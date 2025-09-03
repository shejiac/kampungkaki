/**
 * Common database queries helper module.
 * Provides reusable database operations for users.
 */
import { User } from '../../types/user'
import type { RequestInfo } from "../../types/request";
import logger from './logger'
import { DbInterface, DbQueryResult } from '../../types/db'

export interface CommonQueries {
  upsertUser: (userInfo: User) => Promise<DbQueryResult<void>>;
}

export interface CommonQueries {
  upsertRequest: (requestInfo: RequestInfo) => Promise<DbQueryResult<void>>;
}


/**
 * Creates common database query helpers
 * @param db - Database interface object
 * @returns Collection of database helper functions
 */
const commonQueries = (db: DbInterface): CommonQueries => {
  return {
    upsertUser: async (userInfo: User) => {
      try {
        const {
          user_id,
          user_name,
          email,
          phone_number,
          postal_code,
          home_address,
          pwd,
          helper,
          via_points,
          created_date,
          updated_date
        } = userInfo

        const query = `
          INSERT INTO kampung_kaki.t_users (
            user_id, 
            user_name,
            email,
            phone_number,
            postal_code,
            home_address,
            pwd,
            helper,
            via_points,
            created_date,
            updated_date 
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
          )
          ON CONFLICT (user_id)
          DO UPDATE SET
            user_name    = EXCLUDED.user_name,
            email        = EXCLUDED.email,
            phone_number = EXCLUDED.phone_number,
            postal_code  = EXCLUDED.postal_code,
            home_address = EXCLUDED.home_address,
            pwd          = EXCLUDED.pwd,
            helper       = EXCLUDED.helper,
            via_points   = EXCLUDED.via_points,
            created_date = EXCLUDED.created_date,
            updated_date = EXCLUDED.updated_date;
        `

        const params = [
          user_id,
          user_name,
          email,
          phone_number,
          postal_code ?? null,
          home_address ?? null,
          pwd,
          helper,
          via_points ?? null,
          created_date ?? null,
          updated_date ?? null
        ]

        await db.query(query, params)
        logger.success(`Upserted user ${user_id}`)

        return { success: true, data: undefined }
      } catch (error: any) {
        logger.error(`Failed to upsert user ${userInfo.user_id}: ${error.message}`)
        return { success: false, error: error.message }
      }
    },

    upsertRequest: async (requestInfo: RequestInfo) => {
      try {
        const {
          requester_id,
          request_title,
          request_type,
          request_description,
          request_location,
          request_initial_meet,
          request_time,
          request_approx_duration,
          request_priority,
          created_date,
          updated_date
        } = requestInfo;
        

        const query = `
          INSERT INTO kampung_kaki.t_requests (
            requester_id, 
            request_title,
            request_type,
            request_description, 
            request_location,
            request_initial_meet,
            request_time,
            request_approx_duration,
            request_priority,
            created_date,
            updated_date 
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
          )
          ON CONFLICT (user_id)
          DO UPDATE SET
            requester_id            = EXCLUDED.requester_id,
            request_title           = EXCLUDED.request_title,
            request_type            = EXCLUDED.request_type,
            request_description     = EXCLUDED.request_description,
            request_location        = EXCLUDED.request_location,
            request_initial_meet    = EXCLUDED.request_initial_meet,
            request_time            = EXCLUDED.request_time,
            request_approx_duration = EXCLUDED.request_approx_duration, 
            request_priority        = EXCLUDED.request_priority,
            created_date            = EXCLUDED.created_date,
            updated_date            = EXCLUDED.updated_date;
        `

        const params = [
          requester_id,
          request_title,
          request_type,
          request_description,
          request_location,
          request_initial_meet,
          request_time,
          request_approx_duration,
          request_priority,
          created_date ?? null,
          updated_date ?? null
        ]

        await db.query(query, params)
        logger.success(`Upserted request ${requester_id}`)

        return { success: true, data: undefined }
      } catch (error: any) {
        logger.error(`Failed to upsert request ${requestInfo.requester_id}: ${error.message}`)
        return { success: false, error: error.message }
      }
    },
    
  }
}

export default commonQueries
