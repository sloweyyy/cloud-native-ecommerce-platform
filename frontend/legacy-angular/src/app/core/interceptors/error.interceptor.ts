import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private router = inject(Router);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error) => {
        if (error) {
          // Only redirect to not-found for navigation errors, not API calls
          if (error.status === 404 && !request.url.includes('localhost:8010')) {
            this.router.navigateByUrl('/not-found');
          }
          if (error.status === 401) {
            this.router.navigateByUrl('/un-authenticated');
          }
          if (error.status === 500 && !request.url.includes('localhost:8010')) {
            this.router.navigateByUrl('/server-error');
          }
        }
        return throwError(() => new Error(error));
      })
    );
  }
}
