import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstructionSite } from './entities/construction-site.entity';
import { Account } from '../accounts-module/entities/account.entity';
import { ConstructionSiteController } from './construction-site.controller';
import { ConstructionSiteService } from './construction-site.service';
import { Export } from 'src/import-export-module/entities/export.entity';
import { Return } from 'src/request-return-module/entities/return.entity';
import { ProductRequest } from 'src/request-return-module/entities/request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConstructionSite, Account, ProductRequest, Export, Return])],
  controllers: [ConstructionSiteController],
  providers: [ConstructionSiteService],
  exports: [ConstructionSiteService],
})
export class ConstructionSiteModule {}
