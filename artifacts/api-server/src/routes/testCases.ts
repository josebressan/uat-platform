import { Router, type IRouter } from "express";
import { eq, and, inArray } from "drizzle-orm";
import { db, testCasesTable, testStepsTable, testScenariosTable, testExecutionsTable, usersTable } from "@workspace/db";
import {
  ListTestCasesQueryParams,
  CreateTestCaseBody,
  GetTestCaseParams,
  GetTestCaseResponse,
  UpdateTestCaseParams,
  UpdateTestCaseBody,
  UpdateTestCaseResponse,
  ListTestCasesResponse,
  CreateTestScenarioBody,
  GetTestScenarioParams,
  GetTestScenarioResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/test-scenarios", async (req, res): Promise<void> => {
  const parsed = CreateTestScenarioBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [scenario] = await db.insert(testScenariosTable).values(parsed.data).returning();
  res.status(201).json(scenario);
});

router.get("/test-scenarios/:id", async (req, res): Promise<void> => {
  const params = GetTestScenarioParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [scenario] = await db.select().from(testScenariosTable).where(eq(testScenariosTable.id, params.data.id));
  if (!scenario) {
    res.status(404).json({ error: "Scenario not found" });
    return;
  }
  const testCases = await db
    .select({
      id: testCasesTable.id,
      scenarioId: testCasesTable.scenarioId,
      title: testCasesTable.title,
      description: testCasesTable.description,
      preconditions: testCasesTable.preconditions,
      priority: testCasesTable.priority,
      complexity: testCasesTable.complexity,
      status: testCasesTable.status,
      assigneeId: testCasesTable.assigneeId,
      assigneeName: usersTable.name,
      estimatedMinutes: testCasesTable.estimatedMinutes,
      lastExecutionStatus: testCasesTable.lastExecutionStatus,
      createdAt: testCasesTable.createdAt,
    })
    .from(testCasesTable)
    .leftJoin(usersTable, eq(testCasesTable.assigneeId, usersTable.id))
    .where(eq(testCasesTable.scenarioId, params.data.id));
  res.json(GetTestScenarioResponse.parse({ ...scenario, testCases }));
});

router.get("/test-cases", async (req, res): Promise<void> => {
  const query = ListTestCasesQueryParams.safeParse(req.query);
  let conditions: (ReturnType<typeof eq>)[] = [];

  if (query.success) {
    if (query.data.scenarioId) {
      conditions.push(eq(testCasesTable.scenarioId, query.data.scenarioId));
    }
    if (query.data.status) {
      conditions.push(eq(testCasesTable.status, query.data.status));
    }
    if (query.data.priority) {
      conditions.push(eq(testCasesTable.priority, query.data.priority));
    }
    if (query.data.assigneeId) {
      conditions.push(eq(testCasesTable.assigneeId, query.data.assigneeId));
    }
    if (query.data.testPlanId) {
      const scenarios = await db.select({ id: testScenariosTable.id }).from(testScenariosTable).where(eq(testScenariosTable.testPlanId, query.data.testPlanId));
      const ids = scenarios.map(s => s.id);
      if (ids.length > 0) {
        conditions.push(inArray(testCasesTable.scenarioId, ids));
      } else {
        res.json([]);
        return;
      }
    }
  }

  const cases = await db
    .select({
      id: testCasesTable.id,
      scenarioId: testCasesTable.scenarioId,
      title: testCasesTable.title,
      description: testCasesTable.description,
      preconditions: testCasesTable.preconditions,
      priority: testCasesTable.priority,
      complexity: testCasesTable.complexity,
      status: testCasesTable.status,
      assigneeId: testCasesTable.assigneeId,
      assigneeName: usersTable.name,
      estimatedMinutes: testCasesTable.estimatedMinutes,
      lastExecutionStatus: testCasesTable.lastExecutionStatus,
      createdAt: testCasesTable.createdAt,
    })
    .from(testCasesTable)
    .leftJoin(usersTable, eq(testCasesTable.assigneeId, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(testCasesTable.createdAt);

  res.json(ListTestCasesResponse.parse(cases));
});

router.post("/test-cases", async (req, res): Promise<void> => {
  const parsed = CreateTestCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { steps, ...caseData } = parsed.data;
  const [testCase] = await db.insert(testCasesTable).values(caseData).returning();

  if (steps && steps.length > 0) {
    await db.insert(testStepsTable).values(
      steps.map((s) => ({ ...s, testCaseId: testCase.id }))
    );
  }

  res.status(201).json(UpdateTestCaseResponse.parse(testCase));
});

router.get("/test-cases/:id", async (req, res): Promise<void> => {
  const params = GetTestCaseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [testCase] = await db
    .select({
      id: testCasesTable.id,
      scenarioId: testCasesTable.scenarioId,
      title: testCasesTable.title,
      description: testCasesTable.description,
      preconditions: testCasesTable.preconditions,
      postconditions: testCasesTable.postconditions,
      priority: testCasesTable.priority,
      complexity: testCasesTable.complexity,
      status: testCasesTable.status,
      assigneeId: testCasesTable.assigneeId,
      assigneeName: usersTable.name,
      estimatedMinutes: testCasesTable.estimatedMinutes,
      lastExecutionStatus: testCasesTable.lastExecutionStatus,
      createdAt: testCasesTable.createdAt,
    })
    .from(testCasesTable)
    .leftJoin(usersTable, eq(testCasesTable.assigneeId, usersTable.id))
    .where(eq(testCasesTable.id, params.data.id));

  if (!testCase) {
    res.status(404).json({ error: "Test case not found" });
    return;
  }

  const steps = await db.select().from(testStepsTable).where(eq(testStepsTable.testCaseId, params.data.id)).orderBy(testStepsTable.stepNumber);

  const executions = await db
    .select({
      id: testExecutionsTable.id,
      testCaseId: testExecutionsTable.testCaseId,
      testCycleId: testExecutionsTable.testCycleId,
      executorId: testExecutionsTable.executorId,
      executorName: usersTable.name,
      status: testExecutionsTable.status,
      result: testExecutionsTable.result,
      notes: testExecutionsTable.notes,
      executedAt: testExecutionsTable.executedAt,
      createdAt: testExecutionsTable.createdAt,
    })
    .from(testExecutionsTable)
    .leftJoin(usersTable, eq(testExecutionsTable.executorId, usersTable.id))
    .where(eq(testExecutionsTable.testCaseId, params.data.id))
    .orderBy(testExecutionsTable.createdAt);

  res.json(GetTestCaseResponse.parse({ ...testCase, steps, executions }));
});

router.patch("/test-cases/:id", async (req, res): Promise<void> => {
  const params = UpdateTestCaseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTestCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [testCase] = await db.update(testCasesTable).set(parsed.data).where(eq(testCasesTable.id, params.data.id)).returning();
  if (!testCase) {
    res.status(404).json({ error: "Test case not found" });
    return;
  }
  res.json(UpdateTestCaseResponse.parse(testCase));
});

export default router;
