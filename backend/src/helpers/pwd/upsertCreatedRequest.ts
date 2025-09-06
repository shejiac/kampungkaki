// backend/src/helpers/pwd/upsertCreatedRequest.ts

import { RequestInfo } from "../../types/request";

// Use the import style that matches your database.ts:
// 1) Named export:
// import { pool } from "../../config/database";
// 2) Default export:
import {pool} from "../../config/database";


export const upsertCreatedRequest = async (request: RequestInfo): Promise<boolean> => {
  const client = await pool.connect();
  try {
    console.info(`Upserting request ${request.request_id}`);
    console.info(`Request Info: ${JSON.stringify(request)}`);

    const sql = `
      INSERT INTO kampung_kaki.t_requests
        (request_id, requester_id, volunteer_id, request_title, request_type,
         request_description, request_location, request_initial_meet,
         request_time,            -- VARCHAR
         request_approx_duration, -- INTERVAL
         request_priority, request_status)
      VALUES
        (
          COALESCE($1, uuid_generate_v4()),
          $2, $3, $4, $5,
          $6, $7, $8,
          NULLIF($9, ''),           -- safe for VARCHAR column
          NULLIF($10, '')::interval,-- safe cast for INTERVAL
          $11, $12
        )
      ON CONFLICT (request_id) DO UPDATE SET
        requester_id = EXCLUDED.requester_id,
        volunteer_id = EXCLUDED.volunteer_id,
        request_title = EXCLUDED.request_title,
        request_type = EXCLUDED.request_type,
        request_description = EXCLUDED.request_description,
        request_location = EXCLUDED.request_location,
        request_initial_meet = EXCLUDED.request_initial_meet,
        request_time = EXCLUDED.request_time,
        request_approx_duration = EXCLUDED.request_approx_duration,
        request_priority = EXCLUDED.request_priority,
        request_status = EXCLUDED.request_status,
        updated_at = NOW()
      RETURNING request_id
    `;

    // IMPORTANT: exactly 12 values for $1..$12, in the same order.
    const values = [
      request.request_id,
      request.requester_id,
      request.volunteer_id ?? null,
      request.request_title ?? null,
      request.request_type ?? null,
      request.request_description ?? null,
      request.request_location ?? null,
      request.request_initial_meet ?? false,
      request.request_time ?? null,                 // becomes NULL if '' by NULLIF
      request.request_approx_duration ?? null,      // becomes NULL if '' by NULLIF
      request.request_priority ?? null,
      request.request_status ?? null,
    ];

    await client.query(sql, values);
    console.info(`Successfully upserted request ${request.request_id}`);
    return true;
  } catch (err) {
    console.error(`Error in upsertCreatedRequest: ${String(err)}`);
    throw err;
  } finally {
    client.release();
  }
};
