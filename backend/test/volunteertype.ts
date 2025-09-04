import { Volunteer } from "../src/types/user"; 

export const mockVolunteers: Volunteer[] = [
  {
    user_id: "v1",
    user_name: "Jason Tan",
    email: "jason.tan@example.com",
    phone_number: "+6591112233",
    postal_code: "560101",
    home_address: "Blk 101 Ang Mo Kio Ave 3 #07-15",
    volunteer: true,
    via_points: "120",
    created_at: new Date("2025-01-05T09:15:00Z"),
    updated_at: new Date("2025-02-01T11:00:00Z"),
  },
  {
    user_id: "v2",
    user_name: "Sophia Lim",
    email: "sophia.lim@example.com",
    phone_number: "+6598761234",
    postal_code: "650234",
    // no home_address
    volunteer: true,
    via_points: "40",
    created_at: new Date("2025-01-12T14:30:00Z"),
    updated_at: new Date("2025-02-10T16:45:00Z"),
  },
  {
    user_id: "v3",
    user_name: "Daniel Lee",
    email: "daniel.lee@example.com",
    phone_number: "+6581234567",
    // no postal_code
    home_address: "Blk 222 Hougang St 21 #03-18",
    volunteer: true,
    via_points: "75",
    created_at: new Date("2025-01-20T08:00:00Z"),
    updated_at: new Date("2025-02-18T09:20:00Z"),
  },
  {
    user_id: "v4",
    user_name: "Rachel Ng",
    email: "rachel.ng@example.com",
    phone_number: "+6587654321",
    postal_code: "310333",
    home_address: "Blk 333 Toa Payoh Central #11-01",
    volunteer: true,
    via_points: "200", // very active volunteer
    created_at: new Date("2025-01-28T12:00:00Z"),
    updated_at: new Date("2025-02-25T10:10:00Z"),
  },
  {
    user_id: "v5",
    user_name: "Marcus Goh",
    email: "marcus.goh@example.com",
    phone_number: "+6577008899",
    // no postal_code or home_address
    volunteer: true,
    via_points: "0", // new volunteer, no points yet
    created_at: new Date("2025-02-10T15:30:00Z"),
    updated_at: new Date("2025-02-20T18:05:00Z"),
  },
];
