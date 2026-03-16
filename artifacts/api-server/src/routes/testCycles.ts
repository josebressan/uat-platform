import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, testCyclesTable, usersTable, testPlansTable, testScenariosTable, testCasesTable, testExecutionsTable } from "@workspace/db";
import {
  ListTestCyclesQueryParams,
  CreateTestCycleBody,
  GetTestCycleParams,
  GetTestCycleResponse,
  UpdateTestCycleParams,
  UpdateTestCycleBody,
  UpdateTestCycleResponse,
  ListTestCyclesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/test-cycles", async (req, res): Promise<void> => {
  const query = ListTestCyclesQueryParams.safeParse(req.query);
  let q = db
    .select({
      id: testCyclesTable.id,
      releaseId: testCyclesTable.releaseId,
      name: testCyclesTable.name,
      type: testCyclesTable.type,
      status: testCyclesTable.status,
      startDate: testCyclesTable.startDate,
      endDate: testCyclesTable.endDate,
      ownerId: testCyclesTable.ownerId,
      ownerName: usersTable.name,
      createdAt: testCyclesTable.createdAt,
    })
    .from(testCyclesTable)
    .leftJoin(usersTable, eq(testCyclesTable.ownerId, usersTable.id))
    .$dynamic();

  if (query.success && query.data.releaseId) {
    q = q.where(eq(testCyclesTable.releaseId, query.data.releaseId));
  }

  const cycles = await q.orderBy(testCyclesTable.createdAt);
  res.json(ListTestCyclesResponse.parse(cycles));
});

router.post("/test-cycles", async (req, res): Promise<void> => {
  const parsed = CreateTestCycleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [cycle] = await db.insert(testCyclesTable).values(parsed.data).returning();
  res.status(201).json(UpdateTestCycleResponse.parse(cycle));
});

router.get("/test-cycles/:id", async (req, res): Promise<void> => {
  const params = GetTestCycleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [cycle] = await db
    .select({
      id: testCyclesTable.id,
      releaseId: testCyclesTable.releaseId,
      name: testCyclesTable.name,
      type: testCyclesTable.type,
      status: testCyclesTable.status,
      startDate: testCyclesTable.startDate,
      endDate: testCyclesTable.endDate,
      ownerId: testCyclesTable.ownerId,
      ownerName: usersTable.name,
      createdAt: testCyclesTable.createdAt,
    })
    .from(testCyclesTable)
    .leftJoin(usersTable, eq(testCyclesTable.ownerId, usersTable.id))
    .where(eq(testCyclesTable.id, params.data.id));

  if (!cycle) {
    res.status(404).json({ error: "Test cycle not found" });
    return;
  }

  const plans = await db
    .select({
      id: testPlansTable.id,
      testCycleId: testPlansTable.testCycleId,
      name: testPlansTable.name,
      description: testPlansTable.description,
      module: testPlansTable.module,
      status: testPlansTable.status,
      entryCriteria: testPlansTable.entryCriteria,
      exitCriteria: testPlansTable.exitCriteria,
      ownerId: testPlansTable.ownerId,
      ownerName: usersTable.name,
      createdAt: testPlansTable.createdAt,
    })
    .from(testPlansTable)
    .leftJoin(usersTable, eq(testPlansTable.ownerId, usersTable.id))
    .where(eq(testPlansTable.testCycleId, params.data.id));

  const executions = await db
    .select({ result: testExecutionsTable.result, status: testExecutionsTable.status })
    .from(testExecutionsTable)
    .where(eq(testExecutionsTable.testCycleId, params.data.id));

  const totalCases = executions.length;
  const passed = executions.filter(e => e.result === "Passed").length;
  const failed = executions.filter(e => e.result === "Failed").length;
  const blocked = executions.filter(e => e.result === "Blocked").length;
  const inProgress = executions.filter(e => e.status === "In Progress").length;
  const notStarted = executions.filter(e => e.result === "Pending" || e.status === "Not Started").length;

  const stats = {
    totalPlans: plans.length,
    totalCases: totalCases,
    passed,
    failed,
    blocked,
    inProgress,
    notStarted,
    passRate: totalCases > 0 ? Math.round((passed / totalCases) * 100) : 0,
  };

  res.json(GetTestCycleResponse.parse({ ...cycle, testPlans: plans, stats }));
});

router.patch("/test-cycles/:id", async (req, res): Promise<void> => {
  const params = UpdateTestCycleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTestCycleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [cycle] = await db.update(testCyclesTable).set(parsed.data).where(eq(testCyclesTable.id, params.data.id)).returning();
  if (!cycle) {
    res.status(404).json({ error: "Test cycle not found" });
    return;
  }
  res.json(UpdateTestCycleResponse.parse(cycle));
});

export default router;
