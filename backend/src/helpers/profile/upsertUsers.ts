import db from "../db";
import logger from "../db/logger";
import { User } from "../../types/user";

/**
 * Upsert users using the commonQueries helper
 */
export async function upsertUser(userInfo: User): Promise<boolean> {
  try {
    const queries = db.helpers;
    const result = await queries.upsertUser(userInfo);
    if (!result.success) {
      logger.error(`Failed to upsert request ${userInfo.user_id}`);
      return false;
    }

    logger.success(`Successfully upserted request ${userInfo.user_id}`);
    return true;
  } catch (error: any) {
    logger.error(`Error upserting request ${userInfo.user_id}: ${error.message}`);
    throw error;
  }
}
