import { Consumer } from 'kafkajs';
import { MessageBroker } from '.';
import { saveVideoToElasticSearch } from './elastic-search.consumer';

export async function setupConsumer() {
	let consumer = await MessageBroker.connectConsumer<Consumer>();

	consumer.on('consumer.connect', (event) => {
		console.log('Consumer connected', event.id);
	});
	consumer.on('consumer.crash', async (event) => {
		console.log('Consumer crashed', event.id);

		const error = event?.payload?.error;
		console.error(error);
		// https://github.com/tulios/kafkajs/issues/1443#issue-1357475148
		try {
			await consumer.disconnect();
		} finally {
			setTimeout(async () => {
				consumer = await MessageBroker.connectConsumer<Consumer>()
				console.warn({
					message: 'Restarted Consumer on non-retirable error',
				});
			}, 5000);
		}
	});
	saveVideoToElasticSearch();
}
