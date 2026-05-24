import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, Between } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { MarkAllReadDto } from './dto/mark-all-read.dto';
import { ListNotificationDto } from './dto/list-notification.dto';
import {
  SuccessResponse,
  successResponse,
} from '../common/utils/success-response';
import { WebsocketService } from 'src/common/websocket/websocket.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly configService: ConfigService,
    private readonly websocketService: WebsocketService,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<SuccessResponse<Notification>> {
    const notification = this.notificationRepository.create(
      createNotificationDto,
    );
    const savedNotification =
      await this.notificationRepository.save(notification);

    this.websocketService.broadcast('notification.created', savedNotification);
    return successResponse(savedNotification, 'Notification créée avec succès');
  }

  async markAllAsRead(
    markAllReadDto: MarkAllReadDto,
  ): Promise<SuccessResponse<null>> {
    await this.notificationRepository.update(
      { type: markAllReadDto.type, isRead: false },
      { isRead: true },
    );
    return successResponse(
      null,
      'Toutes les notifications de ce type ont été marquées comme lues',
    );
  }

  async markOneAsRead(id: number): Promise<SuccessResponse<Notification>> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(`Notification avec l'ID ${id} introuvable`);
    }
    notification.isRead = true;
    const updatedNotification =
      await this.notificationRepository.save(notification);
    return successResponse(
      updatedNotification,
      'Notification marquée comme lue',
    );
  }

  async findFiltered(listNotificationDto: ListNotificationDto): Promise<
    SuccessResponse<{
      items: Notification[];
      total: number;
      page: number;
      pageSize: number;
      lastPage: boolean;
    }>
  > {
    const maxPageSize = this.configService.get<number>('PAGE_SIZE', 20);
    const page = listNotificationDto.page ?? 1;
    let pageSize = listNotificationDto.pageSize ?? maxPageSize;

    if (pageSize > maxPageSize) {
      pageSize = maxPageSize;
    }

    const where: any = {};

    // Filter by type (exact match)
    if (listNotificationDto.type) {
      where.type = listNotificationDto.type;
    }

    // Filter by exact date (YYYY-MM-DD) — match the full day range
    if (listNotificationDto.date) {
      const startDate = new Date(listNotificationDto.date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(listNotificationDto.date);
      endDate.setHours(23, 59, 59, 999);
      where.date = Between(startDate, endDate);
    }

    const [items, total] = await this.notificationRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { date: 'DESC' },
    });

    const lastPage = page * pageSize >= total;

    return successResponse(
      { items, total, page, pageSize, lastPage },
      'Notifications récupérées avec succès',
    );
  }
}
