import { IsOptional, IsInt, Min, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from '../enums/notification-type.enum';

export class ListNotificationDto {
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}
