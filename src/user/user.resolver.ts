import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from 'src/common/common.module';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { GetUserId } from './decorators/jwt.decorator';
import { GetUser } from './decorators/user.decorator';
import {
  CreateAccountInput,
  CreateAccountOutput,
  FindUserInput,
  FindUserOutput,
  SearchUserInput,
  SignInInput,
  SignInOutput,
  UpdateUserInput,
} from './dtos/userCRUD.dto';
import { User } from './entities/user.entity';
import { JwtGuard } from './guards/user.guard';
import { JwtIdGuard } from './guards/userId.guard';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  // constructor(private readonly userService: UserService) {}

  constructor(
    private readonly userService: UserService,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  @Mutation(() => Boolean)
  @UseGuards(JwtIdGuard)
  shotString(@GetUserId() userId: number | null) {
    const id = userId ? userId : 0;
    this.pubsub.publish('EventName', { waitString: 'String ready' + id });
    return true;
  }

  @Subscription(() => String)
  waitString() {
    return this.pubsub.asyncIterator('EventName');
  }

  @Mutation(() => CreateAccountOutput)
  createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.userService.createAccount(createAccountInput);
  }

  @Query(() => FindUserOutput)
  findUser(
    @Args('input') findUserInput: FindUserInput,
  ): Promise<FindUserOutput> {
    return this.userService.findUser(findUserInput);
  }

  @Query(() => FindUserOutput)
  searchUser(
    @Args('input') searchUserInput: SearchUserInput,
  ): Promise<FindUserOutput> {
    return this.userService.searchUser(searchUserInput);
  }

  @Mutation(() => CoreOuput)
  @UseGuards(JwtGuard)
  updateUser(
    @GetUser() user: User,
    @Args('input') updateUserInput: UpdateUserInput,
  ): Promise<CoreOuput> {
    return this.userService.updateUser(user, updateUserInput);
  }

  @Mutation(() => CoreOuput)
  @UseGuards(JwtGuard)
  deleteUser(@GetUser() user: User): Promise<CoreOuput> {
    return this.userService.deleteUser(user.id);
  }

  @Query(() => SignInOutput)
  signIn(@Args('input') signinInput: SignInInput): Promise<SignInOutput> {
    return this.userService.signIn(signinInput);
  }

  @Query(() => User)
  @UseGuards(JwtGuard)
  currentUser(@GetUser() user: User): User {
    return user;
  }
}
