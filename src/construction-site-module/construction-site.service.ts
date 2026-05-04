import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, ILike } from 'typeorm';
import { ConstructionSite } from './entities/construction-site.entity';
import { Account } from '../accounts-module/entities/account.entity';
import { CreateConstructionSiteDto } from './dto/create-construction-site.dto';
import { UpdateConstructionSiteDto } from './dto/update-construction-site.dto';
import { ListConstructionSiteDto } from './dto/list-construction-site.dto';
import {
  SuccessResponse,
  successResponse,
} from '../common/utils/success-response';

@Injectable()
export class ConstructionSiteService {
  constructor(
    @InjectRepository(ConstructionSite)
    private readonly constructionSiteRepository: Repository<ConstructionSite>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createConstructionSiteDto: CreateConstructionSiteDto,
  ): Promise<SuccessResponse<ConstructionSite>> {
    const { managerId, ...siteData } = createConstructionSiteDto;

    const manager = await this.accountRepository.findOne({
      where: { id: managerId },
    });
    if (!manager) {
      throw new NotFoundException(`Compte avec l'ID ${managerId} introuvable`);
    }

    const constructionSite = this.constructionSiteRepository.create({
      ...siteData,
      manager,
    });
    const savedSite =
      await this.constructionSiteRepository.save(constructionSite);
    return successResponse(savedSite, 'Chantier créé avec succès');
  }

  async findAll(): Promise<SuccessResponse<ConstructionSite[]>> {
    const sites = await this.constructionSiteRepository.find({
      relations: ['manager'],
    });
    return successResponse(sites, 'Chantiers récupérés avec succès');
  }

  async findFiltered(listConstructionSiteDto: ListConstructionSiteDto): Promise<
    SuccessResponse<{
      items: ConstructionSite[];
      total: number;
      page: number;
      pageSize: number;
    }>
  > {
    const maxPageSize = this.configService.get<number>('PAGE_SIZE', 20);
    const page = listConstructionSiteDto.page ?? 1;
    let pageSize = listConstructionSiteDto.pageSize ?? maxPageSize;

    if (pageSize > maxPageSize) {
      pageSize = maxPageSize;
    }

    const where: any = {};

    if (listConstructionSiteDto.filters) {
      if (listConstructionSiteDto.filters.name) {
        where.name = ILike(`%${listConstructionSiteDto.filters.name}%`);
      }
      if (listConstructionSiteDto.filters.address) {
        where.address = ILike(`%${listConstructionSiteDto.filters.address}%`);
      }
      if (listConstructionSiteDto.filters.managerId) {
        where.manager = { id: listConstructionSiteDto.filters.managerId };
      }
    }

    const [items, total] = await this.constructionSiteRepository.findAndCount({
      where,
      relations: ['manager'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return successResponse(
      { items, total, page, pageSize },
      'Chantiers récupérés avec succès',
    );
  }

  async findOne(id: number): Promise<SuccessResponse<ConstructionSite>> {
    const site = await this.constructionSiteRepository.findOne({
      where: { id },
      relations: ['manager'],
    });
    if (!site) {
      throw new NotFoundException(`Chantier avec l'ID ${id} introuvable`);
    }
    return successResponse(site, 'Chantier récupéré avec succès');
  }

  async update(
    id: number,
    updateConstructionSiteDto: UpdateConstructionSiteDto,
  ): Promise<SuccessResponse<ConstructionSite>> {
    const site = await this.findOne(id);

    const { managerId, ...siteData } = updateConstructionSiteDto;

    if (managerId !== undefined) {
      const manager = await this.accountRepository.findOne({
        where: { id: managerId },
      });
      if (!manager) {
        throw new NotFoundException(
          `Compte avec l'ID ${managerId} introuvable`,
        );
      }
      (site.data as any).manager = manager;
    }

    Object.assign(site.data, siteData);
    const updatedSite = await this.constructionSiteRepository.save(site.data);
    return successResponse(updatedSite, 'Chantier mis à jour avec succès');
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const site = await this.findOne(id);
    await this.constructionSiteRepository.remove(site.data);
    return successResponse(null, 'Chantier supprimé avec succès');
  }
}
