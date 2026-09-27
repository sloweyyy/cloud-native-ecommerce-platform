import { Component, Input, inject } from '@angular/core';
import { BasketService } from 'src/app/basket/basket.service';
import { IProduct, IProductWithDiscount } from 'src/app/shared/models/product';

@Component({
  selector: 'app-product-items',
  templateUrl: './product-items.component.html',
  styleUrls: ['./product-items.component.scss']
})
export class ProductItemsComponent {
  private basketService = inject(BasketService);

  @Input() product?: IProductWithDiscount;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor(){}

  addItemToBasket(){
    this.product && this.basketService.addItemToBasket(this.product);
  }
}
