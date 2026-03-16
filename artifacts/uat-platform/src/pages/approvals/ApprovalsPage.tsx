import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useListApprovals, useUpdateApproval } from "@workspace/api-client-react";
import type { Approval } from "@workspace/api-client-react";
import { CheckCircle, XCircle, AlertTriangle, Clock, FileCheck } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

function formatDate(d: string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function ApprovalsPage() {
  const { data: approvals = [], isLoading } = useListApprovals();
  const updateMutation = useUpdateApproval();
  const queryClient = useQueryClient();
  const [actionId, setActionId] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [conditions, setConditions] = useState("");

  const pending = approvals.filter((a: Approval) => a.status === "Pending");
  const decided = approvals.filter((a: Approval) => a.status !== "Pending");

  const handleDecision = async (id: number, status: string) => {
    await updateMutation.mutateAsync({
      id,
      data: { status, comments, conditions }
    });
    setActionId(null);
    setComments("");
    setConditions("");
    queryClient.invalidateQueries({ queryKey: ["/api/approvals"] });
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "Approved": return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "Rejected": return <XCircle className="w-5 h-5 text-red-500" />;
      case "Conditionally Approved": return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FileCheck className="w-8 h-8 text-primary" />
              UAT Sign-off Approvals
            </h1>
            <p className="text-muted-foreground mt-1">Review and approve modules and releases for go-live.</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Pending Approvals ({pending.length})
          </h2>
          {isLoading ? (
            <div className="text-muted-foreground text-center py-8">Loading...</div>
          ) : pending.length === 0 ? (
            <div className="border border-border rounded-xl p-8 text-center text-muted-foreground">
              No pending approvals
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((a: Approval) => (
                <div key={a.id} className="border border-border bg-card rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {statusIcon(a.status)}
                      <div>
                        <div className="font-semibold text-white">{a.module}</div>
                        <div className="text-sm text-muted-foreground">
                          <StatusBadge status={a.type} /> &middot; Approver: {a.approverName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {actionId === a.id ? (
                        <div className="flex flex-col gap-2 w-80">
                          <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Comments..."
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-white resize-none"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDecision(a.id, "Approved")}
                              className="flex-1 px-3 py-1.5 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDecision(a.id, "Conditionally Approved")}
                              className="flex-1 px-3 py-1.5 bg-yellow-500 text-black text-sm rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                              Conditional
                            </button>
                            <button
                              onClick={() => handleDecision(a.id, "Rejected")}
                              className="flex-1 px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => { setActionId(null); setComments(""); }}
                              className="px-3 py-1.5 border border-border text-sm rounded-lg text-muted-foreground hover:text-white transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActionId(a.id)}
                          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Decided ({decided.length})
          </h2>
          {decided.length === 0 ? (
            <div className="border border-border rounded-xl p-8 text-center text-muted-foreground">
              No decisions made yet
            </div>
          ) : (
            <div className="space-y-3">
              {decided.map((a: Approval) => (
                <div key={a.id} className="border border-border bg-card rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {statusIcon(a.status)}
                      <div>
                        <div className="font-semibold text-white">{a.module}</div>
                        <div className="text-sm text-muted-foreground">
                          <StatusBadge status={a.type} /> &middot; {a.approverName} &middot; {formatDate(a.decidedAt)}
                        </div>
                        {a.comments && (
                          <p className="text-sm text-muted-foreground mt-1 italic">"{a.comments}"</p>
                        )}
                        {a.conditions && (
                          <p className="text-xs text-yellow-500 mt-1">Condition: {a.conditions}</p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
