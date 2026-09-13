import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './events.service';
import { CreateCustomEventDto } from './dto/create-custom-event.dto';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionName } from 'src/roles-module/permission.enum';

@Controller('custom-events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.CREATE_CALENDAR_EVENT)
  async create(@Body() dto: CreateCustomEventDto) {
    return this.eventService.create(dto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.DELETE_CALENDAR_EVENT)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.delete(id);
  }
}
