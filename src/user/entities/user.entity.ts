import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { CoreEntity } from 'src/common/entities/core.entity';

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
  @IsPositive()
  chip: number;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  roomId?: number;

  @Column('int', { array: true, default: [] })
  @Field(() => [Int], { defaultValue: [] })
  @IsArray()
  cardList: number[];

  @Column({ default: 0 })
  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @IsPositive()
  publicCardLen: number;

  @Column({ default: false })
  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  isReady: boolean;

  @Column({ default: false })
  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  isDead: boolean;

  @Column({ default: false })
  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  isAdmin: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.error(e);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(inputPw: string): Promise<boolean> {
    try {
      return await bcrypt.compare(inputPw, this.password);
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException();
    }
  }
}
