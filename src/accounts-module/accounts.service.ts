import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
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
import { AccountStats } from './dto/account-stats.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { NotificationsService } from 'src/notifications-module/notifications.service';
import { NotificationType } from 'src/notifications-module/enums/notification-type.enum';
import { ConstructionSite } from 'src/construction-site-module/entities/construction-site.entity';
import { Export } from 'src/import-export-module/entities/export.entity';
import { Import } from 'src/import-export-module/entities/import.entity';
import { ProductRequest } from 'src/request-return-module/entities/request.entity';
import { Return } from 'src/request-return-module/entities/return.entity';
import { Role } from '../roles-module/entities/Role.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Import)
    private readonly importRepository: Repository<Import>,
    @InjectRepository(Export)
    private readonly exportRepository: Repository<Export>,
    @InjectRepository(ProductRequest)
    private readonly requestRepository: Repository<ProductRequest>,
    @InjectRepository(Return)
    private readonly returnRepository: Repository<Return>,
    @InjectRepository(ConstructionSite)
    private readonly constructionSiteRepository: Repository<ConstructionSite>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getAccountActivity(id: number): Promise<
    SuccessResponse<{
      imports: Import[];
      exports: Export[];
      requests: ProductRequest[];
      returns: Return[];
      constructionSites: ConstructionSite[];
    }>
  > {
    await this.getAccountById(id);

    const [imports, exports, requests, returns, constructionSites] =
      await Promise.all([
        this.importRepository.find({
          where: { account: { id } },
          order: { createdAt: 'DESC' },
          take: 10,
        }),
        this.exportRepository.find({
          where: { account: { id } },
          order: { createdAt: 'DESC' },
          take: 10,
        }),
        this.requestRepository.find({
          where: { account: { id } },
          order: { createdAt: 'DESC' },
          take: 10,
        }),
        this.returnRepository.find({
          where: { account: { id } },
          order: { createdAt: 'DESC' },
          take: 10,
        }),
        this.constructionSiteRepository.find({
          where: { manager: { id } },
          order: { createdAt: 'DESC' },
          take: 10,
        }),
      ]);

    return successResponse(
      { imports, exports, requests, returns, constructionSites },
      'Activité du compte récupérée avec succès',
    );
  }

  async login(
    loginDto: LoginDto,
  ): Promise<SuccessResponse<{ account: Account; token: string }>> {
    const account = await this.accountRepository.findOne({
      where: { username: loginDto.username },
      // eager: true on the relation already loads role, but explicit is safer:
      relations: ['role'],
    });

    if (!account) {
      throw new UnauthorizedException(
        "Nom d'utilisateur ou mot de passe incorrect",
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      account.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        "Nom d'utilisateur ou mot de passe incorrect",
      );
    }

    if (!account.confirmed) {
      throw new UnauthorizedException(
        "Votre compte n'a pas encore été confirmé. Veuillez contacter un administrateur.",
      );
    }

    const payload = {
      sub: account.id,
      username: account.username,
      role: account.role?.name ?? null,
      roleId: account.role?.id ?? null,
    };

    const token = this.jwtService.sign(payload);

    return successResponse({ account, token }, 'Connexion réussie');
  }

  async create(
    createAccountDto: CreateAccountDto,
  ): Promise<SuccessResponse<Account>> {
    const existing = await this.accountRepository.findOne({
      where: { username: createAccountDto.username },
    });
    if (existing) {
      throw new ConflictException(
        `Un compte avec le nom d'utilisateur "${createAccountDto.username}" existe déjà`,
      );
    }

    const hashedPassword = await bcrypt.hash(createAccountDto.password, 10);

    const savedAccount = await this.accountRepository.save({
      firstname: createAccountDto.firstname,
      lastname: createAccountDto.lastname,
      username: createAccountDto.username,
      password: hashedPassword,
    });

    // Re-fetch with relations to return full data
    const fullAccount = await this.accountRepository.findOne({
      where: { id: savedAccount.id },
      relations: ['role'],
    });

    this.notificationsService
      .create({
        message: `Nouveau compte créé : ${savedAccount.firstname} ${savedAccount.lastname} (${savedAccount.username})`,
        type: NotificationType.NEW_ACCOUNT,
      })
      .catch(() => {});

    return successResponse(fullAccount!, 'Compte créé avec succès');
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

    const where: any = {};

    if (listAccountDto.filters) {
      if (listAccountDto.filters.roleId) {
        where.role = { id: listAccountDto.filters.roleId };
      }
      if (listAccountDto.filters.username) {
        where.username = ILike(`%${listAccountDto.filters.username}%`);
      }
      if (listAccountDto.filters.firstname) {
        where.firstname = ILike(`%${listAccountDto.filters.firstname}%`);
      }
      if (listAccountDto.filters.lastname) {
        where.lastname = ILike(`%${listAccountDto.filters.lastname}%`);
      }
      if (listAccountDto.filters.confirmed !== undefined) {
        where.confirmed = listAccountDto.filters.confirmed;
      }
    }

    const [items, total] = await this.accountRepository.findAndCount({
      where,
      relations: ['role'],
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
      .leftJoin('account.role', 'role')
      .select('role.name', 'roleName')
      .addSelect('COUNT(account.id)', 'count')
      .groupBy('role.name')
      .getRawMany<{ roleName: string | null; count: string }>();

    const roles: Record<string, number> = {};
    let unassigned = 0;

    for (const stat of rawStats) {
      const count = parseInt(stat.count, 10);
      if (stat.roleName) {
        roles[stat.roleName] = count;
      } else {
        unassigned = count;
      }
    }

    return successResponse(
      { roles, unassigned },
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

    // Handle roleId update
    if (updateAccountDto.roleId !== undefined) {
      if (updateAccountDto.roleId === null) {
        // Explicitly remove the role
        account.data.role = null as any;
      } else {
        const role = await this.roleRepository.findOne({
          where: { id: updateAccountDto.roleId },
        });
        if (!role) {
          throw new NotFoundException(
            `Rôle avec l'ID ${updateAccountDto.roleId} introuvable`,
          );
        }
        account.data.role = role;
      }
      // Remove roleId from the DTO so Object.assign doesn't try to set it directly
      delete updateAccountDto.roleId;
    }

    Object.assign(account.data, updateAccountDto);
    const updatedAccount = await this.accountRepository.save(account.data);

    // Re-fetch with relations
    const fullAccount = await this.accountRepository.findOne({
      where: { id: updatedAccount.id },
      relations: ['role'],
    });

    return successResponse(fullAccount!, 'Compte mis à jour avec succès');
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const account = await this.getAccountById(id);
    await this.accountRepository.remove(account.data);
    return successResponse(null, 'Compte supprimé avec succès');
  }

  private async getAccountById(id: number): Promise<SuccessResponse<Account>> {
    const account = await this.accountRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!account) {
      throw new NotFoundException(`Compte avec l'ID ${id} introuvable`);
    }
    return successResponse(account, 'Compte récupéré avec succès');
  }

  async findOne(id: number): Promise<SuccessResponse<Account>> {
    return this.getAccountById(id);
  }
}
