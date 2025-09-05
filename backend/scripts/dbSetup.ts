// run with: npx ts-node backend/scripts/dbSetup.ts

import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  port: Number(process.env.DB_PORT) || 5432,
});

console.log("Starting database setup...");

const schemaCreationSQL = fs.readFileSync(
  path.join(__dirname, "data", "schemaCreation.sql"),
  "utf8"
);
const tableCreationSQL = fs.readFileSync(
  path.join(__dirname, "data", "tableCreation.sql"),
  "utf8"
);
console.log("SQL files loaded.");

export async function setupDatabase(): Promise<void> {
  console.log("Connecting to DB...");
  const client = await pool.connect();
  console.log("Connected to DB.");
  try {
    await client.query("BEGIN");

    console.log("Creating schema...");
    await client.query(schemaCreationSQL);

    console.log("Creating tables...");
    await client.query(tableCreationSQL);

    await client.query("COMMIT");
    console.log("Database setup completed successfully!");
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Database setup failed:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  setupDatabase().catch((err) => {
    console.error("Setup failed:", err);
    process.exit(1);
  });
}
