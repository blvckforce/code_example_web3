import config from 'config';
import {
  OnGatewayConnection,
  WebSocketGateway as WSGateway, WebSocketServer,
} from '@nestjs/websockets';
import { WebSocketService } from './web-socket.service';
import { Server } from 'socket.io';
import { Socket } from 'socket.io/dist/socket';

@WSGateway(config.sockets.port, {
  path: config.sockets.path,
})
export class WebSocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly service: WebSocketService,
  ) {
  }

  /**
   * @private
   * @param socket {Socket}
   */
  async handleConnection(socket: Socket) {
    await this.service.validateUser(socket);
  }

  emit(eventName: string, ...args: any[]) {
    this.server.emit(eventName, ...args);
  }
}
