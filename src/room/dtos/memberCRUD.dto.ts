import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { IsArray, IsInt } from 'class-validator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { RoomInvitation } from '../entities/roomInvitation.entity';
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

@InputType()
export class RoomInvitationIdInput extends PickType(RoomInvitation, ['id']) {}

@ObjectType()
export class GetUserInvitationOutput extends CoreOuput {
  @Field(() => [RoomInvitation])
  @IsArray()
  postedInvitations?: RoomInvitation[];

  @Field(() => [RoomInvitation])
  @IsArray()
  receivedInvitations?: RoomInvitation[];
}
