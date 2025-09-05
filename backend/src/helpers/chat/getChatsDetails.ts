import db from "../db";
import logger from "../db/logger";
import { Chat } from "../../types/chats";
import { error } from "console";

/**
 * Upsert chat using the commonQueries helper
 */
export async function getChatDetailsByReqId(request_id: string): Promise<Chat> {
  try {
    const queries = db.helpers;
    const result = await queries.getChatsByRequestId(request_id);
    if (!result.success) {
      logger.error(`Failed to get chat details of request_id ${request_id}`);
      throw error;
    }
    logger.success(`Successfully obtained chat details`);
    return result.data
  } catch (error: any) {
    logger.error(`Error getting chat details`);
    throw error;
  }
}

export async function getChatDetailsByChatId(chat_id: string): Promise<Chat> {
  try {
    const queries = db.helpers;
    const result = await queries.getChatsByChatId(chat_id);
    if (!result.success) {
      logger.error(`Failed to get chat details of chat_id ${chat_id}`);
      throw error;
    }
    logger.success(`Successfully obtained chat details`);
    return result.data
  } catch (error: any) {
    logger.error(`Error getting chat details`);
    throw error;
  }
}
