import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Account } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ListAccountDto } from './dto/list-account.dto';
import {
  SuccessResponse,
  successResponse,
} from '../common/utils/success-response';
import { AccountRole } from 'src/common/enums/account-role.enum';
import { AccountStats } from './dto/account-stats.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createAccountDto: CreateAccountDto,
  ): Promise<SuccessResponse<Account>> {
    // Check if username already exists
    const existing = await this.accountRepository.findOne({
      where: { username: createAccountDto.username },
    });
    if (existing) {
      throw new ConflictException(
        `Un compte avec le nom d'utilisateur "${createAccountDto.username}" existe déjà`,
      );
    }

    const hashedPassword = await bcrypt.hash(createAccountDto.password, 10);
    const account = this.accountRepository.create({
      ...createAccountDto,
      password: hashedPassword,
    });
    const savedAccount = await this.accountRepository.save(account);
    return successResponse(savedAccount, 'Compte créé avec succès');
  }

  async findFiltered(listAccountDto: ListAccountDto): Promise<
    SuccessResponse<{
      items: Account[];
      total: number;
      page: number;
      pageSize: number;
    }>
  > {
    const maxPageSize = this.configService.get<number>('PAGE_SIZE', 20);
    const page = listAccountDto.page ?? 1;
    let pageSize = listAccountDto.pageSize ?? maxPageSize;

    if (pageSize > maxPageSize) {
      pageSize = maxPageSize;
    }

    const where: any[] = [{}];

    if (listAccountDto.filters) {
      const filterConditions: any = {};
      if (listAccountDto.filters.role) {
        filterConditions.role = listAccountDto.filters.role;
      }
      if (listAccountDto.filters.username) {
        filterConditions.username = ILike(
          `%${listAccountDto.filters.username}%`,
        );
      }
      if (listAccountDto.filters.firstname) {
        filterConditions.firstname = ILike(
          `%${listAccountDto.filters.firstname}%`,
        );
      }
      if (listAccountDto.filters.lastname) {
        filterConditions.lastname = ILike(
          `%${listAccountDto.filters.lastname}%`,
        );
      }

      if (listAccountDto.filters.confirmed !== undefined) {
        filterConditions.confirmed = listAccountDto.filters.confirmed;
      }
      where[0] = filterConditions;
    }

    const [items, total] = await this.accountRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return successResponse(
      { items, total, page, pageSize },
      'Comptes récupérés avec succès',
    );
  }

  async getStats(): Promise<SuccessResponse<AccountStats>> {
    const rawStats = await this.accountRepository
      .createQueryBuilder('account')
      .select('account.role', 'role')
      .addSelect('COUNT(account.id)', 'count')
      .groupBy('account.role')
      .getRawMany();

    let admins = 0;
    let constructionSiteManagers = 0;
    let productKeepers = 0;

    for (const stat of rawStats) {
      const count = parseInt(stat.count, 10);
      switch (stat.role) {
        case AccountRole.ADMIN:
        case AccountRole.ADMIN1:
        case AccountRole.ADMIN2:
          admins += count;
          break;
        case AccountRole.CONSTRUCTION_SITE_MANAGER:
          constructionSiteManagers = count;
          break;
        case AccountRole.PRODUCT_KEEPER:
          productKeepers = count;
          break;
      }
    }

    return successResponse(
      { admins, constructionSiteManagers, productKeepers },
      'Statistiques des comptes récupérées avec succès',
    );
  }

  async accept(id: number): Promise<SuccessResponse<Account>> {
    const account = await this.getAccountById(id);
    account.data.confirmed = true;
    const updatedAccount = await this.accountRepository.save(account.data);
    return successResponse(updatedAccount, 'Compte accepté avec succès');
  }

  async update(
    id: number,
    updateAccountDto: UpdateAccountDto,
  ): Promise<SuccessResponse<Account>> {
    const account = await this.getAccountById(id);

    // Check username uniqueness if being updated
    if (
      updateAccountDto.username &&
      updateAccountDto.username !== account.data.username
    ) {
      const existing = await this.accountRepository.findOne({
        where: { username: updateAccountDto.username },
      });
      if (existing) {
        throw new ConflictException(
          `Un compte avec le nom d'utilisateur "${updateAccountDto.username}" existe déjà`,
        );
      }
    }

    Object.assign(account.data, updateAccountDto);
    const updatedAccount = await this.accountRepository.save(account.data);
    return successResponse(updatedAccount, 'Compte mis à jour avec succès');
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const account = await this.getAccountById(id);
    await this.accountRepository.remove(account.data);
    return successResponse(null, 'Compte supprimé avec succès');
  }

  private async getAccountById(id: number): Promise<SuccessResponse<Account>> {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Compte avec l'ID ${id} introuvable`);
    }
    return successResponse(account, 'Compte récupéré avec succès');
  }
}
