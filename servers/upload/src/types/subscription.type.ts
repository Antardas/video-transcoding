export enum VideoEvent {
	VIDEO_UPLOADED = 'video_uploaded',
}

export type TOPIC_TYPE = 'VideoEvents';

export interface MessageType {
	headers?: Record<string, any>;
	event: VideoEvent;
	data: Record<string, any>;
}
