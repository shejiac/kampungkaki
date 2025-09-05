// backend/test/systemCreateMessage.ts
import { systemCreateMessage } from "../src/helpers/chat/mainChatHelpers";
import logger from "../src/helpers/db/logger";

const cases = [
  {
    name: "System message for grocery request",
    chatId: "11111111-1111-1111-1111-111111111111",
    senderId: "system",
    message: "Volunteer has accepted your grocery request.",
  },
  {
    name: "System message for TTSH escort request",
    chatId: "11111111-1111-1111-1111-111111111111",
    senderId: "system",
    message: "Your escort request is scheduled for today at 3 PM.",
  },
  {
    name: "System message for bedsheets request",
    chatId: "11111111-1111-1111-1111-111111111111",
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
