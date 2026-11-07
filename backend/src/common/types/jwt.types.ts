export interface JwtPayload {
  sub: string;
  phone: string;
  sessionId: string;
}

export interface RefreshTokenUser extends JwtPayload {
  refreshToken: string;
}
