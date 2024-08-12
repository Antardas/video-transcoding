export interface VideoObj {
	id: string;
	title: string;
	description: string;
	url: string;
}
export type AllVideosRes = {
	success: boolean;
	data: VideoObj[];
};

export interface VideoProcessingProgress {
	videoId: string;
	status: '' | 'initialization' | 'processing' | 'completed' | 'error';
	userId: string;
	progress: {
		transcoding?: {
			[resolution: string]: string;
		};
		subtitleGeneration?: {
			percentage: string;
		};
		initialization?: {
			status: 'pending' | 'inProgress' | 'completed';
		};
	};
	error?: {
		message: string;
		stage: 'initialization' | 'transcoding' | 'subtitleGeneration' | 'other';
	};
	timestamp: number;
}
