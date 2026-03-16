import { Router, type IRouter } from "express";
import { db, usersTable, releasesTable, testCyclesTable, testPlansTable, testScenariosTable, testCasesTable, testStepsTable, testExecutionsTable, testExecutionStepsTable, defectsTable, defectCommentsTable, approvalsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.post("/seed", async (_req, res): Promise<void> => {
  await db.execute(sql`TRUNCATE TABLE defect_comments, defects, test_execution_steps, test_executions, test_steps, test_cases, test_scenarios, test_plans, test_cycles, approvals, releases, users RESTART IDENTITY CASCADE`);

  const users = await db.insert(usersTable).values([
    { name: "Sarah Chen", email: "sarah.chen@company.com", role: "Admin", department: "IT" },
    { name: "Marcus Johnson", email: "marcus.j@company.com", role: "QA Manager", department: "Quality Assurance" },
    { name: "Emily Rodriguez", email: "emily.r@company.com", role: "Test Lead", department: "Quality Assurance" },
    { name: "David Kim", email: "david.k@company.com", role: "Business Analyst", department: "Business Operations" },
    { name: "Priya Patel", email: "priya.p@company.com", role: "Tester", department: "Quality Assurance" },
    { name: "James Wilson", email: "james.w@company.com", role: "Tester", department: "Quality Assurance" },
    { name: "Ana Martinez", email: "ana.m@company.com", role: "Business Tester", department: "Finance" },
    { name: "Robert Taylor", email: "robert.t@company.com", role: "Product Owner", department: "Product Management" },
    { name: "Lisa Wang", email: "lisa.w@company.com", role: "Executive Viewer", department: "Executive Leadership" },
    { name: "Michael Brown", email: "michael.b@company.com", role: "Approver", department: "Business Operations" },
    { name: "Jennifer Lee", email: "jennifer.l@company.com", role: "Tester", department: "Quality Assurance" },
    { name: "Carlos Gomez", email: "carlos.g@company.com", role: "Defect Owner", department: "Development" },
  ]).returning();

  const releases = await db.insert(releasesTable).values([
    { name: "ERP Phase 2 - Q1 2026", description: "Major ERP upgrade including Finance, HR, and Supply Chain modules", status: "Active", startDate: new Date("2026-01-15"), endDate: new Date("2026-03-31"), freezeDate: new Date("2026-03-20"), goLiveDate: new Date("2026-04-01"), ownerId: users[7].id },
    { name: "CRM Integration v3.0", description: "Salesforce CRM integration with order management and customer portal", status: "Active", startDate: new Date("2026-02-01"), endDate: new Date("2026-04-15"), freezeDate: new Date("2026-04-05"), goLiveDate: new Date("2026-04-20"), ownerId: users[3].id },
    { name: "Data Analytics Platform", description: "Business intelligence dashboard and reporting platform rollout", status: "Planning", startDate: new Date("2026-04-01"), endDate: new Date("2026-06-30"), ownerId: users[8].id },
  ]).returning();

  const cycles = await db.insert(testCyclesTable).values([
    { releaseId: releases[0].id, name: "ERP SIT Cycle 1", type: "SIT", status: "Completed", startDate: new Date("2026-01-20"), endDate: new Date("2026-02-15"), ownerId: users[2].id },
    { releaseId: releases[0].id, name: "ERP UAT Cycle 1", type: "UAT", status: "Active", startDate: new Date("2026-02-20"), endDate: new Date("2026-03-15"), ownerId: users[1].id },
    { releaseId: releases[0].id, name: "ERP UAT Cycle 2", type: "UAT", status: "Planning", startDate: new Date("2026-03-16"), endDate: new Date("2026-03-30"), ownerId: users[1].id },
    { releaseId: releases[1].id, name: "CRM SIT Cycle 1", type: "SIT", status: "Active", startDate: new Date("2026-02-10"), endDate: new Date("2026-03-10"), ownerId: users[2].id },
    { releaseId: releases[1].id, name: "CRM UAT Cycle 1", type: "UAT", status: "Planning", startDate: new Date("2026-03-15"), endDate: new Date("2026-04-10"), ownerId: users[1].id },
  ]).returning();

  const plans = await db.insert(testPlansTable).values([
    { testCycleId: cycles[1].id, name: "Finance Module Test Plan", description: "End-to-end testing of AP, AR, GL, and Financial Reporting", module: "Finance", status: "Active", entryCriteria: "All finance interfaces deployed to UAT environment", exitCriteria: "95% pass rate, no critical defects open", ownerId: users[2].id },
    { testCycleId: cycles[1].id, name: "HR Module Test Plan", description: "Testing of Employee Management, Payroll, and Benefits", module: "Human Resources", status: "Active", entryCriteria: "HR data migration complete", exitCriteria: "90% pass rate, payroll accuracy verified", ownerId: users[4].id },
    { testCycleId: cycles[1].id, name: "Supply Chain Test Plan", description: "Procurement, Inventory, and Warehouse Management testing", module: "Supply Chain", status: "Draft", entryCriteria: "Supplier master data loaded", exitCriteria: "All P2P scenarios passed", ownerId: users[2].id },
    { testCycleId: cycles[3].id, name: "CRM Order Management", description: "Order creation, approval, fulfillment, and invoicing workflows", module: "Order Management", status: "Active", entryCriteria: "CRM sandbox configured", exitCriteria: "All order types tested successfully", ownerId: users[3].id },
    { testCycleId: cycles[0].id, name: "Integration Test Plan", description: "Cross-module integration and interface testing", module: "Integration", status: "Completed", entryCriteria: "All interfaces deployed", exitCriteria: "Zero interface failures", ownerId: users[2].id },
  ]).returning();

  const scenarios = await db.insert(testScenariosTable).values([
    { testPlanId: plans[0].id, title: "Accounts Payable Processing", description: "End-to-end AP workflow from invoice receipt to payment", businessProcess: "Procure to Pay", priority: "Critical" },
    { testPlanId: plans[0].id, title: "Accounts Receivable", description: "Customer invoicing and collections", businessProcess: "Order to Cash", priority: "High" },
    { testPlanId: plans[0].id, title: "General Ledger Posting", description: "Journal entries and period-end close", businessProcess: "Record to Report", priority: "Critical" },
    { testPlanId: plans[1].id, title: "Employee Onboarding", description: "New hire setup and system provisioning", businessProcess: "Hire to Retire", priority: "High" },
    { testPlanId: plans[1].id, title: "Payroll Processing", description: "Monthly payroll calculation and disbursement", businessProcess: "Hire to Retire", priority: "Critical" },
    { testPlanId: plans[2].id, title: "Purchase Order Processing", description: "PO creation, approval, and goods receipt", businessProcess: "Procure to Pay", priority: "High" },
    { testPlanId: plans[3].id, title: "Sales Order Workflow", description: "Quote to order to invoice flow", businessProcess: "Lead to Cash", priority: "Critical" },
    { testPlanId: plans[4].id, title: "Finance-HR Interface", description: "Payroll data transfer to GL", businessProcess: "Cross-Module", priority: "Critical" },
  ]).returning();

  const testCaseData = [
    { scenarioId: scenarios[0].id, title: "Create vendor invoice with PO reference", description: "Verify 3-way match process for vendor invoices", preconditions: "Valid PO exists with goods receipt", priority: "Critical", complexity: "High", status: "Active", assigneeId: users[4].id, estimatedMinutes: 30 },
    { scenarioId: scenarios[0].id, title: "Process vendor payment batch", description: "Run payment proposal and execute payment run", preconditions: "Approved invoices exist in the system", priority: "Critical", complexity: "High", status: "Active", assigneeId: users[5].id, estimatedMinutes: 45 },
    { scenarioId: scenarios[0].id, title: "Handle invoice exceptions and blocks", description: "Test price variance, quantity variance, and GR/IR blocks", preconditions: "Invoices with discrepancies loaded", priority: "High", complexity: "Medium", status: "Active", assigneeId: users[4].id, estimatedMinutes: 25 },
    { scenarioId: scenarios[1].id, title: "Create customer invoice", description: "Generate invoice from sales order delivery", preconditions: "Delivery document exists", priority: "High", complexity: "Medium", status: "Active", assigneeId: users[6].id, estimatedMinutes: 20 },
    { scenarioId: scenarios[1].id, title: "Process customer payment", description: "Apply incoming payment to open invoice", preconditions: "Open customer invoice exists", priority: "High", complexity: "Medium", status: "Active", assigneeId: users[6].id, estimatedMinutes: 15 },
    { scenarioId: scenarios[2].id, title: "Post manual journal entry", description: "Create and post a manual GL journal entry", preconditions: "GL accounts configured", priority: "Critical", complexity: "Low", status: "Active", assigneeId: users[4].id, estimatedMinutes: 15 },
    { scenarioId: scenarios[2].id, title: "Execute period-end closing", description: "Run month-end close activities", preconditions: "All sub-ledger postings complete", priority: "Critical", complexity: "High", status: "Active", assigneeId: users[5].id, estimatedMinutes: 60 },
    { scenarioId: scenarios[2].id, title: "Generate financial statements", description: "Produce balance sheet and income statement", preconditions: "Period is closed", priority: "High", complexity: "Medium", status: "Active", assigneeId: users[6].id, estimatedMinutes: 20 },
    { scenarioId: scenarios[3].id, title: "Create new employee record", description: "Enter all mandatory employee master data", preconditions: "Organization structure configured", priority: "High", complexity: "Medium", status: "Active", assigneeId: users[10].id, estimatedMinutes: 25 },
    { scenarioId: scenarios[3].id, title: "Assign employee to position", description: "Link employee to org unit and position", preconditions: "Employee record exists", priority: "Medium", complexity: "Low", status: "Active", assigneeId: users[10].id, estimatedMinutes: 10 },
    { scenarioId: scenarios[4].id, title: "Run payroll simulation", description: "Execute payroll simulation for test employees", preconditions: "Employee master data and time entries exist", priority: "Critical", complexity: "High", status: "Active", assigneeId: users[4].id, estimatedMinutes: 40 },
    { scenarioId: scenarios[4].id, title: "Process payroll with deductions", description: "Run payroll including tax, benefits, and garnishments", preconditions: "Deduction rules configured", priority: "Critical", complexity: "High", status: "Active", assigneeId: users[5].id, estimatedMinutes: 50 },
    { scenarioId: scenarios[5].id, title: "Create purchase requisition", description: "Submit purchase requisition with approval", preconditions: "Material master exists", priority: "High", complexity: "Medium", status: "Draft", assigneeId: users[6].id, estimatedMinutes: 20 },
    { scenarioId: scenarios[5].id, title: "Convert PR to purchase order", description: "Generate PO from approved requisition", preconditions: "Approved PR exists", priority: "High", complexity: "Medium", status: "Draft", assigneeId: users[4].id, estimatedMinutes: 15 },
    { scenarioId: scenarios[6].id, title: "Create sales order from quote", description: "Convert approved quote to sales order", preconditions: "Approved quote exists in CRM", priority: "Critical", complexity: "Medium", status: "Active", assigneeId: users[5].id, estimatedMinutes: 25 },
    { scenarioId: scenarios[6].id, title: "Validate order pricing", description: "Verify pricing rules and discounts applied correctly", preconditions: "Price lists configured", priority: "High", complexity: "High", status: "Active", assigneeId: users[10].id, estimatedMinutes: 35 },
    { scenarioId: scenarios[6].id, title: "Process order cancellation", description: "Cancel order and verify reversal of inventory and billing", preconditions: "Active order exists", priority: "Medium", complexity: "Medium", status: "Active", assigneeId: users[6].id, estimatedMinutes: 20 },
    { scenarioId: scenarios[7].id, title: "Verify payroll-to-GL posting", description: "Confirm payroll results post correctly to finance GL", preconditions: "Payroll run completed", priority: "Critical", complexity: "High", status: "Active", assigneeId: users[4].id, estimatedMinutes: 30 },
    { scenarioId: scenarios[7].id, title: "Validate cost center allocation", description: "Verify cost center distribution from HR to Finance", preconditions: "Cost centers configured in both systems", priority: "High", complexity: "Medium", status: "Active", assigneeId: users[5].id, estimatedMinutes: 25 },
    { scenarioId: scenarios[0].id, title: "Validate tax calculation on invoice", description: "Verify correct tax codes and amounts calculated", preconditions: "Tax rules configured", priority: "High", complexity: "Medium", status: "Active", assigneeId: users[10].id, estimatedMinutes: 20 },
    { scenarioId: scenarios[1].id, title: "Process credit memo", description: "Create and apply credit memo for return", preconditions: "Original invoice posted", priority: "Medium", complexity: "Medium", status: "Active", assigneeId: users[4].id, estimatedMinutes: 20 },
    { scenarioId: scenarios[2].id, title: "Run intercompany elimination", description: "Process intercompany eliminations for consolidation", preconditions: "IC transactions posted", priority: "High", complexity: "High", status: "Active", assigneeId: users[5].id, estimatedMinutes: 45 },
    { scenarioId: scenarios[4].id, title: "Process termination payroll", description: "Run final payroll for terminated employee", preconditions: "Termination action processed", priority: "High", complexity: "High", status: "Active", assigneeId: users[6].id, estimatedMinutes: 35 },
  ];

  const cases = await db.insert(testCasesTable).values(testCaseData).returning();

  const stepsData: (typeof testStepsTable.$inferInsert)[] = [];
  const stepTemplates: Record<number, { action: string; expected: string }[]> = {};

  stepTemplates[0] = [
    { action: "Navigate to AP Invoice Entry screen", expected: "Invoice entry form opens" },
    { action: "Enter vendor number and PO reference", expected: "PO details auto-populate" },
    { action: "Verify 3-way match (PO, GR, Invoice)", expected: "Match status shows 'Matched'" },
    { action: "Submit invoice for approval", expected: "Invoice routed to approver" },
    { action: "Approve and post the invoice", expected: "Invoice posted to GL with correct coding" },
  ];

  stepTemplates[1] = [
    { action: "Open Payment Proposal screen", expected: "Payment proposal form available" },
    { action: "Set payment parameters and run proposal", expected: "Eligible invoices listed" },
    { action: "Review and adjust payment proposal", expected: "Changes saved" },
    { action: "Execute payment run", expected: "Payments generated with batch reference" },
  ];

  stepTemplates[5] = [
    { action: "Navigate to GL Journal Entry", expected: "Journal entry form opens" },
    { action: "Enter header data (date, description, reference)", expected: "Header saved" },
    { action: "Add debit and credit line items", expected: "Lines balanced (debits = credits)" },
    { action: "Post journal entry", expected: "Document number generated and posted" },
  ];

  stepTemplates[8] = [
    { action: "Navigate to Employee Master Data", expected: "Employee creation form opens" },
    { action: "Enter personal data (name, DOB, address)", expected: "Data accepted" },
    { action: "Enter organizational assignment", expected: "Org assignment confirmed" },
    { action: "Save employee record", expected: "Employee ID generated" },
  ];

  stepTemplates[14] = [
    { action: "Open CRM quote", expected: "Quote details displayed" },
    { action: "Click 'Convert to Order'", expected: "Sales order form populated from quote" },
    { action: "Verify pricing and line items", expected: "Pricing matches quote" },
    { action: "Submit order", expected: "Order confirmed with order number" },
  ];

  for (const [idx, templates] of Object.entries(stepTemplates)) {
    const caseIdx = parseInt(idx);
    if (cases[caseIdx]) {
      for (let i = 0; i < templates.length; i++) {
        stepsData.push({
          testCaseId: cases[caseIdx].id,
          stepNumber: i + 1,
          action: templates[i].action,
          expectedResult: templates[i].expected,
          testData: "",
        });
      }
    }
  }

  for (const c of cases) {
    const hasSteps = stepsData.some(s => s.testCaseId === c.id);
    if (!hasSteps) {
      stepsData.push(
        { testCaseId: c.id, stepNumber: 1, action: "Navigate to the relevant module", expectedResult: "Module screen opens correctly", testData: "" },
        { testCaseId: c.id, stepNumber: 2, action: "Perform the main action as described", expectedResult: "Action completes without errors", testData: "" },
        { testCaseId: c.id, stepNumber: 3, action: "Verify the result in the system", expectedResult: "Expected outcome confirmed", testData: "" },
      );
    }
  }

  await db.insert(testStepsTable).values(stepsData);

  const executionData: (typeof testExecutionsTable.$inferInsert)[] = [];
  const statuses = ["Passed", "Failed", "Blocked", "Passed", "Passed", "Passed", "Failed", "Passed", "Passed", "Blocked", "Passed", "Passed", "Pending", "Pending", "Passed", "Failed", "Passed", "Passed", "Passed", "Passed", "Passed", "Failed", "Passed"];

  for (let i = 0; i < Math.min(cases.length, statuses.length); i++) {
    const c = cases[i];
    const result = statuses[i];
    executionData.push({
      testCaseId: c.id,
      testCycleId: c.scenarioId <= scenarios[2].id ? cycles[1].id : (c.scenarioId <= scenarios[4].id ? cycles[1].id : (c.scenarioId === scenarios[5].id ? cycles[1].id : (c.scenarioId === scenarios[6].id ? cycles[3].id : cycles[0].id))),
      executorId: c.assigneeId,
      status: result === "Pending" ? "Not Started" : "Completed",
      result: result,
      notes: result === "Failed" ? "Test failed - see defect" : (result === "Blocked" ? "Blocked by environment issue" : ""),
      executedAt: result !== "Pending" ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
    });
  }

  const executions = await db.insert(testExecutionsTable).values(executionData).returning();

  for (const exec of executions) {
    await db.update(testCasesTable).set({ lastExecutionStatus: exec.result }).where(sql`${testCasesTable.id} = ${exec.testCaseId}`);
  }

  const execStepsData: (typeof testExecutionStepsTable.$inferInsert)[] = [];
  for (const exec of executions) {
    const caseSteps = stepsData.filter(s => s.testCaseId === exec.testCaseId);
    for (const step of caseSteps) {
      execStepsData.push({
        executionId: exec.id,
        testStepId: 1,
        stepNumber: step.stepNumber,
        action: step.action,
        expectedResult: step.expectedResult,
        actualResult: exec.result === "Passed" ? step.expectedResult : (exec.result === "Failed" ? "Unexpected behavior observed" : ""),
        status: exec.result === "Pending" ? "Not Executed" : exec.result,
        notes: "",
      });
    }
  }

  if (execStepsData.length > 0) {
    const stepsInDb = await db.select().from(testStepsTable);
    const stepsMap = new Map<string, number>();
    for (const s of stepsInDb) {
      stepsMap.set(`${s.testCaseId}-${s.stepNumber}`, s.id);
    }

    for (const es of execStepsData) {
      const exec = executions.find(e => e.id === es.executionId);
      if (exec) {
        const key = `${exec.testCaseId}-${es.stepNumber}`;
        const stepId = stepsMap.get(key);
        if (stepId) es.testStepId = stepId;
      }
    }

    await db.insert(testExecutionStepsTable).values(execStepsData);
  }

  const failedExecs = executions.filter(e => e.result === "Failed");
  const defectData = [
    { title: "3-way match fails for partial deliveries", description: "When goods receipt is partial, the 3-way match incorrectly blocks the full invoice amount instead of matching the received quantity.", severity: "Critical", priority: "Critical", status: "In Progress", rootCause: "Matching logic", testExecutionId: failedExecs[0]?.id, assigneeId: users[11].id, reporterId: users[4].id },
    { title: "Period-end close hangs on step 4", description: "The automated closing process freezes during the foreign currency revaluation step. Manual intervention required.", severity: "High", priority: "High", status: "Assigned", rootCause: "Performance", testExecutionId: failedExecs[1]?.id, assigneeId: users[11].id, reporterId: users[5].id },
    { title: "Order pricing incorrect for tiered discounts", description: "Discount tiers not applying correctly when order quantity crosses tier boundaries.", severity: "High", priority: "High", status: "New", rootCause: "Configuration", testExecutionId: failedExecs[2]?.id, assigneeId: users[11].id, reporterId: users[10].id },
    { title: "Intercompany elimination rounding errors", description: "Elimination entries show penny differences due to currency conversion rounding.", severity: "Medium", priority: "Medium", status: "Ready for Retest", rootCause: "Rounding logic", testExecutionId: failedExecs[3]?.id ?? failedExecs[0]?.id, assigneeId: users[11].id, reporterId: users[5].id },
    { title: "Tax code not defaulting on vendor invoice", description: "Tax code field is blank instead of defaulting from vendor master.", severity: "Medium", priority: "Low", status: "New", rootCause: "Missing default", assigneeId: users[11].id, reporterId: users[4].id },
    { title: "Employee onboarding email not triggered", description: "Welcome email not sent when new employee record is saved.", severity: "Low", priority: "Low", status: "Deferred", rootCause: "Integration", assigneeId: users[11].id, reporterId: users[10].id },
    { title: "Payment batch reference number format incorrect", description: "Batch reference exceeds bank's 16-character limit causing rejection.", severity: "Critical", priority: "Critical", status: "In Progress", rootCause: "Data format", assigneeId: users[11].id, reporterId: users[5].id },
    { title: "Payroll GL posting date mismatch", description: "Payroll results post with the run date instead of the pay period end date.", severity: "High", priority: "High", status: "Assigned", rootCause: "Configuration", testExecutionId: failedExecs[0]?.id, assigneeId: users[11].id, reporterId: users[4].id },
    { title: "Credit memo not clearing original invoice", description: "Credit memo posts but does not automatically clear against the original invoice.", severity: "Medium", priority: "Medium", status: "Closed", rootCause: "Missing clearing logic", assigneeId: users[11].id, reporterId: users[4].id },
    { title: "Cost center hierarchy not reflecting in reports", description: "Summary-level cost center roll-up missing child cost centers added after initial config.", severity: "Medium", priority: "Medium", status: "New", rootCause: "Hierarchy refresh", assigneeId: users[11].id, reporterId: users[5].id },
  ];

  const defects = await db.insert(defectsTable).values(defectData).returning();

  await db.insert(defectCommentsTable).values([
    { defectId: defects[0].id, authorId: users[11].id, content: "Investigating the matching algorithm. The issue appears to be in the partial delivery handling logic." },
    { defectId: defects[0].id, authorId: users[4].id, content: "This is blocking our AP testing. We need a fix by end of week." },
    { defectId: defects[0].id, authorId: users[11].id, content: "Root cause identified. Fix deployed to UAT. Ready for retest." },
    { defectId: defects[1].id, authorId: users[11].id, content: "Performance profiling shows the revaluation query is doing a full table scan. Adding indexes." },
    { defectId: defects[2].id, authorId: users[10].id, content: "Reproduced with order qty=150. Tier 2 discount (100-199 units) not applying. Only Tier 1 applied." },
    { defectId: defects[6].id, authorId: users[11].id, content: "Working on truncating the batch reference to 16 characters. Need to verify with bank specifications." },
    { defectId: defects[6].id, authorId: users[5].id, content: "Please also check the EFT file format. The bank spec document is in SharePoint." },
  ]);

  await db.insert(approvalsTable).values([
    { releaseId: releases[0].id, module: "Finance", type: "Module", status: "Pending", approverId: users[9].id },
    { releaseId: releases[0].id, module: "Human Resources", type: "Module", status: "Pending", approverId: users[9].id },
    { releaseId: releases[0].id, module: "Supply Chain", type: "Module", status: "Pending", approverId: users[9].id },
    { releaseId: releases[0].id, module: "Integration", type: "Module", status: "Approved", approverId: users[9].id, comments: "All integration tests passed. Approved for production.", decidedAt: new Date("2026-03-01") },
    { releaseId: releases[0].id, module: "Overall Release", type: "Release", status: "Pending", approverId: users[8].id },
    { releaseId: releases[1].id, module: "Order Management", type: "Module", status: "Pending", approverId: users[9].id },
    { releaseId: releases[1].id, module: "Customer Portal", type: "Module", status: "Conditionally Approved", approverId: users[9].id, comments: "Approved with condition: performance testing must pass before go-live.", conditions: "Performance test results required", decidedAt: new Date("2026-03-10") },
    { releaseId: releases[1].id, module: "Overall Release", type: "Release", status: "Pending", approverId: users[8].id },
  ]);

  res.json({ success: true, message: "Database seeded successfully with sample data" });
});

export default router;
