import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import {
  IsInt,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { CoreOuput } from 'src/common/dtos/coreInput.dto';
import { User } from '../entities/user.entity';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'name',
]) {}

@ObjectType()
export class CreateAccountOutput extends CoreOuput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  token?: string;
}

@InputType()
export class SignInInput extends PickType(User, ['email', 'password']) {}

@ObjectType()
export class SignInOutput extends CoreOuput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  token?: string;
}

@InputType()
export class FindUserInput extends PickType(User, ['id']) {}

@InputType()
export class SearchUserInput extends PickType(User, ['email']) {}

@ObjectType()
export class FindUserOutput extends CoreOuput {
  @Field(() => User, { nullable: true })
  @IsOptional()
  @IsObject()
  user?: User;
}

@InputType()
export class UpdateUserInput extends PartialType(
  PickType(User, ['name', 'email', 'password', 'coverImg']),
) {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  chip?: number;
}
