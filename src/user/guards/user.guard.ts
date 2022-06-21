import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserService } from 'src/user/user.service';
import { JWT_KEY } from '../jwt/jwt.constant';
import { JwtService } from '../jwt/jwt.service';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    let token: string = null;
    if (gqlContext?.req?.headers[JWT_KEY]) {
      token = gqlContext.req.headers[JWT_KEY];
    }
    if (token) {
      const decoded = this.jwtService.verify(token.toString());
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        const { status, user } = await this.userService.findUser({
          id: decoded['id'],
        });
        if (status && user) {
          gqlContext['user'] = user;
          return true;
        }
      }
    }
    return false;
  }
}
