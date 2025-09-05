import db from "../db";
import logger from "../db/logger";
import { RequestInfo } from "../../types/request";

/**
 * Upsert an accepted request using the commonQueries helper
 */
export async function updateStatus(request_id: string, new_status: string): Promise<boolean> {
  try {
    const queries = db.helpers;
    const result = await queries.updateRequestStatus(request_id, new_status);
    if (!result.success) {
      logger.error(`Failed to update ${request_id}`);
      return false;
    }
    logger.success(`Successfully update request ${request_id}`);
    return true;
  } catch (error: any) {
    logger.error(`Error updating request ${request_id}: ${error.message}`);
    throw error;
  }
}
