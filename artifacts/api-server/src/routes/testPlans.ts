import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, testPlansTable, usersTable, testScenariosTable, testCasesTable, testExecutionsTable } from "@workspace/db";
import {
  ListTestPlansQueryParams,
  CreateTestPlanBody,
  GetTestPlanParams,
  GetTestPlanResponse,
  UpdateTestPlanParams,
  UpdateTestPlanBody,
  UpdateTestPlanResponse,
  ListTestPlansResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/test-plans", async (req, res): Promise<void> => {
  const query = ListTestPlansQueryParams.safeParse(req.query);
  let conditions: (ReturnType<typeof eq>)[] = [];
  if (query.success && query.data.testCycleId) {
    conditions.push(eq(testPlansTable.testCycleId, query.data.testCycleId));
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
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(testPlansTable.createdAt);

  res.json(ListTestPlansResponse.parse(plans));
});

router.post("/test-plans", async (req, res): Promise<void> => {
  const parsed = CreateTestPlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [plan] = await db.insert(testPlansTable).values(parsed.data).returning();
  res.status(201).json(UpdateTestPlanResponse.parse(plan));
});

router.get("/test-plans/:id", async (req, res): Promise<void> => {
  const params = GetTestPlanParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [plan] = await db
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
    .where(eq(testPlansTable.id, params.data.id));

  if (!plan) {
    res.status(404).json({ error: "Test plan not found" });
    return;
  }

  const scenarios = await db
    .select()
    .from(testScenariosTable)
    .where(eq(testScenariosTable.testPlanId, params.data.id));

  const scenarioIds = scenarios.map(s => s.id);
  let totalCases = 0, passed = 0, failed = 0, blocked = 0, notStarted = 0;

  if (scenarioIds.length > 0) {
    const cases = await db
      .select({ lastExecutionStatus: testCasesTable.lastExecutionStatus })
      .from(testCasesTable)
      .where(
        scenarioIds.length === 1
          ? eq(testCasesTable.scenarioId, scenarioIds[0])
          : undefined
      );
    const filtered = scenarioIds.length === 1 ? cases : cases;
    totalCases = filtered.length;
    passed = filtered.filter(c => c.lastExecutionStatus === "Passed").length;
    failed = filtered.filter(c => c.lastExecutionStatus === "Failed").length;
    blocked = filtered.filter(c => c.lastExecutionStatus === "Blocked").length;
    notStarted = filtered.filter(c => !c.lastExecutionStatus || c.lastExecutionStatus === "Pending" || c.lastExecutionStatus === "Not Started").length;
  }

  const stats = {
    totalScenarios: scenarios.length,
    totalCases,
    passed,
    failed,
    blocked,
    notStarted,
    passRate: totalCases > 0 ? Math.round((passed / totalCases) * 100) : 0,
  };

  res.json(GetTestPlanResponse.parse({ ...plan, scenarios, stats }));
});

router.patch("/test-plans/:id", async (req, res): Promise<void> => {
  const params = UpdateTestPlanParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTestPlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [plan] = await db.update(testPlansTable).set(parsed.data).where(eq(testPlansTable.id, params.data.id)).returning();
  if (!plan) {
    res.status(404).json({ error: "Test plan not found" });
    return;
  }
  res.json(UpdateTestPlanResponse.parse(plan));
});

export default router;
