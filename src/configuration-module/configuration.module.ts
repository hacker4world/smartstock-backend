import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { Unit } from './entities/unit.entity';
import { WarehouseController } from './warehouse.controller';
import { UnitController } from './unit.controller';
import { WarehouseService } from './warehouse.service';
import { UnitService } from './unit.service';

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse, Unit])],
  controllers: [WarehouseController, UnitController],
  providers: [WarehouseService, UnitService],
  exports: [WarehouseService, UnitService],
})
export class ConfigurationModule {}
