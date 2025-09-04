
import { User } from '../src/types/user';
import { upsertUser } from '../src/helpers/profile/upsertUsers'

export const mockUsers: User[] = [
  {
    user_id: "u1",
    user_name: "Alice Tan",
    phone_number: "+6591234567",
    home_address: "Blk 123 Ang Mo Kio Ave 5 #05-12",
    pwd: true,                // person with disability
    volunteer: false,
    via_hours: "0",
    created_at: new Date("2025-01-10T09:30:00Z"),
    updated_at: new Date("2025-02-01T15:20:00Z"),
  },
  {
    user_id: "u2",
    user_name: "Brian Lee",
    phone_number: "+6598765432",
    home_address: "Blk 456 Bukit Batok St 22 #10-45",
    pwd: false,
    volunteer: true,           // volunteer only
    via_hours: "15",
    created_at: new Date("2025-01-20T11:15:00Z"),
    updated_at: new Date("2025-02-18T08:00:00Z"),
  },
  {
    user_id: "u3",
    user_name: "Cheryl Wong",
    phone_number: "+6581122334",
    // no home_address provided (optional field)
    pwd: false,
    volunteer: true,
    via_hours: "50",
    created_at: new Date("2025-02-05T14:45:00Z"),
    updated_at: new Date("2025-02-15T17:10:00Z"),
  },
  {
    user_id: "u4",
    user_name: "David Lim",
    phone_number: "+6587654321",
    pwd: true,
    volunteer: true,            // dual role: PWD + volunteer
    via_hours: "100",
    created_at: new Date("2025-02-01T12:00:00Z"),
    updated_at: new Date("2025-02-25T09:45:00Z"),
  },
  {
    user_id: "u5",
    user_name: "Evelyn Koh",
    phone_number: "+6577889900",
    home_address: "Blk 567 Toa Payoh Lor 2 #02-34",
    pwd: false,
    volunteer: false,           // neither PWD nor volunteer (edge case)
    via_hours: "0",
    created_at: new Date("2025-02-15T10:25:00Z"),
    updated_at: new Date("2025-02-28T14:30:00Z"),
  },
];

export async function testUpsertUsers(users: User[]): Promise<void> {
    for (const u of users) {
      try {
        const result = await upsertUser(u); // assuming it upserts ONE user
        console.log('Upserted user ${u.user_id}:', result);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Failed to upsert user ${u.user_id}: ${msg}');
      }
    }
    console.log("🎉 All users processed.");
  }
  
  // Run immediately when file executes
  (async () => {
    await testUpsertUsers(mockUsers);
  })();