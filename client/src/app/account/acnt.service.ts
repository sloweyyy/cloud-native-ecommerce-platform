import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReplaySubject } from 'rxjs';

import { Router } from '@angular/router';
import { User, UserManager, UserManagerSettings } from 'oidc-client';
import { Constants } from './constants';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';


@Injectable({
  providedIn: 'root'
})
export class AcntService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private msalService = inject(MsalService);


  public currentUserSource = new ReplaySubject<any>(1);
  currentUser$ = this.currentUserSource.asObservable();

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);
  constructor() {
    const account = this.msalService.instance.getActiveAccount();
    if (account) {
      this.currentUserSource.next(account);
    }
  }

  isAuthenticated(): boolean {
   return this.msalService.instance.getActiveAccount() !== null;
  }

  login(state?: string) {
    this.msalService.loginRedirect({
      scopes: ['openid', 'profile'],
      state: state,
    });
  }

  logout() {
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: 'http://localhost:4200',
    });
    this.currentUserSource.next(null);
  }

  setUserAfterRedirect(): void {
    const account = this.msalService.instance.getActiveAccount();
    console.log('Active Account after Redirect:', account);
    if (account) {
        this.currentUserSource.next(account);
    } else {
        this.currentUserSource.next(null);
    }
}

  getCurrentUserEmail(): string | null {
    const account = this.msalService.instance.getActiveAccount();
    if (!account) return null;

    const claims: any = account.idTokenClaims;
    const emailFromClaim = claims?.emails?.[0] || claims?.email;
    return (emailFromClaim as string | undefined) ?? account.username ?? null;
  }

 get authorizationHeaderValue(): Promise<string> {
    const account = this.msalService.instance.getActiveAccount();
    if (account) {
      return this.msalService.instance.acquireTokenSilent({
        scopes: ["openid", "profile"],
        account: account
      }).then((result: AuthenticationResult) => {
        return `${result.tokenType} ${result.accessToken}`;
      });
    }
    return Promise.resolve('');
  }

}



