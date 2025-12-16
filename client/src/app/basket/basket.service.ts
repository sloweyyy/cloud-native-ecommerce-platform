import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AcntService } from '../account/acnt.service';
import {
  Basket,
  IBasket,
  IBasketItem,
  IBasketTotal,
} from '../shared/models/basket';
import { IProduct, IProductWithDiscount } from '../shared/models/product';

@Injectable({
  providedIn: 'root',
})
export class BasketService {
  private http = inject(HttpClient);
  private acntService = inject(AcntService);
  private router = inject(Router);

  baseUrl = 'http://localhost:8010';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);
  constructor() {}
  private basketSource = new BehaviorSubject<Basket | null>(null);
  basketSource$ = this.basketSource.asObservable();
  private basketTotal = new BehaviorSubject<IBasketTotal | null>(null);
  basketTotal$ = this.basketTotal.asObservable();

  getBasket(username: string) {
    return this.http
      .get<IBasket>(`${this.baseUrl}/Basket/GetBasket/${username}`)
      .subscribe({
        //update the basketsource so that via observable these values will be available to the subscribers via component
        next: (basket) => {
          this.basketSource.next(basket);
          this.calculateBasketTotal();
        },
      });
  }
  setBasket(basket: IBasket) {
    return this.http
      .post<IBasket>(this.baseUrl + '/Basket/CreateBasket', basket)
      .subscribe({
        next: (basket) => {
          this.basketSource.next(basket);
          this.calculateBasketTotal();
        },
      });
  }

  async checkoutBasket(basket: IBasket) {
    const token = await this.acntService.authorizationHeaderValue;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token,
      }),
    };

    // Create the checkout object that matches the V2 API expectations
    const checkoutData = {
      userName: basket.userName,
      totalPrice: basket.totalPrice,
    };

    return this.http
      .post<any>(
        'http://localhost:8010/api/v2/Basket/Checkout',
        checkoutData,
        httpOptions
      )
      .subscribe({
        next: (response) => {
          this.basketSource.next(null);
          this.router.navigateByUrl('/');
        },
      });
  }

  getCurrentBasket() {
    return this.basketSource.value;
  }

  // Basket operations starts here
  addItemToBasket(item: IProduct | IProductWithDiscount, quantity = 1) {
    const itemToAdd: IBasketItem = this.mapProductItemToBasketItem(item);
    const basket = this.getCurrentBasket() ?? this.createBasket();
    //now items can be added in the basket
    basket.items = this.addOrUpdateItem(basket.items, itemToAdd, quantity);
    this.setBasket(basket);
  }

  incrementItemQuantity(item: IBasketItem) {
    const basket = this.getCurrentBasket();
    if (!basket) return;
    const founItemIndex = basket.items.findIndex(
      (x) => x.productId === item.productId
    );
    basket.items[founItemIndex].quantity++;
    this.setBasket(basket);
  }

  removeItemFromBasket(item: IBasketItem) {
    const basket = this.getCurrentBasket();
    if (!basket) return;
    if (basket.items.some((x) => x.productId === item.productId)) {
      basket.items = basket.items.filter((x) => x.productId !== item.productId);
      if (basket.items.length > 0) {
        this.setBasket(basket);
      } else {
        this.deleteBasket(basket.userName);
      }
    }
  }
  deleteBasket(userName: string) {
    return this.http
      .delete(this.baseUrl + '/Basket/DeleteBasket/' + userName)
      .subscribe({
        next: (response) => {
          this.basketSource.next(null);
          this.basketTotal.next(null);
          localStorage.removeItem('basket_username');
        },
        error: (err) => {
          console.log('Error Occurred while deletin basket');
          console.log(err);
        },
      });
  }

  decrementItemQuantity(item: IBasketItem) {
    const basket = this.getCurrentBasket();
    if (!basket) return;
    const founItemIndex = basket.items.findIndex(
      (x) => x.productId === item.productId
    );
    if (basket.items[founItemIndex].quantity > 1) {
      basket.items[founItemIndex].quantity--;
      this.setBasket(basket);
    } else {
      this.removeItemFromBasket(item);
    }
  }

  // Basket operations ends here

  private addOrUpdateItem(
    items: IBasketItem[],
    itemToAdd: IBasketItem,
    quantity: number
  ): IBasketItem[] {
    //if we have the item in basket which matches the Id, then we can get here
    const item = items.find((x) => x.productId == itemToAdd.productId);
    if (item) {
      item.quantity += quantity;
    } else {
      itemToAdd.quantity = quantity;
      //then add the items in the basket
      items.push(itemToAdd);
    }
    return items;
  }

  private createBasket(): Basket {
    //since we have created class
    const basket = new Basket();
    const resolvedUserName = this.resolveUserName();
    basket.userName = resolvedUserName;
    localStorage.setItem('basket_username', resolvedUserName);
    return basket;
  }

  private resolveUserName(): string {
    const email = this.acntService.getCurrentUserEmail();
    if (email) {
      return email.toLowerCase();
    }

    const existing = localStorage.getItem('basket_username');
    if (existing) return existing;

    const guest = `guest-${Date.now()}`;
    return guest;
  }

  private mapProductItemToBasketItem(
    item: IProduct | IProductWithDiscount
  ): IBasketItem {
    const hasDiscount = 'hasDiscount' in item && item.hasDiscount;
    return {
      productId: item.id,
      productName: item.name,
      price: item.price,
      originalPrice: hasDiscount ? item.originalPrice! : item.price,
      discountAmount: hasDiscount ? item.discountAmount! : 0,
      imageFile: item.imageFile,
      quantity: 0,
    };
  }

  private calculateBasketTotal() {
    const basket = this.getCurrentBasket();
    if (!basket) return;

    // Calculate totals including savings
    const total = basket.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const originalTotal = basket.items.reduce(
      (sum, item) => sum + item.originalPrice * item.quantity,
      0
    );
    const totalSavings = originalTotal - total;

    this.basketTotal.next({
      total,
      originalTotal,
      totalSavings,
    });
  }
}
