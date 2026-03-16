import { Router, type IRouter } from "express";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { db, releasesTable, testCyclesTable, testExecutionsTable, defectsTable, approvalsTable, testCasesTable } from "@workspace/db";
import {
  GetDashboardStatsResponse,
  GetDefectSummaryResponse,
  GetExecutionTrendResponse,
  GetCycleSummaryParams,
  GetCycleSummaryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [releaseCount] = await db.select({ count: sql<number>`count(*)::int` }).from(releasesTable).where(eq(releasesTable.status, "Active"));
  const [cycleCount] = await db.select({ count: sql<number>`count(*)::int` }).from(testCyclesTable).where(eq(testCyclesTable.status, "Active"));

  const allExecs = await db.select({ result: testExecutionsTable.result, status: testExecutionsTable.status }).from(testExecutionsTable);
  const total = allExecs.length;
  const passed = allExecs.filter(e => e.result === "Passed").length;
  const failed = allExecs.filter(e => e.result === "Failed").length;
  const blocked = allExecs.filter(e => e.result === "Blocked").length;
  const inProgress = allExecs.filter(e => e.status === "In Progress").length;
  const notStarted = allExecs.filter(e => e.result === "Pending" || e.status === "Not Started").length;

  const [openDefectCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(defectsTable)
    .where(sql`${defectsTable.status} NOT IN ('Closed', 'Deferred')`);

  const [criticalCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(defectsTable)
    .where(and(eq(defectsTable.severity, "Critical"), sql`${defectsTable.status} NOT IN ('Closed', 'Deferred')`));

  const allApprovals = await db.select({ status: approvalsTable.status }).from(approvalsTable);
  const approvedCount = allApprovals.filter(a => a.status === "Approved" || a.status === "Conditionally Approved").length;
  const signOffProgress = allApprovals.length > 0 ? Math.round((approvedCount / allApprovals.length) * 100) : 0;

  const readinessScore = total > 0 ? Math.round((passed / total) * 100 * 0.6 + signOffProgress * 0.4) : 0;

  const stats = {
    activeReleases: releaseCount?.count ?? 0,
    activeTestCycles: cycleCount?.count ?? 0,
    totalTestCases: total,
    passed,
    failed,
    blocked,
    notStarted,
    inProgress,
    passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
    failRate: total > 0 ? Math.round((failed / total) * 100) : 0,
    blockedRate: total > 0 ? Math.round((blocked / total) * 100) : 0,
    openDefects: openDefectCount?.count ?? 0,
    criticalDefects: criticalCount?.count ?? 0,
    readinessScore,
    signOffProgress,
    overdueTestCases: 0,
  };

  res.json(GetDashboardStatsResponse.parse(stats));
});

router.get("/dashboard/defect-summary", async (_req, res): Promise<void> => {
  const results = await db
    .select({
      severity: defectsTable.severity,
      count: sql<number>`count(*)::int`,
    })
    .from(defectsTable)
    .groupBy(defectsTable.severity);

  res.json(GetDefectSummaryResponse.parse(results));
});

router.get("/dashboard/execution-trend", async (_req, res): Promise<void> => {
  const results = await db
    .select({
      date: sql<string>`to_char(${testExecutionsTable.createdAt}, 'YYYY-MM-DD')`,
      result: testExecutionsTable.result,
    })
    .from(testExecutionsTable)
    .orderBy(testExecutionsTable.createdAt);

  const grouped: Record<string, { passed: number; failed: number; blocked: number }> = {};
  for (const row of results) {
    if (!grouped[row.date]) grouped[row.date] = { passed: 0, failed: 0, blocked: 0 };
    if (row.result === "Passed") grouped[row.date].passed++;
    else if (row.result === "Failed") grouped[row.date].failed++;
    else if (row.result === "Blocked") grouped[row.date].blocked++;
  }

  const trend = Object.entries(grouped).map(([date, counts]) => ({ date, ...counts }));
  res.json(GetExecutionTrendResponse.parse(trend));
});

router.get("/reports/cycle-summary/:cycleId", async (req, res): Promise<void> => {
  const params = GetCycleSummaryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [cycle] = await db.select().from(testCyclesTable).where(eq(testCyclesTable.id, params.data.cycleId));
  if (!cycle) {
    res.status(404).json({ error: "Test cycle not found" });
    return;
  }

  const executions = await db
    .select({ result: testExecutionsTable.result })
    .from(testExecutionsTable)
    .where(eq(testExecutionsTable.testCycleId, params.data.cycleId));

  const total = executions.length;
  const passed = executions.filter(e => e.result === "Passed").length;
  const failed = executions.filter(e => e.result === "Failed").length;
  const blocked = executions.filter(e => e.result === "Blocked").length;
  const notStarted = executions.filter(e => e.result === "Pending").length;

  const [defectCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(defectsTable)
    .innerJoin(testExecutionsTable, eq(defectsTable.testExecutionId, testExecutionsTable.id))
    .where(eq(testExecutionsTable.testCycleId, params.data.cycleId));

  const [criticalCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(defectsTable)
    .innerJoin(testExecutionsTable, eq(defectsTable.testExecutionId, testExecutionsTable.id))
    .where(and(eq(testExecutionsTable.testCycleId, params.data.cycleId), eq(defectsTable.severity, "Critical")));

  const approvals = await db.select({ status: approvalsTable.status }).from(approvalsTable).where(eq(approvalsTable.releaseId, cycle.releaseId));
  const allApproved = approvals.length > 0 && approvals.every(a => a.status === "Approved" || a.status === "Conditionally Approved");

  const summary = {
    cycleId: cycle.id,
    cycleName: cycle.name,
    totalCases: total,
    passed,
    failed,
    blocked,
    notStarted,
    passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
    defectsFound: defectCount?.count ?? 0,
    criticalDefects: criticalCount?.count ?? 0,
    signOffStatus: allApproved ? "Complete" : "Pending",
  };

  res.json(GetCycleSummaryResponse.parse(summary));
});

export default router;
