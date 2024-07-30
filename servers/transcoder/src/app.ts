import { Consumer } from 'kafkajs';
import { MessageBroker } from './shared/services/kafka';
import { MessageType, VideoEvent } from './types';
import { downloadFromS3 } from './shared/global/helpers/download-from-s3';
import { createHSLVariants, generateMasterPlaylist } from './shared/global/helpers/hls';
import deleteFile from './shared/global/helpers/delete-file';
import uploadHLSFilesToS3 from './shared/global/helpers/upload-HLS-files';

export async function startApplication() {
	const consumer = await MessageBroker.connectConsumer<Consumer>();
	consumer.on('consumer.connect', (event) => {
		console.log('Consumer connected', event.id);
	});

	MessageBroker.subscribe('VideoEvents', async (data: MessageType) => {
		if (data.event === VideoEvent.VIDEO_UPLOADED) {
			console.log('transcode video here');
			const downloadUrl = await downloadFromS3(data.data.fileName);
			const variants = await createHSLVariants(data.data.fileName);
			generateMasterPlaylist(data.data.fileName, variants);
			console.log('Deleting local copy for video');
			await deleteFile(downloadUrl);
			console.log('Deleted local copy for video');
			await uploadHLSFilesToS3(data.data.fileName);
		}
	});
}
