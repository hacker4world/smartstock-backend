import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "./entities/Role.entity";
import { Permission } from "./entities/Permission.entity";
import { RolesService } from "./roles.service";
import { RolesController } from "./roles.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}