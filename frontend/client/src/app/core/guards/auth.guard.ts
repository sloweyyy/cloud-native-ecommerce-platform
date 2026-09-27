import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map } from 'rxjs';
import { Observable } from 'rxjs';
import { AcntService } from 'src/app/account/acnt.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private router = inject(Router);
  private acntService = inject(AcntService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
    return this.acntService.currentUser$.pipe(
        map(auth =>{
        if(auth) return true;
        else{
          this.router.navigate(['/account/login'], {queryParams: {returnUrl: state.url}, replaceUrl: true });
          return false;
        }
      })
    )
  }

}
