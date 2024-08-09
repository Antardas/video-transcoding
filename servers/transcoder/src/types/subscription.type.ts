export enum VideoEvent {
	VIDEO_UPLOADED = 'video_uploaded',
}
export enum ProgressEvent {
	UPDATE_PROGRESS = 'update_progress',
}

export type TOPIC_TYPE = 'VideoEvents' | 'ProgressEvents';

export interface MessageType {
	headers?: Record<string, any>;
	event: VideoEvent | ProgressEvent;
	data: Record<string, any>;
}

export interface VideoProcessingProgress {
	videoId: string;
	status: 'initialization' | 'processing' | 'completed' | 'error';
	userId: string;
	progress: {
		transcoding?: {
			[resolution: string]: string;
		};
		subtitleGeneration?: {
			percentage: string;
		};
		initialization?: {
			status: '' | 'pending' | 'inProgress' | 'completed';
		};
	};
	error?: {
		message: string;
		stage: 'initialization' | 'transcoding' | 'subtitleGeneration' | 'other';
	};
	timestamp: number;
}
