import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(user: any) {
    const payload = { sub: user._id || user.id, email: user.email, roles: user.roles || [] };
    return { access_token: this.jwtService.sign(payload) };
  }
}
