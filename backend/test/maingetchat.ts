// backend/test/getChat.ts
import { getChat } from "../src/helpers/chat/mainChatHelpers";
import logger from "../src/helpers/db/logger";

const cases = [
  {
    name: "Chat for grocery request",
    chatId: "3dbd33a3-7da5-4a16-a72a-71cdc391b45e",
  },
  {
    name: "Chat for TTSH escort request",
    chatId: "5f143dfb-a8d1-4f0b-aa00-33c251b18e50",
  },
  {
    name: "Chat for bedsheets request",
    chatId: "aa0844aa-99e7-41ff-a64f-96abcdb6464f",
  },
];

export async function testGetChat() {
  for (const c of cases) {
    try {
      const { chat_details, request_details, chat_messages } = await getChat(c.chatId);
      console.log(`\n=== ${c.name} ===`);
      console.log("chat_details:", chat_details);
      console.log("request_details:", request_details);
      console.log("chat_messages:", chat_messages);
    } catch (err: any) {
      console.error(`${c.name} failed:`, err?.message ?? err);
    }
  }
  console.log("\nAll getChat cases processed.");
}

(async () => {
  try {
    await testGetChat();
  } catch (e) {
    logger.error(`getChat test run error: ${(e as any)?.message ?? e}`);
    process.exit(1);
  }
})();
