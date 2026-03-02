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
import type { TestParameter } from "@/context/LisDataContext";
import { useLisData } from "@/context/LisDataContext";
import {
  Check,
  ClipboardList,
  Edit2,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ActiveBadge } from "./components/StatusBadge";

type ParamForm = Omit<TestParameter, "id">;

const EMPTY_FORM: ParamForm = {
  machineCode: "",
  testName: "",
  unit: "",
  referenceRange: "",
  category: "Hematology",
  isActive: true,
};

const CATEGORIES = [
  "Hematology",
  "Biochemistry",
  "Liver Function",
  "Kidney Function",
  "Thyroid",
  "Lipid Profile",
  "Immunology",
  "Microbiology",
  "Other",
];

export default function ParametersPage() {
  const { parameters, addParameter, updateParameter, deleteParameter } =
    useLisData();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ParamForm>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineForm, setInlineForm] = useState<Partial<TestParameter>>({});
  const [isSaving, setIsSaving] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(parameters.map((p) => p.category));
    return Array.from(cats).sort();
  }, [parameters]);

  const filtered = useMemo(() => {
    return parameters.filter((p) => {
      const matchSearch =
        !search ||
        p.machineCode.toLowerCase().includes(search.toLowerCase()) ||
        p.testName.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        categoryFilter === "all" || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [parameters, search, categoryFilter]);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    if (editId) {
      updateParameter(editId, form);
      toast.success("Parameter updated");
    } else {
      addParameter(form);
      toast.success("Parameter added");
    }
    setIsSaving(false);
    setDialogOpen(false);
  };

  const startInlineEdit = (p: TestParameter) => {
    setInlineEditId(p.id);
    setInlineForm({
      testName: p.testName,
      unit: p.unit,
      referenceRange: p.referenceRange,
    });
  };

  const saveInlineEdit = (id: string) => {
    updateParameter(id, inlineForm);
    setInlineEditId(null);
    toast.success("Parameter saved");
  };

  const cancelInlineEdit = () => {
    setInlineEditId(null);
    setInlineForm({});
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteParameter(deleteId);
    toast.success("Parameter deleted");
    setDeleteId(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            Test Parameters
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Map machine codes to human-readable test names
          </p>
        </div>
        <Button
          onClick={openAdd}
          data-ocid="params.add.button"
          className="bg-primary text-primary-foreground gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Parameter
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="params.search_input"
            placeholder="Search by code or test name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-input/50 h-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger
            data-ocid="params.category.select"
            className="w-44 bg-input/50 h-9"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
          <span>
            {filtered.length} of {parameters.length}
          </span>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div data-ocid="params.empty_state" className="py-16 text-center">
              <ClipboardList className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {search || categoryFilter !== "all"
                  ? "No parameters match your filters."
                  : "No parameters configured yet."}
              </p>
              {!search && categoryFilter === "all" && (
                <Button onClick={openAdd} variant="outline" className="mt-3">
                  Add Your First Parameter
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider w-24">
                    Code
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                    Test Name
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider w-28">
                    Unit
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider w-36">
                    Ref Range
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider w-32">
                    Category
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider w-24">
                    Status
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
                    data-ocid={`params.item.${idx + 1}`}
                    className="border-border hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {p.machineCode}
                      </span>
                    </TableCell>
                    <TableCell>
                      {inlineEditId === p.id ? (
                        <Input
                          value={inlineForm.testName ?? p.testName}
                          onChange={(e) =>
                            setInlineForm((f) => ({
                              ...f,
                              testName: e.target.value,
                            }))
                          }
                          className="h-7 text-xs bg-input/50 w-48"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm text-foreground">
                          {p.testName}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {inlineEditId === p.id ? (
                        <Input
                          value={inlineForm.unit ?? p.unit}
                          onChange={(e) =>
                            setInlineForm((f) => ({
                              ...f,
                              unit: e.target.value,
                            }))
                          }
                          className="h-7 text-xs bg-input/50 w-20"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground font-mono">
                          {p.unit}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {inlineEditId === p.id ? (
                        <Input
                          value={inlineForm.referenceRange ?? p.referenceRange}
                          onChange={(e) =>
                            setInlineForm((f) => ({
                              ...f,
                              referenceRange: e.target.value,
                            }))
                          }
                          className="h-7 text-xs bg-input/50 w-28"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground font-mono">
                          {p.referenceRange}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className="text-xs bg-muted/50 text-muted-foreground border-border font-normal">
                        {p.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          data-ocid={`params.active.switch.${idx + 1}`}
                          checked={p.isActive}
                          onCheckedChange={(v) => {
                            updateParameter(p.id, { isActive: v });
                            toast.success(
                              `${p.machineCode} ${v ? "enabled" : "disabled"}`,
                            );
                          }}
                          className="h-4 w-7"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {inlineEditId === p.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              data-ocid={`params.save.button.${idx + 1}`}
                              onClick={() => saveInlineEdit(p.id)}
                              className="h-7 px-2 text-[oklch(0.7_0.18_145)] hover:text-[oklch(0.7_0.18_145)]"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              data-ocid={`params.cancel.button.${idx + 1}`}
                              onClick={cancelInlineEdit}
                              className="h-7 px-2 text-muted-foreground"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              data-ocid={`params.edit.button.${idx + 1}`}
                              onClick={() => startInlineEdit(p)}
                              className="h-7 px-2 text-muted-foreground hover:text-primary"
                              title="Quick edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              data-ocid={`params.delete.button.${idx + 1}`}
                              onClick={() => setDeleteId(p.id)}
                              className="h-7 px-2 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
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
          className="bg-card border-border max-w-md"
          data-ocid="params.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editId ? "Edit Parameter" : "Add Test Parameter"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Machine Code
                </Label>
                <Input
                  data-ocid="params.code.input"
                  placeholder="WBC"
                  value={form.machineCode}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      machineCode: e.target.value.toUpperCase(),
                    }))
                  }
                  className="bg-input/50 font-mono text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Category
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger
                    data-ocid="params.category.dialog.select"
                    className="bg-input/50"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Test Name
              </Label>
              <Input
                data-ocid="params.name.input"
                placeholder="White Blood Cell Count"
                value={form.testName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, testName: e.target.value }))
                }
                className="bg-input/50"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Unit
                </Label>
                <Input
                  data-ocid="params.unit.input"
                  placeholder="10³/µL"
                  value={form.unit}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, unit: e.target.value }))
                  }
                  className="bg-input/50 font-mono text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Reference Range
                </Label>
                <Input
                  data-ocid="params.range.input"
                  placeholder="4.5-11.0"
                  value={form.referenceRange}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, referenceRange: e.target.value }))
                  }
                  className="bg-input/50 font-mono text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-between py-1">
              <Label className="text-sm text-foreground/80">Active</Label>
              <Switch
                data-ocid="params.active.dialog.switch"
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="params.cancel_button"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="params.save_button"
                disabled={isSaving}
                className="bg-primary text-primary-foreground"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editId ? "Update" : "Add Parameter"}
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
          data-ocid="params.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Parameter?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this test parameter mapping.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="params.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="params.delete.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
