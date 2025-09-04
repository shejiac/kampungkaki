import { RequestInfo } from '../src/types/request';
import { upsertCreatedRequest } from "../src/helpers/pwd/upsertCreatedRequest";

export const mockRequests: RequestInfo[] = [
  {
    request_id: "r1",
    requester_id: "p1", // Alice Tan (PWD)
    volunteer_id: undefined, // not yet taken
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
    request_id: "r2",
    requester_id: "p2", // Benjamin Ong (PWD)
    volunteer_id: "v2", // Sophia Lim (Volunteer)
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
    request_id: "r3",
    requester_id: "p3", // Cheryl Wong (PWD)
    volunteer_id: "v4", // Rachel Ng (Volunteer)
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
  },
  {
    request_id: "r4",
    requester_id: "p4", // David Lim (PWD & Volunteer)
    volunteer_id: undefined,
    request_title: "Wheelchair Ramp Assistance",
    request_type: "Transport",
    request_description: "Need help getting down the block via ramp safely.",
    request_location: "Toa Payoh Central",
    request_initial_meet: false,
    request_time: "2025-03-07T08:30:00Z",
    request_approx_duration: "20 minutes",
    request_priority: "High",
    request_status: "open",
    created_at: new Date("2025-03-02T11:00:00Z"),
    updated_at: new Date("2025-03-02T11:00:00Z"),
  },
  {
    request_id: "r5",
    requester_id: "p5", // Evelyn Koh (PWD)
    volunteer_id: "v1", // Jason Tan (Volunteer)
    request_title: "Help Reading Letters",
    request_type: "Companionship",
    request_description: "Need assistance reading some government letters.",
    request_location: "Hougang Ave 9",
    request_initial_meet: true,
    request_time: "2025-03-08T16:00:00Z",
    request_approx_duration: "45 minutes",
    request_priority: "Medium",
    request_status: "ongoing",
    created_at: new Date("2025-03-01T10:15:00Z"),
    updated_at: new Date("2025-03-03T13:00:00Z"),
  },
];


export async function testUpsertRequest(mockRequests: RequestInfo[]): Promise<string> {
  for (const request of mockRequests) {
    await upsertCreatedRequest(request); 
  }
  return "upserted request";
}

testUpsertRequest(mockRequests)
