import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLisData } from "@/context/LisDataContext";
import { Download, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { TransferStatusBadge } from "./components/StatusBadge";

export default function TransferLogsPage() {
  const { transferLogs, ldmsList, machines } = useLisData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ldmsFilter, setLdmsFilter] = useState("all");
  const [machineFilter, setMachineFilter] = useState("all");

  const filtered = useMemo(() => {
    return [...transferLogs]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .filter((l) => {
        const matchStatus = statusFilter === "all" || l.status === statusFilter;
        const matchLdms = ldmsFilter === "all" || l.ldmsId === ldmsFilter;
        const matchMachine =
          machineFilter === "all" || l.machineId === machineFilter;
        const matchSearch =
          !search ||
          l.barcode.toLowerCase().includes(search.toLowerCase()) ||
          l.patientName.toLowerCase().includes(search.toLowerCase()) ||
          l.resultId.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchLdms && matchMachine && matchSearch;
      });
  }, [transferLogs, statusFilter, ldmsFilter, machineFilter, search]);

  const exportCsv = () => {
    const headers = [
      "Timestamp",
      "Result ID",
      "Machine ID",
      "LDMS",
      "Barcode",
      "Patient",
      "Parameter Code",
      "Test Name",
      "Status",
      "Notes",
    ];
    const rows = filtered.map((l) => [
      new Date(l.timestamp).toISOString(),
      l.resultId,
      l.machineId,
      l.ldmsName,
      l.barcode,
      l.patientName,
      l.parameterCode,
      l.testName,
      l.status,
      `"${l.notes.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lis_transfer_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} records`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Transfer Log
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Full audit trail of all data transfers to LDMS
          </p>
        </div>
        <Button
          variant="outline"
          onClick={exportCsv}
          data-ocid="logs.export.button"
          className="gap-2"
          disabled={filtered.length === 0}
        >
          <Download className="w-4 h-4" />
          Export CSV ({filtered.length})
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="logs.search_input"
            placeholder="Search by barcode, patient, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-input/50 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            data-ocid="logs.status.select"
            className="w-36 bg-input/50 h-9"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ldmsFilter} onValueChange={setLdmsFilter}>
          <SelectTrigger
            data-ocid="logs.ldms.select"
            className="w-44 bg-input/50 h-9"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All LDMS</SelectItem>
            {ldmsList.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={machineFilter} onValueChange={setMachineFilter}>
          <SelectTrigger
            data-ocid="logs.machine.select"
            className="w-48 bg-input/50 h-9"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Machines</SelectItem>
            {machines.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center text-xs text-muted-foreground px-2">
          {filtered.length} of {transferLogs.length} entries
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div data-ocid="logs.empty_state" className="py-16 text-center">
              <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {search || statusFilter !== "all" || ldmsFilter !== "all"
                  ? "No entries match your filters."
                  : "No transfer logs yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Timestamp
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Result ID
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      LDMS
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Barcode
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Patient
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Code
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Test Name
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Notes
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l, idx) => (
                    <TableRow
                      key={l.id}
                      data-ocid={`logs.item.${idx + 1}`}
                      className="border-border hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(l.timestamp).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell>
                        <span
                          className="font-mono text-xs text-muted-foreground/60 truncate max-w-20 block"
                          title={l.resultId}
                        >
                          {l.resultId.slice(0, 8)}…
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-foreground">
                        {l.ldmsName}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                          {l.barcode}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {l.patientName || "—"}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-primary">
                          {l.parameterCode}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-36">
                        <span className="truncate block" title={l.testName}>
                          {l.testName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <TransferStatusBadge status={l.status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-40">
                        <span className="truncate block" title={l.notes}>
                          {l.notes}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer stats */}
      {transferLogs.length > 0 && (
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>
            Success:{" "}
            <span className="text-[oklch(0.7_0.18_145)] font-medium">
              {transferLogs.filter((l) => l.status === "success").length}
            </span>
          </span>
          <span>
            Failed:{" "}
            <span className="text-[oklch(0.56_0.22_25)] font-medium">
              {transferLogs.filter((l) => l.status === "failed").length}
            </span>
          </span>
          <span>
            Total:{" "}
            <span className="text-foreground font-medium">
              {transferLogs.length}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
