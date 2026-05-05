import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, ILike } from 'typeorm';
import { Manufacturer } from './entities/manufacturer.entity';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { ListManufacturerDto } from './dto/list-manufacturer.dto';
import {
  SuccessResponse,
  successResponse,
} from '../common/utils/success-response';

@Injectable()
export class ManufacturerService {
  constructor(
    @InjectRepository(Manufacturer)
    private readonly manufacturerRepository: Repository<Manufacturer>,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createManufacturerDto: CreateManufacturerDto,
  ): Promise<SuccessResponse<Manufacturer>> {
    const manufacturer = this.manufacturerRepository.create(
      createManufacturerDto,
    );
    const savedManufacturer =
      await this.manufacturerRepository.save(manufacturer);
    return successResponse(savedManufacturer, 'Fabricant créé avec succès');
  }

  async findAll(): Promise<SuccessResponse<Manufacturer[]>> {
    const manufacturers = await this.manufacturerRepository.find();
    return successResponse(manufacturers, 'Fabricants récupérés avec succès');
  }

  async findFiltered(listManufacturerDto: ListManufacturerDto): Promise<
    SuccessResponse<{
      items: Manufacturer[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    const maxPageSize = this.configService.get<number>('PAGE_SIZE', 20);
    const page = listManufacturerDto.page ?? 1;
    let pageSize = listManufacturerDto.pageSize ?? maxPageSize;

    if (pageSize > maxPageSize) {
      pageSize = maxPageSize;
    }

    const where: any[] = [{}];

    if (listManufacturerDto.filters) {
      const filterConditions: any = {};
      if (listManufacturerDto.filters.name) {
        filterConditions.name = ILike(`%${listManufacturerDto.filters.name}%`);
      }
      if (listManufacturerDto.filters.contact) {
        filterConditions.contact = ILike(
          `%${listManufacturerDto.filters.contact}%`,
        );
      }
      if (listManufacturerDto.filters.address) {
        filterConditions.address = ILike(
          `%${listManufacturerDto.filters.address}%`,
        );
      }
      where[0] = filterConditions;
    }

    const [items, total] = await this.manufacturerRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const lastPage = page * pageSize >= total; // <-- NEW

    return successResponse(
      { items, total, page, pageSize, lastPage }, // <-- CHANGED: added lastPage
      'Fabricants récupérés avec succès',
    );
  }

  async findOne(id: number): Promise<SuccessResponse<Manufacturer>> {
    const manufacturer = await this.manufacturerRepository.findOne({
      where: { id },
    });
    if (!manufacturer) {
      throw new NotFoundException(`Fabricant avec l'ID ${id} introuvable`);
    }
    return successResponse(manufacturer, 'Fabricant récupéré avec succès');
  }

  async update(
    id: number,
    updateManufacturerDto: UpdateManufacturerDto,
  ): Promise<SuccessResponse<Manufacturer>> {
    const manufacturer = await this.findOne(id);
    Object.assign(manufacturer.data, updateManufacturerDto);
    const updatedManufacturer = await this.manufacturerRepository.save(
      manufacturer.data,
    );
    return successResponse(
      updatedManufacturer,
      'Fabricant mis à jour avec succès',
    );
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const manufacturer = await this.findOne(id);
    await this.manufacturerRepository.remove(manufacturer.data);
    return successResponse(null, 'Fabricant supprimé avec succès');
  }
}
