import db from "../db";
import logger from "../db/logger";

/**
 * Get number of PWDs using the commonQueries helper
 */
export async function getPWDCount(): Promise<number|undefined> {
  try {
    const queries = db.helpers;
    const result = await queries.getNumberOfPWDs();
    if (!result.success) {
      logger.error(`Failed to get PWD count`);
      return ;
    }
    logger.success(`Successfully obtained PWD count`);
    return result.data;
  } catch (error: any) {
    logger.error(`Error getting PWD count`);
    throw error;
  }
}
/**
 * Get number of Volunteers using the commonQueries helper
 */
export async function getVolunteerCount(): Promise<number|undefined> {
  try {
    const queries = db.helpers;
    const result = await queries.getNumberOfVolunteers();
    if (!result.success) {
      logger.error(`Failed to get Volunteer count`);
      return ;
    }
    logger.success(`Successfully obtained Volunteer count`);
    return result.data;
  } catch (error: any) {
    logger.error(`Error getting Volunteer count`);
    throw error;
  }
}
/**
 * Get number of Requests using the commonQueries helper
 */
export async function getRequestCount(): Promise<number|undefined> {
  try {
    const queries = db.helpers;
    const result = await queries.getNumberOfRequests();
    if (!result.success) {
      logger.error(`Failed to get Request count`);
      return ;
    }
    logger.success(`Successfully obtained Request count`);
    return result.data;
  } catch (error: any) {
    logger.error(`Error getting Request count`);
    throw error;
  }
}

/* -------------------- Inline test runner -------------------- */
if (require.main === module) {
  (async () => {
    console.log("🔍 Running inline tests...\n");

    try {
      const pwdCount = await getPWDCount();
      console.log("PWD Count:", pwdCount);
    } catch (err) {
      console.error("❌ Error testing getPWDCount:", err);
    }

    try {
      const volunteerCount = await getVolunteerCount();
      console.log("Volunteer Count:", volunteerCount);
    } catch (err) {
      console.error("❌ Error testing getVolunteerCount:", err);
    }

    try {
      const requestCount = await getRequestCount();
      console.log("Request Count:", requestCount);
    } catch (err) {
      console.error("❌ Error testing getRequestCount:", err);
    }

    console.log("\n✅ Inline tests finished");
  })();
}