import { Injectable } from '@nestjs/common';
import { CustomLogger } from '@opengeekslab_llc/nest-custom-logger';

@Injectable()
export class WebSocketService {
  private readonly logger = CustomLogger('WebSocketService');

  async validateUser(socket) {
    this.logger.log(`user was connected client.id ${socket.id}`);
    // console.log('socket', socket);
    // const token = socket?.handshake?.headers?.token;
    //
    // if (!token) {
    //   throw new WsException('Invalid credentials.');
    // }
    //
    // const user = await this.authenticationService.getUserByToken(authenticationToken);
    //
    // if (!user) {
    //   throw new WsException('Invalid credentials.');
    // }
    //
    return true;
  }
}
