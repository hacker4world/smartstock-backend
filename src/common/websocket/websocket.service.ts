import { Injectable } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { Server } from 'socket.io';

// websocket.service.ts
@Injectable()
export class WebsocketService {
  constructor(private readonly gateway: WebsocketGateway) {}

  emitToUser(userId: number, event: string, data: unknown): void {
    if (!this.gateway.server) return;
    this.gateway.server.to(`user_${userId}`).emit(event, data);
  }

  broadcast(event: string, data: unknown): void {
    if (!this.gateway.server) return;
    this.gateway.server.emit(event, data);
  }

  emitToRoom(room: string, event: string, data: unknown): void {
    if (!this.gateway.server) return;
    this.gateway.server.to(room).emit(event, data);
  }
}
