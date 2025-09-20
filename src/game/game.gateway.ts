import {OnGatewayConnection, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';

@WebSocketGateway({cors: {origin: '*'}})
export class GameGateway implements OnGatewayConnection {
    @WebSocketServer()
    server!: Server;

    handleConnection(client: Socket) {
        // TODO - For future, notify game change to user
    }
}
