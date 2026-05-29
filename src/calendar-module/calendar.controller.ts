import { Controller, Post, Body } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarDto } from './dto/calendar.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Import } from '../import-export-module/entities/import.entity';
import { Export } from '../import-export-module/entities/export.entity';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('month')
  getMonthData(
    @Body() calendarDto: CalendarDto,
  ): Promise<SuccessResponse<{ imports: Import[]; exports: Export[] }>> {
    return this.calendarService.getMonthData(calendarDto);
  }
}
