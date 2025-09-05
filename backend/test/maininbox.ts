// backend/test/listInbox.ts
import { listChatForUser } from "../src/helpers/chat/mainChatHelpers";
import type { ChatListItem } from "../src/types/chats";
import logger from "../src/helpers/db/logger";

const cases = [
  { name: "Inbox for Requester u1", userId: "u1" },
  { name: "Inbox for Volunteer u2", userId: "u2" },
  { name: "Inbox for Mixed user u3", userId: "u3" },
];

function printItems(title: string, items: ChatListItem[]) {
  console.log(`\n=== ${title} ===`);
  if (!items.length) {
    console.log("(no chats)");
    return;
  }
  for (const it of items) {
    console.log(
      [
        `chat_id=${it.chat_id}`,
        `other_party="${it.other_party_user_name}"`,
        `last="${it.last_message ?? ""}"`,
        `at=${it.last_message_time ?? ""}`,
        `by=${it.last_message_sender ?? ""}`,
      ].join(" | ")
    );
  }
}

export async function testListChatForUser() {
  for (const c of cases) {
    try {
      const inbox = await listChatForUser(c.userId);
      printItems(c.name, inbox);
    } catch (err: any) {
      console.error(`${c.name} failed:`, err?.message ?? err);
    }
  }
  console.log("\nAll listChatForUser cases processed.");
}

(async () => {
  try {
    await testListChatForUser();
  } catch (e) {
    logger.error(`listInbox test run error: ${(e as any)?.message ?? e}`);
    process.exit(1);
  }
})();
