import * as bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 10;

export const hashValue = (value: string): Promise<string> =>
  bcrypt.hash(value, BCRYPT_ROUNDS);

export const compareValue = (plain: string, hashed: string): Promise<boolean> =>
  bcrypt.compare(plain, hashed);
