import { Args, Query, Resolver } from '@nestjs/graphql';
import { AsyncHelloInput, HelloInput, HelloOutput } from './dtos/user.dto';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => HelloOutput)
  hello(@Args('input') input: HelloInput): HelloOutput {
    return this.userService.hello(input);
  }

  @Query(() => HelloOutput)
  asyncHello(@Args('input') input: AsyncHelloInput): Promise<HelloOutput> {
    return this.userService.asyncHello(input);
  }
}
