import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/user/entities/user.entity';
import { RoomInvitation } from './roomInvitation.entity';
import { Chat } from './chat.entity';

@InputType('RoomInputType', { isAbstract: true })
@ObjectType()
@Entity('Room')
export class Room extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsString()
  name: string;

  @Column({ default: true })
  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  isPublic: boolean;

  @Column({ default: 0 })
  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  chip: number;

  @Column('int', { array: true, default: [] })
  @Field(() => [Int], { defaultValue: [] })
  @IsArray()
  cardList: number[];

  @Column({ default: 0 })
  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  publicCardLen: number;

  @Column({ default: 8 })
  @Field(() => Int, { defaultValue: 8 })
  @IsInt()
  @Max(8)
  maxMember: number;

  @Column()
  @Field(() => Int)
  @IsInt()
  ownerId: number;

  @OneToMany(() => User, (user: User) => user.room)
  @Field(() => [User], { nullable: true })
  @IsOptional()
  @IsArray()
  users?: User[];

  @OneToMany(
    () => RoomInvitation,
    (invitation: RoomInvitation) => invitation.room,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  @Field(() => [RoomInvitation], { nullable: true })
  @IsArray()
  roomInvitation?: RoomInvitation[];

  @OneToMany(() => Chat, (chat: Chat) => chat.room, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => [Chat], { nullable: true })
  @IsArray()
  chats?: Chat[];
}
