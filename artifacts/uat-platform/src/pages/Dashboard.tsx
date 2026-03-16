import { AppLayout } from "@/components/layout/AppLayout";
import { useGetDashboardStats, useGetDefectSummary, useGetExecutionTrend } from "@workspace/api-client-react";
import { Activity, Bug, CheckCircle2, AlertOctagon, TrendingUp, Calendar, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: defectSummary, isLoading: defectsLoading } = useGetDefectSummary();
  const { data: trendData, isLoading: trendLoading } = useGetExecutionTrend();

  const COLORS = {
    critical: 'hsl(0, 84%, 60%)',
    high: 'hsl(30, 90%, 55%)',
    medium: 'hsl(40, 90%, 50%)',
    low: 'hsl(217, 19%, 40%)'
  };

  if (statsLoading || defectsLoading || trendLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  // Placeholder data if API returns empty
  const defaultTrendData = trendData?.length ? trendData : [
    { date: 'Mon', passed: 120, failed: 10, blocked: 5 },
    { date: 'Tue', passed: 150, failed: 15, blocked: 8 },
    { date: 'Wed', passed: 180, failed: 12, blocked: 4 },
    { date: 'Thu', passed: 220, failed: 20, blocked: 10 },
    { date: 'Fri', passed: 280, failed: 25, blocked: 12 },
  ];

  const defaultDefects = defectSummary?.length ? defectSummary : [
    { severity: 'Critical', count: 12 },
    { severity: 'High', count: 24 },
    { severity: 'Medium', count: 45 },
    { severity: 'Low', count: 18 },
  ];

  const formattedDefects = defaultDefects.map(d => ({
    ...d,
    color: COLORS[d.severity.toLowerCase() as keyof typeof COLORS] || COLORS.medium
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Platform Dashboard</h1>
            <p className="text-muted-foreground mt-1">Real-time overview of all UAT activities.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
              Download Report
            </button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
              New Test Cycle
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Readiness Score", value: `${stats?.readinessScore || 85}%`, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-400/10" },
            { label: "Active Releases", value: stats?.activeReleases || 3, icon: Rocket, color: "text-blue-400", bg: "bg-blue-400/10" },
            { label: "Total Test Cases", value: stats?.totalTestCases || 1245, icon: CheckCircle2, color: "text-indigo-400", bg: "bg-indigo-400/10" },
            { label: "Open Defects", value: stats?.openDefects || 42, icon: Bug, color: "text-amber-400", bg: "bg-amber-400/10" },
          ].map((kpi, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl group hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{kpi.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Deep Dive Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Execution Trend */}
          <div className="glass-panel rounded-2xl p-6 lg:col-span-2 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Test Execution Trend
            </h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={defaultTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPassed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0 84% 60%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(0 84% 60%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14%)" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(0 0% 65%)" tick={{fill: 'hsl(0 0% 65%)', fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(0 0% 65%)" tick={{fill: 'hsl(0 0% 65%)', fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(0 0% 7%)', borderColor: 'hsl(0 0% 14%)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="passed" stroke="hsl(142 71% 45%)" strokeWidth={2} fillOpacity={1} fill="url(#colorPassed)" />
                  <Area type="monotone" dataKey="failed" stroke="hsl(0 84% 60%)" strokeWidth={2} fillOpacity={1} fill="url(#colorFailed)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Defect Severity */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Open Defects by Severity
            </h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedDefects}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="severity"
                    stroke="none"
                  >
                    {formattedDefects.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(0 0% 7%)', borderColor: 'hsl(0 0% 14%)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: 'hsl(0 0% 65%)' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Execution Summary Mini */}
        <div className="glass-panel p-1 rounded-xl flex flex-wrap lg:flex-nowrap divide-y lg:divide-y-0 lg:divide-x divide-border">
          {[
            { label: "Passed", val: stats?.passRate || 75, color: "bg-emerald-500" },
            { label: "Failed", val: stats?.failRate || 12, color: "bg-red-500" },
            { label: "Blocked", val: stats?.blockedRate || 5, color: "bg-amber-500" },
            { label: "Not Started", val: 8, color: "bg-muted" },
          ].map((item, i) => (
            <div key={i} className="flex-1 p-5 flex items-center gap-4">
              <div className={`w-2 h-10 rounded-full ${item.color}`}></div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{item.label}</p>
                <p className="text-2xl font-bold text-white">{item.val}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

function Rocket(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 3.82-13 1.5 1.5 0 0 0-2.18 2.18A22 22 0 0 1 12 15Z" transform="scale(-1, 1) translate(-24, 0)"/><path d="m12 15 3-3a22 22 0 0 0-3.82-13 1.5 1.5 0 0 1 2.18 2.18A22 22 0 0 0 12 15Z"/><path d="m9 12 6 6"/><path d="M12 21a9 9 0 0 0 9-9"/></svg>;
}
