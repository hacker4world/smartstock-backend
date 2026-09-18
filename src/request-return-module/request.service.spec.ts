import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { RequestService } from './request.service';
import { ProductRequest } from './entities/request.entity';
import { RequestItem } from './entities/request-items.entity';
import { Product } from '../product-module/entities/product.entity';
import { ConstructionSite } from '../construction-site-module/entities/construction-site.entity';
import { Account } from '../accounts-module/entities/account.entity';
import { Export } from '../import-export-module/entities/export.entity';
import { ExportItem } from '../import-export-module/entities/export-item.entity';
import { NotificationsService } from '../notifications-module/notifications.service';
import { PdfGenerationService } from '../common/document-generation/document-generation.service';
import { BadRequestException } from '@nestjs/common';
import { CreateMobileProductRequestDto } from './dto/create-mobile-product-request.dto';

describe('RequestService', () => {
  let service: RequestService;
  let productRepository: jest.Mocked<Repository<Product>>;
  let constructionSiteRepository: jest.Mocked<Repository<ConstructionSite>>;
  let accountRepository: jest.Mocked<Repository<Account>>;
  let requestRepository: jest.Mocked<Repository<ProductRequest>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestService,
        {
          provide: getRepositoryToken(ProductRequest),
          useValue: {
            create: jest.fn((entity) => entity),
            save: jest.fn(async (entity) => ({ ...entity, id: 1 })),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            remove: jest.fn(),
          },
        },
        { provide: getRepositoryToken(RequestItem), useValue: { find: jest.fn() } },
        {
          provide: getRepositoryToken(Product),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(ConstructionSite),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Account),
          useValue: { findOne: jest.fn() },
        },
        { provide: getRepositoryToken(Export), useValue: {} },
        { provide: getRepositoryToken(ExportItem), useValue: {} },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(10) } },
        { provide: NotificationsService, useValue: { create: jest.fn().mockResolvedValue({}) } },
        { provide: PdfGenerationService, useValue: {} },
      ],
    }).compile();

    service = module.get<RequestService>(RequestService);
    productRepository = module.get(getRepositoryToken(Product));
    constructionSiteRepository = module.get(
      getRepositoryToken(ConstructionSite),
    );
    accountRepository = module.get(getRepositoryToken(Account));
    requestRepository = module.get(getRepositoryToken(ProductRequest));
  });

  describe('createForAccount', () => {
    it('creates a request with the account resolved from the JWT', async () => {
      productRepository.findOne.mockResolvedValue({
        id: 2,
        name: 'Sable',
      } as Product);
      constructionSiteRepository.findOne.mockResolvedValue({
        id: 1,
      } as ConstructionSite);
      accountRepository.findOne.mockResolvedValue({ id: 7 } as Account);
      requestRepository.findOne.mockResolvedValue({
        id: 1,
        requestItems: [],
        constructionSite: { name: 'Stade' },
        account: { username: 'mobile-user' },
      } as unknown as ProductRequest);

      const dto = new CreateMobileProductRequestDto();
      dto.constructionSiteId = 1;
      dto.requestItems = [{ productId: 2, requestedStock: 5 }];

      const result = await service.createForAccount(7, dto);

      expect(requestRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          account: { id: 7 },
          constructionSite: { id: 1 },
          requestItems: [
            expect.objectContaining({
              product: { id: 2 },
              requestedStock: 5,
            }),
          ],
        }),
      );
      expect(result.data).toBeDefined();
    });

    it('defaults the date to today when not provided', async () => {
      productRepository.findOne.mockResolvedValue({ id: 2 } as Product);
      constructionSiteRepository.findOne.mockResolvedValue({ id: 1 } as ConstructionSite);
      accountRepository.findOne.mockResolvedValue({ id: 7 } as Account);
      requestRepository.findOne.mockResolvedValue({ id: 1 } as ProductRequest);

      const dto = new CreateMobileProductRequestDto();
      dto.constructionSiteId = 1;
      dto.requestItems = [{ productId: 2, requestedStock: 1 }];

      await service.createForAccount(7, dto);

      const saved = requestRepository.save.mock.calls[0][0] as ProductRequest;
      expect(saved.date).toBe(new Date().toISOString().split('T')[0]);
    });

    it('rejects an empty request', async () => {
      const dto = new CreateMobileProductRequestDto();
      dto.constructionSiteId = 1;
      dto.requestItems = [];

      await expect(service.createForAccount(7, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
