import { AcceptedRequestInfo } from "../src/types/request"; 

export const mockAcceptedRequests: AcceptedRequestInfo[] = [
  {
    request_id: "r1",
    requester_id: "p1",   // Alice Tan (PWD)
    volunteer_id: "v1",   // Jason Tan (Volunteer)
    request_start_time: new Date("2025-03-05T10:00:00Z"),
    // not finished yet
    request_status: "Ongoing",
  },
  {
    request_id: "r2",
    requester_id: "p2",   // Benjamin Ong
    volunteer_id: "v2",   // Sophia Lim
    request_start_time: new Date("2025-03-06T14:00:00Z"),
    request_end_time: new Date("2025-03-06T16:10:00Z"),
    request_total_time: 130, // minutes
    request_status: "Closed",
  },
  {
    request_id: "r3",
    requester_id: "p3",   // Cheryl Wong
    volunteer_id: "v4",   // Rachel Ng
    request_start_time: new Date("2025-03-04T09:00:00Z"),
    request_end_time: new Date("2025-03-04T09:35:00Z"),
    request_total_time: 35, // minutes
    request_status: "Closed",
  },
  {
    request_id: "r4",
    requester_id: "p4",   // David Lim
    volunteer_id: "v3",   // Daniel Lee
    request_start_time: new Date("2025-03-07T08:30:00Z"),
    // ongoing, no end time yet
    request_status: "Ongoing",
  },
  {
    request_id: "r5",
    requester_id: "p5",   // Evelyn Koh
    volunteer_id: "v1",   // Jason Tan
    request_start_time: new Date("2025-03-08T16:00:00Z"),
    request_end_time: new Date("2025-03-08T16:50:00Z"),
    request_total_time: 50, // minutes
    request_status: "Closed",
  },
];
