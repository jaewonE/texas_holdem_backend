import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { CoreOuput } from 'src/common/dtos/coreInput.dto';

@InputType()
export class HelloInput {
  @IsString()
  @Field(() => String)
  name: string;
}

@InputType()
export class AsyncHelloInput extends HelloInput {
  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  timeout?: number;
}

@ObjectType()
export class HelloOutput extends CoreOuput {
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  data?: string;
}
