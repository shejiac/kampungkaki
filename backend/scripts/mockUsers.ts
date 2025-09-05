// run with: npx ts-node backend/scripts/mockUsers.ts

import { User } from '../src/types/user';
import { upsertUser } from '../src/helpers/profile/upsertUsers'

export const mockUsers: User[] = [
  {
    user_id: "u1",
    user_name: "Alice Tan",
    phone_number: "+6591234567",
    home_address: "Blk 123 Ang Mo Kio Ave 5 #05-12",
    pwd: true,                // person with disability
    volunteer: false,         // not volunteer
    via_hours: "0",
    created_at: new Date("2025-01-10T09:30:00Z"),
    updated_at: new Date("2025-02-01T15:20:00Z"),
  },
  {
    user_id: "u2",
    user_name: "Brian Lee",
    phone_number: "+6598765432",
    home_address: "Blk 456 Bukit Batok St 22 #10-45",
    pwd: false,                // not pwd
    volunteer: true,           // volunteer only
    via_hours: "15",
    created_at: new Date("2025-01-20T11:15:00Z"),
    updated_at: new Date("2025-02-18T08:00:00Z"),
  },
  {
    user_id: "u3",
    user_name: "Cheryl Wong",
    phone_number: "+6581122334",
    pwd: true,                       // both volunteer and pwd
    volunteer: true,
    via_hours: "50",
    created_at: new Date("2025-02-05T14:45:00Z"),
    updated_at: new Date("2025-02-15T17:10:00Z"),
  }]

export async function UpsertUsers(users: User[]): Promise<void> {
    for (const u of users) {
      try {
        const result = await upsertUser(u); 
        console.log(`Upserted user ${u.user_id}:', result`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Failed to upsert user ${u.user_id}: ${msg}`);
      }
    }
    console.log("All users processed.");
    return 
  }
  
  (async () => {
    await UpsertUsers(mockUsers);
  })();