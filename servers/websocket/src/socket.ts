import http from 'http';
import { Server, Socket } from 'socket.io';
import app from './app';
import createLogger from './shared/global/helpers/logger';
const logger = createLogger('socket.io');
const PORT = process.env.PORT || 5005;
const CLIENT_URL = process.env.CLIENT_URL || 'localhost:5173';
const httpServer: http.Server = http.createServer(app);
const userSocketMap = new Map<string, string>();
const io: Server = new Server(httpServer, {
	cors: {
		origin: CLIENT_URL, // Allow connections from the specified client URL.
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow specified HTTP methods.
	},
});
io.on('connection', (socket: Socket) => {
	logger.info('User connected');
	logger.info('socket.id');
	logger.info(socket.id);
	socket.on('join_room', (userId) => {
		userSocketMap.set(socket.id, userId);
	});

	socket.on('disconnect', () => {
		userSocketMap.delete(socket.id);
	});
});

export { httpServer, io, PORT };
