import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, defectsTable, defectCommentsTable, usersTable } from "@workspace/db";
import {
  ListDefectsQueryParams,
  CreateDefectBody,
  GetDefectParams,
  GetDefectResponse,
  UpdateDefectParams,
  UpdateDefectBody,
  UpdateDefectResponse,
  ListDefectsResponse,
  ListDefectCommentsParams,
  CreateDefectCommentParams,
  CreateDefectCommentBody,
  ListDefectCommentsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/defects", async (req, res): Promise<void> => {
  const query = ListDefectsQueryParams.safeParse(req.query);
  let conditions: (ReturnType<typeof eq>)[] = [];

  if (query.success) {
    if (query.data.testExecutionId) conditions.push(eq(defectsTable.testExecutionId, query.data.testExecutionId));
    if (query.data.severity) conditions.push(eq(defectsTable.severity, query.data.severity));
    if (query.data.status) conditions.push(eq(defectsTable.status, query.data.status));
    if (query.data.assigneeId) conditions.push(eq(defectsTable.assigneeId, query.data.assigneeId));
  }

  const defects = await db
    .select({
      id: defectsTable.id,
      title: defectsTable.title,
      description: defectsTable.description,
      severity: defectsTable.severity,
      priority: defectsTable.priority,
      status: defectsTable.status,
      rootCause: defectsTable.rootCause,
      testExecutionId: defectsTable.testExecutionId,
      assigneeId: defectsTable.assigneeId,
      assigneeName: usersTable.name,
      reporterId: defectsTable.reporterId,
      createdAt: defectsTable.createdAt,
      updatedAt: defectsTable.updatedAt,
    })
    .from(defectsTable)
    .leftJoin(usersTable, eq(defectsTable.assigneeId, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(defectsTable.createdAt);

  res.json(ListDefectsResponse.parse(defects));
});

router.post("/defects", async (req, res): Promise<void> => {
  const parsed = CreateDefectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [defect] = await db.insert(defectsTable).values(parsed.data).returning();
  res.status(201).json(UpdateDefectResponse.parse(defect));
});

router.get("/defects/:id", async (req, res): Promise<void> => {
  const params = GetDefectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [defect] = await db
    .select({
      id: defectsTable.id,
      title: defectsTable.title,
      description: defectsTable.description,
      severity: defectsTable.severity,
      priority: defectsTable.priority,
      status: defectsTable.status,
      rootCause: defectsTable.rootCause,
      testExecutionId: defectsTable.testExecutionId,
      assigneeId: defectsTable.assigneeId,
      assigneeName: usersTable.name,
      reporterId: defectsTable.reporterId,
      createdAt: defectsTable.createdAt,
      updatedAt: defectsTable.updatedAt,
    })
    .from(defectsTable)
    .leftJoin(usersTable, eq(defectsTable.assigneeId, usersTable.id))
    .where(eq(defectsTable.id, params.data.id));

  if (!defect) {
    res.status(404).json({ error: "Defect not found" });
    return;
  }

  const comments = await db
    .select({
      id: defectCommentsTable.id,
      defectId: defectCommentsTable.defectId,
      authorId: defectCommentsTable.authorId,
      authorName: usersTable.name,
      content: defectCommentsTable.content,
      createdAt: defectCommentsTable.createdAt,
    })
    .from(defectCommentsTable)
    .leftJoin(usersTable, eq(defectCommentsTable.authorId, usersTable.id))
    .where(eq(defectCommentsTable.defectId, params.data.id))
    .orderBy(defectCommentsTable.createdAt);

  res.json(GetDefectResponse.parse({ ...defect, comments }));
});

router.patch("/defects/:id", async (req, res): Promise<void> => {
  const params = UpdateDefectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateDefectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [defect] = await db.update(defectsTable).set(parsed.data).where(eq(defectsTable.id, params.data.id)).returning();
  if (!defect) {
    res.status(404).json({ error: "Defect not found" });
    return;
  }
  res.json(UpdateDefectResponse.parse(defect));
});

router.get("/defects/:id/comments", async (req, res): Promise<void> => {
  const params = ListDefectCommentsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const comments = await db
    .select({
      id: defectCommentsTable.id,
      defectId: defectCommentsTable.defectId,
      authorId: defectCommentsTable.authorId,
      authorName: usersTable.name,
      content: defectCommentsTable.content,
      createdAt: defectCommentsTable.createdAt,
    })
    .from(defectCommentsTable)
    .leftJoin(usersTable, eq(defectCommentsTable.authorId, usersTable.id))
    .where(eq(defectCommentsTable.defectId, params.data.id))
    .orderBy(defectCommentsTable.createdAt);
  res.json(ListDefectCommentsResponse.parse(comments));
});

router.post("/defects/:id/comments", async (req, res): Promise<void> => {
  const params = CreateDefectCommentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateDefectCommentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [comment] = await db.insert(defectCommentsTable).values({ ...parsed.data, defectId: params.data.id }).returning();
  res.status(201).json(comment);
});

export default router;
