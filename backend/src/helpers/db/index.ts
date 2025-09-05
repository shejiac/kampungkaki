// backend/src/helpers/db/index.ts
import pg from "pg";                       // <— default import avoids ESM/named export ambiguity
import logger from "./logger";
import commonQueriesFactory, { CommonQueries } from "./commonQueries";

// Pull named items off the default import for both runtime and types
const { Pool } = pg;
export type PoolClient = pg.PoolClient;
export type QueryResult<T = any> = pg.QueryResult<T>;

const pool: pg.Pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  port: Number(process.env.DB_PORT) || 5432,
});

// EventEmitter typings are present on pg.Pool; this works with the default import style above
pool.on("connect", () => logger.debug("Database connection established"));
pool.on("error", (err: Error) => logger.error(`Unexpected database error: ${err.message}`));

export const query = async <T = any>(
  text: string,
  params: any[] = []
): Promise<QueryResult<T>> => {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    logger.debug(`Query OK in ${duration}ms`);
    return res;
  } catch (error: any) {
    logger.error(`Database query error: ${error.message}`);
    logger.debug(`Failed query: ${text}`);
    logger.debug(`Parameters: ${JSON.stringify(params)}`);
    throw error;
  }
};

export const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const originalRelease = client.release.bind(client);

  // @ts-ignore: augment for debugging
  client.query = function (...args: [any, ...any[]]) {
    // @ts-ignore
    client.lastQuery = args;
    // @ts-ignore
    return originalQuery.apply(client, args);
  } as typeof client.query;

  client.release = () => {
    originalRelease();
    logger.debug("Database client released");
  };

  return client;
};

export const destroy = async (): Promise<void> => {
  try {
    logger.debug("Closing database connection pool...");
    await pool.end();
    logger.debug("Database connection pool closed successfully");
  } catch (error: any) {
    logger.error(`Error closing database pool: ${error.message}`);
    throw error;
  }
};

// Build your commonly-used query helpers off this db surface
const db = { query, getClient, pool, destroy };
export const helpers: CommonQueries = commonQueriesFactory(db);

export default { query, getClient, pool, destroy, helpers };
