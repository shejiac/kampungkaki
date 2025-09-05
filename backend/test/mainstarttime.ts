// backend/test/startTime.ts
import { startTime } from "../src/helpers/chat/mainChatHelpers";
import logger from "../src/helpers/db/logger";

const cases = [
  {
    name: "Start time for grocery request chat",
    chatId: "11111111-1111-1111-1111-111111111111",
  },
  {
    name: "Start time for TTSH escort chat",
    chatId: "11111111-1111-1111-1111-111111111111",
  },
  {
    name: "Start time for bedsheets request chat",
    chatId: "11111111-1111-1111-1111-111111111111",
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
