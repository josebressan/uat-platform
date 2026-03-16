import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useListTestCases } from "@workspace/api-client-react";
import { Search, Filter, Play, Edit3, Bug, ListTree } from "lucide-react";
import { Link } from "wouter";

export default function TestCasesList() {
  // Pass empty object to get all test cases
  const { data: testCases, isLoading } = useListTestCases({});

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Test Case Library</h1>
            <p className="text-muted-foreground mt-1">Central repository of all test cases across modules.</p>
          </div>
          <button className="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-all flex items-center gap-2">
            <ListTree className="w-4 h-4" /> Import Excel
          </button>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex flex-wrap gap-4 bg-muted/20 items-center">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search test cases by title or ID..." 
                className="w-full bg-background border border-border h-10 rounded-lg pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>
            <select className="bg-background border border-border h-10 rounded-lg px-3 text-sm outline-none text-foreground w-36">
              <option value="">Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select className="bg-background border border-border h-10 rounded-lg px-3 text-sm outline-none text-foreground w-36">
              <option value="">Status</option>
              <option value="Draft">Draft</option>
              <option value="Approved">Approved</option>
              <option value="Deprecated">Deprecated</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border whitespace-nowrap">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Title & Details</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Exec Result</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading test cases...</td></tr>
                ) : testCases?.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No test cases found.</td></tr>
                ) : (
                  testCases?.map((tc) => (
                    <tr key={tc.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4 font-mono text-muted-foreground text-xs">TC-{tc.id.toString().padStart(4, '0')}</td>
                      <td className="px-6 py-4">
                        <Link href={`/test-cases/${tc.id}`}>
                          <span className="font-medium text-white group-hover:text-primary transition-colors cursor-pointer block mb-1">
                            {tc.title}
                          </span>
                        </Link>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Scen-{tc.scenarioId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold uppercase tracking-wider ${tc.priority === 'High' ? 'text-red-400' : tc.priority === 'Medium' ? 'text-amber-400' : 'text-blue-400'}`}>
                          {tc.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={tc.status} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        {tc.lastExecutionStatus ? (
                          <StatusBadge status={tc.lastExecutionStatus} size="sm" />
                        ) : (
                          <span className="text-muted-foreground text-xs italic">Never run</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <button title="Edit" className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-white transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <Link href={`/test-cases/${tc.id}`}>
                            <button title="View Details" className="w-8 h-8 rounded flex items-center justify-center text-primary bg-primary/10 hover:bg-primary hover:text-white transition-colors">
                              <Play className="w-4 h-4 ml-0.5" />
                            </button>
                          </Link>
                        </div>
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
