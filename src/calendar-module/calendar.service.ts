import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Import } from '../import-export-module/entities/import.entity';
import { Export } from '../import-export-module/entities/export.entity';
import { CalendarDto } from './dto/calendar.dto';
import {
  SuccessResponse,
  successResponse,
} from '../common/utils/success-response';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Import)
    private readonly importRepository: Repository<Import>,
    @InjectRepository(Export)
    private readonly exportRepository: Repository<Export>,
  ) {}

  async getMonthData(
    calendarDto: CalendarDto,
  ): Promise<SuccessResponse<{ imports: Import[]; exports: Export[] }>> {
    const { month, year } = calendarDto;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    const [imports, exports] = await Promise.all([
      this.importRepository.find({
        where: {
          date: Between(startDate, endDate),
        },
        relations: [
          'importItems',
          'importItems.product',
          'supplier',
          'manufacturer',
          'account',
        ],
        order: { date: 'ASC' },
      }),
      this.exportRepository.find({
        where: {
          date: Between(startDate, endDate),
        },
        relations: [
          'exportItems',
          'exportItems.product',
          'warehouse',
          'constructionSite',
          'account',
        ],
        order: { date: 'ASC' },
      }),
    ]);

    return successResponse(
      { imports, exports },
      `Données du mois ${month}/${year} récupérées avec succès`,
    );
  }
}
