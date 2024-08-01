import AWS, { AWSError } from 'aws-sdk';
import { s3 } from '../../services/AWS/s3';
import { CreateBucketRequest, PutBucketCorsRequest } from 'aws-sdk/clients/s3';
import createLogger from './logger';
import { Logger } from 'winston';
const corsObject = {
	CORSRules: [
		{
			AllowedHeaders: ['*'],
			AllowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
			AllowedOrigins: ['*'],
			ExposeHeaders: ['ETag'],
		},
		{
			AllowedHeaders: ['*'],
			AllowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
			AllowedOrigins: ['https://app.localstack.cloud'],
			ExposeHeaders: ['ETag'],
		},
	],
};
const logger: Logger = createLogger('AWS');
export default async function createBucketIfNotExists(bucketName: string) {
	console.log(bucketName, 'AWS_S3_BUCKET');

	try {
		const data = await s3.headBucket({ Bucket: bucketName }).promise();
		logger.info('Bucket exist');
		logger.info(data);
	} catch (err: unknown) {
		
		logger.error("Bucket not found", (err as Error).name);
		const error: AWSError = err as unknown as AWSError;

		if (error.name === 'NotFound') {
			try {
				logger.info('Creating a bucket');
				const bucketParams: CreateBucketRequest = {
					Bucket: bucketName,
				};
				await s3.createBucket(bucketParams).promise();
				logger.info('Bucket Create done');

				await s3
					.putBucketCors({ Bucket: bucketName, CORSConfiguration: corsObject })
					.promise();
				logger.info('added cors rule to bucket');
			} catch (error) {
				logger.info('Failed to Creating Bucket');
				logger.error(error);
			}
		}
	}
}
