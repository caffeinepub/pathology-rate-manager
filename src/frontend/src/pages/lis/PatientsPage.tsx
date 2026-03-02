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
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Patient } from "@/context/LisDataContext";
import { useLisData } from "@/context/LisDataContext";
import {
  Activity,
  ArrowLeft,
  Edit2,
  Loader2,
  Plus,
  Scan,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "./components/StatusBadge";

type PatientForm = Omit<Patient, "id" | "createdAt"> & {
  testCodesInput: string;
};

const EMPTY_FORM: PatientForm = {
  barcode: "",
  patientName: "",
  age: 0,
  gender: "Male",
  referralSource: "",
  orderedTestCodes: [],
  testCodesInput: "",
};

export default function PatientsPage() {
  const {
    patients,
    parameters,
    results,
    addPatient,
    updatePatient,
    deletePatient,
  } = useLisData();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PatientForm>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewBarcode, setViewBarcode] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      (p) =>
        p.barcode.toLowerCase().includes(q) ||
        p.patientName.toLowerCase().includes(q),
    );
  }, [patients, search]);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (p: Patient) => {
    setEditId(p.id);
    setForm({
      barcode: p.barcode,
      patientName: p.patientName,
      age: p.age,
      gender: p.gender,
      referralSource: p.referralSource,
      orderedTestCodes: p.orderedTestCodes,
      testCodesInput: p.orderedTestCodes.join(", "),
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const codes = form.testCodesInput
      .split(/[,\s]+/)
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    const patientData: Omit<Patient, "id" | "createdAt"> = {
      barcode: form.barcode,
      patientName: form.patientName,
      age: form.age,
      gender: form.gender,
      referralSource: form.referralSource,
      orderedTestCodes: codes,
    };

    if (editId) {
      updatePatient(editId, patientData);
      toast.success("Patient updated");
    } else {
      addPatient(patientData);
      toast.success("Patient registered");
    }
    setIsSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deletePatient(deleteId);
    toast.success("Patient removed");
    setDeleteId(null);
  };

  // Detail view for a specific barcode
  if (viewBarcode) {
    const patient = patients.find((p) => p.barcode === viewBarcode);
    const patientResults = results.filter((r) => r.barcode === viewBarcode);
    return (
      <div className="p-6 space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewBarcode(null)}
            data-ocid="patients.back.button"
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {patient?.patientName || "Unknown Patient"}
            </h1>
            <p className="text-sm text-muted-foreground font-mono">
              {viewBarcode}
            </p>
          </div>
        </div>

        {patient && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Age", value: `${patient.age} yrs` },
              { label: "Gender", value: patient.gender },
              { label: "Referral", value: patient.referralSource || "—" },
              {
                label: "Ordered Tests",
                value: patient.orderedTestCodes.length.toString(),
              },
            ].map((f) => (
              <Card key={f.label} className="bg-card border-border">
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">{f.label}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {f.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Results for {viewBarcode} ({patientResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {patientResults.length === 0 ? (
              <div
                data-ocid="patients.results.empty_state"
                className="py-12 text-center text-muted-foreground text-sm"
              >
                No results yet for this barcode.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Time
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Test
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Value
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Machine
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientResults.map((r, idx) => (
                    <TableRow
                      key={r.id}
                      data-ocid={`patients.result.item.${idx + 1}`}
                      className="border-border hover:bg-muted/20"
                    >
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.timestamp).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-mono text-xs text-primary/80">
                            {r.parameterCode}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {r.testName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-foreground">
                          {r.resultValue}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          {r.unit}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.machineName}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Patient Registry
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Register patients and link barcodes to ordered tests
          </p>
        </div>
        <Button
          onClick={openAdd}
          data-ocid="patients.add.button"
          className="bg-primary text-primary-foreground gap-2"
        >
          <Plus className="w-4 h-4" />
          Register Patient
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="patients.search_input"
            placeholder="Search by barcode or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-input/50 h-9"
          />
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div data-ocid="patients.empty_state" className="py-16 text-center">
              <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {search
                  ? "No patients match your search."
                  : "No patients registered yet."}
              </p>
              {!search && (
                <Button onClick={openAdd} variant="outline" className="mt-3">
                  Register First Patient
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                    Barcode
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                    Patient Name
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider w-16">
                    Age
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider w-20">
                    Gender
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                    Referral
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                    Ordered Tests
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                    Registered
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p, idx) => (
                  <TableRow
                    key={p.id}
                    data-ocid={`patients.item.${idx + 1}`}
                    className="border-border hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => setViewBarcode(p.barcode)}
                        data-ocid={`patients.barcode.link.${idx + 1}`}
                        className="font-mono text-xs text-primary hover:text-primary/70 flex items-center gap-1 hover:underline"
                      >
                        <Scan className="w-3 h-3" />
                        {p.barcode}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground">
                      {p.patientName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.age}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.gender}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.referralSource || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-48">
                        {p.orderedTestCodes.slice(0, 3).map((c) => (
                          <span
                            key={c}
                            className="font-mono text-xs bg-primary/10 text-primary/80 px-1.5 py-0.5 rounded"
                          >
                            {c}
                          </span>
                        ))}
                        {p.orderedTestCodes.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{p.orderedTestCodes.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          data-ocid={`patients.edit.button.${idx + 1}`}
                          onClick={() => openEdit(p)}
                          className="h-7 px-2 text-muted-foreground hover:text-primary"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          data-ocid={`patients.delete.button.${idx + 1}`}
                          onClick={() => setDeleteId(p.id)}
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
          data-ocid="patients.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editId ? "Edit Patient" : "Register Patient"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Barcode ID
                </Label>
                <Input
                  data-ocid="patients.barcode.input"
                  placeholder="BC-2024-001"
                  value={form.barcode}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, barcode: e.target.value }))
                  }
                  className="bg-input/50 font-mono text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Patient Name
                </Label>
                <Input
                  data-ocid="patients.name.input"
                  placeholder="Full name"
                  value={form.patientName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, patientName: e.target.value }))
                  }
                  className="bg-input/50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Age
                </Label>
                <Input
                  data-ocid="patients.age.input"
                  type="number"
                  placeholder="35"
                  value={form.age || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      age: Number.parseInt(e.target.value) || 0,
                    }))
                  }
                  className="bg-input/50"
                  min={0}
                  max={150}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Gender
                </Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}
                >
                  <SelectTrigger
                    data-ocid="patients.gender.select"
                    className="bg-input/50"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Referral Source
              </Label>
              <Input
                data-ocid="patients.referral.input"
                placeholder="Dr. Mehta Clinic"
                value={form.referralSource}
                onChange={(e) =>
                  setForm((f) => ({ ...f, referralSource: e.target.value }))
                }
                className="bg-input/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Ordered Test Codes
              </Label>
              <Input
                data-ocid="patients.tests.input"
                placeholder="WBC, HGB, PLT, GLU (comma or space separated)"
                value={form.testCodesInput}
                onChange={(e) =>
                  setForm((f) => ({ ...f, testCodesInput: e.target.value }))
                }
                className="bg-input/50 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Available: {parameters.map((p) => p.machineCode).join(", ")}
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="patients.cancel_button"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="patients.save_button"
                disabled={isSaving}
                className="bg-primary text-primary-foreground"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editId ? "Update" : "Register"}
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
          data-ocid="patients.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Remove Patient?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this patient record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="patients.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="patients.delete.confirm_button"
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
