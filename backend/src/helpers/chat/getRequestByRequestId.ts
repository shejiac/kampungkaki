import { error } from "console";
import db from "../db";
import logger from "../db/logger";

/*
 * Fetch requester_id, given request_id
 */
export async function getRequesterbyRequest(request_id: string): Promise<string> {
  try {
    const queries = db.helpers;

    // gets all past requests by user 
    const requestsResult = await queries.getRequestByRequestId(request_id);
    if (!requestsResult.success) {
      logger.error(`Failed to fetch requests for requester ${request_id}`);
      throw error;
    }

    const request = requestsResult.data;
    const requester_id = request.requester_id
    return requester_id
  } catch (error: any) {
    logger.error(`Error fetching past requests: ${error.message}`);
    throw error;
  }
}
