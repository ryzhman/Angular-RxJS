import {ChangeDetectionStrategy, Component} from '@angular/core';

import {ProductService} from '../product.service';
import {catchError} from 'rxjs/operators';
import {EMPTY} from 'rxjs';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  pageTitle = 'Product Detail';
  errorMessage = '';
  product;

  product$ = this.productService.selectedProduct$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

  productSuppliers$ = this.productService.selectedProductSupplierViaId$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

  constructor(private productService: ProductService) {
  }

}
