import AWS from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

export const s3 = new AWS.S3({
	endpoint: process.env.AWS_ENDPOINT,
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
	s3ForcePathStyle: true,
});

export const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'video';
