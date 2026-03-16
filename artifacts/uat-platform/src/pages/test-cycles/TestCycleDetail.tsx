import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useGetTestCycle } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, ClipboardList, Play, CheckCircle, XCircle, PauseCircle } from "lucide-react";

export default function TestCycleDetail() {
  const [, params] = useRoute("/test-cycles/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  
  const { data: cycle, isLoading } = useGetTestCycle(id);

  if (isLoading) return <AppLayout><div className="p-12 text-center">Loading cycle details...</div></AppLayout>;
  if (!cycle) return <AppLayout><div className="p-12 text-center text-red-400">Cycle not found</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link href="/test-cycles" className="hover:text-white flex items-center"><ChevronLeft className="w-4 h-4 mr-1" /> Test Cycles</Link>
            <span>/</span>
            <span className="text-primary font-medium">{cycle.name}</span>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground text-xs font-bold tracking-wider uppercase">{cycle.type}</span>
                <StatusBadge status={cycle.status} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">{cycle.name}</h1>
            </div>
            <div className="flex gap-3">
              <Link href={`/test-plans?testCycleId=${cycle.id}`}>
                <button className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-medium transition-colors">
                  View Test Plans
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Execution Progress Bar */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Execution Progress ({cycle.stats.passRate}%)</h3>
          <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex">
            {cycle.stats.totalCases > 0 && (
              <>
                <div style={{ width: `${(cycle.stats.passed / cycle.stats.totalCases) * 100}%` }} className="bg-emerald-500 transition-all duration-1000"></div>
                <div style={{ width: `${(cycle.stats.failed / cycle.stats.totalCases) * 100}%` }} className="bg-red-500 transition-all duration-1000"></div>
                <div style={{ width: `${(cycle.stats.blocked / cycle.stats.totalCases) * 100}%` }} className="bg-amber-500 transition-all duration-1000"></div>
                <div style={{ width: `${(cycle.stats.inProgress / cycle.stats.totalCases) * 100}%` }} className="bg-blue-500 transition-all duration-1000"></div>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-sm text-muted-foreground">Passed: <strong className="text-white">{cycle.stats.passed}</strong></span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-sm text-muted-foreground">Failed: <strong className="text-white">{cycle.stats.failed}</strong></span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-sm text-muted-foreground">Blocked: <strong className="text-white">{cycle.stats.blocked}</strong></span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-sm text-muted-foreground">In Progress: <strong className="text-white">{cycle.stats.inProgress}</strong></span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-muted border border-border"></div><span className="text-sm text-muted-foreground">Not Started: <strong className="text-white">{cycle.stats.notStarted}</strong></span></div>
          </div>
        </div>

        {/* Test Plans List */}
        <h3 className="text-xl font-bold text-white mt-8 mb-4">Included Test Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cycle.testPlans.length === 0 ? (
            <div className="col-span-full p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground">
              No test plans added to this cycle yet.
            </div>
          ) : (
            cycle.testPlans.map(plan => (
              <Link key={plan.id} href={`/test-plans/${plan.id}`}>
                <div className="glass-panel p-5 rounded-2xl hover-card-effect cursor-pointer group flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <StatusBadge status={plan.status} size="sm" />
                  </div>
                  <h4 className="font-bold text-lg text-white mb-1 group-hover:text-primary transition-colors">{plan.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{plan.description}</p>
                  <div className="border-t border-border pt-4 mt-auto">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Module: <span className="text-white">{plan.module}</span></span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
