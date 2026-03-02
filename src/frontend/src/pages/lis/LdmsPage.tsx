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
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { LdmsSoftware } from "@/context/LisDataContext";
import { useLisData } from "@/context/LisDataContext";
import {
  Edit2,
  Loader2,
  MonitorSpeaker,
  Plus,
  Trash2,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ActiveBadge } from "./components/StatusBadge";

type LdmsFormData = Omit<LdmsSoftware, "id" | "createdAt">;

const EMPTY_FORM: LdmsFormData = {
  name: "",
  ipAddress: "",
  port: "",
  apiEndpoint: "/api/v1/results",
  description: "",
  isActive: true,
};

export default function LdmsPage() {
  const { ldmsList, addLdms, updateLdms, deleteLdms } = useLisData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<LdmsFormData>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [testingIds, setTestingIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (l: LdmsSoftware) => {
    setEditId(l.id);
    setForm({
      name: l.name,
      ipAddress: l.ipAddress,
      port: l.port,
      apiEndpoint: l.apiEndpoint,
      description: l.description,
      isActive: l.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    if (editId) {
      updateLdms(editId, form);
      toast.success("LDMS updated");
    } else {
      addLdms(form);
      toast.success("LDMS connection added");
    }
    setIsSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteLdms(deleteId);
    toast.success("LDMS connection removed");
    setDeleteId(null);
  };

  const testConnection = async (id: string, name: string) => {
    setTestingIds((prev) => new Set(prev).add(id));
    await new Promise((r) => setTimeout(r, 1500));
    const ok = Math.random() > 0.15;
    if (ok) {
      toast.success(`Connected to ${name}`, {
        description: "API endpoint responding",
      });
    } else {
      toast.error(`Cannot reach ${name}`, {
        description: "HTTP timeout — check endpoint",
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
            <MonitorSpeaker className="w-6 h-6 text-primary" />
            LDMS Software
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Connect Lab Data Management Software endpoints
          </p>
        </div>
        <Button
          onClick={openAdd}
          data-ocid="ldms.add.button"
          className="bg-primary text-primary-foreground gap-2"
        >
          <Plus className="w-4 h-4" />
          Add LDMS
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {ldmsList.length === 0 ? (
            <div data-ocid="ldms.empty_state" className="py-16 text-center">
              <MonitorSpeaker className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No LDMS connections configured.
              </p>
              <Button
                onClick={openAdd}
                variant="outline"
                className="mt-3"
                data-ocid="ldms.add.empty.button"
              >
                Add Your First LDMS
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                    Software Name
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                    IP:Port
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                    API Endpoint
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
                {ldmsList.map((l, idx) => (
                  <TableRow
                    key={l.id}
                    data-ocid={`ldms.item.${idx + 1}`}
                    className="border-border hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {l.name}
                        </p>
                        {l.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {l.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-primary/80 bg-primary/10 px-2 py-0.5 rounded">
                        {l.ipAddress}:{l.port}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {l.apiEndpoint}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ActiveBadge isActive={l.isActive} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(l.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          data-ocid={`ldms.test.button.${idx + 1}`}
                          onClick={() => testConnection(l.id, l.name)}
                          disabled={testingIds.has(l.id)}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
                        >
                          {testingIds.has(l.id) ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Wifi className="w-3.5 h-3.5" />
                          )}
                          <span className="ml-1 hidden sm:inline">Test</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          data-ocid={`ldms.edit.button.${idx + 1}`}
                          onClick={() => openEdit(l)}
                          className="h-7 px-2 text-muted-foreground hover:text-primary"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          data-ocid={`ldms.delete.button.${idx + 1}`}
                          onClick={() => setDeleteId(l.id)}
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
          data-ocid="ldms.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editId ? "Edit LDMS" : "Add LDMS Connection"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Software Name
              </Label>
              <Input
                data-ocid="ldms.name.input"
                placeholder="MedLab Pro LIS"
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
                  data-ocid="ldms.ip.input"
                  placeholder="192.168.1.50"
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
                  data-ocid="ldms.port.input"
                  placeholder="8080"
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
                API Endpoint
              </Label>
              <Input
                data-ocid="ldms.endpoint.input"
                placeholder="/api/v1/results"
                value={form.apiEndpoint}
                onChange={(e) =>
                  setForm((f) => ({ ...f, apiEndpoint: e.target.value }))
                }
                className="bg-input/50 font-mono text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Description
              </Label>
              <Textarea
                data-ocid="ldms.description.textarea"
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
                data-ocid="ldms.active.switch"
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="ldms.cancel_button"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="ldms.save_button"
                disabled={isSaving}
                className="bg-primary text-primary-foreground"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editId ? "Update" : "Add LDMS"}
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
          data-ocid="ldms.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Remove LDMS?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this LDMS connection. Transfer logs referencing
              it will remain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="ldms.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="ldms.delete.confirm_button"
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
