import { Consumer, Kafka, logLevel, Partitioners, Producer } from 'kafkajs';
import { KafkaType, MessageHandler, PublishType } from './kafka.type';
import { MessageType, TOPIC_TYPE, VideoEvent } from '../../../types';

// Configuration
const CLIENT_ID = process.env.CLIENT_ID || 'video-service';
const GROUP_ID = process.env.GROUP_ID || 'video-service-group';
const BROKERS = [process.env.BROKER_1 || 'localhost:9092'];

const kafka = new Kafka({
	clientId: CLIENT_ID,
	brokers: BROKERS,
	logLevel: logLevel.INFO,
});

let producer: Producer;
let consumer: Consumer;

const createTopic = async (topicList: TOPIC_TYPE[]) => {
	const topicsParams = topicList.map((topic) => ({
		topic,
		numPartitions: 1,
		replicationFactor: 1,
	}));
	const admin = kafka.admin();
	await admin.connect();

	const topicsExists = await admin.listTopics();
	for (const topic of topicsParams) {
		if (!topicsExists.includes(topic.topic)) {
			await admin.createTopics({
				topics: [topic],
			});
		}
	}

	await admin.disconnect();
};

const connectProducer = async <T>(): Promise<T> => {
	await createTopic(['VideoEvents', 'SearchIndexEvents']);

	if (producer) {
		console.log(producer.events)
		return producer as unknown as T;
	}

	producer = kafka.producer({
		createPartitioner: Partitioners.DefaultPartitioner,
	});
	await producer.connect();
	return producer as unknown as T;
};

const disconnectProducer = async () => {
	if (producer) {
		await producer.disconnect();
	}
};

const publish = async (data: PublishType) => {
	const producer = await connectProducer<Producer>();
	const result = await producer.send({
		topic: data.topic,
		messages: [{ headers: data.headers, key: data.event, value: JSON.stringify(data.message) }],
	});

	console.log('Published data:', result);

	return result.length > 0;
};

const connectConsumer = async <T>(): Promise<T> => {
	if (consumer) {
		return consumer as unknown as T;
	}

	consumer = kafka.consumer({
		groupId: GROUP_ID,
	});

	await consumer.connect();

	return consumer as unknown as T;
};

const disconnectConsumer = async () => {
	if (consumer) {
		await consumer.disconnect();
	}
};

const subscribe = async (topic: string, messageHandler: MessageHandler) => {
	const consumer = await connectConsumer<Consumer>();
	await consumer.subscribe({ topic, fromBeginning: true });

	await consumer.run({
		eachMessage: async ({ topic, partition, message }) => {
			if (topic !== 'VideoEvents') {
				return;
			}

			if (message.key && message.value) {
				const inputMessage: MessageType = {
					headers: message.headers,
					event: message.key.toString() as VideoEvent,
					data: message.value ? JSON.parse(message.value.toString()) : null,
				};

				await messageHandler(inputMessage);
				await consumer.commitOffsets([
					{
						topic,
						offset: (Number(message.offset) + 1).toString(),
						partition,
					},
				]);
			}
		},
	});
};

export const MessageBroker: KafkaType = {
	connectConsumer,
	disconnectConsumer,
	subscribe,
	connectProducer,
	disconnectProducer,
	publish,
};
