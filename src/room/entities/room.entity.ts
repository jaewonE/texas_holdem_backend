import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/user/entities/user.entity';

@InputType('RoomInputType', { isAbstract: true })
@ObjectType()
@Entity('Room')
export class Room extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsString()
  name: string;

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

  @OneToMany(() => User, (user: User) => user.room)
  @Field(() => [User], { nullable: true })
  @IsOptional()
  @IsArray()
  users?: User[];
}
