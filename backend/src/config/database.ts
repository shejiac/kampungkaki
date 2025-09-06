import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

// Log the environment variables for debugging
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// Test DB connection
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to the database successfully!");
    client.release();
  } catch (err: unknown) {
    // Type the error as an instance of Error
    if (err instanceof Error) {
      console.error("❌ Database connection failed:", err.message);
    } else {
      console.error("❌ Database connection failed with an unknown error");
    }
  }
})();

export { pool };
