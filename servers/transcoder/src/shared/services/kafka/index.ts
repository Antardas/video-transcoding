import { MessageType, TOPIC_TYPE, VideoEvent } from './../../../types/subscription.type';
import { Consumer, Kafka, logLevel, Partitioners, Producer } from 'kafkajs';
import { KafkaType, MessageHandler, PublishType } from './kafka.type';

// Configuration
const CLIENT_ID = process.env.CLIENT_ID || 'transcoder-service';
const GROUP_ID = process.env.GROUP_ID || 'transcoder-service-group';
const BROKERS = [process.env.BROKER_1 || 'localhost:9092'];

let producer: Producer;
let consumer: Consumer;

const kafka = new Kafka({
	clientId: CLIENT_ID,
	brokers: BROKERS,
	logLevel: logLevel.INFO,
});

const createTopic = async (topicNames: Array<TOPIC_TYPE>) => {
	const topics = topicNames.map((topicName) => ({
		topic: topicName,
		numPartitions: 2,
		replicationFactor: 1,
	}));

	const admin = kafka.admin();
	await admin.connect();
	const topicExists = await admin.listTopics();
	for (const topic of topics) {
		if (!topicExists.includes(topic.topic)) {
			await admin.createTopics({
				topics: [topic],
			});
		}
	}
	console.log(topicExists);
	await admin.connect();
};

const connectProducer = async <T>(): Promise<T> => {
	await createTopic(['VideoEvents']);

	if (producer) {
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
		messages: [
			{
				headers: data.headers,
				key: data.event,
				value: JSON.stringify(data.message),
			},
		],
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

const subscribe = async (topic: TOPIC_TYPE, messageHandler: MessageHandler) => {
	const consumer = await connectConsumer<Consumer>();
	await consumer.connect();

	await consumer.subscribe({ topic, fromBeginning: true });

	await consumer.run({
		eachMessage: async ({ topic, message, partition }) => {
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
						topic: topic,
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
