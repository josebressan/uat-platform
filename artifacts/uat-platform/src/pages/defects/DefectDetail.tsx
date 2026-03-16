import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { useGetDefect, useListDefectComments, useCreateDefectComment, useUpdateDefect } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { ChevronLeft, Bug, MessageSquare, User, Send } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { DefectComment } from "@workspace/api-client-react";

export default function DefectDetail() {
  const [, params] = useRoute("/defects/:id");
  const id = params?.id ? parseInt(params.id) : 0;

  const { data: defect, isLoading } = useGetDefect(id);
  const { data: comments = [] } = useListDefectComments(id);
  const addComment = useCreateDefectComment();
  const updateDefect = useUpdateDefect();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [newStatus, setNewStatus] = useState("");

  if (isLoading) return <AppLayout><div className="p-12 text-center text-muted-foreground">Loading defect...</div></AppLayout>;
  if (!defect) return <AppLayout><div className="p-12 text-center text-red-400">Defect not found</div></AppLayout>;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addComment.mutateAsync({
      id,
      data: { content: newComment, authorId: 1 }
    });
    setNewComment("");
    queryClient.invalidateQueries({ queryKey: [`/api/defects/${id}/comments`] });
  };

  const handleStatusChange = async (status: string) => {
    await updateDefect.mutateAsync({
      id,
      data: { status }
    });
    queryClient.invalidateQueries({ queryKey: [`/api/defects/${id}`] });
    queryClient.invalidateQueries({ queryKey: ["/api/defects"] });
  };

  const severityColor: Record<string, string> = {
    Critical: "text-red-400",
    High: "text-orange-400",
    Medium: "text-yellow-400",
    Low: "text-blue-400",
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link href="/defects" className="hover:text-white flex items-center transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" /> Defects
            </Link>
            <span>/</span>
            <span className="text-white">DEF-{id}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Bug className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{defect.title}</h1>
                <p className="text-sm text-muted-foreground">DEF-{id} &middot; Reported {formatDate(defect.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={defect.status} />
              <StatusBadge status={defect.severity} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Description</h3>
              <p className="text-white text-sm leading-relaxed">{defect.description}</p>
            </div>

            {defect.rootCause && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Root Cause</h3>
                <p className="text-white text-sm">{defect.rootCause}</p>
              </div>
            )}

            <div className="bg-card border border-border rounded-xl">
              <div className="p-5 border-b border-border flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-white">Comments ({comments.length})</h3>
              </div>
              <div className="divide-y divide-border">
                {comments.map((c: DefectComment) => (
                  <div key={c.id} className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-white">{c.authorName}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-9">{c.content}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-white placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-all"
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Details</h3>
              <div>
                <div className="text-xs text-muted-foreground">Severity</div>
                <div className={`text-sm font-medium ${severityColor[defect.severity] || "text-white"}`}>{defect.severity}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Priority</div>
                <div className="text-sm font-medium text-white">{defect.priority}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Assigned To</div>
                <div className="text-sm font-medium text-white">{defect.assigneeName || "Unassigned"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Last Updated</div>
                <div className="text-sm font-medium text-white">{formatDate(defect.updatedAt)}</div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Update Status</h3>
              {["New", "In Progress", "Ready for Retest", "Closed", "Deferred"].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={defect.status === s}
                  className={`w-full px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                    defect.status === s
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-background border border-border text-muted-foreground hover:text-white hover:border-primary/50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
