import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Dashboard from "@/pages/Dashboard";
import ReleasesList from "@/pages/releases/ReleasesList";
import ReleaseDetail from "@/pages/releases/ReleaseDetail";
import TestCyclesList from "@/pages/test-cycles/TestCyclesList";
import TestCycleDetail from "@/pages/test-cycles/TestCycleDetail";
import TestPlansList from "@/pages/test-plans/TestPlansList";
import TestPlanDetail from "@/pages/test-plans/TestPlanDetail";
import TestCasesList from "@/pages/test-cases/TestCasesList";
import TestCaseDetail from "@/pages/test-cases/TestCaseDetail";
import ExecutionsList from "@/pages/executions/ExecutionsList";
import ExecutionWorkspace from "@/pages/executions/ExecutionWorkspace";
import DefectsBoard from "@/pages/defects/DefectsBoard";
import DefectDetail from "@/pages/defects/DefectDetail";
import ApprovalsPage from "@/pages/approvals/ApprovalsPage";
import ReportsPage from "@/pages/reports/ReportsPage";
import SettingsPage from "@/pages/settings/SettingsPage";

import { AppLayout } from "@/components/layout/AppLayout";

const NotFoundPage = () => (
  <AppLayout><div className="flex h-[60vh] items-center justify-center text-muted-foreground flex-col gap-4">
    <h1 className="text-3xl text-white font-bold">404 Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
  </div></AppLayout>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/releases" component={ReleasesList} />
      <Route path="/releases/:id" component={ReleaseDetail} />
      <Route path="/test-cycles" component={TestCyclesList} />
      <Route path="/test-cycles/:id" component={TestCycleDetail} />
      <Route path="/test-plans" component={TestPlansList} />
      <Route path="/test-plans/:id" component={TestPlanDetail} />
      <Route path="/test-cases" component={TestCasesList} />
      <Route path="/test-cases/:id" component={TestCaseDetail} />
      <Route path="/executions" component={ExecutionsList} />
      <Route path="/executions/:id" component={ExecutionWorkspace} />
      <Route path="/defects" component={DefectsBoard} />
      <Route path="/defects/:id" component={DefectDetail} />
      <Route path="/approvals" component={ApprovalsPage} />
      <Route path="/reports" component={ReportsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
