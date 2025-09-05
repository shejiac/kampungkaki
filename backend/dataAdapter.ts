import getAllPreviousRequests from "./src/helpers/pwd/getAllPreviousRequests";
import upsertCreatedRequest from "./src/helpers/pwd/upsertCreatedRequest";
import upsertAcceptedRequest from "./src/helpers/pwd/upsertAcceptedRequest";

// reuse your shared Request type
import { Request } from "./pwd/request";

// POST — create a new request
export async function createRequestViaHelpers(input: Omit<Request, "id" | "createdAt" | "updatedAt">): Promise<Request> {
  const created = await upsertCreatedRequest(input);
  return created;
}

// GET — list requests
export async function listRequestsViaHelpers(userId: string, q?: string): Promise<Request[]> {
  const rows = await getAllPreviousRequests({ userId, q });
  return rows;
}

// PUT — accept a request
export async function acceptRequestViaHelpers(id: string, actorUserId: string): Promise<Request> {
  const updated = await upsertAcceptedRequest({ id, actorUserId });
  return updated;
}
