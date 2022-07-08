import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { CHAT_WAITING, PUB_SUB } from 'src/common/common.constant';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { GetUserId } from 'src/user/decorators/jwt.decorator';
import { GetUser } from 'src/user/decorators/user.decorator';
import { User } from 'src/user/entities/user.entity';
import { JwtGuard } from 'src/user/guards/user.guard';
import { JwtIdGuard } from 'src/user/guards/userId.guard';
import {
  GetUserInvitationOutput,
  JoinRoomInput,
  MemberInput,
  RoomInvitationIdInput,
} from './dtos/memberCRUD.dto';
import { LeftRoomInput } from './dtos/roomCRUD.dto';
import { Chat } from './entities/chat.entity';
import { MemberService } from './member.service';

@Resolver()
export class MemberResolver {
  constructor(
    private readonly memberService: MemberService,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  @Mutation(() => Boolean)
  @UseGuards(JwtGuard)
  shotString(@GetUser() user: User, @Args('input') message: string) {
    this.pubsub.publish('EventName', {
      waitString: `${user ? user.name : 'user not found'}: ${message}`,
    });
    return true;
  }

  @Subscription(() => String)
  waitString() {
    return this.pubsub.asyncIterator('EventName');
  }

  @Subscription(() => Chat, {
    filter: (
      { waitChat: chat }: { waitChat: Chat },
      {},
      { user }: { user: User },
    ) => {
      return chat.roomId === user.roomId;
    },
    resolve: ({ waitChat: chat }: { waitChat: Chat }) => chat,
  })
  @UseGuards(JwtGuard)
  waitChat() {
    return this.pubsub.asyncIterator(CHAT_WAITING);
  }

  @Mutation(() => CoreOuput)
  @UseGuards(JwtIdGuard)
  sendChat(
    @GetUserId() userId: number,
    @Args('input') message: string,
  ): Promise<CoreOuput> {
    return this.memberService.sendChat(userId, message);
  }

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

  @Mutation(() => CoreOuput)
  @UseGuards(JwtGuard)
  deleteInvitation(
    @GetUser() user: User,
    @Args('input') roomInvitationIdInput: RoomInvitationIdInput,
  ): Promise<CoreOuput> {
    return this.memberService.deleteInvitation(user, roomInvitationIdInput);
  }

  @Mutation(() => CoreOuput)
  @UseGuards(JwtGuard)
  acceptInvitation(
    @GetUser() user: User,
    @Args('input') roomInvitationIdInput: RoomInvitationIdInput,
  ): Promise<CoreOuput> {
    return this.memberService.acceptInvitation(user, roomInvitationIdInput);
  }

  @Mutation(() => CoreOuput)
  @UseGuards(JwtGuard)
  refuseInvitation(
    @GetUser() user: User,
    @Args('input') roomInvitationIdInput: RoomInvitationIdInput,
  ): Promise<CoreOuput> {
    return this.memberService.refuseInvitation(user, roomInvitationIdInput);
  }

  @Mutation(() => CoreOuput)
  @UseGuards(JwtGuard)
  leftRoom(
    @GetUser() user: User,
    @Args('input') leftRoomInput: LeftRoomInput,
  ): Promise<CoreOuput> {
    return this.memberService.leftRoom(user, leftRoomInput);
  }

  @Query(() => GetUserInvitationOutput)
  @UseGuards(JwtIdGuard)
  getUserInvitations(
    @GetUserId() id: number,
  ): Promise<GetUserInvitationOutput> {
    return this.memberService.getUserInvitations(id);
  }
}
