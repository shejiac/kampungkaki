
import db from "../db";
import logger from "../db/logger";
import { RequestInfo, OpenRequestWithNames } from "../../types/request"; 


/**
 * Fetch all open requests and enrich them with requester username
 */



export async function getAllRequestDetails(): Promise<OpenRequestWithNames[]> {
  try {
    const queries = db.helpers;

    const requestsResult = await queries.getRequestsByStatus('open');
    if (!requestsResult.success) {
      logger.error('Failed to fetch open requests');
      return [];
    }

    const openRequests = requestsResult.data;
    const fullDetails: OpenRequestWithNames[] = [];

    for (const request of openRequests) {
      const requesterResult = await queries.getUserDetailsById(request.requester_id);
      if (!requesterResult.success) {
        logger.warning(`Requester not found for request ${request.request_id}`);
        continue;
      }
      const requester_name = requesterResult.data.user_name;
      fullDetails.push({request: request, requester_name });
    }

    return fullDetails;
  } catch (error: any) {
    logger.error(`Error fetching all open requests: ${error.message}`);
    throw error;
  }
}