import { NextFunction, Request, Response } from 'express';
import catchAsyncError from '../shared/global/helpers/catch-async-error';
import { db } from '../shared/services/db/connect-db';
import { NewVideo, videos } from '../shared/services/db/schema';
import { sql } from 'drizzle-orm';
import { BUCKET_NAME, s3 } from '../shared/services/AWS/s3';
import { createReadStream } from 'fs';
import path from 'path';
import { S3 } from 'aws-sdk';
import AppError from '../shared/global/helpers/AppError';
import { PgRaw } from 'drizzle-orm/pg-core/query-builders/raw';
import { QueryResult } from 'pg';
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
		console.log('got new request');

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
		const { fileName, uploadId, title, description } = req.body;
		
		const listPartParams: S3.Types.ListPartsRequest = {
			Bucket: BUCKET_NAME,
			Key: fileName,
			UploadId: uploadId,
		};
		// get all parts list details
		const data = await s3.listParts(listPartParams).promise();
		console.log(`🚀 ~ complete:catchAsyncError ~ data:`, data);
	
		
		const parts = data.Parts?.map((part) => ({
			ETag: part.ETag,
			PartNumber: part.PartNumber,
		}));
		const completeParams: S3.Types.CompleteMultipartUploadRequest = {
			...listPartParams,
			MultipartUpload: {
				Parts: parts,
			},
		};
		const uploadResult = await s3.completeMultipartUpload(completeParams).promise();
		console.log(uploadResult);

		const video = await db.execute(
			sql`INSERT INTO videos (description, title, url) VALUES (${description}, ${title}, ${uploadResult.Location})`
		);

		res.status(200).json({ message: 'upload complete', data: video });
	}),
};

export default uploadController;
