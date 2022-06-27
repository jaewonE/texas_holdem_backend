import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
  FindUserInput,
  FindUserOutput,
  SearchUserInput,
  SignInInput,
  SignInOutput,
  UpdateUserInput,
} from './dtos/userCRUD.dto';
import { User } from './entities/user.entity';
import { JwtService } from './jwt/jwt.service';
import * as bcrypt from 'bcrypt';
import { GetUserInvitationOutput } from 'src/room/dtos/memberCRUD.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userDB: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async hashPassword(inputPw: string): Promise<string> {
    try {
      return await bcrypt.hash(inputPw, 10);
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException();
    }
  }

  async checkPassword(password, inputPw: string): Promise<boolean> {
    try {
      return await bcrypt.compare(inputPw, password);
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException();
    }
  }

  async createAccount({
    email,
    password,
    name,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const isExist = await this.userDB.findOne({ where: { email } });
      if (isExist) {
        return {
          status: false,
          error: `An account with Email ${email} already exists.`,
        };
      }
      const hashPw = await this.hashPassword(password);
      const { id } = await this.userDB.save(
        this.userDB.create({ email, password: hashPw, name }),
      );
      return { status: true, token: this.jwtService.sign({ id }) };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from createAccount',
        token: null,
      };
    }
  }

  async findUser({ id }: FindUserInput): Promise<FindUserOutput> {
    try {
      const user = await this.userDB.findOne({ where: { id } });
      return { status: true, user };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from findUser',
        user: null,
      };
    }
  }

  async searchUser({ email }: SearchUserInput): Promise<FindUserOutput> {
    try {
      const user = await this.userDB.findOne({ where: { email } });
      return { status: true, user };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from searchUser',
        user: null,
      };
    }
  }

  async updateUser(
    user: User,
    { email, password, chip, ...payload }: UpdateUserInput,
  ): Promise<CoreOuput> {
    try {
      if (email) {
        const isExist = await this.userDB.findOne({
          where: { email },
        });
        if (isExist) {
          return {
            status: false,
            error: `An account with Email ${email} already exists.`,
          };
        }
        user.email = email;
      }
      if (password) {
        const newPw = await this.hashPassword(password);
        user.password = newPw;
      }
      if (chip && chip >= 0) user.chip = chip;
      user = { ...user, ...payload };
      await this.userDB.save(this.userDB.create(user));
      return { status: true };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from updateUser',
      };
    }
  }

  async deleteUser(id: number): Promise<CoreOuput> {
    try {
      const user = await this.userDB.findOne({ where: { id } });
      if (user) {
        await this.userDB.delete({ id: user.id });
        return { status: true };
      }
      return {
        status: false,
        error: 'User not found',
      };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from deleteUser',
      };
    }
  }

  async signIn({ email, password }: SignInInput): Promise<SignInOutput> {
    try {
      const user = await this.userDB.findOne({ where: { email } });
      if (user) {
        const status = await this.checkPassword(user.password, password);
        if (status) {
          return { status, token: this.jwtService.sign({ id: user.id }) };
        }
        return { status: false, error: 'Wrong password' };
      }
      return {
        status: false,
        error: 'User not found',
      };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from deleteUser',
      };
    }
  }

  async getUserWithInvitations({
    id,
  }: FindUserInput): Promise<GetUserInvitationOutput> {
    try {
      const user = await this.userDB.findOne({
        where: { id },
        relations: ['postedInvitations', 'receivedInvitations'],
      });
      if (!user) return { status: false, error: 'User not found' };
      return {
        status: true,
        postedInvitations: user.postedInvitations,
        receivedInvitations: user.receivedInvitations,
      };
    } catch (e) {
      return {
        status: false,
        error: 'Unexpected error from getUserInvitations',
      };
    }
  }
}
