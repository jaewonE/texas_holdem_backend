import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsyncHelloInput, HelloInput, HelloOutput } from './dtos/user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userDB: Repository<User>,
  ) {}

  hello({ name }: HelloInput): HelloOutput {
    return { status: true, data: 'Hello' + name };
  }

  async asyncHello({ name, timeout }: AsyncHelloInput): Promise<HelloOutput> {
    console.log(timeout);
    return new Promise<HelloOutput>((resolve) => {
      setTimeout(
        () => {
          resolve({ status: true, data: 'Hello' + name });
        },
        timeout ? timeout : 1000,
      );
    });
  }
}
