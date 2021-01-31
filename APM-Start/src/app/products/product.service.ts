import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {BehaviorSubject, combineLatest, forkJoin, Observable, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';

import {Product} from './product';
import {SupplierService} from '../suppliers/supplier.service';
import {ProductCategory} from '../product-categories/product-category';
import {ProductCategoryService} from '../product-categories/product-category.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient,
              private supplierService: SupplierService,
              private productCategoryService: ProductCategoryService) {
  }

  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;
  categories$ = this.productCategoryService.getAll();
  products$ = this.http.get<Product[]>(this.productsUrl);
  // alternative solution
  // productsWithCategories$ = combineLatest([this.products$, this.categories$]);
  // productsWithCategories$ = this.products$.pipe(withLatestFrom(this.categories$));
  productsWithCategories$ = forkJoin([this.products$, this.categories$]).pipe(
    tap(item => console.log(item)),
    map(([products, categories]) => products
      // ... is spread operator
      .map(product => ({
        ...product,
        price: product.price * 1.5,
        searchKey: [product.productName],
        category: this.getCategory(product.categoryId, categories),
      }) as Product)
    ),
    tap(data => console.log('Products: ', JSON.stringify(data))),
    catchError(this.handleError),
  );

  private productSelectedSubject = new BehaviorSubject<number>(0);
  productSelected$ = this.productSelectedSubject.asObservable();

  selectedProduct$ = combineLatest([this.productsWithCategories$, this.productSelected$]).pipe(
    map(([products, productSelectedId]) =>
      products.find(item => item.id === productSelectedId))
  );

  publishSelectProductChange(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
  }

  getCategory(categoryId: number, categories: ProductCategory[]): string {
    const productCategoryElement: ProductCategory = categories.find(item => item.id === categoryId);
    return productCategoryElement?.name;
    // this.productsWithCategories$.subscribe({
    // next: item => console.log('This is combined stream: ' + JSON.stringify(item)),
    // complete: () => console.log('Complete')
    // });
  }

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      // category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: any): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }
}
