import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { SuccessResponse } from '../common/utils/success-response';
import { Task } from './entities/task.entity';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionName } from 'src/roles-module/permission.enum';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.CREATE_TASK)
  create(
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<SuccessResponse<Task>> {
    return this.taskService.create(createTaskDto);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.VIEW_TASK)
  findAll(): Promise<SuccessResponse<Task[]>> {
    return this.taskService.findAll();
  }

  // ──────────────────────────────────────────────────────────────────────
  // MOBILE APP ENDPOINT
  // Only protected by authentication (JwtAuthGuard), no role-based
  // permission is required — mirrors /construction-sites/:id/products.
  // ──────────────────────────────────────────────────────────────────────

  /**
   * Get all tasks associated with a specific construction site.
   * GET /tasks/site/:siteId
   */
  @Get('site/:siteId')
  @UseGuards(JwtAuthGuard)
  findBySite(
    @Param('siteId', ParseIntPipe) siteId: number,
  ): Promise<SuccessResponse<Task[]>> {
    return this.taskService.findByConstructionSite(siteId);
  }

  // ──────────────────────────────────────────────────────────────────────
  // MOBILE APP ENDPOINT
  // Only protected by authentication (JwtAuthGuard), no role-based
  // permission is required — site workers may update their task statuses.
  // ──────────────────────────────────────────────────────────────────────

  /**
   * Update the status of a specific task.
   * PATCH /tasks/:id/status
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ): Promise<SuccessResponse<Task>> {
    return this.taskService.updateStatus(id, updateTaskStatusDto);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.VIEW_TASK)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponse<Task>> {
    return this.taskService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.DELETE_TASK)
  remove(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponse<null>> {
    return this.taskService.remove(id);
  }
}
