import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, testExecutionsTable, testExecutionStepsTable, testCasesTable, testStepsTable, testCyclesTable, usersTable, defectsTable } from "@workspace/db";
import {
  ListTestExecutionsQueryParams,
  CreateTestExecutionBody,
  GetTestExecutionParams,
  GetTestExecutionResponse,
  UpdateTestExecutionParams,
  UpdateTestExecutionBody,
  UpdateTestExecutionResponse,
  ListTestExecutionsResponse,
  UpdateTestExecutionStepParams,
  UpdateTestExecutionStepBody,
  UpdateTestExecutionStepResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/test-executions", async (req, res): Promise<void> => {
  const query = ListTestExecutionsQueryParams.safeParse(req.query);
  let conditions: (ReturnType<typeof eq>)[] = [];

  if (query.success) {
    if (query.data.testCaseId) conditions.push(eq(testExecutionsTable.testCaseId, query.data.testCaseId));
    if (query.data.testCycleId) conditions.push(eq(testExecutionsTable.testCycleId, query.data.testCycleId));
    if (query.data.executorId) conditions.push(eq(testExecutionsTable.executorId, query.data.executorId));
    if (query.data.status) conditions.push(eq(testExecutionsTable.status, query.data.status));
  }

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
      testCaseTitle: testCasesTable.title,
    })
    .from(testExecutionsTable)
    .leftJoin(usersTable, eq(testExecutionsTable.executorId, usersTable.id))
    .leftJoin(testCasesTable, eq(testExecutionsTable.testCaseId, testCasesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(testExecutionsTable.createdAt);

  res.json(ListTestExecutionsResponse.parse(executions));
});

router.post("/test-executions", async (req, res): Promise<void> => {
  const parsed = CreateTestExecutionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [execution] = await db.insert(testExecutionsTable).values(parsed.data).returning();

  const steps = await db.select().from(testStepsTable).where(eq(testStepsTable.testCaseId, parsed.data.testCaseId)).orderBy(testStepsTable.stepNumber);

  if (steps.length > 0) {
    await db.insert(testExecutionStepsTable).values(
      steps.map(s => ({
        executionId: execution.id,
        testStepId: s.id,
        stepNumber: s.stepNumber,
        action: s.action,
        expectedResult: s.expectedResult,
        actualResult: "",
        status: "Not Executed",
        notes: "",
      }))
    );
  }

  res.status(201).json(UpdateTestExecutionResponse.parse(execution));
});

router.get("/test-executions/:id", async (req, res): Promise<void> => {
  const params = GetTestExecutionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [execution] = await db
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
      testCaseTitle: testCasesTable.title,
    })
    .from(testExecutionsTable)
    .leftJoin(usersTable, eq(testExecutionsTable.executorId, usersTable.id))
    .leftJoin(testCasesTable, eq(testExecutionsTable.testCaseId, testCasesTable.id))
    .where(eq(testExecutionsTable.id, params.data.id));

  if (!execution) {
    res.status(404).json({ error: "Test execution not found" });
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
    .where(eq(testCasesTable.id, execution.testCaseId));

  const caseSteps = await db.select().from(testStepsTable).where(eq(testStepsTable.testCaseId, execution.testCaseId)).orderBy(testStepsTable.stepNumber);
  const execSteps = await db.select().from(testExecutionStepsTable).where(eq(testExecutionStepsTable.executionId, params.data.id)).orderBy(testExecutionStepsTable.stepNumber);

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
      reporterId: defectsTable.reporterId,
      createdAt: defectsTable.createdAt,
      updatedAt: defectsTable.updatedAt,
    })
    .from(defectsTable)
    .where(eq(defectsTable.testExecutionId, params.data.id));

  res.json(GetTestExecutionResponse.parse({
    ...execution,
    testCase: { ...testCase, steps: caseSteps, executions: [] },
    steps: execSteps,
    defects,
  }));
});

router.patch("/test-executions/:id", async (req, res): Promise<void> => {
  const params = UpdateTestExecutionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTestExecutionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const shouldSetTimestamp = parsed.data.result && (parsed.data.result === "Passed" || parsed.data.result === "Failed" || parsed.data.result === "Blocked");
  const updateData = shouldSetTimestamp
    ? { ...parsed.data, executedAt: new Date() }
    : parsed.data;

  const [execution] = await db.update(testExecutionsTable).set(updateData).where(eq(testExecutionsTable.id, params.data.id)).returning();
  if (!execution) {
    res.status(404).json({ error: "Test execution not found" });
    return;
  }

  if (parsed.data.result) {
    await db.update(testCasesTable).set({ lastExecutionStatus: parsed.data.result }).where(eq(testCasesTable.id, execution.testCaseId));
  }

  res.json(UpdateTestExecutionResponse.parse(execution));
});

router.patch("/test-execution-steps/:id", async (req, res): Promise<void> => {
  const params = UpdateTestExecutionStepParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTestExecutionStepBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [step] = await db.update(testExecutionStepsTable).set(parsed.data).where(eq(testExecutionStepsTable.id, params.data.id)).returning();
  if (!step) {
    res.status(404).json({ error: "Execution step not found" });
    return;
  }
  res.json(UpdateTestExecutionStepResponse.parse(step));
});

export default router;
