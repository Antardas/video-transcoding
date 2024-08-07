import { sql } from 'drizzle-orm';
import catchAsyncError from '../shared/global/helpers/catch-async-error';
import { db } from '../shared/services/db/connect-db';
import { Video } from '../shared/services/db/schema';

const getVideos = {
	all: catchAsyncError(async (req, res, next) => {
		const limit = req.params?.limit ? parseInt(req.params.limit, 10) : 10;
		const offset = req.params?.offset ? parseInt(req.params.offset, 10) : 0;
		const result = await db.execute(sql`SELECT * FROM videos WHERE URL IS NOT NULL`);
		
		return res.status(200).json( {
			success: true,
			data:result.rows
		})
	}),
};

export default getVideos;
