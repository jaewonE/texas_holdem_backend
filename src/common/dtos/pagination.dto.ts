import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsOptional, Max } from 'class-validator';
import { CoreOuput } from './coreOutput.dto';

@InputType()
export class PaginationInput {
  @Field(() => Number)
  @IsNumber()
  page: number;

  @Field(() => Number)
  @IsNumber()
  @Max(30)
  take: number;
}

@ObjectType()
export class PaginationOutput extends CoreOuput {
  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  totalPages?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  totalResult?: number;
}
