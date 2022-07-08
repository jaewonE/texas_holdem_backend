import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { Chat } from './entities/chat.entity';
import { Room } from './entities/room.entity';
import { RoomInvitation } from './entities/roomInvitation.entity';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import { RoomResolver } from './room.resolver';
import { RoomService } from './room.service';

@Module({
  imports: [TypeOrmModule.forFeature([Room, RoomInvitation, Chat]), UserModule],
  providers: [RoomResolver, RoomService, MemberResolver, MemberService],
  exports: [],
})
export class RoomModule {}
