import fs from 'node:fs';
import path from 'node:path';
import { unlink, readdir } from 'node:fs/promises';
import { FILES_PATH } from './hls';
import { BUCKET_NAME, s3 } from '../../services/AWS/s3';
import { PutObjectRequest } from 'aws-sdk/clients/s3';

export default async function uploadHLSFilesToS3(fileName: string): Promise<void> {
	console.log('Uploading hls files to S3...');

	const files = await readdir(FILES_PATH);

	for (const file of files) {
		console.log(file, fileName);
		
		if (!file.startsWith(fileName.replace('.', '_'))) {
			continue;
		}
		console.log('Uploading file: ' + file);

		const filePath = path.join(FILES_PATH, file);
		const fileStream = fs.createReadStream(filePath);
		const s3Params: PutObjectRequest = {
			Bucket: BUCKET_NAME,
			Key: `streams/${file}`,
			Body: fileStream,
			ContentType: file.endsWith('.ts')
				? 'video/mp2t'
				: file.endsWith('.m3u8')
				? 'application/x-mpegURL'
				: undefined,
		};
		await s3.upload(s3Params).promise();
	}
	await Promise.all(files.map((file) => unlink(path.join(FILES_PATH, file))));
	console.log('HLS files uploaded to S3.');
}
