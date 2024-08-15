import { socketService } from '@/services/socket.service';
import { VideoProcessingProgress } from '@/types';
import React, { useCallback, useEffect, useState } from 'react';
import { Progress } from '../ui/progress';

const progressColor = (
	color: VideoProcessingProgress['status'] | 'pending' | 'inProgress' | 'completed'
) => {
	if (color === 'initialization' || color === 'pending') {
		return 'bg-gray-800 text-white';
	} else if (color === 'processing' || color === 'inProgress') {
		return 'bg-green-200 text-black';
	} else if (color === 'completed') {
		return 'bg-yellow-300 text-black';
	} else if (color === 'error') {
		return 'bg-red-300 text-black';
	}
};
const transcoding = Object.keys({
	'320x180': '100',
	'854x480': '100',
	'1280x720': '100',
	'1920x1080': '74',
});

const UploadStatus: React.FC<Props> = ({ uploadProgress, uploadId }) => {
	const [progress, setProgress] = useState<VideoProcessingProgress>({
		videoId: '',
		userId: '',
		progress: {
			subtitleGeneration: { percentage: '0' },
			transcoding: {
				'320x180': '0',
				'854x480': '0',
				'1280x720': '0',
				'1920x1080': '0',
			},
			initialization: { status: 'completed' },
		},
		status: '',
		timestamp: 1723281019017,
	});

	const progressHandler = useCallback((data: VideoProcessingProgress) => {
		console.log('progress-data', data);

		setProgress({ ...data });
	}, []);

	useEffect(() => {
		console.log('socket-service', socketService.socket);

		// if (!socketService.socket || !socketService.socket.connected) {
		// 	socketService.setupSocketConnection();
		// }
		setTimeout(() => {
			if (socketService.socket?.on) {
				socketService.socket.on('progress', progressHandler);
			}
		});
		return () => {
			socketService.socket.off('progress', progressHandler);
		};
	}, [progressHandler]);
	if (!progress.status && !uploadId) {
		return null;
	}

	if(progress.videoId) {
		uploadProgress = 100
	}

	return (
		<div className="w-[800px] flex flex-col text-start ">
			<div className="flex justify-start pb-2 border-b-2 mt-2">
				<div className="w-1/4">
					<span>Upload</span>
				</div>
				<div className="w-3/4">
					<Progress value={uploadProgress} />
				</div>
			</div>
			<div className="flex justify-start pb-2 border-b-2 mt-2">
				<div className="w-1/4">
					<span>Initialization</span>
				</div>
				<div className="w-3/4">
					<span
						className={`${progressColor(
							progress.progress.initialization &&
								progress.progress.initialization.status
								? progress.progress.initialization.status
								: 'pending'
						)} px-2 py-1 rounded-full`}
					>
						{progress.progress.initialization?.status}
					</span>
				</div>
			</div>

			<div className="flex justify-start pb-2 border-b-2 mt-2">
				<div className="w-1/4">
					<span>Subtitle Generating</span>
				</div>
				<div className="w-3/4">
					<Progress
						value={parseInt(progress.progress.subtitleGeneration?.percentage ?? '0')}
						key={'subtitle-percentage'}
					/>
				</div>
			</div>
			<div className=" justify-start pb-2 border-b-2 mt-2">
				<div className="font-medium text-lg">
					<span>Transcoding </span>
				</div>

				{transcoding.map((resolution) => (
					<div className="flex justify-start mb-2" key={resolution}>
						<div className="w-1/4">
							<span className="ml-5">{resolution} </span>
						</div>
						<div className="w-3/4">
							<Progress
								value={parseInt(
									(progress.progress?.transcoding &&
										progress.progress?.transcoding[resolution]) ??
										'0'
								)}
							/>
						</div>
					</div>
				))}
			</div>
			{progress.error ? (
				<div className="flex justify-start pb-2 border-b-2 mt-2">
					<div className="w-1/4">
						<span>
							Error on
							<span className="text-red-500"> {progress.error.stage}</span>
						</span>
					</div>
					<div className="w-3/4">
						<span
							className={`${progressColor(progress.status)} px-2 py-1 rounded-full`}
						>
							{progress.error.message}
						</span>
					</div>
				</div>
			) : null}
			<div className="flex justify-start pb-2 border-b-2 mt-2">
				<div className="w-1/4">
					<span>Status</span>
				</div>
				<div className="w-3/4">
					<span className={`${progressColor(progress.status)} px-2 py-1 rounded-full`}>
						{progress.status}
					</span>
				</div>
			</div>
		</div>
	);
};

export default UploadStatus;

interface Props {
	uploadId?: string;
	uploadProgress: number;
}
