import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskService } from './task.service';
import { Task, TaskStatus } from './entities/task.entity';
import { ConstructionSite } from './entities/construction-site.entity';
import { NotFoundException } from '@nestjs/common';

describe('TaskService', () => {
  let service: TaskService;
  let taskRepository: jest.Mocked<Repository<Task>>;
  let constructionSiteRepository: jest.Mocked<Repository<ConstructionSite>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn(), remove: jest.fn() },
        },
        {
          provide: getRepositoryToken(ConstructionSite),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskRepository = module.get(getRepositoryToken(Task));
    constructionSiteRepository = module.get(getRepositoryToken(ConstructionSite));
  });

  describe('findByConstructionSite', () => {
    it('throws when the site does not exist', async () => {
      constructionSiteRepository.findOne.mockResolvedValue(null);

      await expect(service.findByConstructionSite(9999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns only the tasks of the requested site, ordered by deadline', async () => {
      constructionSiteRepository.findOne.mockResolvedValue({
        id: 1,
      } as ConstructionSite);

      const tasks: Partial<Task>[] = [
        { id: 2, name: 'Cloisons', constructionSiteId: 1 },
        { id: 1, name: 'Gros œuvre', constructionSiteId: 1 },
      ];
      taskRepository.find.mockResolvedValue(tasks as Task[]);

      const result = await service.findByConstructionSite(1);

      expect(result.data).toHaveLength(2);
      expect(taskRepository.find).toHaveBeenCalledWith({
        where: { constructionSiteId: 1 },
        order: { deadline: 'ASC', id: 'DESC' },
      });
    });

    it('returns an empty list when the site has no tasks', async () => {
      constructionSiteRepository.findOne.mockResolvedValue({
        id: 1,
      } as ConstructionSite);
      taskRepository.find.mockResolvedValue([]);

      const result = await service.findByConstructionSite(1);

      expect(result.data).toEqual([]);
    });
  });

  describe('updateStatus', () => {
    it('updates and returns the task with the new status', async () => {
      const task = { id: 1, status: TaskStatus.PENDING } as Task;
      taskRepository.findOne.mockResolvedValue(task);
      taskRepository.save.mockResolvedValue({
        ...task,
        status: TaskStatus.IN_PROGRESS,
      } as Task);

      const result = await service.updateStatus(1, {
        status: TaskStatus.IN_PROGRESS,
      });

      expect(result.data.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('throws when the task does not exist', async () => {
      taskRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus(99, { status: TaskStatus.COMPLETED }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
