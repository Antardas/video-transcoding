import { Consumer } from 'kafkajs';
import { MessageBroker } from './shared/services/kafka';
import { MessageType, VideoEvent } from './types';
import { downloadFromS3 } from './shared/global/helpers/download-from-s3';
import { createHSLVariants, generateMasterPlaylist } from './shared/global/helpers/hls';
import deleteFile from './shared/global/helpers/delete-file';
import uploadHLSFilesToS3 from './shared/global/helpers/upload-HLS-files';
import path from 'path';
import { generateSubtitle } from './shared/global/helpers/whisper/generateSubtitle';
import { convertToWav } from './shared/global/helpers/whisper/convert-to-wav';
import { VIDEO_FOLDER, VIDEO_SUBTITLE_FOLDER } from './shared/global/helpers/CONSTANT';
export async function startApplication() {
	// try {
	// 	await testApplication();
	// } catch (error) {
	// 	console.log(error);
	// }
	// return;
	const consumer = await MessageBroker.connectConsumer<Consumer>();
	consumer.on('consumer.connect', (event) => {
		console.log('Consumer connected', event.id);
	});

	consumer.on('consumer.crash', (event) => {
		console.log('Consumer crashed', event.id);

		const error = event?.payload?.error;
		console.error(error);
	});

	MessageBroker.subscribe('VideoEvents', async (data: MessageType) => {
		console.log('transcode video here');
		console.log(data);

		if (data.event === VideoEvent.VIDEO_UPLOADED) {
			const fileName = data.data.fileName.split(' ').join('_');
	let subTitleMasterFile = path.join(VIDEO_FOLDER, `${data.data.fileName.split(' ').join('_')}_320x180_vtt.m3u8`);
	const downloadedVideoPath = path.join(VIDEO_FOLDER, fileName);
	await downloadFromS3(data.data.fileName, downloadedVideoPath);
	console.log('STEP-2------------');
	const wavOutFile = path.join(VIDEO_SUBTITLE_FOLDER, fileName.replace('.', '_') + '.wav'); // "transcript" is a file name we have to provide it with extension
	const subOutFile = path.join(VIDEO_SUBTITLE_FOLDER, fileName.replace('.', '_')); // "transcript" is a file name we have to provide it with extension
	console.log('Converting to wav file', downloadedVideoPath);
	console.log('STEP-2------------');

	await convertToWav(downloadedVideoPath, wavOutFile);
	console.log('STEP-3------------');
	await generateSubtitle(wavOutFile, subOutFile);
	const variants = await createHSLVariants(fileName, `${subOutFile}.srt`);

	generateMasterPlaylist(fileName, variants, `${data.data.fileName.replace('.', "_").split(' ').join('_')}_320x180_vtt.m3u8`);
	console.log('Deleting local copy for video');
	await deleteFile(downloadedVideoPath);
	console.log('Deleted local copy for video');
	await uploadHLSFilesToS3(fileName);
		}
	});
}

async function testApplication() {
	const data = {
		headers: { token: 'TONE' },
		event: 'video_uploaded',
		data: {
			fileName: 'video.mp4',
			uploadId:
				'TlnxVYWDlEjBxUzhwredHiGA4ERtRPyFGI0SuWpWSAYW1CGH9-qi7DLhIxsUo-D2azlq4sBcEN3bSmse5l960MV7NyPL00zlOk5UMfa5oMEr3kDTNRHjwdxnz42uMlym',
			title: 'Gobhinda Adipurusham',
			description: 'Gobhinda Adipurusham',
			url: 'http://video.s3.localhost.localstack.cloud:4566/video.mp4',
		},
	};
	const fileName = data.data.fileName.split(' ').join('_');
	let subTitleMasterFile = path.join(VIDEO_FOLDER, `${data.data.fileName.split(' ').join('_')}_320x180_vtt.m3u8`);
	const downloadedVideoPath = path.join(VIDEO_FOLDER, fileName);
	await downloadFromS3(data.data.fileName, downloadedVideoPath);
	console.log('STEP-2------------');
	const wavOutFile = path.join(VIDEO_SUBTITLE_FOLDER, fileName.replace('.', '_') + '.wav'); // "transcript" is a file name we have to provide it with extension
	const subOutFile = path.join(VIDEO_SUBTITLE_FOLDER, fileName.replace('.', '_')); // "transcript" is a file name we have to provide it with extension
	console.log('Converting to wav file', downloadedVideoPath);
	console.log('STEP-2------------');

	await convertToWav(downloadedVideoPath, wavOutFile);
	console.log('STEP-3------------');
	await generateSubtitle(wavOutFile, subOutFile);
	const variants = await createHSLVariants(fileName, `${subOutFile}.srt`);

	generateMasterPlaylist(fileName, variants, subTitleMasterFile);
	console.log('Deleting local copy for video');
	await deleteFile(downloadedVideoPath);
	console.log('Deleted local copy for video');
	await uploadHLSFilesToS3(fileName);
}
