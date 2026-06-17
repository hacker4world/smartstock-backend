import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { Import } from '../import-export-module/entities/import.entity';
import { Export } from '../import-export-module/entities/export.entity';
import { CustomEvent } from 'src/events-module/entity/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Import, Export, CustomEvent])],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
