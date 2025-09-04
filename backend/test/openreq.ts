import { OpenRequestWithNames } from "../src/types/request";

export const mockOpenRequestsWithNames: OpenRequestWithNames[] = [
  {
    request: {
      request_id: "r1",
      requester_id: "p1", // Alice Tan
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
    requester_name: "Alice Tan",
  },
  {
    request: {
      request_id: "r4",
      requester_id: "p4", // David Lim
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
    requester_name: "David Lim",
  },
  {
    request: {
      request_id: "r6",
      requester_id: "p3", // Cheryl Wong
      request_title: "Pick Up Medicine",
      request_type: "Medical",
      request_description: "Need someone to help collect my prescription at the polyclinic.",
      request_location: "Bedok Polyclinic",
      request_initial_meet: true,
      request_time: "2025-03-09T15:00:00Z",
      request_approx_duration: "45 minutes",
      request_priority: "High",
      request_status: "open",
      created_at: new Date("2025-03-03T09:15:00Z"),
      updated_at: new Date("2025-03-03T09:15:00Z"),
    },
    requester_name: "Cheryl Wong",
  },
];
