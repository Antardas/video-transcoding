import express, { Application } from 'express';
import errorMiddleware from './shared/global/helpers/error-middleware';
import uploadRouter from './routes/upload-routes';
import cors from 'cors';
import { MessageBroker } from './shared/services/kafka';
import { Consumer, Producer } from 'kafkajs';

const app: Application = express();
(async () => {
	app.use(cors({ origin: '*' }));
	app.use(express.json());
	// 1st step is connect to producer and consumer
	const producer = await MessageBroker.connectProducer<Producer>();
	producer.on('producer.connect', () => {
		console.log('Producer connected');
	});

	/* 	const consumer = await MessageBroker.connectConsumer<Consumer>();
	consumer.on('consumer.connect', () => {
		console.log('Consumer connected');
	});

	// 2nd step subscribe a topic
	await MessageBroker.subscribe('VideoEvents',() => {

	}); */
	app.use(uploadRouter);

	app.use(errorMiddleware);
})();
export default app;
