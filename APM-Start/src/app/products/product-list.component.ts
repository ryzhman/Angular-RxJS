import {ChangeDetectionStrategy, Component} from '@angular/core';

import {BehaviorSubject, combineLatest, EMPTY, Observable, Subject} from 'rxjs';

import {Product} from './product';
import {ProductService} from './product.service';
import {ProductCategoryService} from '../product-categories/product-category.service';
import {catchError, map, startWith, tap} from 'rxjs/operators';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  // changes the component only when the @Input has changed, event is emitted or Observable update
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  private errorMessageSubject: Subject<string> = new Subject<string>();
  errorMessage = this.errorMessageSubject.asObservable();
  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectionAction$ = this.categorySelectedSubject.asObservable();
  categories$ = this.categoryService.getAll();

// $ for marking it is an Observable
  products$: Observable<Product[]> = combineLatest([
    this.productService.productsWithCategories$,
    this.categorySelectionAction$
  ])
    .pipe(
      tap (item => console.log('Tap ' + item)),
      // data that each stream emits - 1st is product, 2nd - categoryId
      map(([products, categoryId]) =>
        products.filter(item => categoryId ? item.categoryId === categoryId : true)
      ),
      tap(([products, selectedCategory]) => {
        console.log(JSON.stringify(products));
      }),
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

  constructor(private productService: ProductService, private categoryService: ProductCategoryService) {
  }

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
    // this.filteredProducts$ = this.products$.pipe(
    //   map(products =>
    //     products.filter(product => +categoryId ? product.categoryId === +categoryId : true)
    //   )
    // );
  }
}
