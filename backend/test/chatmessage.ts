import { ChatMessage } from "../src/types/chats"; 
import { upsertChatMessage } from '../src/helpers/chat/upsertChatMessage'; 

export const mockChatMessages: ChatMessage[] = [

  {
    message_id: "m1",
    chat_id: "c1",
    sender_id: "u1", // Alice Tan (PWD)
    message_type: "user",
    body: "Hi Jason, thanks for volunteering to help with groceries!",
    created_at: new Date("2025-03-01T09:05:00Z"),
  },
  {
    message_id: "m2",
    chat_id: "c1",
    sender_id: "u2", // Jason Tan (Volunteer)
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
    sender_id: "u3",
    message_type: "user",
    body: "Could you accompany me to TTSH on Thursday?",
    created_at: new Date("2025-03-02T14:06:00Z"),
  },
  {
    message_id: "m5",
    chat_id: "c2",
    sender_id: "u4",
    message_type: "user",
    body: "Yes, I’ll be free then. What time is your appointment?",
    created_at: new Date("2025-03-02T14:08:00Z"),
  },

  // Chat c3: Cheryl ↔ Rachel
  {
    message_id: "m6",
    chat_id: "c3",
    sender_id: "u5",
    message_type: "user",
    body: "Hi Rachel, can you help me change my bedsheets tomorrow?",
    created_at: new Date("2025-03-02T15:22:00Z"),
  },
  {
    message_id: "m7",
    chat_id: "c3",
    sender_id: "u3",
    message_type: "user",
    body: "Of course! What time works best for you?",
    created_at: new Date("2025-03-02T15:25:00Z"),
  },

  // Chat c5: Cheryl ↔ Daniel
  {
    message_id: "m8",
    chat_id: "c5",
    sender_id: "u2",
    message_type: "user",
    body: "Daniel, could you pick up my prescription this Friday?",
    created_at: new Date("2025-03-04T10:16:00Z"),
  },
  {
    message_id: "m9",
    chat_id: "c5",
    sender_id: "u1",
    message_type: "user",
    body: "Yes, I’ll collect it in the afternoon.",
    created_at: new Date("2025-03-04T10:20:00Z"),
  },
];

export async function testUpsertChatMessages(messages: ChatMessage[]): Promise<void> {
  for (const msg of messages) {
    try {
      const result = await upsertChatMessage(msg); // ✅ pass the full message
      console.log(`Upserted chat message ${msg.message_id}:`, result);
    } catch (err) {
      console.error(`Failed to upsert chat message ${msg.message_id}:`, err);
    }
  }
  console.log("All chat messages processed.");
}

// Run it immediately when file is executed
(async () => {
  await testUpsertChatMessages(mockChatMessages);
})();