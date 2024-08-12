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
import { MessageBroker } from '../shared/services/kafka';
import { SearchIndexEvents, VideoEvent } from '../types';
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
		res.status(200).json({ message: 'video initialized', uploadID: uploadId });
	}),

	upload: catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
		console.log('Uploading Chunk...');

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

		return res.status(200).json({ success: true });
	}),

	complete: catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
		const { fileName, uploadId, title, description, userId } = req.body;

		const listPartParams: S3.Types.ListPartsRequest = {
			Bucket: BUCKET_NAME,
			Key: fileName,
			UploadId: uploadId,
		};
		// get all parts list details
		const data = await s3.listParts(listPartParams).promise();

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
			sql`INSERT INTO videos (description, title, url) VALUES (${description}, ${title}, ${uploadResult.Location}) RETURNING *;`
		);

		await MessageBroker.publish({
			topic: 'VideoEvents',
			message: {
				fileName,
				uploadId,
				title,
				description,
				url: uploadResult.Location,
				videoId: video.rows[0].id,
				userId,
			},
			event: VideoEvent.VIDEO_UPLOADED,
			headers: {
				token: 'something',
			},
		});

		await MessageBroker.publish({
			topic: 'SearchIndexEvents',
			message: video.rows[0],
			event: SearchIndexEvents.ADD_TO_SEARCH_ENGINE,
			headers: {
				token: 'something',
			},
		});

		//  Add also kafkajs transaction

		return res.status(200).json({ message: 'upload complete', data: video.rows[0] });
	}),
};

export default uploadController;
