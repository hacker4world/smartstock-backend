import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Family } from './entities/family.entity';
import { Subfamily } from './entities/subfamily.entity';
import { Category } from './entities/category.entity';
import { FamilyController } from './family.controller';
import { SubfamilyController } from './subfamily.controller';
import { CategoryController } from './category.controller';
import { FamilyService } from './family.service';
import { SubfamilyService } from './subfamily.service';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsModule } from '../common/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Family, Subfamily, Category]),
    PermissionsModule,
  ],
  controllers: [FamilyController, SubfamilyController, CategoryController],
  providers: [FamilyService, SubfamilyService, CategoryService, JwtAuthGuard],
  exports: [FamilyService, SubfamilyService, CategoryService],
})
export class ClassificationModule {}
