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
export async function startApplication() {
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
		if (data.event === VideoEvent.VIDEO_UPLOADED) {
			const downloadedVideoUrl = await downloadFromS3(data.data.fileName);
			const subOutFile = path.join(process.cwd(), 'files', 'subtitle', 'transcript'); // "transcript" is a file name we have to provide it with extension
			const wavOutFile = path.join(process.cwd(), 'files', 'subtitle', data.data.filename); // "transcript" is a file name we have to provide it with extension
			await convertToWav(downloadedVideoUrl, wavOutFile);
			await generateSubtitle(wavOutFile, subOutFile);
			const variants = await createHSLVariants(data.data.fileName);
			generateMasterPlaylist(data.data.fileName, variants);
			console.log('Deleting local copy for video');
			await deleteFile(downloadedVideoUrl);
			console.log('Deleted local copy for video');
			await uploadHLSFilesToS3(data.data.fileName);
		}
	});
}
