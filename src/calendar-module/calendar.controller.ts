import { Controller, Post, Body } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarDto } from './dto/calendar.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Import } from '../import-export-module/entities/import.entity';
import { Export } from '../import-export-module/entities/export.entity';
import { ProductRequest } from 'src/request-return-module/entities/request.entity';
import { Return } from 'src/request-return-module/entities/return.entity';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('month')
  getMonthData(
    @Body() calendarDto: CalendarDto,
  ): Promise<SuccessResponse<{ imports: Import[]; exports: Export[] }>> {
    return this.calendarService.getMonthData(calendarDto);
  }

  @Post('product')
  getProductHistory(
    @Body() calendarDto: CalendarDto,
  ): Promise<SuccessResponse<{ imports: Import[]; exports: Export[] }>> {
    return this.calendarService.getProductMonthData(calendarDto);
  }

  @Post('site')
  getSiteHistory(@Body() calendarDto: CalendarDto): Promise<
    SuccessResponse<{
      exports: Export[];
      requests: ProductRequest[];
      returns: Return[];
    }>
  > {
    return this.calendarService.getSiteMonthData(calendarDto);
  }
}
