import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { BasketService } from 'src/app/basket/basket.service';
import { IProduct, IProductWithDiscount } from 'src/app/shared/models/product';
import { BreadcrumbService } from 'xng-breadcrumb';
import { StoreService } from '../store.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  private storeService = inject(StoreService);
  private activatedRoute = inject(ActivatedRoute);
  private bcService = inject(BreadcrumbService);
  private basketService = inject(BasketService);

  product?: IProductWithDiscount;
  quantity = 1;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor(){}

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct(){
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if(id){
      this.storeService.getProductById(id).subscribe({
        next:(response) =>{
          this.product = response;
          this.bcService.set('@productDetails', response.name);
          }, error:(error)=>console.log(error)
      });
    }
  }

  addItemToCart(){
    if(this.product){
      this.basketService.addItemToBasket(this.product, this.quantity);
    }
  }

  incrementQuantity(){
    this.quantity++;
  }

  decrementQuantity(){
    if(this.quantity>1){
      this.quantity--;
    }
  }

}
