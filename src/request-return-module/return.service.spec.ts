import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ProductReturnService } from './return.service';
import { Return } from './entities/return.entity';
import { ReturnItem } from './entities/return-item.entity';
import { Product } from '../product-module/entities/product.entity';
import { ConstructionSite } from '../construction-site-module/entities/construction-site.entity';
import { Account } from '../accounts-module/entities/account.entity';
import { NotificationsService } from '../notifications-module/notifications.service';
import { PdfGenerationService } from '../common/document-generation/document-generation.service';
import { BadRequestException } from '@nestjs/common';
import { CreateMobileReturnDto } from './dto/create-mobile-return.dto';

describe('ProductReturnService', () => {
  let service: ProductReturnService;
  let productRepository: jest.Mocked<Repository<Product>>;
  let constructionSiteRepository: jest.Mocked<Repository<ConstructionSite>>;
  let accountRepository: jest.Mocked<Repository<Account>>;
  let returnRepository: jest.Mocked<Repository<Return>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductReturnService,
        {
          provide: getRepositoryToken(Return),
          useValue: {
            create: jest.fn((entity) => entity),
            save: jest.fn(async (entity) => ({ ...entity, id: 1 })),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            remove: jest.fn(),
          },
        },
        { provide: getRepositoryToken(ReturnItem), useValue: { find: jest.fn() } },
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
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(10) } },
        { provide: NotificationsService, useValue: { create: jest.fn().mockResolvedValue({}) } },
        { provide: PdfGenerationService, useValue: {} },
      ],
    }).compile();

    service = module.get<ProductReturnService>(ProductReturnService);
    productRepository = module.get(getRepositoryToken(Product));
    constructionSiteRepository = module.get(
      getRepositoryToken(ConstructionSite),
    );
    accountRepository = module.get(getRepositoryToken(Account));
    returnRepository = module.get(getRepositoryToken(Return));
  });

  describe('createForAccount', () => {
    it('creates a return with the account resolved from the JWT', async () => {
      productRepository.findOne.mockResolvedValue({
        id: 3,
        name: 'Ciment',
      } as Product);
      constructionSiteRepository.findOne.mockResolvedValue({
        id: 1,
      } as ConstructionSite);
      accountRepository.findOne.mockResolvedValue({ id: 9 } as Account);
      returnRepository.findOne.mockResolvedValue({
        id: 1,
        returnItems: [],
        constructionSite: { name: 'Stade' },
        account: { username: 'mobile-user' },
      } as unknown as Return);

      const dto = new CreateMobileReturnDto();
      dto.constructionSiteId = 1;
      dto.returnItems = [{ productId: 3, returnedStock: 4, reason: 'Excédent' }];

      const result = await service.createForAccount(9, dto);

      expect(returnRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          account: { id: 9 },
          constructionSite: { id: 1 },
          returnItems: [
            expect.objectContaining({
              product: { id: 3 },
              returnedStock: 4,
              reason: 'Excédent',
            }),
          ],
        }),
      );
      expect(result.data).toBeDefined();
    });

    it('defaults the date to today when not provided', async () => {
      productRepository.findOne.mockResolvedValue({ id: 3 } as Product);
      constructionSiteRepository.findOne.mockResolvedValue({ id: 1 } as ConstructionSite);
      accountRepository.findOne.mockResolvedValue({ id: 9 } as Account);
      returnRepository.findOne.mockResolvedValue({ id: 1 } as Return);

      const dto = new CreateMobileReturnDto();
      dto.constructionSiteId = 1;
      dto.returnItems = [{ productId: 3, returnedStock: 1 }];

      await service.createForAccount(9, dto);

      const saved = returnRepository.save.mock.calls[0][0] as Return;
      expect(saved.date).toBe(new Date().toISOString().split('T')[0]);
    });

    it('rejects an empty return', async () => {
      const dto = new CreateMobileReturnDto();
      dto.constructionSiteId = 1;
      dto.returnItems = [];

      await expect(service.createForAccount(9, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findMyReturns', () => {
    it('scopes the list to the authenticated account', async () => {
      returnRepository.findAndCount.mockResolvedValue([
        [{ id: 2 } as Return],
        1,
      ]);

      const result = await service.findMyReturns(9, 1, 10);

      // The accountId filter must be applied so an account only ever sees
      // its own returns.
      expect(returnRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            account: { id: 9 },
          }),
        }),
      );
      expect(result.data.items).toHaveLength(1);
      expect(result.data.lastPage).toBe(true);
    });

    it('serializes a return with its returnItems, matching what the mobile app reads', async () => {
      // The mobile history screen reads response.data.items[].returnItems.
      // This pins the wire format so a rename on either side fails here
      // instead of silently emptying the screen.
      const product = { id: 9, name: 'Ciment' } as Product;
      returnRepository.findAndCount.mockResolvedValue([
        [
          {
            id: 2,
            returnItems: [
              { id: 21, product, returnedStock: 4, reason: 'Excédent' } as ReturnItem,
            ],
          } as Return,
        ],
        1,
      ]);

      const result = await service.findMyReturns(9, 1, 10);

      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0].returnItems).toHaveLength(1);
      expect(result.data.items[0].returnItems[0].returnedStock).toBe(4);
      expect(result.data.items[0].returnItems[0].reason).toBe('Excédent');
    });

    it('reports more pages available when the page is not full', async () => {
      returnRepository.findAndCount.mockResolvedValue([
        [{ id: 2 } as Return],
        25,
      ]);

      const result = await service.findMyReturns(9, 1, 10);

      expect(result.data.lastPage).toBe(false);
    });
  });
});
