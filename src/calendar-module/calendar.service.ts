// calendar.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Import } from '../import-export-module/entities/import.entity';
import { Export } from '../import-export-module/entities/export.entity';
import { CustomEvent } from '../events-module/entity/event.entity';
import { ProductRequest } from '../request-return-module/entities/request.entity';
import { Return } from '../request-return-module/entities/return.entity';
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
    @InjectRepository(ProductRequest)
    private readonly productRequestRepository: Repository<ProductRequest>,
    @InjectRepository(Return)
    private readonly returnRepository: Repository<Return>,
  ) {}

  // ── Global: imports, exports, requests, returns, custom events ───
  async getMonthData(calendarDto: CalendarDto): Promise<
    SuccessResponse<{
      imports: Import[];
      exports: Export[];
      events: CustomEvent[];
      requests: ProductRequest[];
      returns: Return[];
    }>
  > {
    const { month, year, productId, constructionSiteId } = calendarDto;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const importWhere: any = { date: Between(startDate, endDate) };
    const exportWhere: any = { date: Between(startDate, endDate) };
    const requestWhere: any = { date: Between(startDate, endDate) };
    const returnWhere: any = { date: Between(startDate, endDate) };

    if (productId) {
      importWhere.importItems = { product: { id: productId } };
      exportWhere.exportItems = { product: { id: productId } };
      requestWhere.requestItems = { product: { id: productId } };
      returnWhere.returnItems = { product: { id: productId } };
    }
    if (constructionSiteId) {
      exportWhere.constructionSite = { id: constructionSiteId };
      requestWhere.constructionSite = { id: constructionSiteId };
      returnWhere.constructionSite = { id: constructionSiteId };
      // imports never have a construction site → skip them when site filter is applied
    }

    const [imports, exports, events, requests, returns] = await Promise.all([
      constructionSiteId
        ? Promise.resolve([] as Import[])
        : this.importRepository.find({
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
      this.productRequestRepository.find({
        where: requestWhere,
        relations: [
          'requestItems',
          'requestItems.product',
          'constructionSite',
          'account',
        ],
        order: { date: 'ASC' },
      }),
      this.returnRepository.find({
        where: returnWhere,
        relations: [
          'returnItems',
          'returnItems.product',
          'constructionSite',
          'account',
        ],
        order: { date: 'ASC' },
      }),
    ]);

    return successResponse(
      { imports, exports, events, requests, returns },
      `Données du mois ${month}/${year} récupérées avec succès`,
    );
  }

  // ── Product history: imports, exports, requests, returns (NO custom events) ───
  async getProductMonthData(calendarDto: CalendarDto): Promise<
    SuccessResponse<{
      imports: Import[];
      exports: Export[];
      requests: ProductRequest[];
      returns: Return[];
    }>
  > {
    const { month, year, productId } = calendarDto;
    if (!productId) {
      throw new BadRequestException('productId est requis pour la vue produit');
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const importWhere: any = {
      date: Between(startDate, endDate),
      importItems: { product: { id: productId } },
    };
    const exportWhere: any = {
      date: Between(startDate, endDate),
      exportItems: { product: { id: productId } },
    };
    const requestWhere: any = {
      date: Between(startDate, endDate),
      requestItems: { product: { id: productId } },
    };
    const returnWhere: any = {
      date: Between(startDate, endDate),
      returnItems: { product: { id: productId } },
    };

    const [imports, exports, requests, returns] = await Promise.all([
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
      this.productRequestRepository.find({
        where: requestWhere,
        relations: [
          'requestItems',
          'requestItems.product',
          'constructionSite',
          'account',
        ],
        order: { date: 'ASC' },
      }),
      this.returnRepository.find({
        where: returnWhere,
        relations: [
          'returnItems',
          'returnItems.product',
          'constructionSite',
          'account',
        ],
        order: { date: 'ASC' },
      }),
    ]);

    return successResponse(
      { imports, exports, requests, returns },
      `Données produit du mois ${month}/${year} récupérées`,
    );
  }

  // ── Construction site history: exports, requests, returns (NO imports, NO custom events) ───
  async getSiteMonthData(calendarDto: CalendarDto): Promise<
    SuccessResponse<{
      exports: Export[];
      requests: ProductRequest[];
      returns: Return[];
    }>
  > {
    const { month, year, constructionSiteId } = calendarDto;
    if (!constructionSiteId) {
      throw new BadRequestException(
        'constructionSiteId est requis pour la vue chantier',
      );
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const exportWhere: any = {
      date: Between(startDate, endDate),
      constructionSite: { id: constructionSiteId },
    };
    const requestWhere: any = {
      date: Between(startDate, endDate),
      constructionSite: { id: constructionSiteId },
    };
    const returnWhere: any = {
      date: Between(startDate, endDate),
      constructionSite: { id: constructionSiteId },
    };

    const [exports, requests, returns] = await Promise.all([
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
      this.productRequestRepository.find({
        where: requestWhere,
        relations: [
          'requestItems',
          'requestItems.product',
          'constructionSite',
          'account',
        ],
        order: { date: 'ASC' },
      }),
      this.returnRepository.find({
        where: returnWhere,
        relations: [
          'returnItems',
          'returnItems.product',
          'constructionSite',
          'account',
        ],
        order: { date: 'ASC' },
      }),
    ]);

    return successResponse(
      { exports, requests, returns },
      `Données chantier du mois ${month}/${year} récupérées`,
    );
  }
}
