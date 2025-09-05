import { Volunteer } from "../src/types/user"; 

export const mockVolunteers: Volunteer[] = [
  {
    user_id: "v1",
    user_name: "Jason Tan",
    phone_number: "+6591112233",
    home_address: "Blk 101 Ang Mo Kio Ave 3 #07-15",
    volunteer: true,
    via_hours: "120",
    created_at: new Date("2025-01-05T09:15:00Z"),
    updated_at: new Date("2025-02-01T11:00:00Z"),
  },
  {
    user_id: "v2",
    user_name: "Sophia Lim",
    phone_number: "+6598761234",
    // no home_address
    volunteer: true,
    via_hours: "40",
    created_at: new Date("2025-01-12T14:30:00Z"),
    updated_at: new Date("2025-02-10T16:45:00Z"),
  },
  {
    user_id: "v4",
    user_name: "Rachel Ng",
    phone_number: "+6587654321",
    home_address: "Blk 333 Toa Payoh Central #11-01",
    volunteer: true,
    via_hours: "200", // very active volunteer
    created_at: new Date("2025-01-28T12:00:00Z"),
    updated_at: new Date("2025-02-25T10:10:00Z"),
  },
];
