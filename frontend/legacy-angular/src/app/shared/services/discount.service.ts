import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IProduct, IProductWithDiscount } from '../models/product';
import { environment } from '../../../environments/environment';

export interface IDiscount {
  id: number;
  productName: string;
  description: string;
  amount: number;
}

@Injectable({
  providedIn: 'root',
})
export class DiscountService {
  private http = inject(HttpClient);

  private baseUrl = 'http://localhost:8010/';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  // This would require a new endpoint on the backend, but for now we'll simulate it
  getDiscountForProduct(productName: string): Observable<IDiscount> {
    // Return no discount for the store page as per system design (gRPC only via Basket)
    return of({
      id: 0,
      productName: productName,
      description: 'No Discount',
      amount: 0,
    });
  }

  // Enrich a single product with discount information
  enrichProductWithDiscount(
    product: IProduct
  ): Observable<IProductWithDiscount> {
    return this.getDiscountForProduct(product.name).pipe(
      map((discount) => ({
        ...product,
        originalPrice: product.price,
        discountAmount: discount.amount,
        hasDiscount: discount.amount > 0,
        price: product.price - discount.amount, // Update price with discount applied
      })),
      catchError(() =>
        of({
          ...product,
          originalPrice: product.price,
          discountAmount: 0,
          hasDiscount: false,
        })
      )
    );
  }

  // Enrich multiple products with discount information
  enrichProductsWithDiscounts(
    products: IProduct[]
  ): Observable<IProductWithDiscount[]> {
    const discountRequests = products.map((product) =>
      this.enrichProductWithDiscount(product)
    );

    return forkJoin(discountRequests);
  }
}
