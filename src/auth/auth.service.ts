import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}
  async findOrCreateFromGoogle(profile: any) {
    return this.usersService.findOrCreateFromGoogle(profile);
  }
  async issueToken(user: any) {
    const payload = { sub: user.id };
    return jwt.sign(payload, process.env.JWT_SECRET || 'change_me', { expiresIn: '7d' });
  }
}
