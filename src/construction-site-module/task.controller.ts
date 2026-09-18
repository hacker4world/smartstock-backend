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

  @Patch(':id/status')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PermissionName.UPDATE_TASK_STATUS)
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
