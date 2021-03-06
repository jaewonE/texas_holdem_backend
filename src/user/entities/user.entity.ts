import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Room } from 'src/room/entities/room.entity';
import { RoomInvitation } from 'src/room/entities/roomInvitation.entity';

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity('User')
export class User extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsString()
  name: string;

  @Column({ unique: true })
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column()
  @Field(() => String)
  @IsString()
  password: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  coverImg?: string;

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

  @Column({ default: false })
  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  isReady: boolean;

  @Column({ default: false })
  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  isDead: boolean;

  @ManyToOne(() => Room, (room: Room) => room.users, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Room, { nullable: true })
  @IsOptional()
  room?: Room;

  @RelationId((user: User) => user.room)
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  roomId?: number;

  @OneToMany(
    () => RoomInvitation,
    (invitation: RoomInvitation) => invitation.poster,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  @Field(() => [RoomInvitation], { nullable: true })
  @IsArray()
  postedInvitations?: RoomInvitation[];

  @OneToMany(
    () => RoomInvitation,
    (invitation: RoomInvitation) => invitation.receiver,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  @Field(() => [RoomInvitation], { nullable: true })
  @IsArray()
  receivedInvitations?: RoomInvitation[];
}
