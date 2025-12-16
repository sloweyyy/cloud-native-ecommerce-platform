import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IBrand } from '../shared/models/brand';
import { IPagination } from '../shared/models/pagination';
import { IProduct, IProductWithDiscount } from '../shared/models/product';
import { StoreParams } from '../shared/models/storeParams';
import { IType } from '../shared/models/type';
import { DiscountService } from '../shared/services/discount.service';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private http = inject(HttpClient);
  private discountService = inject(DiscountService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  baseUrl = 'http://localhost:8010/';

  getProductById(id: string): Observable<IProductWithDiscount> {
    return this.http
      .get<IProduct>(this.baseUrl + 'Catalog/GetProductById/' + id)
      .pipe(
        switchMap((product) =>
          this.discountService.enrichProductWithDiscount(product)
        )
      );
  }

  getProducts(
    storeParams: StoreParams
  ): Observable<IPagination<IProductWithDiscount[]>> {
    let params = new HttpParams();
    if (storeParams.brandId) {
      params = params.append('brandId', storeParams.brandId);
    }
    if (storeParams.typeId) {
      params = params.append('typeId', storeParams.typeId);
    }

    if (storeParams.search) {
      params = params.append('search', storeParams.search);
    }

    params = params.append('sort', storeParams.sort);
    params = params.append('pageIndex', storeParams.pageNumber);
    params = params.append('pageSize', storeParams.pageSize);

    return this.http
      .get<IPagination<IProduct[]>>(this.baseUrl + 'Catalog/GetAllProducts', {
        params,
      })
      .pipe(
        switchMap((response) =>
          this.discountService.enrichProductsWithDiscounts(response.data).pipe(
            switchMap(
              (enrichedProducts) =>
                new Observable<IPagination<IProductWithDiscount[]>>(
                  (observer) => {
                    observer.next({
                      ...response,
                      data: enrichedProducts,
                    });
                    observer.complete();
                  }
                )
            )
          )
        )
      );
  }
  getBrands() {
    return this.http.get<IBrand[]>(this.baseUrl + 'Catalog/GetAllBrands');
  }
  getTypes() {
    return this.http.get<IType[]>(this.baseUrl + 'Catalog/GetAllTypes');
  }

  createProduct(payload: any): Observable<any> {
    return this.http.post(this.baseUrl + 'Catalog/CreateProduct', payload);
  }
}
