import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsInt, IsPositive } from 'class-validator';
import { CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class CoreEntity {
  @PrimaryGeneratedColumn()
  @IsInt()
  @IsPositive()
  @Field(() => Int)
  id: number;

  @CreateDateColumn()
  @Field(() => Date)
  createAt: Date;
}
