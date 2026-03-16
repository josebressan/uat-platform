import { AppLayout } from "@/components/layout/AppLayout";
import { useGetDashboardStats, useGetDefectSummary, useGetExecutionTrend } from "@workspace/api-client-react";
import { BarChart3, Download, PieChart, TrendingUp, FileText } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Legend, LineChart, Line } from "recharts";

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#6366f1", "#8b5cf6"];

export default function ReportsPage() {
  const { data: stats } = useGetDashboardStats();
  const { data: defectSummary } = useGetDefectSummary();
  const { data: execTrend } = useGetExecutionTrend();
  const defectChartData = defectSummary
    ? Object.entries(defectSummary).map(([name, value]) => ({ name, value: Number(value) }))
    : [];

  const trendData = execTrend
    ? (Array.isArray(execTrend) ? execTrend : []).map((t) => ({
        date: String(t.date || ""),
        passed: Number(t.passed || 0),
        failed: Number(t.failed || 0),
      }))
    : [];

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground mt-1">Comprehensive test execution and quality metrics.</p>
          </div>
          <button className="flex items-center gap-2 bg-card border border-border text-white px-5 py-2.5 rounded-xl font-medium hover:bg-muted/30 transition-all">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Test Cases", value: stats?.totalTestCases || 0, icon: FileText, color: "text-blue-400" },
            { label: "Pass Rate", value: `${stats?.readinessScore || 0}%`, icon: TrendingUp, color: "text-emerald-400" },
            { label: "Active Releases", value: stats?.activeReleases || 0, icon: BarChart3, color: "text-purple-400" },
            { label: "Open Defects", value: stats?.openDefects || 0, icon: PieChart, color: "text-red-400" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{kpi.label}</span>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className="text-2xl font-bold text-white">{kpi.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Execution Trend
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip contentStyle={{ background: "#1e1e2e", border: "1px solid #333", borderRadius: 8 }} />
                <Line type="monotone" dataKey="passed" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-yellow-500" />
              Defects by Severity
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <RechartsPie>
                <Pie data={defectChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {defectChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e1e2e", border: "1px solid #333", borderRadius: 8 }} />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
