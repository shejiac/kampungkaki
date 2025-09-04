
import { Pool, PoolClient, QueryResult } from 'pg'
import logger from './logger'
import commonQueriesFactory, { CommonQueries } from './commonQueries'

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  port: Number(process.env.DB_PORT) || 5432
})

pool.on('connect', () => logger.debug('Database connection established'))
pool.on('error', (err: Error) => logger.error(`Unexpected database error: ${err.message}`))


const query = async (text: string, params: any[] = []): Promise<QueryResult> => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start

    return res
  } catch (error: any) {
    logger.error(`Database query error: ${error.message}`)
    logger.debug(`Failed query: ${text}`)
    logger.debug(`Parameters: ${JSON.stringify(params)}`)
    throw error
  }
}


const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect()
  const originalQuery = client.query.bind(client)
  const originalRelease = client.release.bind(client)

  // Override query to track lastQuery
  client.query = function (...args: [any, ...any[]]) {
    // @ts-ignore
    client.lastQuery = args
    // @ts-ignore
    return originalQuery.apply(client, args)
  } as typeof client.query

  client.release = () => {
    originalRelease()
    logger.debug('Database client released')
  }

  return client
}


const destroy = async (): Promise<void> => {
  try {
    logger.debug('Closing database connection pool...')
    await pool.end()
    logger.debug('Database connection pool closed successfully')
  } catch (error: any) {
    logger.error(`Error closing database pool: ${error.message}`)
    throw error
  }
}

const db = {
  query,
  getClient,
  pool,
  destroy
}

const helpers: CommonQueries = commonQueriesFactory(db)

export default {
  query,
  getClient,
  pool,
  destroy,
  helpers
}