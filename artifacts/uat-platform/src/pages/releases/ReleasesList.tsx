import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { useListReleases, useCreateRelease } from "@workspace/api-client-react";
import { Plus, Search, Calendar, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export default function ReleasesList() {
  const { data: releases, isLoading } = useListReleases();
  const createMutation = useCreateRelease();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "", description: "", startDate: "", endDate: "", status: "Planning"
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
    queryClient.invalidateQueries({ queryKey: ["/api/releases"] });
    setIsDialogOpen(false);
    setFormData({ name: "", description: "", startDate: "", endDate: "", status: "Planning" });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Releases</h1>
            <p className="text-muted-foreground mt-1">Manage software releases and deployment schedules.</p>
          </div>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Create Release
          </button>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border flex gap-4 bg-muted/20">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search releases..." 
                className="w-full bg-background border border-border h-10 rounded-lg pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>
            <select className="bg-background border border-border h-10 rounded-lg px-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-foreground">
              <option value="">All Statuses</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg">Release Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Start Date</th>
                  <th className="px-6 py-4">End Date</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4 text-right rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading releases...</td>
                  </tr>
                ) : releases?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No releases found. Create one to get started.</td>
                  </tr>
                ) : (
                  releases?.map((release) => (
                    <tr key={release.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white group-hover:text-primary transition-colors">{release.name}</div>
                        <div className="text-muted-foreground text-xs mt-1 truncate max-w-[250px]">{release.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={release.status} />
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(release.startDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(release.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {release.ownerName || "Unassigned"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/releases/${release.id}`}>
                          <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                            <ChevronRight className="w-5 h-5" />
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

      {/* Create Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="text-lg font-bold text-white">Create New Release</h2>
              <button onClick={() => setIsDialogOpen(false)} className="text-muted-foreground hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Release Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Q3 Major Update" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none" placeholder="Scope of this release..."></textarea>
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
                <button type="button" onClick={() => setIsDialogOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {createMutation.isPending ? "Creating..." : "Create Release"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
