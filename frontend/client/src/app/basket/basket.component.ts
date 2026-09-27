import { Component, inject } from '@angular/core';
import { IBasketItem } from '../shared/models/basket';
import { BasketService } from './basket.service';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent {
  basketService = inject(BasketService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor(){}

  removeBasketItem(item: IBasketItem){
    this.basketService.removeItemFromBasket(item);
  }

  incrementItem(item: IBasketItem){
    this.basketService.incrementItemQuantity(item);
  }

  decrementItem(item: IBasketItem){
    this.basketService.decrementItemQuantity(item);
  }
}
