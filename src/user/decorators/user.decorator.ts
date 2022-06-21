import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const GetUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const user = GqlExecutionContext.create(context).getContext()['user'];
    return user ? user : null;
  },
);
