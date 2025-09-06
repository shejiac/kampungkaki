// backend/test/acceptOpenChat.ts
import { acceptRequest } from "../src/helpers/chat/mainChatHelpers";
import logger from '../src/helpers/db/logger';

// Each case now needs only requestId + volunteerId.
// The beneficiary (requester) is resolved by the helper.
const cases = [
  {
    name: "Create chat for grocery request",
    requestId: "00ac4531-e670-46e1-8a78-b8d540cf8317",
    volunteerId: "u2",
  },
  {
    name: "Create chat for TTSH escort request",
    requestId: "1e0186a0-369b-459f-8757-37b453306063",
    volunteerId: "u2",
  },
  {
    name: "Create chat for bedsheets request",
    requestId: "59c33b7b-df33-4ab6-8807-7c5c3a0c0637",
    volunteerId: "u2",
  },
];

export async function testAcceptRequest() {
  for (const c of cases) {
    try {
      const chatId = await acceptRequest(c.requestId, c.volunteerId);
      console.log(`${c.name}: chat_id=${chatId}`);
    } catch (err: any) {
      console.error(`${c.name} failed:`, err?.message ?? err);
    }
  }
  console.log("All acceptRequest cases processed.");
}

(async () => {
  try {
    await testAcceptRequest();
  } catch (e) {
    logger.error(`acceptOpenChat test run error: ${(e as any)?.message ?? e}`);
    process.exit(1);
  }
})();
