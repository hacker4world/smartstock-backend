import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './events.service';
import { EventController } from './events.controller';
import { CustomEvent } from './entity/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomEvent])],
  controllers: [EventController],
  providers: [EventService],
  exports: [],
})
export class EventsModule {}