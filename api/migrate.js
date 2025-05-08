import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Load .env file for local use or if DATABASE_URL is there

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString });
  const db = drizzle(pool);

  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' }); // Adjust './drizzle' if your migrations folder is named differently
  console.log('Migrations completed successfully!');
  await pool.end(); // Important to close the connection pool
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});