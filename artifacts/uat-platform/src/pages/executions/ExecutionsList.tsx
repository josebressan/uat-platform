import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { useListTestExecutions } from "@workspace/api-client-react";
import { PlayCircle, Search, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function ExecutionsList() {
  const { data: executions, isLoading } = useListTestExecutions({});

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">My Executions</h1>
          <p className="text-muted-foreground mt-1">Test cases assigned to you for execution.</p>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border flex gap-4 bg-muted/20">
             <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search executions..." 
                className="w-full bg-background border border-border h-10 rounded-lg pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>
            <select className="bg-background border border-border h-10 rounded-lg px-4 text-sm outline-none text-foreground w-40">
              <option value="">Status: All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-4">Exec ID</th>
                  <th className="px-6 py-4">Test Case Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Result</th>
                  <th className="px-6 py-4">Executed Date</th>
                  <th className="px-6 py-4 text-right">Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading executions...</td></tr>
                ) : executions?.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No executions assigned.</td></tr>
                ) : (
                  executions?.map((exec) => (
                    <tr key={exec.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">EXE-{exec.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{exec.testCaseTitle || `Test Case #${exec.testCaseId}`}</div>
                        <div className="text-xs text-muted-foreground mt-1">Cycle #{exec.testCycleId}</div>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={exec.status} size="sm"/></td>
                      <td className="px-6 py-4">
                         {exec.result ? <StatusBadge status={exec.result} size="sm"/> : '-'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {exec.executedAt ? formatDate(exec.executedAt) : '--'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/executions/${exec.id}`}>
                          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg transition-all font-medium border border-primary/20 hover:border-primary shadow-sm">
                            <PlayCircle className="w-4 h-4" />
                            {exec.status === 'Completed' ? 'View' : 'Execute'}
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
