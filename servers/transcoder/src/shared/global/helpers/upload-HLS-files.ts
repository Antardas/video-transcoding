import fs from 'node:fs';
import path from 'node:path';
import { unlink, readdir } from 'node:fs/promises';
import { BUCKET_NAME, s3 } from '../../services/AWS/s3';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import { VIDEO_FOLDER, VIDEO_SUBTITLE_FOLDER } from './CONSTANT';

export default async function uploadHLSFilesToS3(fileName: string): Promise<void> {
	console.log('Uploading hls files to S3...');

	const files = await readdir(VIDEO_FOLDER);

	for (const file of files) {
		console.log(file, fileName);
		
		if (!file.startsWith(fileName.replace('.', '_'))) {
			continue;
		}
		console.log('Uploading file: ' + file);

		const filePath = path.join(VIDEO_FOLDER, file);
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

	// Upload Subtitle to s3
	const subtitlePath = path.join(VIDEO_SUBTITLE_FOLDER, `${fileName.replace('.', '_')}.srt`);
  const subtitleStream = fs.createReadStream(subtitlePath);
  const subtitleS3Params: PutObjectRequest = {
    Bucket: BUCKET_NAME,
    Key: `streams/subtitles/${fileName.replace('.', '_')}.srt`,
    Body: subtitleStream,
    ContentType: 'text/plain',
  };
	await s3.upload(subtitleS3Params).promise();

  console.log('HLS files and subtitle uploaded to S3.');
	await Promise.all(files.map((file) => unlink(path.join(VIDEO_FOLDER, file))));
	console.log('HLS files uploaded to S3.');
}
