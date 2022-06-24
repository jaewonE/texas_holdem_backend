import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { User } from '../entities/user.entity';

@InputType()
export class SignInInput extends PickType(User, ['email', 'password']) {}

@ObjectType()
export class SignInOutput extends CoreOuput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  token?: string;
}
