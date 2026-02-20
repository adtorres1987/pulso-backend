export interface JwtSignPayload {
  userId: string;
  email: string;
}

export interface JwtPayload extends JwtSignPayload {
  jti: string;
  exp: number;
}

export interface IJwtService {
  sign(payload: JwtSignPayload): string;
  verify(token: string): JwtPayload;
}
