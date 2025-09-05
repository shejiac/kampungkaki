import db from "../db";
import logger from "../db/logger";
import { Chat, ChatMessage } from "../../types/chats";

/**
 * Upsert chat messages using the commonQueries helper
 */
export async function upsertChatMessage(msg: ChatMessage): Promise<boolean> {
  try {
    const queries = db.helpers;
    const result = await queries.upsertChatMessage(msg);
    if (!result.success) {
      logger.error(`Failed to upsert request ${msg.message_id}`);
      return false;
    }

    logger.success(`Successfully upserted request ${msg.message_id}`);
    return true;
  } catch (error: any) {
    logger.error(`Error upserting request ${msg.message_id}: ${error.message}`);
    throw error;
  }
}