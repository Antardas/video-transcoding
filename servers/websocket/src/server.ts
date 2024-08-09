import http from 'http';
import dotenv from 'dotenv';
import app from './app';
import { SocketHandler } from './socket';
dotenv.config({ path: '.env' });
const PORT = process.env.PORT || 5005;
const httpServer: http.Server = http.createServer(app);

const socket = new SocketHandler(httpServer);
socket.listen()

// Handling Uncaught Exception
process.on('uncaughtException', (err) => {
	console.log(`Error: ${err.message}`);
	console.log('Shutting Down the Server due to unhandled Promise Rejection');
});

const server = httpServer.listen(PORT, () => {
	console.log('Application is running of port: ', PORT);
});

process.on('uncaughtException', (error: Error) => {
	console.error(`There was an uncaught error: ${error}`);
	shutDownProperly(1);
});
process.on('unhandledRejection', (error: Error) => {
	console.error(`There was an Promise Rejection error: ${error}`);
	shutDownProperly(2);
});

process.on('SIGTERM', () => {
	console.error('caught SIGTERM');
	shutDownProperly(2);
});

process.on('SIGINT', () => {
	console.error('caught SIGINT');
	shutDownProperly(2);
});

process.on('exit', () => {
	console.error('Exiting');
	shutDownProperly(2);
});

function shutDownProperly(exitCode: number): void {
	Promise.resolve()
		.then(() => {
			console.info('Shutdown Complete');
			server.close(() => {
				process.exit(2);
			});
		})
		.catch((error: Error) => {
			console.error(`Error During shut down:: ${error}`);
			server.close(() => {
				process.exit(1);
			});
		});
}
