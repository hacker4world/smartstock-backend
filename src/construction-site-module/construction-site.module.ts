import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstructionSite } from './entities/construction-site.entity';
import { Account } from '../accounts-module/entities/account.entity';
import { ConstructionSiteController } from './construction-site.controller';
import { ConstructionSiteService } from './construction-site.service';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { Task } from './entities/task.entity';
import { Export } from 'src/import-export-module/entities/export.entity';
import { Return } from 'src/request-return-module/entities/return.entity';
import { ProductRequest } from 'src/request-return-module/entities/request.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([ConstructionSite, Account, ProductRequest, Export, Return, Task])],
  controllers: [ConstructionSiteController, TaskController],
  providers: [ConstructionSiteService, TaskService, JwtAuthGuard],
  exports: [ConstructionSiteService],
})
export class ConstructionSiteModule {}
