import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const GetUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const userId = GqlExecutionContext.create(context).getContext()['userId'];
    return userId ? userId : null;
  },
);
