import { Auth } from 'src/auth/entities/auth.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Socket } from 'socket.io';

interface ConnectedClients {
  [id: string]: {
    socket: Socket;
    user: Auth;
  };
}

@Injectable()
export class MessagesWsService {
  private connectedClients: ConnectedClients = {};

  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {}

  async registerClient(client: Socket, userId: string) {
    const user = await this.authRepository.findOneBy({ id: userId });
    if (!user) throw new Error('Usuario no encontrado');
    if (!user.isActive) throw new Error('El usuario no está activo');
    this.checkUserConnection(user);
    this.connectedClients[client.id] = {
      socket: client,
      user: user,
    };
  }

  removeClient(clientId: string) {
    delete this.connectedClients[clientId];
  }

  getConnectedClients(): string[] {
    return Object.keys(this.connectedClients);
  }

  getUserFullNameBySocketId(socketId: string) {
    return this.connectedClients[socketId].user.fullname;
  }

  private checkUserConnection(user: Auth) {
    for (const clientId of Object.keys(this.connectedClients)) {
      const connectedClient = this.connectedClients[clientId];
      if (connectedClient.user.id === user.id) {
        connectedClient.socket.disconnect();
        break;
      }
    }
  }
}
