import { Inject } from '@nestjs/common';
import { Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from './common.module';

@Resolver()
export class TestResolver {
  constructor(@Inject(PUB_SUB) private readonly pubsub: PubSub) {}

  @Mutation(() => Boolean)
  shotString() {
    this.pubsub.publish('EventName', { waitString: 'String ready' });
    return true;
  }

  @Subscription(() => String)
  waitString() {
    return this.pubsub.asyncIterator('EventName');
  }
}
