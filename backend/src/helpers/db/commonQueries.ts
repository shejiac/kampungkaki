/**
 * Common database queries helper module.
 * Provides reusable database operations for users.
 */
import { User } from '../../types/user'
import { RequestInfo, AcceptedRequestInfo } from "../../types/request";
import logger from './logger'
import { DbInterface, DbQueryResult } from '../../types/db'

export interface CommonQueries {
  upsertUser: (userInfo: User) => Promise<DbQueryResult<void>>;
  upsertRequest: (requestInfo: RequestInfo) => Promise<DbQueryResult<void>>;
  getUserDetailsById: (userId: number) => Promise<DbQueryResult<User>>;
  getRequestByRequesterId: (requesterId: number) => Promise<DbQueryResult<RequestInfo>>;
  getRequestByRequestId: (requestId: number) => Promise<DbQueryResult<RequestInfo>>;
  getRequestByHelperId: (helperId: number) => Promise<DbQueryResult<RequestInfo>>;
  getAcceptedRequestByRequestId: (requestId: number) => Promise<DbQueryResult<RequestInfo>>;
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
          request_id,
          requester_id,
          helper_id,
          request_title,
          request_type,
          request_description,
          request_location,
          request_initial_meet,
          request_time,
          request_approx_duration,
          request_priority,
          request_status,
          created_date,
          updated_date
        } = requestInfo;
        const query = `
          INSERT INTO kampung_kaki.t_requests (
            request_id,
            requester_id, 
            helper_id,
            request_title,
            request_type,
            request_description, 
            request_location,
            request_initial_meet,
            request_time,
            request_approx_duration,
            request_priority,
            request_status,
            created_date,
            updated_date 
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
          )
          ON CONFLICT (user_id)
          DO UPDATE SET
            request_id              = EXCLUDED.request_id,
            requester_id            = EXCLUDED.requester_id,
            helper_id               = EXCLUDED.helper_id,
            request_title           = EXCLUDED.request_title,
            request_type            = EXCLUDED.request_type,
            request_description     = EXCLUDED.request_description,
            request_location        = EXCLUDED.request_location,
            request_initial_meet    = EXCLUDED.request_initial_meet,
            request_time            = EXCLUDED.request_time,
            request_approx_duration = EXCLUDED.request_approx_duration, 
            request_priority        = EXCLUDED.request_priority,
            request_status          = EXCLUDED.request_status,
            created_date            = EXCLUDED.created_date,
            updated_date            = EXCLUDED.updated_date;
        `
        const params = [
          request_id,
          requester_id,
          helper_id ?? null,
          request_title,
          request_type,
          request_description,
          request_location,
          request_initial_meet,
          request_time,
          request_approx_duration,
          request_priority,
          request_status,
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
    getUserDetailsById: async (userId: number) => {
      try {
        const query = `
          SELECT *
          FROM kampung_kaki.t_users
          WHERE user_id = $1
        `
        const result = await db.query(query, [userId]);
        if (result.rows.length === 0) {
          logger.debug(`No User found with ID ${userId}`)
          return {
            success: false,
            error: 'User not found'
          }
        }
        return { 
          success: true, 
          data: result.rows[0] as User
        }; 
        
      } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
      }
    },
    getRequestByRequesterId: async (requesterId: number) => {
      try {
        const query = `
          SELECT *
          FROM kampung_kaki.t_requests
          WHERE requester_id = $1
        `;
        const result = await db.query(query, [requesterId]);
        if (result.rows.length === 0) {
          logger.debug(`No requests found made by User ${requesterId}`)
          return {
            success: false,
            error: 'Request not found'
          }
        }
        return { 
          success: true, 
          data: result.rows[0] as RequestInfo
        }; 
      } catch (error) {
        console.error("Error fetching request:", error);
        throw error;
      }
    },
    getRequestByRequestId: async (requestId: number) => {
      try {
        const query = `
          SELECT *
          FROM kampung_kaki.t_requests
          WHERE requester_id = $1
        `;
        const result = await db.query(query, [requestId]);
        if (result.rows.length === 0) {
          logger.debug(`No requests found with Id ${requestId}`)
          return {
            success: false,
            error: 'Request not found'
          }
        }
        return { 
          success: true, 
          data: result.rows[0] as RequestInfo
        }; 
      } catch (error) {
        console.error("Error fetching request:", error);
        throw error;
      }
    },
    getRequestByHelperId: async (helperId: number) => {
      try {
        const query = `
          SELECT *
          FROM kampung_kaki.t_requests
          WHERE requester_id = $1
        `;
        const result = await db.query(query, [helperId]);
        if (result.rows.length === 0) {
          logger.debug(`No requests found with Id ${helperId}`)
          return {
            success: false,
            error: 'Request not found'
          }
        }
        return { 
          success: true, 
          data: result.rows[0] as RequestInfo
        }; 
      } catch (error) {
        console.error("Error fetching request:", error);
        throw error;
      }
    },
    getAcceptedRequestByRequestId: async (requestId: number) => {
      try {
        const query = `
          SELECT *
          FROM kampung_kaki.t_accepted_requests
          WHERE request_id = $1
        `;
        const result = await db.query(query, [requestId]);
        if (result.rows.length === 0) {
          logger.debug(`No accepted requests found with Id ${requestId}`)
          return {
            success: false,
            error: 'Request not found'
          }
        }
        return { 
          success: true, 
          data: result.rows[0] as RequestInfo
        }; 
      } catch (error) {
        console.error("Error fetching request:", error);
        throw error;
      }
    },
  }
}

export default commonQueries
