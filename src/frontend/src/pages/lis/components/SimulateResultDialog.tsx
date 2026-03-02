import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Activity, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SimulateResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SimulateResultDialog({
  open,
  onOpenChange,
}: SimulateResultDialogProps) {
  const { machines, parameters, ingestResult } = useLisData();
  const [machineId, setMachineId] = useState("");
  const [barcode, setBarcode] = useState("");
  const [paramCode, setParamCode] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{
    status: string;
    notes: string;
    patientName: string;
    testName: string;
  } | null>(null);

  const activeMachines = machines.filter((m) => m.isActive);

  const handleParamChange = (code: string) => {
    setParamCode(code);
    const param = parameters.find((p) => p.machineCode === code);
    if (param) setUnit(param.unit);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineId || !barcode || !paramCode || !value) return;
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 400));

    const result = ingestResult({
      machineId,
      barcode,
      parameterCode: paramCode,
      resultValue: value,
      unit,
    });
    setLastResult({
      status: result.status,
      notes: result.notes,
      patientName: result.patientName,
      testName: result.testName,
    });

    if (result.status === "matched") {
      toast.success(
        `Result matched: ${result.patientName} — ${result.testName}`,
      );
    } else {
      toast.error(`Result unmatched: ${result.notes}`);
    }

    setIsLoading(false);
    // Reset for next entry
    setBarcode("");
    setValue("");
  };

  const handleClose = () => {
    setLastResult(null);
    setMachineId("");
    setBarcode("");
    setParamCode("");
    setValue("");
    setUnit("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="bg-card border-border max-w-md"
        data-ocid="simulate.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Activity className="w-4 h-4 text-primary" />
            Simulate Machine Result
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Machine
            </Label>
            <Select value={machineId} onValueChange={setMachineId}>
              <SelectTrigger
                data-ocid="simulate.machine.select"
                className="bg-input/50"
              >
                <SelectValue placeholder="Select machine" />
              </SelectTrigger>
              <SelectContent>
                {activeMachines.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.ipAddress}:{m.port})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Barcode
              </Label>
              <Input
                data-ocid="simulate.barcode.input"
                placeholder="BC-2024-001"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="font-mono text-sm bg-input/50"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Parameter Code
              </Label>
              <Select value={paramCode} onValueChange={handleParamChange}>
                <SelectTrigger
                  data-ocid="simulate.param.select"
                  className="bg-input/50"
                >
                  <SelectValue placeholder="WBC, HGB..." />
                </SelectTrigger>
                <SelectContent>
                  {parameters
                    .filter((p) => p.isActive)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.machineCode}>
                        {p.machineCode} — {p.testName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Result Value
              </Label>
              <Input
                data-ocid="simulate.value.input"
                placeholder="7.8"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="bg-input/50"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Unit
              </Label>
              <Input
                data-ocid="simulate.unit.input"
                placeholder="mg/dL"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="bg-input/50"
              />
            </div>
          </div>

          {lastResult && (
            <div
              data-ocid={
                lastResult.status === "matched"
                  ? "simulate.success_state"
                  : "simulate.error_state"
              }
              className={`flex items-start gap-2 p-3 rounded-lg text-xs ${
                lastResult.status === "matched"
                  ? "bg-[oklch(0.7_0.18_145)]/10 border border-[oklch(0.7_0.18_145)]/20 text-[oklch(0.75_0.18_145)]"
                  : "bg-destructive/10 border border-destructive/20 text-destructive/80"
              }`}
            >
              {lastResult.status === "matched" ? (
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              )}
              <div>
                {lastResult.status === "matched" ? (
                  <p>
                    Matched → <strong>{lastResult.patientName}</strong> /{" "}
                    {lastResult.testName}
                  </p>
                ) : (
                  <p>{lastResult.notes}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              data-ocid="simulate.cancel_button"
              className="flex-1"
            >
              Close
            </Button>
            <Button
              type="submit"
              data-ocid="simulate.submit_button"
              disabled={
                isLoading || !machineId || !barcode || !paramCode || !value
              }
              className="flex-1 bg-primary text-primary-foreground"
            >
              {isLoading ? (
                <Activity className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Ingest Result
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
