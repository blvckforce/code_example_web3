import { Global, Module } from '@nestjs/common';
import { WebSocketService } from './web-socket.service';
import { WebSocketGateway } from './web-socket.gateway';

@Global()
@Module({
  providers: [
    WebSocketService,
    WebSocketGateway,
  ],
  exports: [WebSocketGateway],
})
export class WebSocketModule {}
