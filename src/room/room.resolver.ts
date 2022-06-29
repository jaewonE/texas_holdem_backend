import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { PaginationInput } from 'src/common/dtos/pagination.dto';
import { GetUserId } from 'src/user/decorators/jwt.decorator';
import { GetUser } from 'src/user/decorators/user.decorator';
import { User } from 'src/user/entities/user.entity';
import { JwtGuard } from 'src/user/guards/user.guard';
import { JwtIdGuard } from 'src/user/guards/userId.guard';
import {
  CreateRoomInput,
  CreateRoomOutput,
  FindRoomInput,
  FindRoomOutput,
  RoomListOutput,
  SearchRoomInput,
  UpdateRoomInput,
} from './dtos/roomCRUD.dto';
import { RoomService } from './room.service';

@Resolver()
export class RoomResolver {
  constructor(private readonly roomService: RoomService) {}

  @Mutation(() => CreateRoomOutput)
  @UseGuards(JwtIdGuard)
  createRoom(
    @GetUserId() userId: number,
    @Args('input') createRoomInput: CreateRoomInput,
  ): Promise<CreateRoomOutput> {
    return this.roomService.createRoom(userId, createRoomInput);
  }

  @Query(() => RoomListOutput)
  getRoomList(
    @Args('input') pageInfo: PaginationInput,
  ): Promise<RoomListOutput> {
    return this.roomService.getRoomList(pageInfo);
  }

  @Query(() => FindRoomOutput)
  findRoom(
    @Args('input') findRoomInput: FindRoomInput,
  ): Promise<FindRoomOutput> {
    return this.roomService.findRoom(findRoomInput);
  }

  @Query(() => RoomListOutput)
  searchRoom(
    @Args('input') searchRoomInput: SearchRoomInput,
  ): Promise<RoomListOutput> {
    return this.roomService.searchRoom(searchRoomInput);
  }

  @Mutation(() => CoreOuput)
  @UseGuards(JwtGuard)
  updateRoom(
    @GetUser() user: User,
    @Args('input') updateRoomInput: UpdateRoomInput,
  ): Promise<CoreOuput> {
    return this.roomService.updateRoom(user, updateRoomInput);
  }
}
