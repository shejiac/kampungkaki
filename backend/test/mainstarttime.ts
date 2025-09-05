// backend/test/startTime.ts
import { startTime } from "../src/helpers/chat/mainChatHelpers";
import logger from "../src/helpers/db/logger";

const cases = [
  {
    name: "Start time for grocery request chat",
    chatId: "84e185fb-55b5-47b9-b123-1234567890ab",
  },
  {
    name: "Start time for TTSH escort chat",
    chatId: "12ab34cd-56ef-78gh-90ij-0987654321zx",
  },
  {
    name: "Start time for bedsheets request chat",
    chatId: "ab98cd76-54ef-32gh-10ij-abcdefabcdef",
  },
];

export async function testStartTime() {
  for (const c of cases) {
    try {
      await startTime(c.chatId);
      console.log(`${c.name}: request timer started successfully`);
    } catch (err: any) {
      console.error(`${c.name} failed:`, err?.message ?? err);
    }
  }
  console.log("All startTime cases processed.");
}

(async () => {
  try {
    await testStartTime();
  } catch (e) {
    logger.error(`startTime test run error: ${(e as any)?.message ?? e}`);
    process.exit(1);
  }
})();
