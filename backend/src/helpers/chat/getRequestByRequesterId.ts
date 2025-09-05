import { error } from "console";
import db from "../db";
import logger from "../db/logger";

/*
 * Fetch request_id, given requester_id
 */
export async function getRequestbyRequester(requester_id: string): Promise<string> {
  try {
    const queries = db.helpers;

    // gets all past requests by user 
    const requestsResult = await queries.getRequestByRequesterId(requester_id);
    if (!requestsResult.success) {
      logger.error(`Failed to fetch requests for requester ${requester_id}`);
      throw error;
    }

    const request = requestsResult.data[0];
    const request_id = request.request_id
    if (!request_id){
        logger.error (`Failed to fetch request id`)
        throw error
    }
    return request_id
  } catch (error: any) {
    logger.error(`Error fetching past requests: ${error.message}`);
    throw error;
  }
}
