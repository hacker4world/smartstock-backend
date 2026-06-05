import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { MarkAllReadDto } from './dto/mark-all-read.dto';
import { ListNotificationDto } from './dto/list-notification.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Notification } from './entities/notification.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<SuccessResponse<Notification>> {
    return this.notificationsService.create(createNotificationDto);
  }

  @Patch('mark-all-read')
  markAllAsRead(
    @Body() markAllReadDto: MarkAllReadDto,
  ): Promise<SuccessResponse<null>> {
    return this.notificationsService.markAllAsRead(markAllReadDto);
  }

  @Patch(':id/read')
  markOneAsRead(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Notification>> {
    return this.notificationsService.markOneAsRead(id);
  }

  @Post('list')
  findFiltered(@Body() listNotificationDto: ListNotificationDto): Promise<
    SuccessResponse<{
      items: Notification[];
    }>
  > {
    return this.notificationsService.findFiltered(listNotificationDto);
  }
}
