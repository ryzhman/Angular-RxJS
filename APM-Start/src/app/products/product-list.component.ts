import {ChangeDetectionStrategy, Component} from '@angular/core';

import {EMPTY, Observable, Subscription} from 'rxjs';

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
  errorMessage = '';
  categories;

  sub: Subscription;
  // $ for marking it is an Observable
  products$: Observable<Product[]> = this.productService.products$
    .pipe(catchError(error => {
      //     // with onpush this change will not be picked up by component
      this.errorMessage = error;
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
