import { upsertChat } from '../src/helpers/chat/upsertChat'; 
import { Chat } from '../src/types/chats';

// chat id should match something in the database; might need to change it 

export const mockChats: Chat[] = [
  {
    chat_id: "c1",
    request_id: "r1",       // Grocery Shopping Help
    requester_id: "u1",     // Alice Tan (PWD)
    volunteer_id: "u5",     // Jason Tan (Volunteer)
    created_at: new Date("2025-03-01T09:00:00Z"),
  },
  {
    chat_id: "c2",
    request_id: "r2",       // Doctor’s Appointment Escort
    requester_id: "u2",     // Benjamin Ong (PWD)
    volunteer_id: "u4",     // Sophia Lim
    created_at: new Date("2025-03-02T14:05:00Z"),
  },
  {
    chat_id: "c3",
    request_id: "r3",       // Change Bedsheets
    requester_id: "u3",     // Cheryl Wong
    volunteer_id: "u3",     // Rachel Ng
    created_at: new Date("2025-03-02T15:20:00Z"),
  },
  {
    chat_id: "c4",
    request_id: "r5",       // Help Reading Letters
    requester_id: "u4",     // Evelyn Koh
    volunteer_id: "u2",     // Jason Tan
    created_at: new Date("2025-03-03T17:45:00Z"),
  },
  {
    chat_id: "c5",
    request_id: "r6",       // Pick Up Medicine
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
