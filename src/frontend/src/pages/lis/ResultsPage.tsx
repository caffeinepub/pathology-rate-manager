import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Filter,
  Loader2,
  Search,
  Send,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SimulateResultDialog } from "./components/SimulateResultDialog";
import { StatusBadge } from "./components/StatusBadge";

export default function ResultsPage() {
  const { results, ldmsList, machines, transferResult, transferAllMatched } =
    useLisData();
  const [simulateOpen, setSimulateOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [selectedLdmsId, setSelectedLdmsId] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [isBatchTransferring, setIsBatchTransferring] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [machineFilter, setMachineFilter] = useState("all");
  const [search, setSearch] = useState("");

  const activeLdms = ldmsList.filter((l) => l.isActive);
  const matchedCount = results.filter((r) => r.status === "matched").length;

  const filtered = useMemo(() => {
    return [...results]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .filter((r) => {
        const matchStatus = statusFilter === "all" || r.status === statusFilter;
        const matchMachine =
          machineFilter === "all" || r.machineId === machineFilter;
        const matchSearch =
          !search ||
          r.barcode.toLowerCase().includes(search.toLowerCase()) ||
          r.patientName.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchMachine && matchSearch;
      });
  }, [results, statusFilter, machineFilter, search]);

  const openTransfer = (resultId: string) => {
    setSelectedResultId(resultId);
    setSelectedLdmsId(activeLdms[0]?.id || "");
    setTransferDialogOpen(true);
  };

  const handleTransfer = async () => {
    if (!selectedResultId || !selectedLdmsId) return;
    setIsTransferring(true);
    await new Promise((r) => setTimeout(r, 600));
    const log = transferResult(selectedResultId, selectedLdmsId);
    toast.success(`Result transferred to ${log.ldmsName}`);
    setIsTransferring(false);
    setTransferDialogOpen(false);
  };

  const handleTransferAll = async () => {
    if (!selectedLdmsId) return;
    setIsBatchTransferring(true);
    await new Promise((r) => setTimeout(r, 800));
    const logs = transferAllMatched(selectedLdmsId);
    const ldms = ldmsList.find((l) => l.id === selectedLdmsId);
    toast.success(`${logs.length} results transferred to ${ldms?.name}`);
    setIsBatchTransferring(false);
    setTransferDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Results
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Machine result ingestion and routing to LDMS
          </p>
        </div>
        <div className="flex gap-2">
          {matchedCount > 0 && (
            <Button
              variant="outline"
              data-ocid="results.transfer_all.button"
              onClick={() => {
                setSelectedResultId(null);
                setSelectedLdmsId(activeLdms[0]?.id || "");
                setTransferDialogOpen(true);
              }}
              className="gap-2 border-[oklch(0.65_0.16_220)]/50 text-[oklch(0.72_0.16_215)] hover:bg-[oklch(0.65_0.16_220)]/10"
            >
              <Send className="w-4 h-4" />
              Transfer All Matched ({matchedCount})
            </Button>
          )}
          <Button
            onClick={() => setSimulateOpen(true)}
            data-ocid="results.simulate.button"
            className="bg-primary text-primary-foreground gap-2"
          >
            <Zap className="w-4 h-4" />
            Simulate Result
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="results.search_input"
            placeholder="Search by barcode or patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-input/50 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            data-ocid="results.status.select"
            className="w-36 bg-input/50 h-9"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="matched">Matched</SelectItem>
            <SelectItem value="unmatched">Unmatched</SelectItem>
            <SelectItem value="transferred">Transferred</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={machineFilter} onValueChange={setMachineFilter}>
          <SelectTrigger
            data-ocid="results.machine.select"
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
          {filtered.length} results
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div data-ocid="results.empty_state" className="py-16 text-center">
              <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {search || statusFilter !== "all" || machineFilter !== "all"
                  ? "No results match your filters."
                  : "No results yet. Simulate a machine result to get started."}
              </p>
              <Button
                onClick={() => setSimulateOpen(true)}
                variant="outline"
                className="mt-3 gap-2"
                data-ocid="results.simulate.empty.button"
              >
                <Zap className="w-4 h-4" />
                Simulate Result
              </Button>
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
                      Machine
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Barcode
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Patient
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Parameter
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Test Name
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Value
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r, idx) => (
                    <TableRow
                      key={r.id}
                      data-ocid={`results.item.${idx + 1}`}
                      className="border-border hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(r.timestamp).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-32">
                        <span className="truncate block" title={r.machineName}>
                          {r.machineName.split(" ").slice(0, 2).join(" ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                          {r.barcode}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {r.patientName || (
                          <span className="text-muted-foreground italic text-xs">
                            Unregistered
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-primary">
                          {r.parameterCode}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-36">
                        <span className="truncate block" title={r.testName}>
                          {r.testName}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="text-sm font-medium text-foreground">
                          {r.resultValue}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          {r.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <StatusBadge status={r.status} />
                          {r.notes && (
                            <p
                              className="text-xs text-muted-foreground/60 max-w-32 truncate"
                              title={r.notes}
                            >
                              {r.notes}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {r.status === "matched" && activeLdms.length > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`results.transfer.button.${idx + 1}`}
                            onClick={() => openTransfer(r.id)}
                            className="h-7 px-2 text-xs text-[oklch(0.65_0.16_220)] hover:bg-[oklch(0.65_0.16_220)]/10 gap-1"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            Transfer
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transfer dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent
          className="bg-card border-border max-w-sm"
          data-ocid="results.transfer.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              {selectedResultId
                ? "Transfer Result"
                : `Transfer All Matched (${matchedCount})`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Target LDMS
              </p>
              <Select value={selectedLdmsId} onValueChange={setSelectedLdmsId}>
                <SelectTrigger
                  data-ocid="results.ldms.select"
                  className="bg-input/50"
                >
                  <SelectValue placeholder="Select LDMS" />
                </SelectTrigger>
                <SelectContent>
                  {activeLdms.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name} ({l.ipAddress}:{l.port})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {activeLdms.length === 0 && (
              <p className="text-xs text-destructive/80 bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
                No active LDMS connections. Please add one in LDMS Software
                settings.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="results.transfer.cancel_button"
              onClick={() => setTransferDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="results.transfer.confirm_button"
              onClick={selectedResultId ? handleTransfer : handleTransferAll}
              disabled={
                isTransferring || isBatchTransferring || !selectedLdmsId
              }
              className="bg-primary text-primary-foreground gap-2"
            >
              {isTransferring || isBatchTransferring ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {selectedResultId
                ? "Transfer"
                : `Transfer ${matchedCount} Results`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SimulateResultDialog
        open={simulateOpen}
        onOpenChange={setSimulateOpen}
      />
    </div>
  );
}
