import { IsEnum } from 'class-validator';
import { NotificationType } from '../enums/notification-type.enum';

export class MarkAllReadDto {
  @IsEnum(NotificationType)
  type: NotificationType;
}
