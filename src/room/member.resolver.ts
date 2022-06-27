import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { GetUser } from 'src/user/decorators/user.decorator';
import { User } from 'src/user/entities/user.entity';
import { JwtGuard } from 'src/user/guards/user.guard';
import { JoinRoomInput, MemberInput } from './dtos/memberCRUD.dto';
import { MemberService } from './member.service';

@Resolver()
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {}

  @Mutation(() => CoreOuput)
  @UseGuards(JwtGuard)
  joinRoom(
    @GetUser() user: User,
    @Args('input') joinRoomInput: JoinRoomInput,
  ): Promise<CoreOuput> {
    return this.memberService.joinRoom(user, joinRoomInput);
  }

  @Mutation(() => CoreOuput)
  @UseGuards(JwtGuard)
  delegateRoomOwner(
    @GetUser() user: User,
    @Args('input') memberInput: MemberInput,
  ): Promise<CoreOuput> {
    return this.memberService.delegateRoomOwner(user, memberInput);
  }

  @Mutation(() => CoreOuput)
  @UseGuards(JwtGuard)
  expelUser(
    @GetUser() user: User,
    @Args('input') memberInput: MemberInput,
  ): Promise<CoreOuput> {
    return this.memberService.expelUser(user, memberInput);
  }

  @Mutation(() => CoreOuput)
  @UseGuards(JwtGuard)
  inviteNewUser(
    @GetUser() user: User,
    @Args('input') memberInput: MemberInput,
  ): Promise<CoreOuput> {
    return this.memberService.inviteNewUser(user, memberInput);
  }
}
