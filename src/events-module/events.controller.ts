import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { EventService } from './events.service';
import { CreateCustomEventDto } from './dto/create-custom-event.dto';

@Controller('custom-events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(@Body() dto: CreateCustomEventDto) {
    return this.eventService.create(dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.delete(id);
  }
}
