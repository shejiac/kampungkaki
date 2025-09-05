import { error } from "console";
import db from "../db";
import logger from "../db/logger";
import { RequestInfo } from "../../types/request";

/*
 * Fetch request, given request_id
 */
export async function getRequestbyRequestId(request_id: string): Promise<RequestInfo> {
  try {
    const queries = db.helpers;

    const requestsResult = await queries.getRequestByRequestId(request_id);
    if (!requestsResult.success) {
      logger.error(`Failed to fetch request for request id ${request_id}`);
      throw error;
    }

    const request = requestsResult.data;
    return request
  } catch (error: any) {
    logger.error(`Error fetching request: ${error.message}`);
    throw error;
  }
}
