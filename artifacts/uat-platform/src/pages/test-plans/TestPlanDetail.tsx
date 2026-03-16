import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { useGetTestPlan, useListTestCases } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, ClipboardList, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import type { TestCase } from "@workspace/api-client-react";

export default function TestPlanDetail() {
  const [, params] = useRoute("/test-plans/:id");
  const id = params?.id ? parseInt(params.id) : 0;

  const { data: plan, isLoading } = useGetTestPlan(id);
  const { data: allCases = [] } = useListTestCases();

  if (isLoading) return <AppLayout><div className="p-12 text-center text-muted-foreground">Loading test plan...</div></AppLayout>;
  if (!plan) return <AppLayout><div className="p-12 text-center text-red-400">Test plan not found</div></AppLayout>;

  const planCases = allCases as TestCase[];

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link href="/test-plans" className="hover:text-white flex items-center transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" /> Test Plans
            </Link>
            <span>/</span>
            <span className="text-white">{plan.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{plan.name}</h1>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
            </div>
            <StatusBadge status={plan.status} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="text-sm text-muted-foreground mb-1">Module</div>
            <div className="text-lg font-semibold text-white">{plan.module}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="text-sm text-muted-foreground mb-1">Owner</div>
            <div className="text-lg font-semibold text-white">{plan.ownerName}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="text-sm text-muted-foreground mb-1">Created</div>
            <div className="text-lg font-semibold text-white">{formatDate(plan.createdAt)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Entry Criteria
            </h3>
            <p className="text-white text-sm">{plan.entryCriteria || "Not specified"}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" /> Exit Criteria
            </h3>
            <p className="text-white text-sm">{plan.exitCriteria || "Not specified"}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl">
          <div className="p-5 border-b border-border">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Related Test Cases ({planCases.length})
            </h3>
          </div>
          {planCases.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No test cases found for this module.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-sm text-muted-foreground">
                  <th className="text-left px-5 py-3 font-medium">ID</th>
                  <th className="text-left px-5 py-3 font-medium">Title</th>
                  <th className="text-left px-5 py-3 font-medium">Priority</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {planCases.map((tc: TestCase) => (
                  <tr key={tc.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 text-sm text-muted-foreground">TC-{String(tc.id).padStart(4, "0")}</td>
                    <td className="px-5 py-3">
                      <Link href={`/test-cases/${tc.id}`} className="text-sm text-white hover:text-primary transition-colors">
                        {tc.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={tc.priority} /></td>
                    <td className="px-5 py-3"><StatusBadge status={tc.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
