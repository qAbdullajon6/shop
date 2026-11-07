// Admin access token is kept only in module memory — never in localStorage.
// The refresh token lives in the httpOnly 'rt' cookie set by the server.

let adminAccessToken: string | null = null;

export const adminTokens = {
  getAccess: (): string | null => adminAccessToken,
  setAccess: (token: string): void => { adminAccessToken = token; },
  clearAccess: (): void => { adminAccessToken = null; },
};
