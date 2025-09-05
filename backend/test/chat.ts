import { upsertChat } from '../src/helpers/chat/upsertChat'; 
import { Chat } from '../src/types/chats';

// chat id should match something in the database; might need to change it 

export const mockChats: Chat[] = [
  {
    request_id: "76002553-ed79-4068-aeb0-5d62e6a07022",       
    requester_id: "u1",     // Alice Tan (PWD)
    volunteer_id: "u5",     // Jason Tan (Volunteer)
    created_at: new Date("2025-03-01T09:00:00Z"),
  },
  {
    request_id: "1e0186a0-369b-459f-8757-37b453306063",       
    requester_id: "u2",     // Benjamin Ong (PWD)
    volunteer_id: "u4",     // Sophia Lim
    created_at: new Date("2025-03-02T14:05:00Z"),
  },
  {
    request_id: "00ac4531-e670-46e1-8a78-b8d540cf8317",       // Change Bedsheets
    requester_id: "u3",     // Cheryl Wong
    volunteer_id: "u2",     // Rachel Ng
    created_at: new Date("2025-03-02T15:20:00Z"),
  },
  {
    request_id: "59c33b7b-df33-4ab6-8807-7c5c3a0c0637",       
    requester_id: "u4",     // Evelyn Koh
    volunteer_id: "u3",     // Jason Tan
    created_at: new Date("2025-03-03T17:45:00Z"),
  },
  {
    request_id: "763806bd-3515-4f9e-8f1a-4e15b8110b61",       
    requester_id: "u5",     // Cheryl Wong
    volunteer_id: "u1",     // Daniel Lee
    created_at: new Date("2025-03-04T10:15:00Z"),
  },
];

export async function testUpsertChat(chats: Chat[]): Promise<void> {
  for (const chat of chats) {
    try {
      const result = await upsertChat(chat); 
      console.log(`Upserted chat ${chat.chat_id}:`, result);
    } catch (err) {
      console.error(`Failed to upsert chat ${chat.chat_id}:`, err);
    }
  }
  console.log("All chats processed.");
}

// Run it immediately when file is executed
(async () => {
  await testUpsertChat(mockChats);
})();
