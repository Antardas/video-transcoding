import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
export const pool = new Pool({
	connectionString: 'postgresql://postgres:password@localhost:5432/video',
	ssl: false,
});

export const db = drizzle(pool, { schema });
