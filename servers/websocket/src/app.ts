import express, { Application } from 'express';

import cors from 'cors';
import errorMiddleware from './shared/global/helpers/error-middleware';
import { MessageBroker } from './shared/services/kafka';
import { Consumer } from 'kafkajs';
import createLogger from './shared/global/helpers/logger';
import { MessageType } from './types';
import { socketIOObject } from './socket';
const logger = createLogger('kafka-consumer');
const app: Application = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
(async () => {
	const consumer = await MessageBroker.connectConsumer<Consumer>();
	consumer.on('consumer.connect', (event) => {
		logger.info(`
			Consumer Connected: ${event.id}
			`);
	});

	consumer.on('consumer.crash', (event) => {
		const error = event?.payload?.error;
		logger.error(error);
	});

	MessageBroker.subscribe('ProgressEvents', async (data: MessageType) => {
		console.log(data);

		socketIOObject.to(data.data.userId).emit('progress', data.data);
	});
})();
app.use(errorMiddleware);

export default app;
