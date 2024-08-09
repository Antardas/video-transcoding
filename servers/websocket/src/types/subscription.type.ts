export enum ProgressEvent {
	UPDATE_PROGRESS = 'update_progress',
}

export type TOPIC_TYPE = 'ProgressEvents';

export interface MessageType {
	headers?: Record<string, any>;
	event: ProgressEvent;
	data: Record<string, any>;
}
