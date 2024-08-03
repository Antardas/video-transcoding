import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
export async function convertToWav(inputFilePath: string, outputFilePath: string) {
	console.log(inputFilePath, outputFilePath);

	await new Promise<void>((resolve, reject) => {
		ffmpeg(inputFilePath)
			.outputOptions(['-vn', '-ar 16000', '-ac 1', '-c:a pcm_s16le'])
			.output(outputFilePath)
			.on('start', () => {
				console.log('Started converting to WAV');
			})
			.on('progress', (data) => {
				console.log(`Progress: ${data.percent}%`);
			})
			.on('end', () => {
				resolve();
			})
			.on('error', (err) => {
				reject(err);
			})
			.run();
	});
}
