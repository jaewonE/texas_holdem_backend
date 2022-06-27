import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { Room } from './entities/room.entity';
import { RoomResolver } from './room.resolver';
import { RoomService } from './room.service';

@Module({
  imports: [TypeOrmModule.forFeature([Room]), UserModule],
  providers: [RoomResolver, RoomService],
  exports: [],
})
export class RoomModule {}
