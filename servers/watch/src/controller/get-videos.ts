import { sql } from 'drizzle-orm';
import catchAsyncError from '../shared/global/helpers/catch-async-error';
import { db } from '../shared/services/db/connect-db';
import { Video } from '../shared/services/db/schema';
import { QueryResult } from 'pg';
import { elasticSearch } from '../shared/services/elasticsearch';
import { ELASTIC_SEARCH_INDEX_NAME } from '../shared/global/helpers/CONSTANT';

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
	singleVideo: catchAsyncError(async (req, res, next) => {
		const id = req.params.id;
		const result = await db.execute(sql`SELECT * FROM videos WHERE id=${id}`);
		const data = result.rows.length ? result.rows[0] : {};
		return res.status(200).json({
			data: data,
			success: true,
		});
	}),

	// Search on Elastic Search
	search: catchAsyncError(async (req, res, next) => {
		const query = req.query?.query ?? '';
		const data = (await elasticSearch.searchVideos(
			ELASTIC_SEARCH_INDEX_NAME,
			query as string
		)) as Video[];
		return res.status(200).json({
			data,
			success: true,
		});
	}),
};

export default getVideos;
