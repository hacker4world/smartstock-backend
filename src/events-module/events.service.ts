import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomEvent } from './entity/event.entity';
import { CreateCustomEventDto } from './dto/create-custom-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(CustomEvent)
    private readonly eventRepository: Repository<CustomEvent>,
  ) {}

  /**
   * Create a new custom event.
   */
  async create(dto: CreateCustomEventDto): Promise<CustomEvent> {
    const event = this.eventRepository.create({
      name: dto.name,
      description: dto.description,
      date: new Date(dto.date), // ensures date parsing
    });
    return this.eventRepository.save(event);
  }

  /**
   * Delete a custom event by ID.
   */
  async delete(id: number): Promise<{ message: string }> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} introuvable`);
    }
    await this.eventRepository.remove(event);
    return { message: 'Événement supprimé avec succès' };
  }
}
