import {Component} from '@angular/core';

import {EMPTY, Subscription} from 'rxjs';
import {ProductService} from '../product.service';
import {catchError} from "rxjs/operators";

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html'
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  errorMessage = '';
  selectedProductId: number;

  products$ = this.productService.products$
    .pipe(
      catchError(error => {
        this.errorMessage = error;
        return EMPTY;
      })
    );
  sub: Subscription;

  constructor(private productService: ProductService) {
  }

  onSelected(productId: number): void {
    console.log('Not yet implemented');
  }
}
