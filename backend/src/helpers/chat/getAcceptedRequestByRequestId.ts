import { error } from "console";
import db from "../db";
import logger from "../db/logger";
import { AcceptedRequestInfo } from "../../types/request";

/*
 * Fetch accepted request, given request_id
 */
export async function getAcceptedRequestbyRequestId(request_id: string): Promise<AcceptedRequestInfo> {
  try {
    const queries = db.helpers;

    const requestsResult = await queries.getAcceptedRequestByRequestId(request_id);
    if (!requestsResult.success) {
      logger.error(`Failed to fetch accepted request for request id ${request_id}`);
      throw error;
    }

    const request = requestsResult.data;
    return request
  } catch (error: any) {
    logger.error(`Error fetching accepted requests: ${error.message}`);
    throw error;
  }
}
