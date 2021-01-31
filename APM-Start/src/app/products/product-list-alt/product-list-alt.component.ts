import {ChangeDetectionStrategy, Component} from '@angular/core';

import {BehaviorSubject, EMPTY, Subscription} from 'rxjs';
import {ProductService} from '../product.service';
import {catchError} from 'rxjs/operators';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  // since our component is now rendered based on Observable we can change the changeDetectionStrategy
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  private errorMessageSubject = new BehaviorSubject<string>('');
  errorMessage = this.errorMessageSubject.asObservable();

  products$ = this.productService.productsWithCategories$
    .pipe(
      catchError(error => {
        this.errorMessageSubject.next(error);
        return EMPTY;
      })
    );
  selectedProduct$ = this.productService.selectedProduct$;

  constructor(private productService: ProductService) {
  }

  onSelected(productId: number): void {
    this.productService.publishSelectProductChange(productId);
    // this.products$.pipe(
    //   tap(item => console.log(JSON.stringify(item))),
    //   map(products =>
    //     products.find(item => item.id === productId))
    // ).subscribe((item) => this.product = item);
    // this.productService.getById(productId);
  }
}
