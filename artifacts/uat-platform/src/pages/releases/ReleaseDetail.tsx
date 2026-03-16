import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { useGetRelease } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { Calendar, CheckCircle2, ChevronLeft, BarChart3, Clock, Rocket, Bug } from "lucide-react";
import { Link } from "wouter";

export default function ReleaseDetail() {
  const [, params] = useRoute("/releases/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  
  const { data: release, isLoading } = useGetRelease(id);

  if (isLoading) {
    return <AppLayout><div className="text-center p-12 text-muted-foreground">Loading release details...</div></AppLayout>;
  }

  if (!release) {
    return <AppLayout><div className="text-center p-12 text-red-400">Release not found.</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Breadcrumb & Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link href="/releases" className="hover:text-white flex items-center transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" /> Releases
            </Link>
            <span>/</span>
            <span className="text-primary font-medium">{release.name}</span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">{release.name}</h1>
              <p className="text-muted-foreground mt-1 max-w-2xl">{release.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={release.status} size="lg" />
              <button className="px-4 py-2 border border-border bg-card text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                Edit Release
              </button>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Test Cycles</p>
              <p className="text-2xl font-bold text-white leading-none mt-1">{release.stats.totalCycles}</p>
            </div>
          </div>
          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pass Rate</p>
              <p className="text-2xl font-bold text-white leading-none mt-1">{release.stats.passRate}%</p>
            </div>
          </div>
          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Tests</p>
              <p className="text-2xl font-bold text-white leading-none mt-1">{release.stats.totalTestCases}</p>
            </div>
          </div>
          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Bug className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Open Defects</p>
              <p className="text-2xl font-bold text-white leading-none mt-1">{release.stats.openDefects}</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Content - Test Cycles */}
          <div className="xl:col-span-2 space-y-6">
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-border flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Test Cycles</h3>
                <Link href={`/test-cycles?releaseId=${release.id}`}>
                  <button className="text-sm text-primary hover:text-primary/80 font-medium">View All</button>
                </Link>
              </div>
              <div className="divide-y divide-border">
                {release.testCycles.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No test cycles created yet.</div>
                ) : (
                  release.testCycles.map(cycle => (
                    <div key={cycle.id} className="p-5 hover:bg-muted/20 transition-colors flex items-center justify-between group">
                      <div>
                        <Link href={`/test-cycles/${cycle.id}`} className="text-base font-semibold text-white group-hover:text-primary transition-colors">
                          {cycle.name}
                        </Link>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-secondary text-secondary-foreground">{cycle.type}</span>
                        </div>
                      </div>
                      <StatusBadge status={cycle.status} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Release Details</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">Owner</span>
                  <span className="text-white font-medium flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-bold">
                      {release.ownerName ? release.ownerName.charAt(0) : 'U'}
                    </div>
                    {release.ownerName || 'Unassigned'}
                  </span>
                </div>
                <div className="h-px bg-border my-2"></div>
                <div>
                  <span className="text-muted-foreground block mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Start Date</span>
                  <span className="text-white font-medium">{formatDate(release.startDate)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> End Date</span>
                  <span className="text-white font-medium">{formatDate(release.endDate)}</span>
                </div>
                {release.goLiveDate && (
                  <div>
                    <span className="text-primary/80 block mb-1 flex items-center gap-1.5"><Rocket className="w-3.5 h-3.5"/> Go Live Target</span>
                    <span className="text-primary font-bold">{formatDate(release.goLiveDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
