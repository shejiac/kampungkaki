import db from "../db";
import logger from "../db/logger";
import { AcceptedRequestInfo } from "../../types/request";

/**
 * Upsert an accepted request using the commonQueries helper
 */
export async function upsertAcceptedRequest(request: AcceptedRequestInfo): Promise<boolean> {
  try {
    const queries = db.helpers;
    const result = await queries.upsertAcceptedRequest(request);
    if (!result.success) {
      logger.error(`Failed to upsert request ${request.request_id}`);
      return false;
    }
    logger.success(`Successfully upserted request ${request.request_id}`);
    return true;
  } catch (error: any) {
    logger.error(`Error upserting request ${request.request_id}: ${error.message}`);
    throw error;
  }
}
