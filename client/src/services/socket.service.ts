import { SERVER_URL } from '@/lib/constant';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { Socket, io } from 'socket.io-client';

class SocketService {
	public socket!: Socket<DefaultEventsMap, DefaultEventsMap>;

	setupSocketConnection() {
		this.socket = io(`${SERVER_URL}`, {
			secure: true,
			transports: ['websocket'],
		});
		console.log('Working');
		

		this.socketConnectionEvents();
	}

	private socketConnectionEvents() {
		this.socket.on('connect', () => {
			console.log('connected');
			this.socket.emit('join_room', localStorage.getItem('userId'))
		});

		this.socket.on('disconnect', (reason: string) => {
			console.log(`Reason: ${reason}`);
			this.socket.connect();
		});

		this.socket.on('connect_error', (error) => {
			console.log(`Reason: ${error}`);
			this.socket.connect();
		});
	}
}

export const socketService: SocketService = new SocketService();
