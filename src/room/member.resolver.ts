import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
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
