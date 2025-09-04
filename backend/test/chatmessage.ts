import { ChatMessage } from "../src/types/chats"; 

export const mockChatMessages: ChatMessage[] = [
  // Chat c1: Alice ↔ Jason
  {
    message_id: "m1",
    chat_id: "c1",
    sender_id: "p1", // Alice Tan (PWD)
    message_type: "user",
    body: "Hi Jason, thanks for volunteering to help with groceries!",
    created_at: new Date("2025-03-01T09:05:00Z"),
  },
  {
    message_id: "m2",
    chat_id: "c1",
    sender_id: "v1", // Jason Tan (Volunteer)
    message_type: "user",
    body: "Hi Alice, no problem! What time should I meet you?",
    created_at: new Date("2025-03-01T09:07:00Z"),
  },
  {
    message_id: "m3",
    chat_id: "c1",
    message_type: "system",
    body: "Jason Tan has accepted the request Grocery Shopping Help.",
    created_at: new Date("2025-03-01T09:10:00Z"),
  },

  // Chat c2: Benjamin ↔ Sophia
  {
    message_id: "m4",
    chat_id: "c2",
    sender_id: "p2",
    message_type: "user",
    body: "Could you accompany me to TTSH on Thursday?",
    created_at: new Date("2025-03-02T14:06:00Z"),
  },
  {
    message_id: "m5",
    chat_id: "c2",
    sender_id: "v2",
    message_type: "user",
    body: "Yes, I’ll be free then. What time is your appointment?",
    created_at: new Date("2025-03-02T14:08:00Z"),
  },

  // Chat c3: Cheryl ↔ Rachel
  {
    message_id: "m6",
    chat_id: "c3",
    sender_id: "p3",
    message_type: "user",
    body: "Hi Rachel, can you help me change my bedsheets tomorrow?",
    created_at: new Date("2025-03-02T15:22:00Z"),
  },
  {
    message_id: "m7",
    chat_id: "c3",
    sender_id: "v4",
    message_type: "user",
    body: "Of course! What time works best for you?",
    created_at: new Date("2025-03-02T15:25:00Z"),
  },

  // Chat c5: Cheryl ↔ Daniel
  {
    message_id: "m8",
    chat_id: "c5",
    sender_id: "p3",
    message_type: "user",
    body: "Daniel, could you pick up my prescription this Friday?",
    created_at: new Date("2025-03-04T10:16:00Z"),
  },
  {
    message_id: "m9",
    chat_id: "c5",
    sender_id: "v3",
    message_type: "user",
    body: "Yes, I’ll collect it in the afternoon.",
    created_at: new Date("2025-03-04T10:20:00Z"),
  },
];
