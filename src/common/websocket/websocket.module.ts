import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { WebsocketService } from './websocket.service';
import { SharedJwtModule } from '../jwt/jwt.module';

@Module({
  imports: [SharedJwtModule],
  providers: [WebsocketGateway, WebsocketService],
  exports: [WebsocketService],
})
export class WebsocketModule {}
