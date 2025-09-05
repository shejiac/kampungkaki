import { Router, Request as ExpressRequest, Response } from "express";
import prisma from "../pwdPrisma";

const router = Router();

// Hardcoded default user ID
const defaultUserId = "1b4e28ba-2fa1-11d2-883f-0016d3cca427";

// -------------------- Type Helpers --------------------
type RequestBody = {
  title: string;
  type?: string;
  description?: string;
  location?: string;
  initialMeet?: boolean;
  time?: string;
  approxDuration?: string;
  priority?: string;
};

// -------------------- POST /api/requests --------------------
router.post("/", async (req: ExpressRequest<{}, {}, RequestBody>, res: Response) => {
  try {
    const {
      title,
      type,
      description,
      location,
      initialMeet,
      time,
      approxDuration,
      priority,
    } = req.body;

    if (!title) return res.status(400).json({ error: "Title is required" });

    // Create request with hardcoded userId
    const createdRequest = await prisma.request.create({
      data: {
        title,
        type,
        description,
        location,
        initialMeet,
        time,
        approxDuration,
        priority,
        userId: defaultUserId,
        username: "Default User", // optional, just for display
      },
    });

    return res.status(201).json(createdRequest);
  } catch (err: any) {
    console.error("POST error:", err);
    return res.status(500).json({ error: "Failed to create request" });
  }
});

// -------------------- GET /api/requests --------------------
router.get("/", async (req: ExpressRequest, res: Response) => {
  try {
    const q = req.query.q as string | undefined;

    const filters: any = { userId: defaultUserId };
    if (q) {
      filters.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const requests = await prisma.request.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return res.json(requests);
  } catch (err: any) {
    console.error("GET error:", err);
    return res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// -------------------- PUT /api/requests/:id --------------------
router.put("/:id", async (req: ExpressRequest<{ id: string }, {}, RequestBody>, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      type,
      description,
      location,
      initialMeet,
      time,
      approxDuration,
      priority,
    } = req.body;

    if (!title) return res.status(400).json({ error: "Title is required" });

    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.userId !== defaultUserId)
      return res.status(403).json({ error: "Unauthorized" });

    // Update request
    const updatedRequest = await prisma.request.update({
      where: { id },
      data: {
        title,
        type,
        description,
        location,
        initialMeet,
        time,
        approxDuration,
        priority,
      },
    });

    return res.json(updatedRequest);
  } catch (err: any) {
    console.error("PUT error:", err);
    return res.status(500).json({ error: "Failed to update request" });
  }
});

export default router;
