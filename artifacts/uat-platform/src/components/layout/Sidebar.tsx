import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Rocket, 
  RefreshCw, 
  ClipboardList, 
  FlaskConical,
  PlayCircle,
  Bug,
  CheckSquare,
  BarChart3,
  Settings
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/releases", label: "Releases", icon: Rocket },
  { href: "/test-cycles", label: "Test Cycles", icon: RefreshCw },
  { href: "/test-plans", label: "Test Plans", icon: ClipboardList },
  { href: "/test-cases", label: "Test Case Library", icon: FlaskConical },
  { href: "/executions", label: "My Executions", icon: PlayCircle },
  { href: "/defects", label: "Defects", icon: Bug },
  { href: "/approvals", label: "Approvals", icon: CheckSquare },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 h-screen border-r border-border bg-sidebar flex flex-col fixed left-0 top-0 z-40 shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <img 
          src={`${import.meta.env.BASE_URL}images/logo.png`} 
          alt="UAT Platform Logo" 
          className="w-8 h-8 mr-3 object-contain"
        />
        <span className="font-bold text-lg tracking-tight text-white">UAT<span className="text-primary">Sync</span></span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-3">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className="block">
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary/20">
            JD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">John Doe</span>
            <span className="text-xs text-muted-foreground">QA Manager</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
