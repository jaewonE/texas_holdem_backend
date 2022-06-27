import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { JoinRoomInput, MemberInput } from './dtos/memberCRUD.dto';
import { FindRoomOutput } from './dtos/roomCRUD.dto';
import { Room } from './entities/room.entity';
import { RoomInvitation } from './entities/roomInvitation.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Room) private readonly roomDB: Repository<Room>,
    @InjectRepository(RoomInvitation)
    private readonly invitationDB: Repository<RoomInvitation>,
  ) {}

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
      if (room.users[0].id !== userId)
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
      let targetUser: User | null;
      const tempUserList = room.users.filter((instance) => {
        if (instance.id !== userId) return instance;
        targetUser = instance;
      });
      if (tempUserList.length === room.users.length)
        return { status: false, error: `user with id ${userId} not found` };
      const newUsers = [targetUser, ...tempUserList];
      room.users = newUsers;
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
      const newInvitation = this.invitationDB.create();
      newInvitation.room = room;
      newInvitation.owner = user;
      await this.invitationDB.save(newInvitation);
      return { status: true };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from InviteNewUser',
      };
    }
  }
}
