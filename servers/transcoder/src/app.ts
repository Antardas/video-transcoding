import { Consumer, Producer } from 'kafkajs';
import { MessageBroker } from './shared/services/kafka';
import { MessageType, ProgressEvent, VideoEvent, VideoProcessingProgress } from './types';
import { downloadFromS3 } from './shared/global/helpers/download-from-s3';
import { createHSLVariants, generateMasterPlaylist } from './shared/global/helpers/hls';
import deleteFile from './shared/global/helpers/delete-file';
import uploadHLSFilesToS3 from './shared/global/helpers/upload-HLS-files';
import path from 'path';
import { generateSubtitle } from './shared/global/helpers/whisper/generateSubtitle';
import { convertToWav } from './shared/global/helpers/whisper/convert-to-wav';
import { VIDEO_FOLDER, VIDEO_SUBTITLE_FOLDER } from './shared/global/helpers/CONSTANT';
import ProgressGenerator from './shared/global/helpers/progress-generator';
export async function startApplication() {
	// try {
	// 	await testApplication();
	// } catch (error) {
	// 	console.log(error);
	// }
	// return;
	const consumer = await MessageBroker.connectConsumer<Consumer>();
	const producer = await MessageBroker.connectProducer<Producer>();
	consumer.on('consumer.connect', (event) => {
		console.log('Consumer connected', event.id);
	});

	consumer.on('consumer.crash', async (event) => {
		console.log('Consumer crashed', event.id);

		const error = event?.payload?.error;
		console.error(error);
		// https://github.com/tulios/kafkajs/issues/1443#issue-1357475148
		try {
			await consumer.disconnect();
		} finally {
			setTimeout(async () => {
				await consumer.connect();
				bindTopics();
				console.warn({
					message: 'Restarted Consumer on non-retriable error',
				});
			}, 5000);
		}
	});

	producer.on('producer.connect', (event) => {
		console.log('Producer Connected', event.id);
	});

	function bindTopics() {
		MessageBroker.subscribe('VideoEvents', async (data: MessageType) => {
			console.log('transcode video here');
			console.log(data);

			if (data.event === VideoEvent.VIDEO_UPLOADED) {
				const progress = new ProgressGenerator(data.data.videoId, data.data.userId);
				progress.updateStatus('processing');

				// return;
				try {
					const fileName = data.data.fileName.split(' ').join('_');
					const downloadedVideoPath = path.join(VIDEO_FOLDER, fileName);
					progress.updateInitialization('inProgress');
					await downloadFromS3(data.data.fileName, downloadedVideoPath);
					progress.updateInitialization('completed');
					console.log('STEP-2------------');
					const wavOutFile = path.join(
						VIDEO_SUBTITLE_FOLDER,
						fileName.replace('.', '_') + '.wav'
					); // "transcript" is a file name we have to provide it with extension
					const subOutFile = path.join(VIDEO_SUBTITLE_FOLDER, fileName.replace('.', '_')); // "transcript" is a file name we have to provide it with extension
					console.log('Converting to wav file', downloadedVideoPath);
					await progress.updateSubtitleGeneration('0');
					await convertToWav(downloadedVideoPath, wavOutFile);
					await progress.updateSubtitleGeneration('5');
					await generateSubtitle(
						wavOutFile,
						subOutFile,
						progress.updateSubtitleGeneration.bind(progress)
					);

					const variants = await createHSLVariants(
						fileName,
						`${subOutFile}.srt`,
						progress.updateTranscoding.bind(progress)
					);

					generateMasterPlaylist(
						fileName,
						variants,
						`${data.data.fileName
							.replace('.', '_')
							.split(' ')
							.join('_')}_320x180_vtt.m3u8`
					);
					console.log('Deleting local copy for video');
					await deleteFile(downloadedVideoPath);
					console.log('Deleted local copy for video');
					await uploadHLSFilesToS3(fileName);
					progress.updateStatus('completed');
				} catch (error) {
					console.log(error);
				}
			}
		});
	}
	bindTopics()
}

async function testApplication() {
	const data = {
		headers: { token: 'token' },
		event: 'video_uploaded',
		data: {
			fileName: 'video.mp4',
			uploadId:
				'z0rnI88mLcg-j3p5VQ2juuTwPbiHi_4vBrt06nXbOXXwit2zmFpIXn27uN-dQmaNL8UnHOhUhgGwAW1U-pPj7ObnMb64Wp5GMO1m00cGESOlbx_Yc0PeEhgqoBhhnAqT',
			title: 'Video Title',
			description: 'Video Description',
			url: 'http://video.s3.localhost.localstack.cloud:4566/video.mp4',
			userId: '700e7594-093a-412b-b769-58860abf5334',
			videoId: '22',
		},
	};
	const progress = new ProgressGenerator(data.data.videoId, data.data.userId);
	progress.updateStatus('processing');

	// return;
	try {
		const fileName = data.data.fileName.split(' ').join('_');
		const downloadedVideoPath = path.join(VIDEO_FOLDER, fileName);
		progress.updateInitialization('inProgress');
		await downloadFromS3(data.data.fileName, downloadedVideoPath);
		progress.updateInitialization('completed');
		console.log('STEP-2------------');
		const wavOutFile = path.join(VIDEO_SUBTITLE_FOLDER, fileName.replace('.', '_') + '.wav'); // "transcript" is a file name we have to provide it with extension
		const subOutFile = path.join(VIDEO_SUBTITLE_FOLDER, fileName.replace('.', '_')); // "transcript" is a file name we have to provide it with extension
		console.log('Converting to wav file', downloadedVideoPath);
		await progress.updateSubtitleGeneration('0');
		await convertToWav(downloadedVideoPath, wavOutFile);
		await progress.updateSubtitleGeneration('5');
		await generateSubtitle(
			wavOutFile,
			subOutFile,
			progress.updateSubtitleGeneration.bind(progress)
		);

		const variants = await createHSLVariants(
			fileName,
			`${subOutFile}.srt`,
			progress.updateTranscoding.bind(progress)
		);

		generateMasterPlaylist(
			fileName,
			variants,
			`${data.data.fileName.replace('.', '_').split(' ').join('_')}_320x180_vtt.m3u8`
		);
		console.log('Deleting local copy for video');
		await deleteFile(downloadedVideoPath);
		console.log('Deleted local copy for video');
		await uploadHLSFilesToS3(fileName);
		progress.updateStatus('completed');
	} catch (error) {
		console.log(error);
	}
}
