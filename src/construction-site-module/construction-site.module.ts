import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstructionSite } from './entities/construction-site.entity';
import { Account } from '../accounts-module/entities/account.entity';
import { ConstructionSiteController } from './construction-site.controller';
import { ConstructionSiteService } from './construction-site.service';

@Module({
  imports: [TypeOrmModule.forFeature([ConstructionSite, Account])],
  controllers: [ConstructionSiteController],
  providers: [ConstructionSiteService],
  exports: [ConstructionSiteService],
})
export class ConstructionSiteModule {}
