import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
import { Room } from './entities/room.entity';
import { RoomInvitation } from './entities/roomInvitation.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Room) private readonly roomDB: Repository<Room>,
    @InjectRepository(RoomInvitation)
    private readonly invitationDB: Repository<RoomInvitation>,
    @Inject(UserService) private readonly userService: UserService,
  ) {}

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

  async joinRoom(user: User, { roomId }: JoinRoomInput): Promise<CoreOuput> {
    try {
      const room = await this.roomDB.findOne({
        where: { id: roomId },
        relations: ['users'],
      });
      if (!room) return { status: false, error: 'Room not found' };
      if (room.users.length >= room.maxMember)
        return { status: false, error: 'Member is full' };
      if (!room.users) room.users = [];
      const hasUser = room.users.filter((instance) => instance.id === user.id);
      if (hasUser.length > 0)
        return {
          status: false,
          error: 'Already member of this room',
        };
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

  async delegateRoomOwner(
    user: User,
    { roomId, userId }: MemberInput,
  ): Promise<CoreOuput> {
    try {
      const { room, ...roomOwnerStatus } = await this.isRoomOwner(
        { roomId, userId: user.id },
        'delegateRoomOwner',
      );
      if (!roomOwnerStatus.status) return roomOwnerStatus;
      if (!room) throw new Error();

      let hasUser = false;
      for (const instance of room.users) {
        if (instance.id === userId) {
          hasUser = true;
          break;
        }
      }
      if (!hasUser)
        return { status: false, error: `user with id ${userId} not found` };
      room.ownerId = userId;
      await this.roomDB.save({ id: roomId, ...room });
      return { status: true };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from delegateRoomOwner',
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
      if (!room) return { status: false, error: 'Room not found' };
      if (room.users.length >= room.maxMember)
        return { status: false, error: 'Member is full' };
      if (!room.users) room.users = [];
      const hasUser = room.users.filter((instance) => instance.id === user.id);
      if (hasUser.length > 0)
        return {
          status: false,
          error: 'Already member of this room',
        };

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
