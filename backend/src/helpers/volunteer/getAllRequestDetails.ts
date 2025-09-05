
import db from "../db";
import logger from "../db/logger";
import { OpenRequestWithNames, DashboardRequest, PreAcceptRequest } from "../../types/request"; 


/**
 * Fetch all open requests and enrich them with requester username
 * Returns request info (refer to request type) and requester username 
 * For dashboard, everytime refresh use individualDetails... to retrieve all open requests and their minimum details
 * For actual request details, after click in, 
 * should provide a request id to go back to db to retrieve everything,
 * prevent getting a request that happened to have been accepted
 */

export async function getAllRequestDetails(): Promise<OpenRequestWithNames[]> {
  try {
    const queries = db.helpers;

    const requestsResult = await queries.getRequestsByStatus('open');
    if (!requestsResult.success) {
      logger.error('Failed to fetch open requests');
      return [];
    }

    const openRequests = requestsResult.data;
    const fullDetails: OpenRequestWithNames[] = [];

    for (const request of openRequests) {
      const requesterResult = await queries.getUserDetailsById(request.requester_id);
      if (!requesterResult.success) {
        logger.warning(`Requester not found for request ${request.request_id}`);
        continue;
      }
      const requester_name = requesterResult.data.user_name;
      fullDetails.push({request: request, requester_name });
    }

    return fullDetails;
  } catch (error: any) {
    logger.error(`Error fetching all open requests: ${error.message}`);
    throw error;
  }
}

export async function individualRequestDetailsOnDashboard(requests: OpenRequestWithNames[]): Promise<DashboardRequest[]>{
  try {
    const requestDetailsForDashboard: DashboardRequest[] = [];
    for (const request of requests) {
      if (!request.request.request_id){
        logger.error('Request ID does not exist');
      continue;
      }
      const request_id = request.request.request_id
      const type = request.request.request_type
      const title = request.request.request_title
      const urgency = request.request.request_priority
      const duration = request.request.request_approx_duration
      const location = request.request.request_location

      requestDetailsForDashboard.push({request_id, type, title, urgency, duration, location})
    }
    return requestDetailsForDashboard;
  } catch (error: any) {
    logger.error(`Error fetching all open requests: ${error.message}`);
    throw error;
  }
}

export async function fullDetailsAfterClick(request_id: string): Promise<PreAcceptRequest|undefined> {
  try {
    const queries = db.helpers;
    const request = await queries.getRequestByRequestId(request_id)
    if (!request.success) {
      throw new Error('Failed to fetch request');
    }
    const requester_id = request.data?.requester_id
      if (requester_id){
        const data = await queries.getUserDetailsById(requester_id)
        if(!data.success){
          throw new Error("Failed to find user details")
        }
        if(!request.data.request_id){
          throw new Error("Missing request_id in request")
        }
        if(!request.data.created_at){
          throw new Error("No created date")
        }
        const individualDetails: PreAcceptRequest = {
        request_id: request.data.request_id,
        requester_id,
        name: data.data.user_name,
        title: request.data.request_title,
        type: request.data.request_type,
        description: request.data.request_description,
        location: request.data.request_location,
        initial_meet: request.data.request_initial_meet,
        time: request.data.request_time,
        duration: request.data.request_approx_duration,   
        urgency: request.data.request_priority,
        created_at: request.data.created_at,
      };
        return individualDetails
      }
    }catch (err) {
    logger.error(`Error in fullDetailsAfterClick: ${err}`);
    throw err;
  }
}