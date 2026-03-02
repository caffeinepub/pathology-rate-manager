import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLisData } from "@/context/LisDataContext";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Cpu,
  MonitorSpeaker,
  Plus,
  Scan,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { SimulateResultDialog } from "./components/SimulateResultDialog";
import { StatusBadge } from "./components/StatusBadge";

export default function Dashboard() {
  const { machines, ldmsList, parameters, patients, results, transferLogs } =
    useLisData();
  const [simulateOpen, setSimulateOpen] = useState(false);

  const activeMachines = machines.filter((m) => m.isActive).length;
  const activeLdms = ldmsList.filter((l) => l.isActive).length;
  const matchedResults = results.filter((r) => r.status === "matched").length;
  const unmatchedResults = results.filter(
    (r) => r.status === "unmatched",
  ).length;
  const transferredResults = results.filter(
    (r) => r.status === "transferred",
  ).length;

  const recentResults = [...results]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 10);

  const recentLogs = [...transferLogs]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 5);

  const stats = [
    {
      title: "Active Machines",
      value: activeMachines,
      total: machines.length,
      icon: <Cpu className="w-5 h-5" />,
      color: "text-primary",
      bg: "bg-primary/10",
      href: "#/machines",
    },
    {
      title: "LDMS Connections",
      value: activeLdms,
      total: ldmsList.length,
      icon: <MonitorSpeaker className="w-5 h-5" />,
      color: "text-[oklch(0.65_0.18_145)]",
      bg: "bg-[oklch(0.65_0.18_145)]/10",
      href: "#/ldms",
    },
    {
      title: "Registered Patients",
      value: patients.length,
      total: patients.length,
      icon: <Users className="w-5 h-5" />,
      color: "text-[oklch(0.7_0.2_45)]",
      bg: "bg-[oklch(0.7_0.2_45)]/10",
      href: "#/patients",
    },
    {
      title: "Test Parameters",
      value: parameters.filter((p) => p.isActive).length,
      total: parameters.length,
      icon: <ClipboardList className="w-5 h-5" />,
      color: "text-[oklch(0.65_0.16_280)]",
      bg: "bg-[oklch(0.65_0.16_280)]/10",
      href: "#/parameters",
    },
  ];

  const resultStats = [
    {
      label: "Matched",
      count: matchedResults,
      sub: "Pending transfer",
      icon: <CheckCircle2 className="w-4 h-4" />,
      cls: "text-[oklch(0.7_0.18_145)]",
      bg: "bg-[oklch(0.7_0.18_145)]/10",
    },
    {
      label: "Unmatched",
      count: unmatchedResults,
      sub: "Needs attention",
      icon: <AlertCircle className="w-4 h-4" />,
      cls: "text-[oklch(0.68_0.2_45)]",
      bg: "bg-[oklch(0.68_0.2_45)]/10",
    },
    {
      label: "Transferred",
      count: transferredResults,
      sub: "To LDMS",
      icon: <ArrowUpRight className="w-4 h-4" />,
      cls: "text-[oklch(0.65_0.16_220)]",
      bg: "bg-[oklch(0.65_0.16_220)]/10",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            LIS Connectivity Overview —{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button
          onClick={() => setSimulateOpen(true)}
          data-ocid="dashboard.simulate.button"
          className="bg-primary text-primary-foreground gap-2"
        >
          <Zap className="w-4 h-4" />
          Simulate Result
        </Button>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <a href={s.href} className="block">
              <Card className="bg-card border-border hover:border-primary/40 transition-colors cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center ${s.color}`}
                    >
                      {s.icon}
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="space-y-0.5">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.title}</p>
                    {s.total > s.value && (
                      <p className="text-xs text-muted-foreground/60">
                        {s.total - s.value} inactive
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </a>
          </motion.div>
        ))}
      </div>

      {/* Result stats */}
      <div className="grid grid-cols-3 gap-4">
        {resultStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.07 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center ${s.cls}`}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <p className={`text-xl font-bold ${s.cls}`}>{s.count}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.label} — {s.sub}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent results */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Recent Results
                </CardTitle>
                <a
                  href="#/results"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View all <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentResults.length === 0 ? (
                <div
                  data-ocid="dashboard.results.empty_state"
                  className="px-6 py-8 text-center text-muted-foreground text-sm"
                >
                  No results yet. Simulate a machine result to get started.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentResults.map((r, idx) => (
                    <div
                      key={r.id}
                      data-ocid={`dashboard.results.item.${idx + 1}`}
                      className="px-5 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-primary/80">
                            {r.barcode}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                          <span className="text-xs text-foreground/80 truncate">
                            {r.testName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {r.machineName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ·
                          </span>
                          <span className="text-xs font-medium text-foreground">
                            {r.resultValue} {r.unit}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right space-y-0.5">
                        <StatusBadge status={r.status} />
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.timestamp).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent transfer logs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Scan className="w-4 h-4 text-primary" />
                  Transfer Log
                </CardTitle>
                <a
                  href="#/logs"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View all <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentLogs.length === 0 ? (
                <div
                  data-ocid="dashboard.logs.empty_state"
                  className="px-6 py-8 text-center text-muted-foreground text-sm"
                >
                  No transfers yet.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentLogs.map((l, idx) => (
                    <div
                      key={l.id}
                      data-ocid={`dashboard.logs.item.${idx + 1}`}
                      className="px-4 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground/90 truncate">
                            {l.patientName || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {l.testName}
                          </p>
                          <p className="text-xs text-muted-foreground/60 truncate">
                            → {l.ldmsName}
                          </p>
                        </div>
                        <div className="flex-shrink-0 space-y-0.5 text-right">
                          <Badge
                            className={`text-xs px-1.5 py-0 ${
                              l.status === "success"
                                ? "badge-matched"
                                : "badge-failed"
                            }`}
                          >
                            {l.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {new Date(l.timestamp).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <SimulateResultDialog
        open={simulateOpen}
        onOpenChange={setSimulateOpen}
      />
    </div>
  );
}
