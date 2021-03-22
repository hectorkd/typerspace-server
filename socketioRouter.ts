import app from './index';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import helperFunctions from './socketHelperFunctions';

const gameState: any = {}; //TODO: create interface for gameState

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  const { roomId } = socket.handshake.query;
  socket.on('Join race', async () => {
    await helperFunctions.joinUser(roomId, socket.id, gameState);
    socket.join(`${roomId}`);
    io.emit(gameState[roomId]);
  });
});

export default server;
