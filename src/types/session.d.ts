import 'express-session';
import { OAuthTokens } from './google';

declare module 'express-session' {
  interface SessionData {
    tokens?: OAuthTokens;
    oauthState?: string;
  }
}
