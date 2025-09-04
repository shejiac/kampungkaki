import { Chat } from "../src/types/chats"; // adjust path if needed

export const mockChats: Chat[] = [
  {
    chat_id: "c1",
    request_id: "r1",       // Grocery Shopping Help
    requester_id: "p1",     // Alice Tan (PWD)
    volunteer_id: "v1",     // Jason Tan (Volunteer)
    created_at: new Date("2025-03-01T09:00:00Z"),
  },
  {
    chat_id: "c2",
    request_id: "r2",       // Doctor’s Appointment Escort
    requester_id: "p2",     // Benjamin Ong (PWD)
    volunteer_id: "v2",     // Sophia Lim
    created_at: new Date("2025-03-02T14:05:00Z"),
  },
  {
    chat_id: "c3",
    request_id: "r3",       // Change Bedsheets
    requester_id: "p3",     // Cheryl Wong
    volunteer_id: "v4",     // Rachel Ng
    created_at: new Date("2025-03-02T15:20:00Z"),
  },
  {
    chat_id: "c4",
    request_id: "r5",       // Help Reading Letters
    requester_id: "p5",     // Evelyn Koh
    volunteer_id: "v1",     // Jason Tan
    created_at: new Date("2025-03-03T17:45:00Z"),
  },
  {
    chat_id: "c5",
    request_id: "r6",       // Pick Up Medicine
    requester_id: "p3",     // Cheryl Wong
    volunteer_id: "v3",     // Daniel Lee
    created_at: new Date("2025-03-04T10:15:00Z"),
  },
];
