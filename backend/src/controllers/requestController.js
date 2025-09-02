import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// create/draft/post request
export const createRequest = async (req, res) => {
  const { title, description, userId } = req.body;
  const r = await prisma.request.create({
    data: { title, description, createdBy: Number(userId) }
  });
  return res.json(r);
};

// view all + optional filtering (?status=OPEN&role=PWD etc)
export const viewRequests = async (req, res) => {
  const { status } = req.query;
  const where = {};
  if (status) where.status = status.toUpperCase();
  const list = await prisma.request.findMany({
    where,
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });
  return res.json(list);
};

// accept request
export const acceptRequest = async (req, res) => {
  const id = Number(req.params.id);
  const updated = await prisma.request.update({
    where: { id },
    data: { status: "ACCEPTED" }
  });
  return res.json(updated);
};
