import { Injectable } from '@angular/core';
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

  public currentUserSource = new ReplaySubject<any>(1);
  currentUser$ = this.currentUserSource.asObservable();
  constructor(
    private http: HttpClient,
    private router: Router,
    private msalService: MsalService
  ) {
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
      scopes: ["openid", "profile", "https://sportscenter19.onmicrosoft.com/85ec0233-0ecb-4830-96f5-12d00bf87176"],
      state: state
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



