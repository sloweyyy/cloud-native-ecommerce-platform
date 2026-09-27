// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8010',
  clientUrl: 'http://localhost:4200',
  idpAuthority: 'https://localhost:9009',
  azureB2C: {
    clientId: 'd0dafab9-cae6-426d-a516-eab88853767c',
    authority: 'https://nexttechuit.b2clogin.com/nexttechuit.onmicrosoft.com/B2C_1_SignInSignUp/v2.0/',
    knownAuthorities: ['nexttechuit.b2clogin.com'],
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200',
    scopes: [
      'openid',
      'profile'
    ],
    protectedResourceMap: [] as [string, string[]][]
  }
};
