import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { PaginationInput } from 'src/common/dtos/pagination.dto';
import {
  CreateRoomInput,
  CreateRoomOutput,
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
import { UserService } from 'src/user/user.service';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private readonly roomDB: Repository<Room>,
    @Inject(UserService) private readonly userService: UserService,
    private readonly memberService: MemberService,
  ) {}

  async createRoom(
    userId: number,
    createRoomInput: CreateRoomInput,
  ): Promise<CreateRoomOutput> {
    try {
      const { user, ...state } = await this.userService.findUserWithRelation({
        id: userId,
      });
      if (!state.status || !user) return state;
      if (user.room)
        return { status: false, error: 'User is already in the room' };
      const newRoom = this.roomDB.create(createRoomInput);
      const users = [user];
      newRoom.users = users;
      newRoom.ownerId = user.id;
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
        skip: page * take,
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
        skip: page * take,
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
    { id, name, isPublic, ownerId }: UpdateRoomInput,
  ): Promise<CoreOuput> {
    try {
      const { room, ...roomOwnerStatus } = await this.memberService.isRoomOwner(
        { roomId: id, userId: user.id },
        'updateRoom',
      );
      if (!roomOwnerStatus.status) return roomOwnerStatus;
      if (!room) throw new Error();
      name && (room.name = name);
      isPublic && (room.isPublic = isPublic);
      ownerId && (room.ownerId = ownerId);
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
}
