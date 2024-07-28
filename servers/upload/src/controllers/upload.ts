import { NextFunction, Request, Response } from 'express';
import catchAsyncError from '../shared/global/helpers/catch-async-error';
import { db } from '../shared/services/db/connect-db';
import { videos } from '../shared/services/db/schema';

const uploadController = {
	upload: catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
		await db.insert(videos).values({
			title: 'My Title',
			description: 'My Title',
			url: 'My Title',
		});
		res.status(200).json({ message: 'Hello' });
	}),
};

export default uploadController;
