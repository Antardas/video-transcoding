import http from 'http';
import { Server, Socket } from 'socket.io';
import createLogger from './shared/global/helpers/logger';
const logger = createLogger('socket.io');
const CLIENT_URL = process.env.CLIENT_URL || 'localhost:5173';
const userSocketMap = new Map<string, string>();

export let socketIOObject: Server;

export class SocketHandler {
	private io: Server;
	constructor(httpServer: http.Server) {
		const io: Server = new Server(httpServer, {
			cors: {
				origin: CLIENT_URL, // Allow connections from the specified client URL.
				methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow specified HTTP methods.
			},
		});
		this.io = io;
		socketIOObject = io;
	}

	public listen(): void {
		this.io.on('connection', (socket: Socket) => {
			console.log('Post Socket IO handler');
			logger.info('User connected');
			logger.info('socket.id');
			logger.info(socket.id);
			socket.on('join_room', (userId) => {
				userSocketMap.set(socket.id, userId);
				socket.join(userId)
			});

			socket.on('disconnect', () => {
				userSocketMap.delete(socket.id);
			});
		});
	}
}
