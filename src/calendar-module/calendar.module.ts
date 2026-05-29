import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { Import } from '../import-export-module/entities/import.entity';
import { Export } from '../import-export-module/entities/export.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Import, Export])],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
