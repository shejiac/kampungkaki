/**
 * Common database queries helper module.
 * Provides reusable database operations for Jira tickets and Confluence pages.
 */
import logger from '../../logger'


export interface CommonQueries {
  upsertJiraTicket: (ticketData: JiraTicket) => Promise<DbQueryResult<void>>
}

/**
 * Creates common database query helpers
 * @param db - Database interface object
 * @returns Collection of database helper functions
 */
const commonQueries = (db: DbInterface): CommonQueries => {
  return {
    upsertJiraTicket: async (ticketData: JiraTicket) => {
      try {
        const {
          id,
          title,
          assignee = null,
          reporter = null,
          tester = null,
          overview = null,
          body = null,
          recommended_solution = null,
          actual_solution = null,
          link = null,
          ticket_key = null,
          comments = [],
          created_at = null,
          updated_at = null
        } = ticketData
        
        // Format dates properly for PostgreSQL if they exist
        const formattedCreatedAt = created_at instanceof Date ? created_at : created_at ? new Date(created_at) : null;
        const formattedUpdatedAt = updated_at instanceof Date ? updated_at : updated_at ? new Date(updated_at) : null;

        const query = `
          INSERT INTO nphc_ops_helper.t_knowledge_jira (
            id, title, assignee, reporter, tester, overview, body,
            recommended_solution, actual_solution, link, ticket_key, comments, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
          )
          ON CONFLICT (id)
          DO UPDATE SET
            title = EXCLUDED.title,
            assignee = EXCLUDED.assignee,
            reporter = EXCLUDED.reporter,
            tester = EXCLUDED.tester,
            overview = EXCLUDED.overview,
            body = EXCLUDED.body,
            recommended_solution = EXCLUDED.recommended_solution,
            actual_solution = EXCLUDED.actual_solution,
            link = EXCLUDED.link,
            ticket_key = EXCLUDED.ticket_key,
            comments = EXCLUDED.comments,
            created_at = EXCLUDED.created_at,
            updated_at = EXCLUDED.updated_at
          RETURNING id;
        `

        const params = [
          id,
          title,
          assignee,
          reporter,
          tester,
          overview,
          body,
          recommended_solution,
          actual_solution,
          link,
          ticket_key,
          comments,
          formattedCreatedAt,
          formattedUpdatedAt  
        ]

        const result = await db.query(query, params)
        logger.debug(`Upserted Jira ticket with ID ${id}`)
        return {
          success: true,
          data: undefined
        }
      } catch (error: any) {
        logger.error(`Failed to upsert Jira ticket: ${error.message}`)
        return {
          success: false,
          error: error.message
        }
      }
    },
  }
}

export default commonQueries
