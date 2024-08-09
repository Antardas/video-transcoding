import { ProgressEvent, VideoProcessingProgress } from '../../../types';
import { MessageBroker } from '../../services/kafka';

class ProgressGenerator {
	private progress: VideoProcessingProgress;

	constructor(videoId: string, userId: string) {
		this.progress = {
			videoId,
			userId,
			progress: {
				subtitleGeneration: {
					percentage: '0',
				},
				transcoding: {},
				initialization: {
					status: 'pending',
				},
			},
			status: 'processing',
			timestamp: Date.now(),
		};
		console.log(this.progress);
		
	}

	// Method to update initialization percentage
	updateInitialization(status: '' | 'pending' | 'inProgress' | 'completed'): void {
		if (!this.progress.progress.initialization) {
			this.progress.progress.initialization = { status: '' };
		}
		this.progress.progress.initialization.status = status;
		this.updateTimestamp();
		this.publishProgress();
	}

	// Method to update subtitle generation percentage
	async updateSubtitleGeneration(percentage: string): Promise<void> {
		if (!this.progress?.progress?.subtitleGeneration) {
			this.progress.progress.subtitleGeneration = {
				percentage: '0',
			};
		}
		this.progress.progress.subtitleGeneration.percentage = percentage;
		this.updateTimestamp();
		await this.publishProgress();
	}

	// Method to update transcoding progress
	updateTranscoding(resolution: string,percentage: string, ): void {
		console.log(this)
		if (!this.progress.progress.transcoding) {
			this.progress.progress.transcoding = {};
		}
		this.progress.progress.transcoding[resolution] = percentage;
		this.updateTimestamp();
		this.publishProgress();
	}

	// Method to update status
	updateStatus(status: 'initialization' | 'processing' | 'completed' | 'error'): void {
		this.progress.status = status;
		this.updateTimestamp();
		this.publishProgress();
	}
	updateError(
		message: string,
		stage: 'initialization' | 'transcoding' | 'subtitleGeneration' | 'other'
	): void {
		this.progress.error = {
			message,
			stage,
		};
		this.updateTimestamp();
		this.publishProgress();
	}
	// Method to update timestamp
	private updateTimestamp(): void {
		this.progress.timestamp = Date.now();
	}

	private async publishProgress(): Promise<void> {
		await MessageBroker.publish({
			topic: 'ProgressEvents',
			event: ProgressEvent.UPDATE_PROGRESS,
			message: this.progress,
			headers: {
				token: 'token',
			},
		});
	}

	// Method to get the current progress
	getProgress(): VideoProcessingProgress {
		return this.progress;
	}
}

export default ProgressGenerator;
