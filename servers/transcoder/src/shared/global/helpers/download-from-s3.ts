import path from 'node:path';
import fs from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { BUCKET_NAME, s3 } from '../../services/AWS/s3';

export async function downloadFromS3(fileName: string, outDir: string = 'files'):Promise<string> {
	console.log('Video Downloading started from s3. Filename', fileName);

	const workingDirectory = process.cwd();
	const downloadFileLocation = path.join(workingDirectory, outDir, fileName);
	const writeFile = await fs.open(downloadFileLocation, 'w');
	const writeStream = writeFile.createWriteStream();
	const readStream = s3.getObject({ Bucket: BUCKET_NAME, Key: fileName }).createReadStream();
	await pipeline(readStream, writeStream);
	console.log('Video Download');
	return downloadFileLocation;
}
