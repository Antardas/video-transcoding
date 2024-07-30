import { MessageType, TOPIC_TYPE, VideoEvent } from '../../../types';

export interface KafkaType {
	// Producer
	connectProducer: <T>() => Promise<T>;
	disconnectProducer: () => Promise<void>;
	publish: (data: PublishType) => Promise<boolean>;

	// Consumer
	connectConsumer: <T>() => Promise<T>;
	disconnectConsumer: () => Promise<void>;
	subscribe: (topic: TOPIC_TYPE,messageHandler: MessageHandler) => Promise<void>;
}

export interface PublishType {
	headers?: Record<string, any>;
	topic: TOPIC_TYPE;
	event: VideoEvent;
	message: Record<string, any>;
}

export type MessageHandler =  (input: MessageType) => Promise<void>;
