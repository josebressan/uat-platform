import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useListUsers } from "@workspace/api-client-react";
import { Settings, Users, Shield, Database, Bell } from "lucide-react";
import { useState } from "react";
import type { User } from "@workspace/api-client-react";

type Tab = "users" | "roles" | "notifications" | "system";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const { data: users = [], isLoading } = useListUsers();

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "users", label: "User Management", icon: Users },
    { key: "roles", label: "Roles & Permissions", icon: Shield },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "system", label: "System", icon: Database },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Admin Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage users, roles, and platform configuration.</p>
        </div>

        <div className="flex gap-2 border-b border-border pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "users" && (
          <div className="bg-card border border-border rounded-xl">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-white">Platform Users</h3>
              <button className="px-4 py-2 bg-primary text-white text-sm rounded-lg font-medium hover:bg-primary/90 transition-colors">
                + Add User
              </button>
            </div>
            {isLoading ? (
              <div className="p-12 text-center text-muted-foreground">Loading users...</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-sm text-muted-foreground">
                    <th className="text-left px-5 py-3 font-medium">Name</th>
                    <th className="text-left px-5 py-3 font-medium">Email</th>
                    <th className="text-left px-5 py-3 font-medium">Role</th>
                    <th className="text-left px-5 py-3 font-medium">Department</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: User) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                            {user.name.split(" ").map((n: string) => n[0]).join("")}
                          </div>
                          <span className="text-sm font-medium text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-5 py-3"><StatusBadge status={user.role} /></td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{user.department || "—"}</td>
                      <td className="px-5 py-3"><StatusBadge status={user.isActive ? "Active" : "Inactive"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "roles" && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-white mb-4">Role Definitions</h3>
            {[
              { role: "Admin", perms: "Full platform access, user management, configuration" },
              { role: "PMO", perms: "Release management, dashboard access, reports, approvals" },
              { role: "QA_Lead", perms: "Test plans, test cycles, execution oversight, defect management" },
              { role: "BA", perms: "Test case authoring, scenario management, sign-off requests" },
              { role: "PO", perms: "UAT approvals, release sign-off, dashboard viewing" },
              { role: "Tester", perms: "Test execution, defect logging, step-level results" },
            ].map((r) => (
              <div key={r.role} className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                <div>
                  <div className="font-medium text-white">{r.role}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{r.perms}</div>
                </div>
                <StatusBadge status={r.role} />
              </div>
            ))}
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-white mb-4">Notification Preferences</h3>
            {[
              { label: "Defect assigned to me", enabled: true },
              { label: "Test execution completed", enabled: true },
              { label: "Approval request received", enabled: true },
              { label: "Release status changed", enabled: false },
              { label: "New comment on my defect", enabled: true },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                <span className="text-sm text-white">{n.label}</span>
                <div className={`w-10 h-6 rounded-full transition-colors ${n.enabled ? "bg-primary" : "bg-muted"} relative`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${n.enabled ? "left-5" : "left-1"}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "system" && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-white mb-4">System Information</h3>
            {[
              { label: "Database", value: "PostgreSQL 16", status: "Connected" },
              { label: "API Server", value: "Express 5", status: "Running" },
              { label: "Frontend", value: "React 19 + Vite", status: "Running" },
              { label: "Total Users", value: String(users.length), status: "Active" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                <div>
                  <div className="text-sm font-medium text-white">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.value}</div>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
