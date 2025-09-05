import db from "../db";
import logger from "../db/logger";
import { Chat } from "../../types/chats";

/**
 * Upsert chat using the commonQueries helper
 */
export async function upsertChat(chat: Chat): Promise<boolean> {
  try {
    const queries = db.helpers;
    const result = await queries.upsertChat(chat);
    if (!result.success) {
      logger.error(`Failed to upsert request ${chat}`);
      return false;
    }

    logger.success(`Successfully upserted request ${chat}`);
    return true;
  } catch (error: any) {
    logger.error(`Error upserting request ${chat}: ${error.message}`);
    throw error;
  }
}
