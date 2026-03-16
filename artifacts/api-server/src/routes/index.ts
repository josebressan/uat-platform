import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import releasesRouter from "./releases";
import testCyclesRouter from "./testCycles";
import testPlansRouter from "./testPlans";
import testCasesRouter from "./testCases";
import testExecutionsRouter from "./testExecutions";
import defectsRouter from "./defects";
import approvalsRouter from "./approvals";
import dashboardRouter from "./dashboard";
import seedRouter from "./seed";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(releasesRouter);
router.use(testCyclesRouter);
router.use(testPlansRouter);
router.use(testCasesRouter);
router.use(testExecutionsRouter);
router.use(defectsRouter);
router.use(approvalsRouter);
router.use(dashboardRouter);
if (process.env.NODE_ENV === "development") {
  router.use(seedRouter);
}

export default router;
