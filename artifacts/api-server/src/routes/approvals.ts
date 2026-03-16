import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, approvalsTable, usersTable, releasesTable } from "@workspace/db";
import {
  ListApprovalsQueryParams,
  CreateApprovalBody,
  GetApprovalParams,
  GetApprovalResponse,
  UpdateApprovalParams,
  UpdateApprovalBody,
  UpdateApprovalResponse,
  ListApprovalsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/approvals", async (req, res): Promise<void> => {
  const query = ListApprovalsQueryParams.safeParse(req.query);
  let conditions: (ReturnType<typeof eq>)[] = [];

  if (query.success) {
    if (query.data.releaseId) conditions.push(eq(approvalsTable.releaseId, query.data.releaseId));
    if (query.data.status) conditions.push(eq(approvalsTable.status, query.data.status));
  }

  const approvals = await db
    .select({
      id: approvalsTable.id,
      releaseId: approvalsTable.releaseId,
      module: approvalsTable.module,
      type: approvalsTable.type,
      status: approvalsTable.status,
      approverId: approvalsTable.approverId,
      approverName: usersTable.name,
      comments: approvalsTable.comments,
      conditions: approvalsTable.conditions,
      decidedAt: approvalsTable.decidedAt,
      createdAt: approvalsTable.createdAt,
    })
    .from(approvalsTable)
    .leftJoin(usersTable, eq(approvalsTable.approverId, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(approvalsTable.createdAt);

  res.json(ListApprovalsResponse.parse(approvals));
});

router.post("/approvals", async (req, res): Promise<void> => {
  const parsed = CreateApprovalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [approval] = await db.insert(approvalsTable).values(parsed.data).returning();
  res.status(201).json(UpdateApprovalResponse.parse(approval));
});

router.get("/approvals/:id", async (req, res): Promise<void> => {
  const params = GetApprovalParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [approval] = await db
    .select({
      id: approvalsTable.id,
      releaseId: approvalsTable.releaseId,
      releaseName: releasesTable.name,
      module: approvalsTable.module,
      type: approvalsTable.type,
      status: approvalsTable.status,
      approverId: approvalsTable.approverId,
      approverName: usersTable.name,
      comments: approvalsTable.comments,
      conditions: approvalsTable.conditions,
      decidedAt: approvalsTable.decidedAt,
      createdAt: approvalsTable.createdAt,
    })
    .from(approvalsTable)
    .leftJoin(usersTable, eq(approvalsTable.approverId, usersTable.id))
    .leftJoin(releasesTable, eq(approvalsTable.releaseId, releasesTable.id))
    .where(eq(approvalsTable.id, params.data.id));

  if (!approval) {
    res.status(404).json({ error: "Approval not found" });
    return;
  }

  res.json(GetApprovalResponse.parse(approval));
});

router.patch("/approvals/:id", async (req, res): Promise<void> => {
  const params = UpdateApprovalParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateApprovalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const shouldSetDecidedAt = parsed.data.status === "Approved" || parsed.data.status === "Rejected" || parsed.data.status === "Conditionally Approved";
  const updateData = shouldSetDecidedAt
    ? { ...parsed.data, decidedAt: new Date() }
    : parsed.data;

  const [approval] = await db.update(approvalsTable).set(updateData).where(eq(approvalsTable.id, params.data.id)).returning();
  if (!approval) {
    res.status(404).json({ error: "Approval not found" });
    return;
  }
  res.json(UpdateApprovalResponse.parse(approval));
});

export default router;
