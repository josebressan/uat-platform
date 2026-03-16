import { AppLayout } from "@/components/layout/AppLayout";
import { useListDefects, useCreateDefect } from "@workspace/api-client-react";
import { Plus, Bug, Search, Filter, AlertCircle, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useQueryClient } from "@tanstack/react-query";

export default function DefectsBoard() {
  const { data: defects, isLoading } = useListDefects({});
  const createMutation = useCreateDefect();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "", description: "", severity: "Medium", priority: "Medium"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({ data: formData });
    queryClient.invalidateQueries({ queryKey: ["/api/defects"] });
    setIsDialogOpen(false);
    setFormData({ title: "", description: "", severity: "Medium", priority: "Medium" });
  };

  const columns = ["New", "In Progress", "Ready for Retest", "Closed"];

  const getSeverityColor = (sev: string) => {
    switch(sev.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Bug className="w-8 h-8 text-red-500" /> Defect Tracker
            </h1>
          </div>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> Log Defect
          </button>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
          {columns.map(col => {
            const colDefects = defects?.filter(d => d.status === col) || [];
            return (
              <div key={col} className="w-[350px] shrink-0 flex flex-col bg-muted/10 rounded-2xl border border-border/50">
                <div className="p-4 border-b border-border/50 flex justify-between items-center bg-card/30 rounded-t-2xl">
                  <h3 className="font-semibold text-white tracking-tight">{col}</h3>
                  <span className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-xs font-bold text-muted-foreground">{colDefects.length}</span>
                </div>
                
                <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                  {colDefects.map(defect => (
                    <Link key={defect.id} href={`/defects/${defect.id}`}>
                      <div className="glass-panel p-4 rounded-xl cursor-pointer hover:border-primary/50 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-mono text-muted-foreground">DEF-{defect.id}</span>
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getSeverityColor(defect.severity)}`}>
                            {defect.severity}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-white mb-3 group-hover:text-primary transition-colors leading-snug">
                          {defect.title}
                        </h4>
                        <div className="flex justify-between items-center mt-4">
                           <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-white" title={defect.assigneeName || 'Unassigned'}>
                             {defect.assigneeName ? defect.assigneeName.charAt(0) : '?'}
                           </div>
                           <div className="flex items-center gap-1 text-muted-foreground text-xs">
                             <MessageSquare className="w-3.5 h-3.5" /> 0
                           </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {colDefects.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-sm text-muted-foreground/50">
                      Drop defects here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><Bug className="w-5 h-5 text-red-500"/> Log New Defect</h2>
              <button onClick={() => setIsDialogOpen(false)} className="text-muted-foreground hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none" placeholder="Brief summary of issue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none resize-none" placeholder="Steps to reproduce, expected vs actual..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Severity</label>
                  <select required value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none">
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Priority</label>
                  <select required value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none">
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
                <button type="button" onClick={() => setIsDialogOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50">
                  {createMutation.isPending ? "Logging..." : "Log Defect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
