import 'dotenv/config';
import { db, pool } from './connect-db';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
// This will run migrations on the database, skipping the ones already applied
// Don't forget to close the connection, otherwise the script will hang

(async () => {
	try {
		await migrate(db, { migrationsFolder: './drizzle' });
		await pool.end();
	} catch (error) {
		console.log(error);
	}
})();
