import { RequestAuthData } from '../auth/classes/RequestAuthData.class';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends RequestAuthData {}
  }
}
