import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { Import } from '../import-export-module/entities/import.entity';
import { Export } from '../import-export-module/entities/export.entity';
import { CustomEvent } from 'src/events-module/entity/event.entity';
import { ProductRequest } from 'src/request-return-module/entities/request.entity';
import { Return } from 'src/request-return-module/entities/return.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Import, Export, CustomEvent, ProductRequest, Return])],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
