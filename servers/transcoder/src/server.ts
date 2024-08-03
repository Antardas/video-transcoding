import { startApplication } from './app';
import makeDirectory from './shared/global/helpers/make-directory';
import { MessageBroker } from './shared/services/kafka';
import dotenv from 'dotenv';
import path from 'node:path';
import { VIDEO_FOLDER, VIDEO_SUBTITLE_FOLDER } from './shared/global/helpers/CONSTANT';
dotenv.config({ path: '.env' });

process.on('uncaughtException', (err) => {
	console.log(`Error: ${err.message}`);
	console.log('Shutting Down the Server due to unhandled Promise Rejection');
});

makeDirectory(VIDEO_SUBTITLE_FOLDER);
makeDirectory(VIDEO_FOLDER);
startApplication();

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
			MessageBroker.disconnectConsumer();
			MessageBroker.disconnectProducer();
			process.exit(0);
		})
		.catch((error: Error) => {
			console.error(`Error During shut down:: ${error}`);
			process.exit(1);
		});
}
