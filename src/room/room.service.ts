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
import { MemberService } from './member.service';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private readonly roomDB: Repository<Room>,
    private readonly memberService: MemberService,
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
      const { room, ...roomOwnerStatus } = await this.memberService.isRoomOwner(
        { roomId: id, userId: user.id },
        'updateRoom',
      );
      if (!roomOwnerStatus.status) return roomOwnerStatus;
      if (!room) throw new Error();
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
      const { room, ...roomOwnerStatus } = await this.memberService.isRoomOwner(
        { roomId: id, userId: user.id },
        'updateRoom',
      );
      if (!roomOwnerStatus.status) return roomOwnerStatus;
      if (!room) throw new Error();
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
