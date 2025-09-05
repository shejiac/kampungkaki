import { RequestInfo } from "../../types/request";
import logger from "../db/logger";
import db from "../db";
import { error } from "console";


export async function getRequestsByUserId(user_id: string): Promise<RequestInfo[]> {
  try {
    const request_list: RequestInfo[] = [];
    const queries = db.helpers;

    // Requests where the user is a requester
    const result = await queries.getRequestByRequesterId(user_id);
    if (!result.success || !result.data) {
      logger.error(`Failed to fetch requests as requester`);
    } else {
        for (const r of result.data) {
          request_list.push(r);
        }
      }

    // Requests where the user is a volunteer
    const result2 = await queries.getRequestByVolunteerId(user_id);
    if (!result2.success || !result2.data) {
      logger.error(`Failed to fetch requests as volunteer`);
    } else {
        for (const r of result2.data) {
          request_list.push(r);
        }
      }

    logger.success(`Successfully got requests`);
    return request_list;
  } catch (error: any) {
    logger.error(`Error getting requests: ${error.message}`);
    throw error;
  }
}
