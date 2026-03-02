import { useLisAuth } from "@/context/LisAuthContext";
import {
  Activity,
  BarChart3,
  ChevronRight,
  ClipboardList,
  Cpu,
  Database,
  FileText,
  LogOut,
  MonitorSpeaker,
  Network,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

type NavItem = {
  label: string;
  hash: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    hash: "#/dashboard",
    icon: <BarChart3 className="w-4 h-4" />,
  },
  { label: "Machines", hash: "#/machines", icon: <Cpu className="w-4 h-4" /> },
  {
    label: "LDMS Software",
    hash: "#/ldms",
    icon: <MonitorSpeaker className="w-4 h-4" />,
  },
  {
    label: "Test Parameters",
    hash: "#/parameters",
    icon: <ClipboardList className="w-4 h-4" />,
  },
  {
    label: "Patient Registry",
    hash: "#/patients",
    icon: <Users className="w-4 h-4" />,
  },
  {
    label: "Results",
    hash: "#/results",
    icon: <Activity className="w-4 h-4" />,
  },
  {
    label: "Transfer Log",
    hash: "#/logs",
    icon: <FileText className="w-4 h-4" />,
  },
];

interface SidebarProps {
  currentHash: string;
}

export function Sidebar({ currentHash }: SidebarProps) {
  const { logout } = useLisAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center animate-pulse-glow">
          <Network className="w-4 h-4 text-primary" />
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="overflow-hidden"
          >
            <p className="text-sm font-bold text-sidebar-foreground tracking-wide">
              LIS Connect
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              Lab Connectivity Hub
            </p>
          </motion.div>
        )}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto text-muted-foreground hover:text-sidebar-foreground transition-colors"
          aria-label="Toggle sidebar"
          data-ocid="sidebar.toggle"
        >
          <motion.div animate={{ rotate: isCollapsed ? 0 : 180 }}>
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </button>
      </div>

      {/* Status indicator */}
      {!isCollapsed && (
        <div className="px-4 py-2 mx-2 mt-2 rounded-md bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[oklch(0.7_0.18_145)] animate-pulse" />
            <span className="text-xs text-primary font-medium">
              System Online
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = currentHash === item.hash;
            return (
              <li key={item.hash}>
                <a
                  href={item.hash}
                  data-ocid={`nav.${item.label.toLowerCase().replace(/\s+/g, "_")}.link`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group relative ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary"
                    />
                  )}
                  <span
                    className={
                      isActive
                        ? "text-primary"
                        : "group-hover:text-primary/70 transition-colors"
                    }
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        {!isCollapsed && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/30">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                Administrator
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Full Access
              </p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          data-ocid="nav.logout.button"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all duration-150"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
        {!isCollapsed && (
          <div className="px-3 pb-1 flex items-center gap-1.5 opacity-40">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-xs text-muted-foreground">v2.1.0</span>
            <Database className="w-3 h-3 ml-1" />
            <span className="text-xs text-muted-foreground">LAN Mode</span>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
