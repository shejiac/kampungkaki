/**
 * Database setup module for the NPHC Ops Helper application. Initializes the PostgreSQL database
 * by creating the required schema and tables from SQL files.
 */

import dotenv from 'dotenv'
dotenv.config()
import fs from 'fs'
import path from 'path'
import { Pool } from 'pg'

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  port: Number(process.env.DB_PORT) || 5432
})

console.log('Starting database setup...')

const schemaCreationSQL = fs.readFileSync(
  path.join(__dirname, 'models', 'schemaCreation.sql'),
  'utf8'
)
const tableCreationSQL = fs.readFileSync(
  path.join(__dirname, 'models', 'tableCreation.sql'),
  'utf8'
)

/**
 * Sets up the database by executing schema and table creation scripts within a transaction
 * @returns {Promise<void>} Resolves when database setup is complete
 * @throws {Error} If the database setup fails
 */
export async function setupDatabase (): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    console.log('Creating schema...')
    await client.query(schemaCreationSQL)

    console.log('Creating tables...')
    await client.query(tableCreationSQL)

    await client.query('COMMIT')
    console.log('Database setup completed successfully!')
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error('Database setup failed:', error.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

if (require.main === module) {
  setupDatabase()
}