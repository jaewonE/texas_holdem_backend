import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsInt, IsString } from 'class-validator';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/user/entities/user.entity';
import { Room } from './room.entity';

@InputType('ChatInputType', { isAbstract: true })
@ObjectType()
@Entity('Chat')
export class Chat extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsString()
  chat: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Field(() => User)
  sender: User;

  @RelationId((chat: Chat) => chat.sender)
  @Field(() => Int)
  @IsInt()
  senderId: number;

  @ManyToOne(() => Room, (room: Room) => room.chats, { onDelete: 'CASCADE' })
  @Field(() => Room)
  room: Room;

  @RelationId((chat: Chat) => chat.room)
  @Field(() => Int)
  @IsInt()
  roomId: number;
}
