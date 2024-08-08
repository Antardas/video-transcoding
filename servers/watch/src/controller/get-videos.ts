import { sql } from 'drizzle-orm';
import catchAsyncError from '../shared/global/helpers/catch-async-error';
import { db } from '../shared/services/db/connect-db';
import { Video } from '../shared/services/db/schema';
import { QueryResult } from 'pg';

const getVideos = {
	all: catchAsyncError(async (req, res, next) => {
		const limit = req.query?.limit ? parseInt(req.query.limit as string, 10) : 10;
		const offset = req.query?.offset ? parseInt(req.query.offset as string, 10) : 0;

		const result: QueryResult<Record<string, Video>> = await db.execute(
			sql`SELECT * FROM videos LIMIT ${limit} OFFSET ${offset}`
		);

		return res.status(200).json({
			success: true,
			data: result.rows,
		});
	}),
};

export default getVideos;
