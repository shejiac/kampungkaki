import db from "../db";
import logger from "../db/logger";
import { ChatMessage } from "../../types/chats";
import { error } from "console";

/**
 * Upsert chat using the commonQueries helper
 */
export async function getChatMessages(chat_id: string): Promise<ChatMessage[]> {
  try {
    const queries = db.helpers;
    const result = await queries.getMessagesByChatId(chat_id);
    if (!result.success) {
      logger.error(`Failed to get chat messages of chat_id ${chat_id}`);
      throw error;
    }
    logger.success(`Successfully obtained chat details`);
    return result.data
  } catch (error: any) {
    logger.error(`Error getting chat details`);
    throw error;
  }
}

export async function getLastChatMessage(chat_messages: ChatMessage[]): Promise<ChatMessage> {
    const last_chat_message = chat_messages[0]
    return last_chat_message
}
