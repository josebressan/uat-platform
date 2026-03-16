import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useListTestPlans } from "@workspace/api-client-react";
import { ClipboardList, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import type { TestPlan } from "@workspace/api-client-react";

export default function TestPlansList() {
  const { data: plans = [], isLoading } = useListTestPlans();
  const [search, setSearch] = useState("");

  const filtered = plans.filter((p: TestPlan) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.module ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Test Plans</h1>
            <p className="text-muted-foreground mt-1">Organize and scope testing activities by module.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
            <Plus className="w-4 h-4" /> New Test Plan
          </button>
        </div>

        <div className="bg-card border border-border rounded-xl">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search test plans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-white placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading test plans...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-sm text-muted-foreground">
                  <th className="text-left px-5 py-3 font-medium">Plan Name</th>
                  <th className="text-left px-5 py-3 font-medium">Module</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Owner</th>
                  <th className="text-left px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((plan: TestPlan) => (
                  <tr key={plan.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <ClipboardList className="w-4 h-4 text-primary" />
                        <div>
                          <div className="font-medium text-white">{plan.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{plan.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{plan.module}</td>
                    <td className="px-5 py-4"><StatusBadge status={plan.status} /></td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{plan.ownerName}</td>
                    <td className="px-5 py-4">
                      <Link href={`/test-plans/${plan.id}`} className="text-sm text-primary hover:underline">
                        View details
                      </Link>
                    </td>
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
