import { sql } from "drizzle-orm";
import catchAsyncError from "../shared/global/helpers/catch-async-error";
import { db } from "../shared/services/db/connect-db";

const getVideos = {
	all: catchAsyncError(async (req, res, next) => {
		const limit = req.params?.limit ? parseInt(req.params.limit, 10) : 10;
		const offset = req.params?.offset? parseInt(req.params.offset, 10) : 0;
		db.execute(sql`SELECT * FROM videos WHERE URL IS NOT NULL`)
	}) 
};

export default getVideos;
