import {ChangeDetectionStrategy, Component} from '@angular/core';

import {EMPTY, Observable, Subject, Subscription} from 'rxjs';

import {Product} from './product';
import {ProductService} from './product.service';
import {catchError} from "rxjs/operators";

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
  categories;

  sub: Subscription;
  // $ for marking it is an Observable
  products$: Observable<Product[]> = this.productService.productsWithCategories$
    .pipe(
      catchError(error => {
        //     // with onpush this change will not be picked up by component
        this.errorMessageSubject.next(error);
        //     // if error happened, we will return an empty observable
        //     // otherwise, the error is propagated to the template
        return EMPTY;
      }));

  constructor(private productService: ProductService) {
  }

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    console.log('Not yet implemented');
  }
}
