import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoreOuput } from 'src/common/dtos/coreOutput.dto';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from 'src/user/jwt/jwt.service';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(User) private readonly userDB: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
}
