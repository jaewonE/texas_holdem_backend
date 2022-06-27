import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt } from 'class-validator';

/*
1. 방장 교체
2. 맴버 초대(초대장 테이블 생성)
3. 맴버 삭제
 */

@InputType()
export class JoinRoomInput {
  @Field(() => Int)
  @IsInt()
  roomId: number;
}

@InputType()
export class MemberInput extends JoinRoomInput {
  @Field(() => Int)
  @IsInt()
  userId: number;
}
