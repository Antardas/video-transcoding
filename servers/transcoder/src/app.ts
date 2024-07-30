import { Consumer } from 'kafkajs';
import { MessageBroker } from './shared/services/kafka';
import { MessageType } from './types';

export async function startApplication() {
	const consumer = await MessageBroker.connectConsumer<Consumer>();

	consumer.on('consumer.connect', (event) => {
		console.log('Consumer connected', event.id);
	});

	MessageBroker.subscribe('VideoEvents', async (data: MessageType) => {
		console.log(data);
	});
}
