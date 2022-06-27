import {
  Field,
  InputType,
  Int,
  IntersectionType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { IsArray, IsInt, IsOptional } from 'class-validator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { Room } from '../entities/room.entity';

/* CreateRoomPage
1. 방 생성하기(CreateRoom)
2. 방 내용 수정
3. 방 삭제
*/
/* RoomListPage
1. 현재 존재하는 방 리스트 가져오기(가져올 정보: 방 이름, 방장 이름, 현재 인원수, // 미개봉: 생성시기, id)
2. 방 상세 정보 가져오기(가져올 정보: 방 이름, 구성 인원 이름들, 현재 인원수
*/

@InputType()
export class CreateRoomInput extends IntersectionType(
  PickType(Room, ['name']),
  PartialType(PickType(Room, ['coverImg'])),
) {}
@ObjectType()
export class CreateRoomOutput extends CoreOuput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  id?: number;
}

@InputType()
export class FindRoomInput extends PickType(Room, ['id']) {}

@ObjectType()
export class FindRoomOutput extends CoreOuput {
  @Field(() => Room, { nullable: true })
  @IsOptional()
  room?: Room;
}

@InputType()
export class SearchRoomInput extends IntersectionType(
  PaginationInput,
  PickType(Room, ['name']),
) {}
@ObjectType()
export class RoomListOutput extends PaginationOutput {
  @Field(() => [Room], { nullable: true })
  @IsOptional()
  @IsArray()
  rooms?: Room[];
}

@InputType()
export class UpdateRoomInput extends IntersectionType(
  PickType(Room, ['id']),
  PartialType(PickType(Room, ['name', 'coverImg'])),
) {}

@InputType()
export class DeleteRoomInput extends PickType(Room, ['id']) {}
