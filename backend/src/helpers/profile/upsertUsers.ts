import { pool } from "../../config/database"; // Ensure correct pool import
import { User } from "../../types/user";

/**
 * Upsert user into the database
 */
export const upsertUser = async (userInfo: User): Promise<boolean> => {
  const client = await pool.connect();

  try {
    console.log(`Upserting user ${userInfo.user_id}`);
    // Log the actual user info
    console.log("User Info:", userInfo);
    
    const result = await client.query(`
      INSERT INTO kampung_kaki.t_users (user_id, user_name, phone_number, home_address, pwd, volunteer, via_hours, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        user_name = $2, 
        phone_number = $3, 
        home_address = $4, 
        pwd = $5, 
        volunteer = $6, 
        via_hours = $7, 
        updated_at = NOW();
    `, [
      userInfo.user_id, userInfo.user_name, userInfo.phone_number, userInfo.home_address, userInfo.pwd,
      userInfo.volunteer, userInfo.via_hours, userInfo.created_at, userInfo.updated_at
    ]);

    console.log("User upserted:", result);
    return true;
  } catch (err) {
    console.error("Error in upsertUser:", err);
    throw err;
  } finally {
    client.release(); // Release the client back to the pool
  }
};
