// backend/test/systemCreateMessage.ts
import { systemCreateMessage } from "../src/helpers/chat/mainChatHelpers";
import logger from "../src/helpers/db/logger";

const cases = [
  {
    name: "System message for grocery request",
    chatId: "ed6cb83b-b53b-4538-aaa4-8cfa768bef35",
    senderId: "system",
    message: "Volunteer has accepted your grocery request.",
  },
  {
    name: "System message for TTSH escort request",
    chatId: "87e4c50a-3bf4-46b7-9656-2c896005a2fd",
    senderId: "system",
    message: "Your escort request is scheduled for today at 3 PM.",
  },
  {
    name: "System message for bedsheets request",
    chatId: "c7fa1885-cd55-4c04-a3b9-e04c458592e5",
    senderId: "system",
    message: "Bedsheets delivery is on the way.",
  },
];

export async function testSystemCreateMessage() {
  for (const c of cases) {
    try {
      await systemCreateMessage(c.chatId, c.senderId, c.message);
      console.log(`${c.name}: system message created successfully`);
    } catch (err: any) {
      console.error(`${c.name} failed:`, err?.message ?? err);
    }
  }
  console.log("All systemCreateMessage cases processed.");
}

(async () => {
  try {
    await testSystemCreateMessage();
  } catch (e) {
    logger.error(`systemCreateMessage test run error: ${(e as any)?.message ?? e}`);
    process.exit(1);
  }
})();
