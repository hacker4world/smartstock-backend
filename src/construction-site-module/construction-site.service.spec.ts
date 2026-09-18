import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ConstructionSiteService } from './construction-site.service';
import { ConstructionSite } from './entities/construction-site.entity';
import { Account } from '../accounts-module/entities/account.entity';
import { Export } from '../import-export-module/entities/export.entity';
import { Return } from '../request-return-module/entities/return.entity';
import { ProductRequest } from '../request-return-module/entities/request.entity';
import { Product } from '../product-module/entities/product.entity';
import { ExportItem } from '../import-export-module/entities/export-item.entity';
import { NotFoundException } from '@nestjs/common';

describe('ConstructionSiteService', () => {
  let service: ConstructionSiteService;
  let constructionSiteRepository: jest.Mocked<Repository<ConstructionSite>>;
  let exportRepository: jest.Mocked<Repository<Export>>;

  const mockConfigService = {
    get: jest.fn().mockReturnValue(10),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConstructionSiteService,
        { provide: getRepositoryToken(ConstructionSite), useValue: { find: jest.fn(), findOne: jest.fn(), findAndCount: jest.fn(), create: jest.fn(), save: jest.fn(), remove: jest.fn() } },
        { provide: getRepositoryToken(Account), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(Export), useValue: { find: jest.fn(), findAndCount: jest.fn() } },
        { provide: getRepositoryToken(Return), useValue: { findAndCount: jest.fn() } },
        { provide: getRepositoryToken(ProductRequest), useValue: { findAndCount: jest.fn() } },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ConstructionSiteService>(ConstructionSiteService);
    constructionSiteRepository = module.get(
      getRepositoryToken(ConstructionSite),
    );
    exportRepository = module.get(getRepositoryToken(Export));
  });

  describe('findSitesByAccount', () => {
    it('returns managed sites merged with sites that have exports from the account', async () => {
      const managedSite: Partial<ConstructionSite> = {
        id: 1,
        name: 'Stade Rades',
        address: 'stade rades',
      };
      const exportSite: Partial<ConstructionSite> = {
        id: 2,
        name: 'Pont de Bizerte',
        address: 'bizerte',
      };

      constructionSiteRepository.find.mockResolvedValue([
        managedSite as ConstructionSite,
      ]);
      exportRepository.find.mockResolvedValue([
        { constructionSite: exportSite } as Export,
      ]);

      const result = await service.findSitesByAccount(1);

      expect(result.data).toHaveLength(2);
      expect(result.data.map((s) => s.id)).toEqual([1, 2]);
    });

    it('deduplicates sites that are both managed and exported to', async () => {
      const site: Partial<ConstructionSite> = { id: 1, name: 'Stade', address: 'a' };

      constructionSiteRepository.find.mockResolvedValue([site as ConstructionSite]);
      exportRepository.find.mockResolvedValue([
        { constructionSite: site } as Export,
      ]);

      const result = await service.findSitesByAccount(1);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(1);
    });

    it('returns an empty list when the account has no sites', async () => {
      constructionSiteRepository.find.mockResolvedValue([]);
      exportRepository.find.mockResolvedValue([]);

      const result = await service.findSitesByAccount(99);

      expect(result.data).toEqual([]);
    });
  });

  describe('findProductsBySite', () => {
    it('throws when the site does not exist', async () => {
      constructionSiteRepository.findOne.mockResolvedValue(null);

      await expect(service.findProductsBySite(9999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('aggregates quantities of products across confirmed exports', async () => {
      constructionSiteRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Stade',
      } as ConstructionSite);

      const product: Partial<Product> = {
        id: 2,
        name: 'Sable de construction',
        stock: 149,
        minimumStock: 15,
        averagePrice: 181.29,
        unit: undefined,
        warehouse: undefined,
        category: undefined,
      };

      exportRepository.find.mockResolvedValue([
        {
          exportItems: [
            { product, exitedStock: 20 } as ExportItem,
            { product, exitedStock: 30 } as ExportItem,
          ],
        } as Export,
      ]);

      const result = await service.findProductsBySite(1);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(2);
      expect(result.data[0].quantiteLivre).toBe(50);
      expect(result.data[0].name).toBe('Sable de construction');
    });

    it('returns an empty list when the site has no confirmed export', async () => {
      constructionSiteRepository.findOne.mockResolvedValue({
        id: 1,
      } as ConstructionSite);
      exportRepository.find.mockResolvedValue([]);

      const result = await service.findProductsBySite(1);

      expect(result.data).toEqual([]);
    });
  });
});
