import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useGetTestCase } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, Clock, User, ListChecks, History, AlertCircle } from "lucide-react";

export default function TestCaseDetail() {
  const [, params] = useRoute("/test-cases/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  
  const { data: testCase, isLoading } = useGetTestCase(id);

  if (isLoading) return <AppLayout><div className="p-12 text-center text-muted-foreground">Loading test case...</div></AppLayout>;
  if (!testCase) return <AppLayout><div className="p-12 text-center text-red-400">Test Case not found</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Link href="/test-cases" className="hover:text-white flex items-center"><ChevronLeft className="w-4 h-4 mr-1" /> Library</Link>
          <span>/</span>
          <span>TC-{testCase.id.toString().padStart(4, '0')}</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start gap-6 border-l-4 border-l-primary">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-mono font-bold tracking-widest">TC-{testCase.id.toString().padStart(4,'0')}</span>
              <StatusBadge status={testCase.status} size="sm" />
              <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${testCase.priority === 'High' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-amber-500/30 text-amber-400 bg-amber-500/10'}`}>
                {testCase.priority} Priority
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{testCase.title}</h1>
            <p className="text-muted-foreground text-sm">{testCase.description}</p>
            
            <div className="grid grid-cols-2 gap-y-2 text-sm mt-4">
              {testCase.preconditions && (
                <div className="col-span-2">
                  <strong className="text-white block mb-1">Preconditions:</strong>
                  <div className="bg-background/50 p-3 rounded border border-border text-muted-foreground">{testCase.preconditions}</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            <div className="bg-background/50 border border-border p-4 rounded-xl space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="w-4 h-4"/> Est. Time</span>
                <span className="text-white font-medium">{testCase.estimatedMinutes || '--'} mins</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><User className="w-4 h-4"/> Assignee</span>
                <span className="text-white font-medium">{testCase.assigneeName || 'Unassigned'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><AlertCircle className="w-4 h-4"/> Complexity</span>
                <span className="text-white font-medium">{testCase.complexity}</span>
              </div>
            </div>
            <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium shadow shadow-primary/20 hover:bg-primary/90 transition-all">
              Execute Now
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-white">Test Steps</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-4 py-3 w-12 text-center">#</th>
                <th className="px-4 py-3 w-1/3">Action</th>
                <th className="px-4 py-3 w-1/3">Expected Result</th>
                <th className="px-4 py-3">Test Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {testCase.steps.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No steps defined.</td></tr>
              ) : (
                testCase.steps.sort((a,b)=>a.stepNumber-b.stepNumber).map(step => (
                  <tr key={step.id} className="hover:bg-muted/10">
                    <td className="px-4 py-4 text-center font-mono text-muted-foreground">{step.stepNumber}</td>
                    <td className="px-4 py-4 text-white leading-relaxed">{step.action}</td>
                    <td className="px-4 py-4 text-muted-foreground leading-relaxed">{step.expectedResult}</td>
                    <td className="px-4 py-4 text-muted-foreground font-mono text-xs bg-background/30 rounded p-2 m-2 inline-block border border-border/50">
                      {step.testData || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
