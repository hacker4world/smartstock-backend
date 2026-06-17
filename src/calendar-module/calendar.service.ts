import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Import } from '../import-export-module/entities/import.entity';
import { Export } from '../import-export-module/entities/export.entity';
import { CustomEvent } from '../events-module/entity/event.entity';
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
    @InjectRepository(CustomEvent)
    private readonly customEventRepository: Repository<CustomEvent>,
  ) {}

  async getMonthData(calendarDto: CalendarDto): Promise<
    SuccessResponse<{
      imports: Import[];
      exports: Export[];
      events: CustomEvent[];
    }>
  > {
    const { month, year, productId } = calendarDto;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    // Build dynamic where conditions
    const importWhere: any = { date: Between(startDate, endDate) };
    const exportWhere: any = { date: Between(startDate, endDate) };

    if (productId) {
      importWhere.importItems = { product: { id: productId } };
      exportWhere.exportItems = { product: { id: productId } };
    }

    const [imports, exports, events] = await Promise.all([
      this.importRepository.find({
        where: importWhere,
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
        where: exportWhere,
        relations: [
          'exportItems',
          'exportItems.product',
          'warehouse',
          'constructionSite',
          'account',
        ],
        order: { date: 'ASC' },
      }),
      this.customEventRepository.find({
        where: { date: Between(startDate, endDate) },
        order: { date: 'ASC' },
      }),
    ]);

    return successResponse(
      { imports, exports, events },
      `Données du mois ${month}/${year} récupérées avec succès`,
    );
  }
}
