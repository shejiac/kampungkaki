// backend/test/endTime.ts
import { endTime } from "../src/helpers/chat/mainChatHelpers";
import logger from "../src/helpers/db/logger";

const cases = [
  {
    name: "End time for grocery request chat",
    chatId: "84e185fb-55b5-47b9-b123-1234567890ab",
  },
  {
    name: "End time for TTSH escort chat",
    chatId: "12ab34cd-56ef-78gh-90ij-0987654321zx",
  },
  {
    name: "End time for bedsheets request chat",
    chatId: "ab98cd76-54ef-32gh-10ij-abcdefabcdef",
  },
];

export async function testEndTime() {
  for (const c of cases) {
    try {
      await endTime(c.chatId);
      console.log(`${c.name}: request timer ended successfully`);
    } catch (err: any) {
      console.error(`${c.name} failed:`, err?.message ?? err);
    }
  }
  console.log("All endTime cases processed.");
}

(async () => {
  try {
    await testEndTime();
  } catch (e) {
    logger.error(`endTime test run error: ${(e as any)?.message ?? e}`);
    process.exit(1);
  }
})();
