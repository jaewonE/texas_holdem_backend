import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsInt, IsOptional, Max } from 'class-validator';
import { CoreOuput } from './coreOutput.dto';

@InputType()
export class PaginationInput {
  @Field(() => Int)
  @IsInt()
  page: number;

  @Field(() => Int)
  @IsInt()
  @Max(30)
  take: number;
}

@ObjectType()
export class PaginationOutput extends CoreOuput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  totalPages?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  totalResult?: number;
}
