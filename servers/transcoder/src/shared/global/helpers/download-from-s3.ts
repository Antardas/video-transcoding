import path from 'node:path';
import fs from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { BUCKET_NAME, s3 } from '../../services/AWS/s3';

export async function downloadFromS3(fileName: string, downloadFilePath: string): Promise<void> {

		console.log('Video Downloading started from s3. Filename', fileName);

		const writeFile = await fs.open(downloadFilePath, 'w');
		const writeStream = writeFile.createWriteStream();
		const readStream = s3.getObject({ Bucket: BUCKET_NAME, Key: fileName }).createReadStream();
		await pipeline(readStream, writeStream);
		console.log('Video Download');

}
