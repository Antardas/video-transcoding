export enum VideoEvent {
	VIDEO_UPLOADED = 'video_uploaded',
}
export enum ProgressEvent {
	UPDATE_PROGRESS = 'update_progress',
}
export enum SearchIndexEvents {
	ADD_TO_SEARCH_ENGINE = 'add_to_search_engine',
}

export type TOPIC_TYPE = 'VideoEvents' | 'ProgressEvents' | 'SearchIndexEvents';

export interface MessageType {
	headers?: Record<string, any>;
	event: VideoEvent | ProgressEvent | SearchIndexEvents;
	data: Record<string, any>;
}
