import db from "../db";
import logger from "../db/logger";
import { RequestInfo } from "../../types/request"; 

/*
 * Fetch all past requests made by a specific PWD, given their requester_id
 */
export async function getAllPastRequests(requesterId: string): Promise<RequestInfo[]> {
  try {
    const queries = db.helpers;

    // gets all past requests by user 
    const requestsResult = await queries.getRequestByRequesterId(requesterId);
    if (!requestsResult.success) {
      logger.error(`Failed to fetch requests for requester ${requesterId}`);
      return [];
    }

    const requests = requestsResult.data;
    return requests
  } catch (error: any) {
    logger.error(`Error fetching past requests: ${error.message}`);
    throw error;
  }
}
