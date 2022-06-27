import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsDefined, IsNumber, IsOptional } from 'class-validator';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/user/entities/user.entity';
import { Room } from './room.entity';

@InputType('RoomInvitationInput', { isAbstract: true })
@ObjectType()
@Entity('RoomInvitation')
export class RoomInvitation extends CoreEntity {
  @Column({ nullable: true })
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  hasRefused: boolean;

  @ManyToOne(() => Room, (room: Room) => room.roomInvitation, {
    onDelete: 'CASCADE',
  })
  @Field(() => Room)
  @IsDefined()
  room: Room;

  @RelationId((invitation: RoomInvitation) => invitation.room)
  @Field(() => Int)
  @IsNumber()
  roomId: number;

  @ManyToOne(() => User, (poster: User) => poster.postedInvitations, {
    onDelete: 'CASCADE',
  })
  @Field(() => User)
  @IsDefined()
  poster: User;

  @RelationId((invitation: RoomInvitation) => invitation.poster)
  @Field(() => Int)
  @IsNumber()
  posterId: number;

  @ManyToOne(() => User, (user: User) => user.receivedInvitations, {
    onDelete: 'CASCADE',
  })
  @Field(() => User)
  @IsDefined()
  receiver: User;

  @RelationId((invitation: RoomInvitation) => invitation.receiver)
  @Field(() => Int)
  @IsNumber()
  receiverId: number;
}
