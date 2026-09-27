import { environment } from '../../environments/environment';

export class Constants {
  public static apiRoot = 'http://localhost:8010';
  public static clientRoot = environment.clientUrl;
  public static idpAuthority = environment.idpAuthority;
  public static clientId = 'angular-client';
}
