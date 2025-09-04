import db from "../db";
import logger from "../db/logger";


export async function getUserNameForRequestCreation(user_id: string): Promise<string | null> {
  try {
    const queries = db.helpers;

    const userResult = await queries.getUserDetailsById(user_id);
    if (!userResult.success) {
      logger.error(`Failed to fetch user with id ${user_id}`);
      return null
    }

    const user = userResult.data
    const user_name = user.user_name
    return user_name
  } catch (error: any) {
    logger.error(`Error fetching user by id ${user_id}: ${error.message}`);
    throw error;
  }
}
