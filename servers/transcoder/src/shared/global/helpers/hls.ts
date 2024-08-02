import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'node:path';
import fs from 'node:fs';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
console.log('FFMPEG version: ', ffmpegInstaller.version);

const resolutions: ResolutionType[] = [
	{
		resolution: '320x180',
		videoBitrate: '500k',
		audioBitrate: '64k',
	},
	{
		resolution: '854x480',
		videoBitrate: '1000k',
		audioBitrate: '128k',
	},
	{
		resolution: '1280x720',
		videoBitrate: '1500k',
		audioBitrate: '192k',
	},
	{
		resolution: '1920x1080',
		videoBitrate: '2000k',
		audioBitrate: '256k',
	},
];

export const FILES_PATH = path.join(process.cwd(), 'files');

export async function createHSLVariants(
	fileName: string,
	subtitle?: string
): Promise<VariantType[]> {
	const variantPlaylist: VariantType[] = [];
	const replacedName = fileName.replace('.', '_');
	const inputFilePath = path.join(FILES_PATH, fileName);
	console.log(`HLS Video Creating is stated`);

	for (const { resolution, audioBitrate, videoBitrate } of resolutions) {
		const outputVariantMasterFileName = path.join(
			FILES_PATH,
			`${replacedName}_${resolution}.m3u8`
		); // TODO: change file path
		const chunkFileName = path.join(FILES_PATH, `${replacedName}_${resolution}_%03d.ts`);
		console.log(chunkFileName, outputVariantMasterFileName);

		await new Promise<void>((resolve, reject) => {
			ffmpeg(inputFilePath)
				.outputOptions([
					'-c:v h264', // codec name video compression format
					`-b:v ${videoBitrate}`, // video bitrate in kbps
					`-c:a aac`, // codec name audio compression format
					`-b:a ${audioBitrate}`, // audio bitrate in kbps
					`-vf scale=${resolution}`, // add video filter and resize based on resolution
					'-f hls', // format hls video
					'-hls_time 10', // each chunk 10 seconds
					'-hls_list_size 0', // means all chunk will be store in same playlist
					`-hls_segment_filename ${chunkFileName}`, // naming each chunk file with format %03d.ts and the directory where will be stored ts transport streams(ts) file will be stored
					...(subtitle ? [`-vf subtitles=${subtitle}`] : []),
				])
				.output(outputVariantMasterFileName) // the master play will be stored for each variant
				.on('error', (err) => {
					console.log(err);
					reject(err);
				})
				.on('end', () => {
					variantPlaylist.push({
						resolution,
						outputFile: `${replacedName}_${resolution}.m3u8`,
					});
					resolve();
				})
				.on('start', () => {
					console.log(`Started processing ${resolution} variant for ${fileName}`);
				})
				.run();
		});
	}
	console.log('All variants finished');
	return variantPlaylist;
}

export function generateMasterPlaylist(fileName: string, variants: VariantType[]) {
	let masterPlaylist = variants
		.map(({ outputFile, resolution }) => {
			const bandwidth =
				resolution === '320x180'
					? 676800
					: resolution === '854x480'
					? 1353600
					: resolution === '1280x720'
					? 3230400
					: resolution === '1920x1080'
					? 4500000
					: 0;
			return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n${outputFile}`;
		})
		.join('\n');
	masterPlaylist = `#EXTM3U\n${masterPlaylist}`;
	const masterFileName = `${fileName.replace('.', '_')}_master.m3u8`;
	const masterPlaylistFilePath = path.join(FILES_PATH, masterFileName);
	fs.writeFileSync(masterPlaylistFilePath, masterPlaylist);
	console.log(`Master playlist saved as ${masterFileName}`);
}

interface ResolutionType {
	resolution: string;
	videoBitrate: string;
	audioBitrate: string;
}

type VariantType = {
	resolution: string;
	outputFile: string;
};
