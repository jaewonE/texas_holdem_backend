import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { CHAT_WAITING, PUB_SUB } from 'src/common/common.constant';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { In, Repository } from 'typeorm';
import {
  GetUserInvitationOutput,
  JoinRoomInput,
  MemberInput,
  RoomInvitationIdInput,
} from './dtos/memberCRUD.dto';
import { FindRoomOutput, LeftRoomInput } from './dtos/roomCRUD.dto';
import { Chat } from './entities/chat.entity';
import { Room } from './entities/room.entity';
import { RoomInvitation } from './entities/roomInvitation.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Room) private readonly roomDB: Repository<Room>,
    @InjectRepository(Chat) private readonly chatDB: Repository<Chat>,
    @InjectRepository(RoomInvitation)
    private readonly invitationDB: Repository<RoomInvitation>,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
    @Inject(UserService) private readonly userService: UserService,
  ) {}

  canJoinTheRoom(room: Room | null, userId: number): CoreOuput {
    if (!room) return { status: false, error: 'Room not found' };
    if (!room.isPublic)
      return { status: false, error: 'The room has been changed to private' };
    if (room.cardList.length >= 1)
      return { status: false, error: 'The game is in progress' };
    if (room.users.length >= room.maxMember)
      return { status: false, error: 'Member is full' };

    if (!room.users) room.users = [];
    const hasUser = room.users.filter((instance) => instance.id === userId);
    if (hasUser.length > 0)
      return {
        status: false,
        error: 'Already member of this room',
      };
    return { status: true };
  }

  async deleteRoom(id: number): Promise<CoreOuput> {
    try {
      const room = await this.roomDB.findOne({
        where: { id },
        relations: ['users'],
      });
      if (!room) return { status: false, error: 'Room not Found' };
      if (room.users.length > 1)
        return { status: false, error: 'Room is not empty' };
      await this.roomDB.delete(id);
      return { status: true };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from deleteRoom',
      };
    }
  }

  async isRoomOwner(
    { roomId, userId }: MemberInput,
    func: string,
  ): Promise<FindRoomOutput> {
    try {
      const room = await this.roomDB.findOne({
        where: { id: roomId },
        relations: ['users'],
      });
      if (!room) return { status: false, error: 'Room not Found' };
      if (room.users.length <= 0) throw new Error();
      if (room.ownerId !== userId)
        return {
          status: false,
          error: 'Permission denied: not owner of this room',
        };
      return { status: true, room };
    } catch (e) {
      return {
        status: false,
        error: `Unexpected error from ${func}`,
      };
    }
  }

  //유저가 방에 있었는지 확인하고 만약 자신이 방장이라면 방을 삭제한다.
  async deleteRoomIfUserIsAlone(userId: number): Promise<CoreOuput> {
    try {
      const { user, status, error } =
        await this.userService.findUserWithRelation({ id: userId });
      if (!status || !user) {
        return { status, error };
      }
      if (user.room) {
        if (user.room.cardList.length >= 1)
          return { status: false, error: 'The game is in progress' };
        if (user.room?.id) {
          const result = await this.leftRoom(user, { id: user.room.id });
          if (
            result ===
            {
              status: false,
              error: 'Unexpected error from leftRoom',
            }
          ) {
            return {
              status: false,
              error: 'Unexpected error from deleteRoomIfUserIsAlone',
            };
          }
        }
      }
      return { status: true };
    } catch (e) {
      return e;
    }
  }

  async sendChat(userId: number, message: string): Promise<CoreOuput> {
    try {
      if (!userId) return { status: false, error: 'User not found' };
      const userResult = await this.userService.findUserWithRelation({
        id: userId,
      });
      if (!userResult.status || !userResult.user)
        return {
          status: false,
          error: userResult.error ? userResult.error : 'User not found',
        };
      if (!userResult.user.room)
        return { status: false, error: 'Room not found' };
      const chat = this.chatDB.create({
        chat: message,
      });
      chat.sender = userResult.user;
      chat.senderId = userResult.user.id;
      chat.room = userResult.user.room;
      chat.roomId = userResult.user.roomId;
      const { id, createAt } = await this.chatDB.save(chat);
      this.pubsub.publish(CHAT_WAITING, {
        waitChat: { ...chat, id, createAt },
      });
      return { status: true };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from shotChat',
      };
    }
  }

  // 만약 유저가 다른 방에 있었다면 joinRoom 메소드 실행시 그 방으로 값이 덮어쓰인다.
  async joinRoom(user: User, { roomId }: JoinRoomInput): Promise<CoreOuput> {
    try {
      const room = await this.roomDB.findOne({
        where: { id: roomId },
        relations: ['users'],
      });
      const canJoin = this.canJoinTheRoom(room, user.id);
      if (!canJoin.status) return canJoin;

      const { status, error } = await this.deleteRoomIfUserIsAlone(user.id);
      if (!status) {
        return { status, error };
      }

      room.users.push(user);
      this.roomDB.save({ id: roomId, ...room });
      return { status: true };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from joinRoom',
      };
    }
  }

  async leftRoom(user: User, { id }: LeftRoomInput): Promise<CoreOuput> {
    try {
      const room = await this.roomDB.findOne({
        where: { id },
        relations: ['users'],
      });
      if (!room) return { status: false, error: 'Room not found' };

      const newUsers = room.users.filter((instance) => instance.id !== user.id);
      if (newUsers.length === room.users.length)
        return { status: false, error: `user with id ${user.id} not found` };
      if (newUsers.length <= 0) {
        await this.deleteRoom(id);
      } else {
        room.users = newUsers;
        if (user.id === room.ownerId) room.ownerId = newUsers[0].id;
        await this.roomDB.save({ id, ...room });
      }
      return { status: true };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from leftRoom',
      };
    }
  }

  async expelUser(
    user: User,
    { roomId, userId }: MemberInput,
  ): Promise<CoreOuput> {
    try {
      if (user.id === userId)
        return { status: false, error: 'Can not deport yourself' };

      const { room, ...roomOwnerStatus } = await this.isRoomOwner(
        { roomId, userId: user.id },
        'expelUser',
      );
      if (!roomOwnerStatus.status) return roomOwnerStatus;
      if (!room) throw new Error();

      const newUsers = room.users.filter((instance) => instance.id !== userId);
      if (newUsers.length === room.users.length)
        return { status: false, error: `user with id ${userId} not found` };
      room.users = newUsers;
      await this.roomDB.save({ id: roomId, ...room });
      return { status: true };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from expelUser',
      };
    }
  }

  async inviteNewUser(
    user: User,
    { roomId, userId }: MemberInput,
  ): Promise<CoreOuput> {
    try {
      const userResult = await this.userService.findUser({ id: userId });
      if (!userResult.status || !userResult.user)
        return { status: false, error: `user with id ${userId} not found` };
      const receiver = userResult.user;

      const room = await this.roomDB.findOne({
        where: { id: roomId },
        relations: ['users'],
      });
      if (!room) return { status: false, error: 'Room not found' };
      if (room.users.length >= room.maxMember)
        return { status: false, error: 'Member is full' };
      if (!room.users) room.users = [];
      const hasUser = room.users.filter((instance) => instance.id === userId);
      if (hasUser.length > 0)
        return {
          status: false,
          error: 'Already member of this room',
        };

      const hasInvite = await this.invitationDB.findOne({
        where: { room: { id: roomId }, receiver: { id: userId } },
      });
      if (hasInvite)
        return { status: false, error: 'Invitation already exist' };

      const newInvitation = this.invitationDB.create();
      newInvitation.room = room;
      newInvitation.poster = user;
      newInvitation.receiver = receiver;
      await this.invitationDB.save(newInvitation);
      return { status: true };
    } catch (e) {
      console.log(e);
      return {
        status: false,
        error: 'Unexpected error from InviteNewUser',
      };
    }
  }

  async deleteInvitation(
    user: User,
    { id }: RoomInvitationIdInput,
  ): Promise<CoreOuput> {
    try {
      const invitation = await this.invitationDB.findOne({
        where: { id },
        relations: ['room'],
      });
      if (!invitation) return { status: false, error: 'Invitation not found' };
      if (
        user.id !== invitation.posterId &&
        user.id !== invitation.room.ownerId
      )
        return {
          status: false,
          error: 'Permission denied: not owner of this invitation',
        };
      await this.invitationDB.delete(id);
      return { status: true };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from deleteInvitation',
      };
    }
  }

  async acceptInvitation(
    user: User,
    { id }: RoomInvitationIdInput,
  ): Promise<CoreOuput> {
    try {
      const invitation = await this.invitationDB.findOne({
        where: { id },
      });
      if (!invitation) return { status: false, error: 'Invitation not found' };
      if (user.id !== invitation.receiverId && user.id)
        return {
          status: false,
          error: 'Permission denied: not receiver of this invitation',
        };

      const room = await this.roomDB.findOne({
        where: { id: invitation.roomId },
        relations: ['users'],
      });
      const canJoin = this.canJoinTheRoom(room, user.id);
      if (!canJoin.status) return canJoin;

      room.users = [...room.users, user];
      await this.roomDB.save({ id: room.id, ...room });
      await this.invitationDB.delete(id);
      return { status: true };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from acceptInvitation',
      };
    }
  }

  async refuseInvitation(
    user: User,
    { id }: RoomInvitationIdInput,
  ): Promise<CoreOuput> {
    try {
      const invitation = await this.invitationDB.findOne({
        where: { id },
      });
      if (!invitation) return { status: false, error: 'Invitation not found' };
      if (user.id !== invitation.receiverId && user.id)
        return {
          status: false,
          error: 'Permission denied: not receiver of this invitation',
        };
      invitation.hasRefused = false;
      await this.invitationDB.save({ id, ...invitation });
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from refuseInvitation',
      };
    }
  }

  async getUserInvitations(id: number): Promise<GetUserInvitationOutput> {
    try {
      const data = await this.userService.getUserWithInvitations({ id });
      if (!data.status) return data;
      const postIdList = data.postedInvitations.map((post) => post.id);
      const receiveIdList = data.receivedInvitations.map(
        (receive) => receive.id,
      );
      const postList = await this.invitationDB.find({
        where: { id: In(postIdList) },
        relations: ['room', 'receiver'],
      });
      const receiveList = await this.invitationDB.find({
        where: { id: In(receiveIdList) },
        relations: ['room', 'poster'],
      });
      return {
        status: true,
        postedInvitations: postList,
        receivedInvitations: receiveList,
      };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from getUserInvitations',
      };
    }
  }
}
