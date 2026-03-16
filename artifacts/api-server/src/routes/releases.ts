import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, releasesTable, usersTable, testCyclesTable, testPlansTable, testScenariosTable, testCasesTable, testExecutionsTable, defectsTable } from "@workspace/db";
import {
  CreateReleaseBody,
  GetReleaseParams,
  GetReleaseResponse,
  UpdateReleaseParams,
  UpdateReleaseBody,
  UpdateReleaseResponse,
  ListReleasesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/releases", async (_req, res): Promise<void> => {
  const releases = await db
    .select({
      id: releasesTable.id,
      name: releasesTable.name,
      description: releasesTable.description,
      status: releasesTable.status,
      startDate: releasesTable.startDate,
      endDate: releasesTable.endDate,
      freezeDate: releasesTable.freezeDate,
      goLiveDate: releasesTable.goLiveDate,
      ownerId: releasesTable.ownerId,
      ownerName: usersTable.name,
      createdAt: releasesTable.createdAt,
    })
    .from(releasesTable)
    .leftJoin(usersTable, eq(releasesTable.ownerId, usersTable.id))
    .orderBy(releasesTable.createdAt);
  res.json(ListReleasesResponse.parse(releases));
});

router.post("/releases", async (req, res): Promise<void> => {
  const parsed = CreateReleaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [release] = await db.insert(releasesTable).values(parsed.data).returning();
  res.status(201).json(UpdateReleaseResponse.parse(release));
});

router.get("/releases/:id", async (req, res): Promise<void> => {
  const params = GetReleaseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [release] = await db
    .select({
      id: releasesTable.id,
      name: releasesTable.name,
      description: releasesTable.description,
      status: releasesTable.status,
      startDate: releasesTable.startDate,
      endDate: releasesTable.endDate,
      freezeDate: releasesTable.freezeDate,
      goLiveDate: releasesTable.goLiveDate,
      ownerId: releasesTable.ownerId,
      ownerName: usersTable.name,
      createdAt: releasesTable.createdAt,
    })
    .from(releasesTable)
    .leftJoin(usersTable, eq(releasesTable.ownerId, usersTable.id))
    .where(eq(releasesTable.id, params.data.id));

  if (!release) {
    res.status(404).json({ error: "Release not found" });
    return;
  }

  const cycles = await db
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
    .where(eq(testCyclesTable.releaseId, params.data.id));

  const executions = await db
    .select({ status: testExecutionsTable.result })
    .from(testExecutionsTable)
    .innerJoin(testCyclesTable, eq(testExecutionsTable.testCycleId, testCyclesTable.id))
    .where(eq(testCyclesTable.releaseId, params.data.id));

  const openDefects = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(defectsTable)
    .innerJoin(testExecutionsTable, eq(defectsTable.testExecutionId, testExecutionsTable.id))
    .innerJoin(testCyclesTable, eq(testExecutionsTable.testCycleId, testCyclesTable.id))
    .where(eq(testCyclesTable.releaseId, params.data.id));

  const totalCases = executions.length;
  const passed = executions.filter(e => e.status === "Passed").length;
  const failed = executions.filter(e => e.status === "Failed").length;
  const blocked = executions.filter(e => e.status === "Blocked").length;
  const notStarted = executions.filter(e => e.status === "Pending" || e.status === "Not Started").length;

  const stats = {
    totalCycles: cycles.length,
    totalTestCases: totalCases,
    passed,
    failed,
    blocked,
    notStarted,
    passRate: totalCases > 0 ? Math.round((passed / totalCases) * 100) : 0,
    openDefects: openDefects[0]?.count ?? 0,
  };

  res.json(GetReleaseResponse.parse({ ...release, testCycles: cycles, stats }));
});

router.patch("/releases/:id", async (req, res): Promise<void> => {
  const params = UpdateReleaseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateReleaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [release] = await db.update(releasesTable).set(parsed.data).where(eq(releasesTable.id, params.data.id)).returning();
  if (!release) {
    res.status(404).json({ error: "Release not found" });
    return;
  }
  res.json(UpdateReleaseResponse.parse(release));
});

export default router;
