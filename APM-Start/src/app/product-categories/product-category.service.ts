import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {Observable, throwError} from 'rxjs';

import {ProductCategory} from './product-category';
import {catchError, shareReplay, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductCategoryService {
  private productCategoriesUrl = 'api/productCategories';

  constructor(private http: HttpClient) {
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

  getAll(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(this.productCategoriesUrl).pipe(
      tap(items => console.log('categories', JSON.stringify(items))),
      // Observable returns the single even of ProductCategories[]
      catchError(this.handleError),
      shareReplay(1)
    );
  }
}
