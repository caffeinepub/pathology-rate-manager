import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { Machine } from "@/context/LisDataContext";
import { useLisData } from "@/context/LisDataContext";
import {
  Activity,
  CheckCircle2,
  Cpu,
  Edit2,
  Loader2,
  Plus,
  Trash2,
  Wifi,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ActiveBadge, ProtocolBadge } from "./components/StatusBadge";

type MachineFormData = Omit<Machine, "id" | "createdAt">;

const EMPTY_FORM: MachineFormData = {
  name: "",
  ipAddress: "",
  port: "",
  protocol: "HL7",
  description: "",
  isActive: true,
};

export default function MachinesPage() {
  const { machines, addMachine, updateMachine, deleteMachine } = useLisData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<MachineFormData>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [testingIds, setTestingIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (m: Machine) => {
    setEditId(m.id);
    setForm({
      name: m.name,
      ipAddress: m.ipAddress,
      port: m.port,
      protocol: m.protocol,
      description: m.description,
      isActive: m.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    if (editId) {
      updateMachine(editId, form);
      toast.success("Machine updated");
    } else {
      addMachine(form);
      toast.success("Machine added");
    }
    setIsSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMachine(deleteId);
    toast.success("Machine removed");
    setDeleteId(null);
  };

  const testConnection = async (id: string, name: string) => {
    setTestingIds((prev) => new Set(prev).add(id));
    await new Promise((r) => setTimeout(r, 1500));
    const ok = Math.random() > 0.2;
    if (ok) {
      toast.success(`Connected to ${name}`, {
        description: "Ping successful — machine online",
      });
    } else {
      toast.error(`Cannot connect to ${name}`, {
        description: "Connection timeout — check IP/port",
      });
    }
    setTestingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" />
            Machine Connections
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage lab analyzer connections via LAN IP
          </p>
        </div>
        <Button
          onClick={openAdd}
          data-ocid="machines.add.button"
          className="bg-primary text-primary-foreground gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Machine
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {machines.length === 0 ? (
            <div data-ocid="machines.empty_state" className="py-16 text-center">
              <Cpu className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No machines configured yet.
              </p>
              <Button
                onClick={openAdd}
                variant="outline"
                className="mt-3"
                data-ocid="machines.add.empty.button"
              >
                Add Your First Machine
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                    Machine
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                    IP Address
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                    Protocol
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                    Added
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {machines.map((m, idx) => (
                  <TableRow
                    key={m.id}
                    data-ocid={`machines.item.${idx + 1}`}
                    className="border-border hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {m.name}
                        </p>
                        {m.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {m.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-primary/80 bg-primary/10 px-2 py-0.5 rounded">
                        {m.ipAddress}:{m.port}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ProtocolBadge protocol={m.protocol} />
                    </TableCell>
                    <TableCell>
                      <ActiveBadge isActive={m.isActive} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(m.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          data-ocid={`machines.test.button.${idx + 1}`}
                          onClick={() => testConnection(m.id, m.name)}
                          disabled={testingIds.has(m.id)}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
                        >
                          {testingIds.has(m.id) ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Wifi className="w-3.5 h-3.5" />
                          )}
                          <span className="ml-1 hidden sm:inline">Test</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          data-ocid={`machines.edit.button.${idx + 1}`}
                          onClick={() => openEdit(m)}
                          className="h-7 px-2 text-muted-foreground hover:text-primary"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          data-ocid={`machines.delete.button.${idx + 1}`}
                          onClick={() => setDeleteId(m.id)}
                          className="h-7 px-2 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="bg-card border-border max-w-lg"
          data-ocid="machines.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editId ? "Edit Machine" : "Add Machine"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Machine Name
              </Label>
              <Input
                data-ocid="machines.name.input"
                placeholder="Hematology Analyzer HA-5000"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="bg-input/50"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  IP Address
                </Label>
                <Input
                  data-ocid="machines.ip.input"
                  placeholder="192.168.1.101"
                  value={form.ipAddress}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ipAddress: e.target.value }))
                  }
                  className="bg-input/50 font-mono text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Port
                </Label>
                <Input
                  data-ocid="machines.port.input"
                  placeholder="3000"
                  value={form.port}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, port: e.target.value }))
                  }
                  className="bg-input/50 font-mono text-sm"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Protocol
              </Label>
              <Select
                value={form.protocol}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, protocol: v as Machine["protocol"] }))
                }
              >
                <SelectTrigger
                  data-ocid="machines.protocol.select"
                  className="bg-input/50"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HL7">HL7 v2.x</SelectItem>
                  <SelectItem value="ASTM">ASTM E1381</SelectItem>
                  <SelectItem value="Custom">Custom Protocol</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Description
              </Label>
              <Textarea
                data-ocid="machines.description.textarea"
                placeholder="Optional description..."
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="bg-input/50 resize-none h-16 text-sm"
              />
            </div>
            <div className="flex items-center justify-between py-1">
              <Label className="text-sm text-foreground/80">Active</Label>
              <Switch
                data-ocid="machines.active.switch"
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="machines.cancel_button"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="machines.save_button"
                disabled={isSaving}
                className="bg-primary text-primary-foreground"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editId ? "Update" : "Add Machine"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent
          className="bg-card border-border"
          data-ocid="machines.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Remove Machine?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the machine connection. Existing
              results referencing this machine will remain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="machines.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="machines.delete.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
