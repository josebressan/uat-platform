import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useGetTestExecution, useUpdateTestExecutionStep, useUpdateTestExecution } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, Play, CheckCircle, XCircle, AlertTriangle, MessageSquare, Save } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

function formatDate(d: string | null | undefined): string {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function ExecutionWorkspace() {
  const [, params] = useRoute("/executions/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  
  const { data: exec, isLoading } = useGetTestExecution(id);
  const stepMutation = useUpdateTestExecutionStep();
  const execMutation = useUpdateTestExecution();
  const queryClient = useQueryClient();

  const [activeStepId, setActiveStepId] = useState<number | null>(null);
  const [actualResult, setActualResult] = useState("");

  if (isLoading) return <AppLayout><div className="p-12 text-center text-muted-foreground">Loading workspace...</div></AppLayout>;
  if (!exec) return <AppLayout><div className="p-12 text-center text-red-400">Execution not found</div></AppLayout>;

  const handleStepAction = async (stepId: number, status: string) => {
    await stepMutation.mutateAsync({
      id: stepId,
      data: { status, actualResult: actualResult || (status === "Passed" ? "As expected" : "") }
    });
    setActualResult("");
    setActiveStepId(null);
    queryClient.invalidateQueries({ queryKey: [`/api/test-executions/${id}`] });
  };

  const handleCompleteExecution = async (result: string) => {
    await execMutation.mutateAsync({
      id,
      data: { status: "Completed", result, executedAt: new Date().toISOString() }
    });
    queryClient.invalidateQueries({ queryKey: [`/api/test-executions/${id}`] });
  };

  const isCompleted = exec.status === "Completed";

  return (
    <AppLayout>
      <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
        {/* Header Strip */}
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             <Link href="/executions" className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 text-white transition-colors">
               <ChevronLeft className="w-5 h-5" />
             </Link>
             <div>
               <div className="text-xs text-muted-foreground font-mono mb-0.5">EXE-{exec.id} • TC-{exec.testCaseId}</div>
               <h1 className="text-xl font-bold text-white leading-none">{exec.testCaseTitle || exec.testCase.title}</h1>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <StatusBadge status={exec.status} />
             {exec.result && <StatusBadge status={exec.result} />}
          </div>
        </div>

        {/* Main Workspace Area */}
        <div className="flex-1 flex gap-4 min-h-0">
          
          {/* Left: Steps List */}
          <div className="w-2/3 glass-panel rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20 shrink-0">
              <h3 className="font-bold text-white">Execution Steps</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {exec.steps.sort((a,b)=>a.stepNumber-b.stepNumber).map(step => {
                const isActive = activeStepId === step.id;
                
                return (
                  <div key={step.id} className={`border rounded-xl transition-all ${isActive ? 'border-primary ring-1 ring-primary/50 shadow-lg shadow-primary/10' : 'border-border bg-card/50'}`}>
                    {/* Step Header / Display */}
                    <div className="p-4 flex gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${step.status === 'Passed' ? 'bg-emerald-500/20 text-emerald-500' : step.status === 'Failed' ? 'bg-red-500/20 text-red-500' : 'bg-muted text-muted-foreground'}`}>
                        {step.stepNumber}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">{step.action}</p>
                        <div className="text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border">
                          <strong className="text-white/70 block mb-1">Expected:</strong>
                          {step.expectedResult}
                        </div>
                        {step.actualResult && !isActive && (
                          <div className="text-sm mt-2 p-3 rounded-lg border border-border bg-muted/30">
                            <strong className="text-white/70 block mb-1">Actual:</strong>
                            <span className={step.status === 'Failed' ? 'text-red-400' : 'text-emerald-400'}>{step.actualResult}</span>
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-2">
                        {!isCompleted && !isActive && (
                          <button 
                            onClick={() => setActiveStepId(step.id)}
                            className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-white rounded text-sm font-medium transition-colors"
                          >
                            Record Result
                          </button>
                        )}
                        {step.status !== 'Pending' && <StatusBadge status={step.status} size="sm" />}
                      </div>
                    </div>

                    {/* Active Input Area */}
                    {isActive && (
                      <div className="p-4 border-t border-border bg-background/50 rounded-b-xl animate-in slide-in-from-top-2">
                        <label className="block text-sm font-medium text-white mb-2">Actual Result / Notes</label>
                        <textarea 
                          rows={3} 
                          className="w-full bg-card border border-border rounded-lg p-3 text-sm text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none mb-4"
                          placeholder="What actually happened? (Required for failure)"
                          value={actualResult}
                          onChange={(e) => setActualResult(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                          <button onClick={() => setActiveStepId(null)} className="px-4 py-2 text-sm text-muted-foreground hover:text-white">Cancel</button>
                          <button 
                            onClick={() => handleStepAction(step.id, 'Failed')}
                            disabled={!actualResult}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" /> Fail Step
                          </button>
                          <button 
                            onClick={() => handleStepAction(step.id, 'Passed')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5"
                          >
                            <CheckCircle className="w-4 h-4" /> Pass Step
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Info & Final Signoff */}
          <div className="w-1/3 flex flex-col gap-4">
            <div className="glass-panel p-5 rounded-xl">
              <h3 className="font-bold text-white mb-4">Preconditions</h3>
              <div className="text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border">
                {exec.testCase.preconditions || "No preconditions specified."}
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl flex-1 flex flex-col">
              <h3 className="font-bold text-white mb-4">Execution Summary</h3>
              
              {!isCompleted ? (
                <div className="mt-auto p-4 border border-primary/30 bg-primary/5 rounded-xl text-center space-y-4">
                  <p className="text-sm text-muted-foreground">Once all steps are completed, sign off on the execution.</p>
                  <div className="flex gap-3 justify-center">
                    <button 
                      onClick={() => handleCompleteExecution('Failed')}
                      className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg text-sm shadow-lg shadow-red-500/20 hover:-translate-y-0.5 transition-all"
                    >
                      Mark Failed
                    </button>
                    <button 
                      onClick={() => handleCompleteExecution('Passed')}
                      className="px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg text-sm shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all"
                    >
                      Mark Passed
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-auto p-6 border border-border bg-background rounded-xl text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h4 className="text-lg font-bold text-white mb-1">Execution Completed</h4>
                  <p className="text-sm text-muted-foreground mb-4">Saved on {formatDate(exec.executedAt)}</p>
                  <button className="text-primary text-sm hover:underline font-medium">Reopen Execution</button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
