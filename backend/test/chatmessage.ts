import { ChatMessage } from "../src/types/chats"; 
import { upsertChatMessage } from '../src/helpers/chat/upsertChatMessage'; 

export const mockChatMessages: ChatMessage[] = [

  {
    chat_id: "6018722c-be5a-46a2-a64b-0625986c7caa",
    sender_id: "1b4e28ba-2fa1-11d2-883f-0016d3cca427", 
    message_type: "user",
    body: "Hi Jason, thanks for volunteering to help with groceries!",
    created_at: new Date("2025-03-01T09:05:00Z"),
  },
  {
    chat_id: "2377b116-f2e0-44cc-b866-3ea0c182b277",
    sender_id: "u5", 
    message_type: "user",
    body: "Hi Alice, no problem! What time should I meet you?",
    created_at: new Date("2025-03-01T09:07:00Z"),
  },
  {
    chat_id: "30772e1a-9049-452b-9b10-bafe8f0448ef",
    sender_id: "u3",
    message_type: "system",
    body: "Jason Tan has accepted the request Grocery Shopping Help.",
    created_at: new Date("2025-03-01T09:10:00Z"),
  },

  {
    chat_id: "7c8cdb94-0f80-41be-9629-5515afa466e2",
    sender_id: "u4",
    message_type: "user",
    body: "Could you accompany me to TTSH on Thursday?",
    created_at: new Date("2025-03-02T14:06:00Z"),
  },
  {
    chat_id: "4fcb36bf-e3da-46c0-8d72-59e3c093a4ff",
    sender_id: "u2",
    message_type: "user",
    body: "Yes, I’ll be free then. What time is your appointment?",
    created_at: new Date("2025-03-02T14:08:00Z"),
  },

  {
    chat_id: "2377b116-f2e0-44cc-b866-3ea0c182b277",
    sender_id: "u5",
    message_type: "user",
    body: "Hi Rachel, can you help me change my bedsheets tomorrow?",
    created_at: new Date("2025-03-02T15:22:00Z"),
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