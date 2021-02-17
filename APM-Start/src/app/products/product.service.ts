import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {BehaviorSubject, combineLatest, forkJoin, from, merge, Observable, Subject, throwError} from 'rxjs';
import {catchError, filter, map, mergeMap, scan, shareReplay, switchMap, tap, toArray} from 'rxjs/operators';

import {Product} from './product';
import {SupplierService} from '../suppliers/supplier.service';
import {ProductCategory} from '../product-categories/product-category';
import {ProductCategoryService} from '../product-categories/product-category.service';
import {Supplier} from "../suppliers/supplier";

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient,
              private supplierService: SupplierService,
              private productCategoryService: ProductCategoryService) {
  }

  private productsUrl = 'api/products';
  suppliers$ = this.supplierService.suppliersWithMap$;
  categories$ = this.productCategoryService.getAll();
  products$ = this.http.get<Product[]>(this.productsUrl);
  // alternative solution
  // productsWithCategories$ = combineLatest([this.products$, this.categories$]);
  // productsWithCategories$ = this.products$.pipe(withLatestFrom(this.categories$));
  productsWithCategories$ = forkJoin([
    this.products$,
    this.categories$])
    .pipe(
      map(([products, categories]) => products
        // ... is spread operator
        .map(product => ({
          ...product,
          price: product.price * 1.5,
          searchKey: [product.productName],
          category: this.getCategory(product.categoryId, categories),
        }) as Product)
      ),
      catchError(this.handleError)
    );

  private addProductSubject = new Subject<Product>();
  addProduct$ = this.addProductSubject.asObservable();
  // merging two streams together
  productsWithAdd$ = merge(
    this.productsWithCategories$,
    this.addProduct$
  )
    .pipe(
      // accumulator function that gets old value and adds a new one
      scan((existingProducts: Product[], newProduct: Product) =>
        // using spread operator instead of add()
        [...existingProducts, newProduct]),
      tap(items => console.log('productsWithAdd$', JSON.stringify(items))),
      // caching the data, one event is cached for ever
      shareReplay(1)
    );

  private productSelectedSubject = new BehaviorSubject<number>(0);
  productSelected$ = this.productSelectedSubject.asObservable();

  selectedProduct$ = combineLatest([this.productsWithCategories$, this.productSelected$]).pipe(
    map(([products, productSelectedId]) =>
      products.find(item => item.id === productSelectedId))
  );

  selectedProductSupplier$ = combineLatest([
    this.selectedProduct$,
    this.supplierService.suppliers$
  ]).pipe(
    map(([product, suppliers]) => suppliers.filter(supplier => product.supplierIds.includes(supplier.id))),
  );

  // this approach takes time to load
  selectedProductSupplierViaId$ = this.selectedProduct$
    .pipe(
      // before the user selects a product
      // filter(product => Boolean(product)),
      filter(product => !!product),
      // transform supplierId into a stream of id that is consumer
      tap(product => console.log('selected', JSON.stringify(product))),
      // PREFFERRABLE approach - if user reselects the product, previous HTTP will be canceled and only a new one created
      switchMap(product =>
        // mergeMap will make the API call even if the item was reselected. Thus, there will be trailing requests that are not required and can mess up the order
        // mergeMap(product =>
        // create a new stream based on SuppliersId from product. This operation is done due to mergeMap above
        from(product.supplierIds)
          .pipe(
            // for each elements of a stream get the Supplier by Id
            mergeMap(id => this.http.get<Supplier>(`${this.supplierService.suppliersUrl}/${id}`)),
            // combine everything to an array<Supplier>. Emits only when the all the streams complete.
            // toArray() is inside the inner scope of from() -> that's why constant emission of selectedProduct doesn't break it
            tap(result => console.log(result)),
            toArray()
          ),
      )
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

  publishNewProduct(product?: Product): void {
    this.addProductSubject.next(product || this.fakeProduct());
  }
}
