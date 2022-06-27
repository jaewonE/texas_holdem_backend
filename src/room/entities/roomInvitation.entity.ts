import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsDefined, IsOptional } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';
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
  @IsDefined()
  room: Room;

  @ManyToOne(() => User, (user: User) => user.roomInvitation, {
    onDelete: 'CASCADE',
  })
  @IsDefined()
  owner: User;
}
