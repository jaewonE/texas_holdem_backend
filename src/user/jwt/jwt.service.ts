import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(private readonly configService: ConfigService) {}

  sign(payload: any): string {
    return jwt.sign(payload, this.configService.get('JWT_PRIVATE_TOKEN'));
  }
  verify(token: string) {
    return jwt.verify(token, this.configService.get('JWT_PRIVATE_TOKEN'));
  }
}
