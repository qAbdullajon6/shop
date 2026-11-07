// Access token is kept only in module memory (never in localStorage/sessionStorage)
// so XSS cannot steal it. The refresh token lives in an httpOnly cookie set by
// the server and is never accessible to JavaScript at all.

let accessToken: string | null = null;

export const tokens = {
  getAccess: (): string | null => accessToken,
  setAccess: (token: string): void => {
    accessToken = token;
  },
  clearAccess: (): void => {
    accessToken = null;
  },
};
