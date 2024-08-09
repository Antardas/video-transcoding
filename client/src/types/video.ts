export interface VideoObj {
	id: string;
	title: string;
	description: string;
	url: string;
}

export interface VideoProcessingProgress {
	videoId: string; // Unique identifier for the video being processed
	status: 'uploading' | 'processing' | 'completed' | 'error'; // Overall status of the video processing
	progress: {
		uploading?: {
			percentage: number; // Percentage of the video upload completed
		};
		transcoding?: {
			resolution: string; // Current resolution being transcoded (e.g., '1080p', '720p')
			percentage: number; // Percentage of the transcoding process completed for the current resolution
		};
		subtitleGeneration?: {
			percentage: number; // Percentage of the subtitle generation process completed
		};
	};
	error?: {
		message: string; // Error message, if any error occurs
		stage: 'uploading' | 'transcoding' | 'subtitleGeneration' | 'other'; // Stage where the error occurred
	};
	timestamp: number; // Timestamp when the progress update was sent
}
