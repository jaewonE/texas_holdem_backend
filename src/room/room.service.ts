import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { PaginationInput } from 'src/common/dtos/pagination.dto';
import {
  CreateRoomInput,
  CreateRoomOutput,
  DeleteRoomInput,
  FindRoomInput,
  FindRoomOutput,
  RoomListOutput,
  SearchRoomInput,
  UpdateRoomInput,
} from './dtos/roomCRUD.dto';
import { Room } from './entities/room.entity';
import { User } from 'src/user/entities/user.entity';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';

@Injectable()
export class RoomService {
  constructor(
    // @InjectRepository(User) private readonly userDB: Repository<User>,
    @InjectRepository(Room) private readonly roomDB: Repository<Room>,
  ) {}

  async createRoom(
    user: User,
    createRoomInput: CreateRoomInput,
  ): Promise<CreateRoomOutput> {
    try {
      const newRoom = this.roomDB.create(createRoomInput);
      const users = [user];
      newRoom.users = users;
      const { id } = await this.roomDB.save(newRoom);
      return {
        status: Boolean(id),
        error: Boolean(id) ? null : 'Unexpected error from createRoom',
        id,
      };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from createRoom',
      };
    }
  }

  async getRoomList({ page, take }: PaginationInput): Promise<RoomListOutput> {
    try {
      const [rooms, totalResult] = await this.roomDB.findAndCount({
        take: take,
        skip: (page - 1) * take,
        order: {
          createAt: 'DESC',
        },
        relations: ['users'],
      });
      return {
        status: true,
        totalResult,
        totalPages: Math.ceil(totalResult / take),
        rooms,
      };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from getRoomList',
      };
    }
  }

  async findRoom({ id }: FindRoomInput): Promise<FindRoomOutput> {
    try {
      const room = await this.roomDB.findOne({
        where: { id },
        relations: ['users'],
      });
      return {
        status: true,
        room,
      };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from findRoom',
      };
    }
  }

  async searchRoom({
    name: roomName,
    page,
    take,
  }: SearchRoomInput): Promise<RoomListOutput> {
    try {
      const [rooms, totalResult] = await this.roomDB.findAndCount({
        where: { name: Raw((name) => `${name} ILIKE '%${roomName}%'`) },
        take: take,
        skip: (page - 1) * take,
        order: {
          createAt: 'DESC',
        },
        relations: ['users'],
      });
      return {
        status: true,
        totalResult,
        totalPages: Math.ceil(totalResult / take),
        rooms,
      };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from searchRoom',
      };
    }
  }

  async updateRoom(
    user: User,
    { id, name, coverImg }: UpdateRoomInput,
  ): Promise<CoreOuput> {
    try {
      const room = await this.roomDB.findOne({
        where: { id },
      });
      if (!room) return { status: false, error: 'Room not Found' };
      if (room.users.length <= 0) throw new Error();
      if (room.users[0].id !== user.id)
        return {
          status: false,
          error: 'Permission denied: not owner of this room',
        };
      name && (room.name = name);
      coverImg && (room.coverImg = coverImg);
      await this.roomDB.save([{ id, ...room }]);
      return {
        status: true,
      };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from updateRoom',
      };
    }
  }

  async deleteRoom(user: User, { id }: DeleteRoomInput): Promise<CoreOuput> {
    try {
      const room = await this.roomDB.findOne({
        where: { id },
      });
      if (!room) return { status: false, error: 'Room not Found' };
      if (room.users.length <= 0) throw new Error();
      if (room.users[0].id !== user.id)
        return {
          status: false,
          error: 'Permission denied: not owner of this room',
        };
      await this.roomDB.delete(id);
      return { status: true };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from deleteRoom',
      };
    }
  }
}
