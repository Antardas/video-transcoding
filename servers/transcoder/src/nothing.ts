import path from 'path';
import { generateSubtitle } from './shared/global/helpers/whisper/generateSubtitle';
import { convertToWav } from './shared/global/helpers/whisper/convert-to-wav';

const filePath = path.join(process.cwd(), 'sample.wav');
const videoFilePath = path.join(process.cwd(), './hindi.mp4');
const subOutDir = path.join(process.cwd(), 'files');
(async () => {
	try {
		await convertToWav(videoFilePath, filePath);
		await generateSubtitle(filePath, subOutDir);
	} catch (error) {
		console.log(error);
	}
})();
