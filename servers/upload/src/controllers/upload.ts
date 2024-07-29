import { NextFunction, Request, Response } from 'express';
import catchAsyncError from '../shared/global/helpers/catch-async-error';
import { db } from '../shared/services/db/connect-db';
import { videos } from '../shared/services/db/schema';
import { sql } from 'drizzle-orm';
import { BUCKET_NAME, s3 } from '../shared/services/AWS/s3';
import { createReadStream } from 'fs';
import path from 'path';
import { S3 } from 'aws-sdk';
import AppError from '../shared/global/helpers/AppError';
console.log(path.join('SampleVideo_1280x720_10mb.mp94'), 'dfadfasdfadsfds');
const uploadController = {
	initialize: catchAsyncError(async (req: Request, res: Response) => {
		const { fileName } = req.body;
		const createParams = {
			Bucket: BUCKET_NAME,
			Key: fileName,
			ContentType: 'video/mp4', // TODO: take from Body also
		};
		console.log(createParams);
		const multipartParams = await s3.createMultipartUpload(createParams).promise();
		console.log(multipartParams);

		const uploadId = multipartParams?.UploadId;
		res.status(200).json({ message: 'Hello', uploadID: uploadId });
	}),

	upload: catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
		if (!req.file) {
			return next(new AppError('chunk is missing', 400));
		}

		const { fileName, chunkIndex, uploadId } = req.body;

		const params: S3.UploadPartRequest = {
			Bucket: BUCKET_NAME,
			Key: fileName,
			UploadId: uploadId,
			PartNumber: parseInt(chunkIndex) + 1,
			Body: req.file.buffer,
		};
		const data = await s3.uploadPart(params).promise();
		console.log(data);

		res.status(200).json({ success: true });
	}),

	complete: catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
		
	}),
};

export default uploadController;
