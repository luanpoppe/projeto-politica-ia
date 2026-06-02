import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { IPasswordHasher } from '../../domain/services/password-hasher.interface';

const BCRYPT_COST = 12;

@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(plain: string): Promise<string> {
    return hash(plain, BCRYPT_COST);
  }

  async compare(plain: string, passwordHash: string): Promise<boolean> {
    return compare(plain, passwordHash);
  }
}
