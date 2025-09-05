// backend/test/userCreateMessage.ts
import { userCreateMessage } from "../src/helpers/chat/mainChatHelpers";
import logger from "../src/helpers/db/logger";

const cases = [
  {
    name: "Send grocery chat message",
    chatId: "a2762758-c436-43f1-b2d3-506e140b9a32",
    senderId: "u1",
    message: "Hi, just checking if you're still available to help?",
  },
  {
    name: "Send TTSH escort chat message",
    chatId: "4fcb36bf-e3da-46c0-8d72-59e3c093a4ff",
    senderId: "u2",
    message: "Yes, I can escort you to TTSH at 3 PM.",
  },
  {
    name: "Send bedsheets request chat message",
    chatId: "96efc31e-a006-45bf-b5ad-cb3dbf06277d",
    senderId: "u3",
    message: "Thanks a lot for helping with the bedsheets!",
  },
];

export async function testUserCreateMessage() {
  for (const c of cases) {
    try {
      await userCreateMessage(c.chatId, c.senderId, c.message);
      console.log(`${c.name}: message created successfully`);
    } catch (err: any) {
      console.error(`${c.name} failed:`, err?.message ?? err);
    }
  }
  console.log("All userCreateMessage cases processed.");
}

(async () => {
  try {
    await testUserCreateMessage();
  } catch (e) {
    logger.error(`userCreateMessage test run error: ${(e as any)?.message ?? e}`);
    process.exit(1);
  }
})();
