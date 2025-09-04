import { Pwd } from "../src/types/user"; 

export const mockPwds: Pwd[] = [
  {
    user_id: "p1",
    user_name: "Alice Tan",
    email: "alice.tan@example.com",
    phone_number: "+6591234567",
    postal_code: "560123",
    home_address: "Blk 123 Ang Mo Kio Ave 5 #05-12",
    pwd: true,
    created_at: new Date("2025-01-10T09:30:00Z"),
    updated_at: new Date("2025-02-01T15:20:00Z"),
  },
  {
    user_id: "p2",
    user_name: "Benjamin Ong",
    email: "ben.ong@example.com",
    phone_number: "+6598765432",
    // no postal code (optional)
    home_address: "Blk 456 Bukit Batok St 22 #10-45",
    pwd: true,
    created_at: new Date("2025-01-20T11:15:00Z"),
    updated_at: new Date("2025-02-15T14:50:00Z"),
  },
  {
    user_id: "p3",
    user_name: "Cheryl Wong",
    email: "cheryl.wong@example.com",
    phone_number: "+6581122334",
    postal_code: "470789",
    home_address: "Blk 789 Bedok North Ave 3 #07-22",
    pwd: true,
    created_at: new Date("2025-02-05T14:45:00Z"),
    updated_at: new Date("2025-02-20T10:30:00Z"),
  },
  {
    user_id: "p4",
    user_name: "David Lim",
    email: "david.lim@example.com",
    phone_number: "+6587654321",
    postal_code: "310567",
    home_address: "Blk 321 Toa Payoh Lor 2 #02-34",
    pwd: true,
    created_at: new Date("2025-01-28T12:00:00Z"),
    updated_at: new Date("2025-02-25T09:45:00Z"),
  },
  {
    user_id: "p5",
    user_name: "Evelyn Koh",
    email: "evelyn.koh@example.com",
    phone_number: "+6577889900",
    // no postal_code (optional)
    home_address: "Blk 567 Hougang Ave 9 #03-10",
    pwd: true,
    created_at: new Date("2025-02-15T10:25:00Z"),
    updated_at: new Date("2025-02-28T14:30:00Z"),
  },
];
