import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsArray, IsOptional } from 'class-validator';
import { PaginationOutput } from 'src/common/dtos/pagination.dto';
import { User } from 'src/user/entities/user.entity';

/* CreateRoomPage
1. 방 생성하기(CreateRoom)
2. 방 내용 수정
3. 방 삭제
*/
/* RoomListPage
1. 현재 존재하는 방 리스트 가져오기(가져올 정보: 방 이름, 방장 이름, 현재 인원수, // 미개봉: 생성시기, id)
2. 방 상세 정보 가져오기(가져올 정보: 방 이름, 구성 인원 이름들, 현재 인원수
*/

@ObjectType()
class RoomInfo extends PickType(User, ['id', 'createAt', 'name']) {}

@ObjectType()
export class GetRoomList extends PaginationOutput {
  @Field(() => [RoomInfo], { nullable: true })
  @IsOptional()
  @IsArray()
  rooms?: RoomInfo[];
}
