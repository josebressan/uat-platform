import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { useListTestCycles, useCreateTestCycle, useListReleases } from "@workspace/api-client-react";
import { Plus, Search, Calendar, ChevronRight, Filter } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export default function TestCyclesList() {
  const { data: cycles, isLoading } = useListTestCycles();
  const { data: releases } = useListReleases();
  const createMutation = useCreateTestCycle();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    releaseId: 0, name: "", type: "SIT", startDate: "", endDate: "", status: "Planned"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      data: {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      }
    });
    queryClient.invalidateQueries({ queryKey: ["/api/test-cycles"] });
    setIsDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Test Cycles</h1>
            <p className="text-muted-foreground mt-1">Manage phases of testing (SIT, UAT, Regression).</p>
          </div>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            New Test Cycle
          </button>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex flex-wrap gap-4 bg-muted/20 items-center justify-between">
            <div className="relative flex-1 min-w-[250px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search test cycles..." 
                className="w-full bg-background border border-border h-10 rounded-lg pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 h-10">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select className="bg-transparent text-sm outline-none text-foreground w-32">
                  <option value="">All Types</option>
                  <option value="SIT">SIT</option>
                  <option value="UAT">UAT</option>
                  <option value="Regression">Regression</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg">Cycle Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Release</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Timeline</th>
                  <th className="px-6 py-4 text-right rounded-tr-lg"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading cycles...</td></tr>
                ) : cycles?.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No test cycles found.</td></tr>
                ) : (
                  cycles?.map((cycle) => {
                    const parentRelease = releases?.find(r => r.id === cycle.releaseId);
                    return (
                      <tr key={cycle.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4 font-semibold text-white group-hover:text-primary transition-colors">
                          {cycle.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground text-xs font-bold tracking-wider">{cycle.type}</span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {parentRelease?.name || `Release #${cycle.releaseId}`}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={cycle.status} />
                        </td>
                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                          {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/test-cycles/${cycle.id}`}>
                            <button className="px-3 py-1.5 text-xs font-medium text-white bg-primary/10 hover:bg-primary border border-primary/20 hover:border-primary rounded-lg transition-all">
                              View details
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-lg font-bold text-white">Create Test Cycle</h2>
              <button onClick={() => setIsDialogOpen(false)} className="text-muted-foreground hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Release Target</label>
                <select required value={formData.releaseId} onChange={e => setFormData({...formData, releaseId: parseInt(e.target.value)})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none">
                  <option value={0} disabled>Select a release...</option>
                  {releases?.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Cycle Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none" placeholder="e.g. UAT Cycle 1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Testing Phase (Type)</label>
                <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none">
                  <option value="SIT">SIT (System Integration Testing)</option>
                  <option value="UAT">UAT (User Acceptance Testing)</option>
                  <option value="Regression">Regression</option>
                  <option value="Sanity">Sanity</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Start Date</label>
                  <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">End Date</label>
                  <input required type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none [color-scheme:dark]" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
                <button type="button" onClick={() => setIsDialogOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || formData.releaseId === 0} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50">
                  {createMutation.isPending ? "Creating..." : "Create Cycle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
