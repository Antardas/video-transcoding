import { MessageType, TOPIC_TYPE, VideoEvent } from './../../../types/subscription.type';
import { Consumer, Kafka, logLevel, Partitioners, Producer } from 'kafkajs';
import { KafkaType, MessageHandler, PublishType } from './kafka.type';

// Configuration
const CLIENT_ID = process.env.CLIENT_ID || 'watch-service';
const GROUP_ID = process.env.GROUP_ID || 'watch-service-group';
const BROKERS = [process.env.BROKER_1 || 'localhost:9092'];

let producer: Producer;
let consumer: Consumer;

const kafka = new Kafka({
	clientId: CLIENT_ID,
	brokers: BROKERS,
	logLevel: logLevel.INFO,
	retry: {
		initialRetryTime: 300,
		retries: 5,
	},
});
const createTopic = async (topicNames: Array<TOPIC_TYPE>) => {
	const topics = topicNames.map((topicName) => ({
		topic: topicName,
		numPartitions: 1,
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
	await createTopic(['VideoEvents', 'ProgressEvents']);

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
		sessionTimeout: 100000, // large enough to fit any message being processed
		heartbeatInterval: 30000, // 1/3 of the session timeout
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
	// const consumer = await connectConsumer<Consumer>();

	await consumer.subscribe({ topic, fromBeginning: true });

	await consumer.run({
		autoCommit: false,
		eachMessage: async ({ topic, message, partition, heartbeat }) => {
			console.log('Each Message');

			if (topic !== 'SearchIndexEvents') {
				return;
			}

			let intervalId;
			try {
				if (message.key && message.value) {
					const inputMessage: MessageType = {
						headers: message.headers ,
						event: message.key.toString() as VideoEvent,
						data: message.value ? JSON.parse(message.value.toString()) : null,
					};

					intervalId = setInterval(async () => {
						await heartbeat();
						console.log('heartBeating');
					}, 10 * 1000);

					await messageHandler(inputMessage);

					clearInterval(intervalId);

					await consumer.commitOffsets([
						{
							topic: topic,
							offset: (Number(message.offset) + 1).toString(),
							partition,
						},
					]);
				}
			} catch (error) {
				clearInterval(intervalId);
				console.error('Error processing message or committing offset:', error);
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
