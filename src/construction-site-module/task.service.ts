import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { ConstructionSite } from './entities/construction-site.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import {
  SuccessResponse,
  successResponse,
} from '../common/utils/success-response';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(ConstructionSite)
    private readonly constructionSiteRepository: Repository<ConstructionSite>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<SuccessResponse<Task>> {
    const site = await this.constructionSiteRepository.findOne({
      where: { id: createTaskDto.constructionSiteId },
    });
    if (!site) {
      throw new NotFoundException(
        `Chantier avec l'ID ${createTaskDto.constructionSiteId} introuvable`,
      );
    }

    const task = this.taskRepository.create({
      name: createTaskDto.name,
      description: createTaskDto.description,
      deadline: new Date(createTaskDto.deadline),
      status: TaskStatus.PENDING,
      constructionSiteId: site.id,
      constructionSite: site,
    });
    const savedTask = await this.taskRepository.save(task);
    return successResponse(savedTask, 'Tâche créée avec succès');
  }

  async findAll(): Promise<SuccessResponse<Task[]>> {
    const tasks = await this.taskRepository.find({
      relations: ['constructionSite'],
    });
    return successResponse(tasks, 'Tâches récupérées avec succès');
  }

  // MOBILE APP ENDPOINT
  // Only protected by authentication (JwtAuthGuard), no role-based
  // permission is required — mirrors /construction-sites/:id/products.
  async findByConstructionSite(
    siteId: number,
  ): Promise<SuccessResponse<Task[]>> {
    const site = await this.constructionSiteRepository.findOne({
      where: { id: siteId },
    });
    if (!site) {
      throw new NotFoundException(
        `Chantier avec l'ID ${siteId} introuvable`,
      );
    }

    const tasks = await this.taskRepository.find({
      where: { constructionSiteId: siteId },
      order: { deadline: 'ASC', id: 'DESC' },
    });
    return successResponse(tasks, 'Tâches récupérées avec succès');
  }

  async findOne(id: number): Promise<SuccessResponse<Task>> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['constructionSite'],
    });
    if (!task) {
      throw new NotFoundException(`Tâche avec l'ID ${id} introuvable`);
    }
    return successResponse(task, 'Tâche récupérée avec succès');
  }

  async updateStatus(
    id: number,
    updateTaskStatusDto: UpdateTaskStatusDto,
  ): Promise<SuccessResponse<Task>> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Tâche avec l'ID ${id} introuvable`);
    }

    task.status = updateTaskStatusDto.status;
    const updatedTask = await this.taskRepository.save(task);
    return successResponse(updatedTask, 'Statut de la tâche mis à jour avec succès');
  }

  async remove(id: number): Promise<SuccessResponse<null>> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Tâche avec l'ID ${id} introuvable`);
    }
    await this.taskRepository.remove(task);
    return successResponse(null, 'Tâche supprimée avec succès');
  }
}
