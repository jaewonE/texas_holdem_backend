import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JWT_KEY, JWT_TOKEN } from '../jwt/jwt.constant';
import { JwtService } from '../jwt/jwt.service';

@Injectable()
export class JwtIdGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    let token: string = null;
    if (gqlContext[JWT_TOKEN]) {
      token = gqlContext[JWT_TOKEN];
    } else if (gqlContext?.req?.headers[JWT_KEY]) {
      token = gqlContext.req.headers[JWT_KEY];
    }
    if (token) {
      const decoded = this.jwtService.verify(token.toString());
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        gqlContext['userId'] = decoded['id'];
        return true;
      }
    }
    return false;
  }
}
