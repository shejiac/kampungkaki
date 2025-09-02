import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// TODO: integrate Singpass
export const loginUser = async (req, res) => {
  return res.json({ message: "Login with Singpass - placeholder" });
};

export const getProfile = async (req, res) => {
  return res.json({ message: "User profile - placeholder" });
};
