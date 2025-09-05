import { RequestInfo } from "../../types/request";
import logger from "../db/logger";
import db from "../db";
import { error } from "console";


export async function getRequestsByUserId(user_id: string): Promise<RequestInfo[]> {
  try {
    const request_list: RequestInfo[] = [];
    const queries = db.helpers;

    const result = await queries.getRequestByRequesterId(user_id);
    if (!result.success) {
      logger.error(`Failed to fetch requests as requester`);
    } else if (!result.data || result.data.length === 0) {
      logger.debug(`No requests found for user ${user_id} as requester`);
    } else {
      request_list.push(...result.data);
    }

    // Requests where the user is a volunteer
    const result2 = await queries.getRequestByVolunteerId(user_id);
    if (!result2.success) {
      logger.error(`Failed to fetch requests as volunteer`);
    } else if (!result2.data || result2.data.length === 0) {
      logger.debug(`No requests found for user ${user_id} as volunteer`);
    } else {
      request_list.push(...result2.data);
    }

    logger.success(`Successfully got requests`);
    return request_list;
  } catch (error: any) {
    logger.error(`Error getting requests: ${error.message}`);
    throw error;
  }
}
