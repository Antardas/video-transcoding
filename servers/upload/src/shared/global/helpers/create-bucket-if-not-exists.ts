import AWS, { AWSError } from 'aws-sdk';
import { s3 } from '../../services/AWS/s3';

export default async function createBucketIfNotExists(bucketName: string) {
	console.log(bucketName, 'AWS_S3_BUCKET');

	try {
		const data = await s3.headBucket({ Bucket: bucketName }).promise();
		console.log(data, 'Bucket exist');
	} catch (err: unknown) {
		console.log(err);
		const error: AWSError = err as unknown as AWSError;

		if (error.name === 'NotFound') {
			try {
				console.log('Creating a bucket');

				await s3.createBucket({ Bucket: bucketName }).promise();

				console.log('Bucket Create done');
			} catch (error) {
				console.log('Failed to Creating Bucket');
				console.error(error);
			}
		}
	}
}
