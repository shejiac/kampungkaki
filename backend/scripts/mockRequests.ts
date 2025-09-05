// run with: npx ts-node backend/scripts/mockRequests.ts

import { RequestInfo } from '../src/types/request';
import { upsertCreatedRequest } from '../src/helpers/pwd/upsertCreatedRequest';

export const mockRequests: RequestInfo[] = [
  {
    requester_id: "u1", 
    volunteer_id: undefined,  
    request_title: "Grocery Shopping Help",
    request_type: "Shopping",
    request_description: "Need help carrying groceries from NTUC FairPrice.",
    request_location: "Ang Mo Kio Hub",
    request_initial_meet: true,
    request_time: "2025-03-05T10:00:00Z",
    request_approx_duration: "1 hour",
    request_priority: "Medium",
    request_status: "open",
    created_at: new Date("2025-03-01T08:00:00Z"),
    updated_at: new Date("2025-03-01T08:00:00Z"),
  },
  {
    requester_id: "u1", 
    volunteer_id: undefined, 
    request_title: "Doctor’s Appointment Escort",
    request_type: "Medical",
    request_description: "Need someone to accompany me to TTSH clinic visit.",
    request_location: "Tan Tock Seng Hospital",
    request_initial_meet: false,
    request_time: "2025-03-06T14:00:00Z",
    request_approx_duration: "2 hours",
    request_priority: "High",
    request_status: "ongoing",
    created_at: new Date("2025-02-28T09:30:00Z"),
    updated_at: new Date("2025-03-01T12:00:00Z"),
  },
  {
    requester_id: "u3", 
    volunteer_id: undefined, 
    request_title: "Change Bedsheets",
    request_type: "Home Task",
    request_description: "Help with changing bedsheets, too heavy for me.",
    request_location: "Bedok North Ave 3",
    request_initial_meet: true,
    request_time: "2025-03-04T09:00:00Z",
    request_approx_duration: "30 minutes",
    request_priority: "Low",
    request_status: "closed",
    created_at: new Date("2025-02-25T15:45:00Z"),
    updated_at: new Date("2025-03-04T10:00:00Z"),
  },]

  export async function testUpsertRequest(requests: RequestInfo[]): Promise<void> {
    for (const req of requests) {
      try {
        const result = await upsertCreatedRequest(req);
        console.log('Upserted request ${req.request_id}:', result);
      } catch (err) {
        console.error('Failed to upsert request ${req.request_id}:', err);
      }
    }
    console.log("All requests processed.");
  }
  
  (async () => {
    await testUpsertRequest(mockRequests);
  })();