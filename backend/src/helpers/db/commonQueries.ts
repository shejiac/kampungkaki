import { User } from '../../types/user';
import { RequestInfo, AcceptedRequestInfo, RequestStatus } from "../../types/request";
import logger from './logger';
import { DbInterface, DbQueryResult } from '../../types/db';
import { Chat, ChatMessage } from '../../types/chats'; 
import { errorMessage } from './errorMessage';




export interface CommonQueries {
  upsertUser: (userInfo: User) => Promise<DbQueryResult<void>>;
  upsertRequest: (requestInfo: RequestInfo) => Promise<DbQueryResult<void>>;
  upsertAcceptedRequest: (requestInfo: AcceptedRequestInfo) => Promise<DbQueryResult<void>>;
  upsertChat: (chat: Chat) => Promise<DbQueryResult<void>>;
  upsertChatMessage: (msg: ChatMessage) => Promise<DbQueryResult<void>>;
  getUserDetailsById: (userId: string) => Promise<DbQueryResult<User>>;
  getRequestByRequesterId: (requesterId: string) => Promise<DbQueryResult<RequestInfo[]>>;
  getRequestByRequestId: (requestId: string) => Promise<DbQueryResult<RequestInfo>>;
  getRequestByVolunteerId: (volunteerId: string) => Promise<DbQueryResult<RequestInfo[]>>;
  getAcceptedRequestByRequestId: (requestId: string) => Promise<DbQueryResult<AcceptedRequestInfo>>;
  getChatsByRequestId: (requestId: string) => Promise<DbQueryResult<Chat>>;
  getMessagesByChatId: (chatId: string) => Promise<DbQueryResult<ChatMessage[]>>;
  getNumberOfRequests: () => Promise<DbQueryResult<number>>;
  getNumberOfPWDs: () => Promise<DbQueryResult<number>>;
  getNumberOfVolunteers: () => Promise<DbQueryResult<number>>;
  getRequestsByStatus: (requestStatus: RequestStatus) => Promise<DbQueryResult<RequestInfo[]>>;
  updateRequestStatus: (request_id: string, new_status: string) => Promise<DbQueryResult<void>>;
}

const commonQueries = (db: DbInterface): CommonQueries => ({
      upsertUser: async (userInfo: User) => {
        try {
          const {
            user_id, user_name, phone_number,
            home_address, pwd, volunteer, via_hours, created_at, updated_at
          } = userInfo;

          const query = `
            INSERT INTO kampung_kaki.t_users (
              user_id, user_name, phone_number, 
              home_address, pwd, volunteer, via_hours, created_at, updated_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,COALESCE($8, NOW()), COALESCE($9, NOW()))
            ON CONFLICT (user_id)
            DO UPDATE SET
              user_id      = EXCLUDED.user_id,
              user_name    = EXCLUDED.user_name,
              phone_number = EXCLUDED.phone_number,
              home_address = EXCLUDED.home_address,
              pwd          = EXCLUDED.pwd,
              volunteer    = EXCLUDED.volunteer,
              via_hours    = EXCLUDED.via_hours,
              updated_at   = EXCLUDED.updated_at;
          `;

          const params = [
            user_id, user_name, phone_number,
            home_address ?? null, pwd, volunteer, via_hours ?? null,
            created_at ?? null, updated_at ?? null
          ];

          await db.query(query, params);
          logger.success(`Upserted user ${user_id}`);
          return { success: true, data: undefined };
        } catch (error: any) {
          logger.error(`Failed to upsert user ${userInfo.user_id}: ${error.message}`);
          return { success: false, error: error.message };
        }
      },

      upsertRequest: async (requestInfo: RequestInfo) => {
        try {
          const {
            request_id, requester_id, volunteer_id, request_title, request_type,
            request_description, request_location, request_initial_meet,
            request_time, request_approx_duration, request_priority,
            request_status, created_at, updated_at
          } = requestInfo;

          const query = `
            INSERT INTO kampung_kaki.t_requests (
              request_id, requester_id, volunteer_id, request_title, request_type,
              request_description, request_location, request_initial_meet,
              request_time, request_approx_duration, request_priority,
              request_status, created_at, updated_at
            )
            VALUES (COALESCE($1, uuid_generate_v4()), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, COALESCE($13, NOW()), COALESCE($14, NOW()))
            ON CONFLICT (request_id)
            DO UPDATE SET
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
            RETURNING request_id;
          `;
          const params = [
            request_id ?? null,
            requester_id,
            volunteer_id ?? null,
            request_title,
            request_type,
            request_description,
            request_location,
            request_initial_meet,
            request_time,
            request_approx_duration,
            request_priority,
            request_status,
            created_at,
            updated_at
          ];

          await db.query(query, params);
          logger.success(`Upserted request`);
          return { success: true, data: undefined };
        } catch (error: any) {
          logger.error(`Failed to upsert request ${requestInfo.request_id}: ${error.message}`);
          return { success: false, error: error.message };
        }
      },

      upsertAcceptedRequest: async (requestInfo: AcceptedRequestInfo) => {
        try {
          const {
            request_id, requester_id, volunteer_id, request_start_time,
            request_end_time, request_total_time, request_status
          } = requestInfo;

          const query = `
            INSERT INTO kampung_kaki.t_accepted_requests (
              request_id, requester_id, volunteer_id,
              request_start_time, request_end_time, request_total_time,
              request_status
            ) VALUES ($1,$2,$3,$4,$5,$6,$7)
            ON CONFLICT (request_id)
            DO UPDATE SET
              volunteer_id = EXCLUDED.volunteer_id,
              request_start_time = EXCLUDED.request_start_time,
              request_end_time = EXCLUDED.request_end_time,
              request_total_time = EXCLUDED.request_total_time,
              request_status = EXCLUDED.request_status;
          `;

          const params = [
            request_id, requester_id, volunteer_id, request_start_time ?? null,
            request_end_time ?? null, request_total_time ?? null, request_status
          ];

          await db.query(query, params);
          logger.success(`Upserted accepted request ${request_id}`);
          return { success: true, data: undefined };
        } catch (error: any) {
          logger.error(`Failed to upsert accepted request ${requestInfo.request_id}: ${error.message}`);
          return { success: false, error: error.message };
        }
      },

      getUserDetailsById: async (userId: string) => {
        try {
          const query = `SELECT * FROM kampung_kaki.t_users WHERE user_id = $1`;
          const result = await db.query(query, [userId]);
          if (!result.rows.length) {
            return { success: false, error: 'User not found' };
          }
          return { success: true, data: result.rows[0] as User };
        } catch (error) {
          logger.error(`Error fetching user ${userId}: ${errorMessage(error)}`);
          throw error;
        }
      },

      getRequestByRequesterId: async (requesterId: string) => {
        try {
          const query = `SELECT * FROM kampung_kaki.t_requests WHERE requester_id = $1`;
          const result = await db.query(query, [requesterId]);
          if (!result.rows.length) {
            return { success: true, data: []  };
          }
          return { success: true, data: result.rows as RequestInfo[] };
        } catch (error) {
          logger.error(`Error fetching request by requester: ${requesterId}: ${errorMessage(error)}`);
          throw error;
        }
      },

      getRequestByRequestId: async (requestId: string) => {
        try {
          const query = `SELECT * FROM kampung_kaki.t_requests WHERE request_id = $1`;
          const result = await db.query(query, [requestId]);
          if (!result.rows.length) {
            return { success: false, error: 'Request not found' };
          }
          return { success: true, data: result.rows[0] as RequestInfo };
        } catch (error) {
          logger.error(`Error fetching request ${requestId}: ${errorMessage(error)}`);
          throw error;
        }
      },

      getRequestByVolunteerId: async (volunteerId: string) => {
        try {
          const query = `SELECT * FROM kampung_kaki.t_requests WHERE volunteer_id = $1`;
          const result = await db.query(query, [volunteerId]);
          if (!result.rows.length) {
            return { success: true, data: []  };
          }
          return { success: true, data: result.rows as RequestInfo[] };
        } catch (error) {
          logger.error(`Error fetching request by requester: ${volunteerId}: ${errorMessage(error)}`);
          throw error;
        }
      },

      getAcceptedRequestByRequestId: async (requestId: string) => {
        try {
          const query = `SELECT * FROM kampung_kaki.t_accepted_requests WHERE request_id = $1`;
          const result = await db.query(query, [requestId]);
          if (!result.rows.length) {
            return { success: false, error: 'Accepted request not found' };
          }
          return { success: true, data: result.rows[0] as AcceptedRequestInfo };
        } catch (error) {
          logger.error(`Error fetching request ${requestId}: ${errorMessage(error)}`);
          throw error;
        }
      },

      upsertChat: async (chat: Chat) => {
        try {
          const { chat_id, request_id, requester_id, volunteer_id, created_at } = chat;
          const query = `
            INSERT INTO kampung_kaki.t_chats (
              chat_id, request_id, requester_id, volunteer_id, created_at
            ) VALUES (COALESCE($1, uuid_generate_v4()),$2,$3,$4,COALESCE($5, NOW()))
            ON CONFLICT (chat_id)
            DO NOTHING;
          `;
          const params = [chat_id, request_id, requester_id, volunteer_id, created_at ?? null];
          await db.query(query, params);
          logger.success(`Upserted chat ${chat_id}`);
          return { success: true, data: undefined };
        } catch (error: any) {
          logger.error(`Failed to upsert chat ${chat.chat_id}: ${errorMessage(error)}`);
          return { success: false, error: error.message };
        }
      },

      upsertChatMessage: async (msg: ChatMessage) => {
        try {
          const { message_id, chat_id, sender_id, message_type, body, created_at } = msg;
          const query = `
            INSERT INTO kampung_kaki.t_chats_messages (
              message_id, chat_id, sender_id, message_type, body, created_at
            ) VALUES (COALESCE($1, uuid_generate_v4()),$2,$3,$4,$5,COALESCE($6, NOW()))
            ON CONFLICT (message_id)
            DO NOTHING;
          `;
          const params = [message_id, chat_id, sender_id ?? null, message_type, body, created_at ?? null];
          await db.query(query, params);
          logger.success(`Upserted message ${message_id}`);
          return { success: true, data: undefined };
        } catch (error: any) {
          logger.error(`Failed to upsert message ${msg.message_id}: ${errorMessage(error)}`);
          return { success: false, error: error.message };
        }
      },

      getChatsByRequestId: async (requestId: string) => {
        try {
          const query = `SELECT * FROM kampung_kaki.t_chats WHERE request_id = $1`;
          const result = await db.query(query, [requestId]);
          return { success: true, data: result.rows[0] as Chat };
        } catch (error: any) {
          logger.error(`Error fetching chats for request ${requestId}: ${errorMessage(error)}`);
          return { success: false, error: error.message };
        }
      },

      getMessagesByChatId: async (chatId: string) => {
        try {
          const query = `SELECT * FROM kampung_kaki.t_chats_messages WHERE chat_id = $1 ORDER BY created_at DESC`;
          const result = await db.query(query, [chatId]);
          return { success: true, data: result.rows as ChatMessage[] };
        } catch (error: any) {
          logger.error(`Error fetching messages for chat ${chatId}: ${errorMessage(error)}`);
          return { success: false, error: error.message };
        }
      },

      getNumberOfRequests: async () => {
      try {
        const query = `SELECT COUNT(*) AS count FROM kampung_kaki.t_requests`;
        const result = await db.query(query);
        return { success: true, data: parseInt(result.rows[0].count, 10) };
      } catch (error: any) {
        logger.error(`Error fetching number of requests: ${error.message}`);
        return { success: false, error: error.message };
      }
    },

    getNumberOfVolunteers: async () => {
      try {
        const query = `SELECT COUNT(*) AS count FROM kampung_kaki.t_users WHERE volunteer = TRUE`;
        const result = await db.query(query);
        return { success: true, data: parseInt(result.rows[0].count, 10) };
      } catch (error: any) {
        logger.error(`Error fetching number of volunteers: ${error.message}`);
        return { success: false, error: error.message };
      }
    },

    getNumberOfPWDs: async () => {
      try {
        const query = `SELECT COUNT(*) AS count FROM kampung_kaki.t_users WHERE pwd = TRUE`;
        
        const result = await db.query(query);
        
        return { success: true, data: parseInt(result.rows[0].count, 10) };
      } catch (error: any) {
        logger.error(`Error fetching number of PWD users: ${error.message}`);
        return { success: false, error: error.message };
      }
    },
    getRequestsByStatus: async (status: RequestStatus): Promise<DbQueryResult<RequestInfo[]>> => {
      try {
        const query = `
          SELECT *
          FROM kampung_kaki.t_requests
          WHERE request_status = $1
          ORDER BY created_at DESC
        `;
        const result = await db.query(query, [status]);

        return { success: true, data: result.rows as RequestInfo[] };
      } catch (error: any) {
        logger.error(`Error fetching requests with status ${status}: ${error.message}`);
        return { success: false, error: error.message };
      }
    },
    updateRequestStatus: async (request_id: string, new_status: string) => {
      try {
        const query = `
          UPDATE kampung_kaki.t_requests
          SET request_status = $2,
              updated_at = NOW()
          WHERE request_id = $1
          RETURNING request_id, request_status, updated_at;
        `;

        const params = [request_id, new_status];
        await db.query(query, params);
        logger.success(`Updated request to status '${new_status}`);
        return { success: true, data: undefined };
      } catch (error: any) {
        logger.error(`Failed to update status for request ${request_id}: ${error.message}`);
        return { success: false, error: error.message };
      }
    },
  }
);

export default commonQueries;
