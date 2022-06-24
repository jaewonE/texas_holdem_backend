import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from 'src/user/jwt/jwt.service';
import { RoomResolver } from './room.resolver';
import { RoomService } from './room.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [RoomResolver, RoomService, JwtService],
  exports: [],
})
export class RoomModule {}
