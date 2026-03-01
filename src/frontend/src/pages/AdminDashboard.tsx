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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  Check,
  FlaskConical,
  KeyRound,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  TestTube,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PathologyTest, SubAccount } from "../backend.d.ts";
import { SUBACCOUNTS_CACHE_KEY, useAuth } from "../context/AuthContext";
import {
  useAddPathologyTest,
  useAddSampleData,
  useAdminLogout,
  useCreateSubAccount,
  useDeletePathologyTest,
  useDeleteSubAccount,
  useGetAllSubAccounts,
  useGetAllTests,
  useUpdatePathologyTest,
} from "../hooks/useQueries";
import {
  getAdminMobile,
  getPasswordOverride,
  setAdminMobile,
  setPasswordOverride,
} from "../utils/adminSettings";

interface AdminDashboardProps {
  onLogout: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Hematology:
    "bg-[oklch(0.92_0.06_30)] text-[oklch(0.4_0.14_30)] border-[oklch(0.82_0.08_30)]",
  Biochemistry:
    "bg-[oklch(0.92_0.07_200)] text-[oklch(0.35_0.12_200)] border-[oklch(0.82_0.08_200)]",
  Microbiology:
    "bg-[oklch(0.92_0.06_150)] text-[oklch(0.35_0.12_150)] border-[oklch(0.82_0.08_150)]",
  Immunology:
    "bg-[oklch(0.93_0.06_280)] text-[oklch(0.38_0.12_280)] border-[oklch(0.83_0.08_280)]",
  Pathology:
    "bg-[oklch(0.92_0.06_60)] text-[oklch(0.4_0.12_60)] border-[oklch(0.82_0.08_60)]",
  Radiology:
    "bg-[oklch(0.91_0.06_310)] text-[oklch(0.38_0.1_310)] border-[oklch(0.81_0.08_310)]",
  Cardiology:
    "bg-[oklch(0.91_0.08_20)] text-[oklch(0.42_0.15_20)] border-[oklch(0.81_0.1_20)]",
  Endocrinology:
    "bg-[oklch(0.91_0.06_90)] text-[oklch(0.38_0.1_90)] border-[oklch(0.81_0.08_90)]",
};

function getCategoryClass(category: string): string {
  return (
    CATEGORY_COLORS[category] ||
    "bg-[oklch(0.93_0.01_215)] text-[oklch(0.4_0.04_215)] border-[oklch(0.83_0.02_215)]"
  );
}

function formatCurrency(val: number): string {
  return `₹${val.toFixed(2)}`;
}

interface TestFormValues {
  name: string;
  category: string;
  mrp: string;
  b2bRate: string;
}

const DEFAULT_FORM: TestFormValues = {
  name: "",
  category: "",
  mrp: "",
  b2bRate: "",
};

const CATEGORIES = [
  "Hematology",
  "Biochemistry",
  "Microbiology",
  "Immunology",
  "Pathology",
  "Radiology",
  "Cardiology",
  "Endocrinology",
  "Other",
];

// ─── Settings Panel ───────────────────────────────────────────────────────────

function SettingsPanel() {
  const currentMobile = getAdminMobile();

  const [mobileInput, setMobileInput] = useState(currentMobile ?? "");
  const [mobileSaving, setMobileSaving] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const maskedMobile = currentMobile
    ? `••••••${currentMobile.slice(-4)}`
    : "Not set";

  const handleSaveMobile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileInput.trim()) {
      toast.error("Please enter a valid mobile number.");
      return;
    }
    setMobileSaving(true);
    setTimeout(() => {
      setAdminMobile(mobileInput.trim());
      toast.success("Mobile number saved successfully!");
      setMobileSaving(false);
    }, 300);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      toast.error("New password cannot be empty.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 4) {
      toast.error("Password must be at least 4 characters.");
      return;
    }
    setPwSaving(true);
    setTimeout(() => {
      setPasswordOverride(newPassword);
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setPwSaving(false);
    }, 300);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Security Settings Card */}
      <Card className="border-[oklch(0.88_0.02_200)] shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[oklch(0.92_0.06_200)] rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[oklch(0.38_0.1_210)]" />
            </div>
            <CardTitle className="font-fraunces text-[oklch(0.25_0.06_215)] text-lg">
              Security Settings
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {/* Mobile Number Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-4 h-4 text-[oklch(0.45_0.12_175)]" />
              <h3 className="font-semibold text-[oklch(0.3_0.05_215)] text-sm">
                Registered Mobile Number
              </h3>
            </div>
            {currentMobile && (
              <div className="mb-3 px-3 py-2 bg-[oklch(0.95_0.02_185)] rounded-lg border border-[oklch(0.88_0.05_185)] text-sm text-[oklch(0.4_0.08_185)]">
                Current:{" "}
                <span className="font-mono font-semibold">{maskedMobile}</span>
              </div>
            )}
            <form onSubmit={handleSaveMobile} className="flex gap-3">
              <Input
                type="tel"
                value={mobileInput}
                onChange={(e) => setMobileInput(e.target.value)}
                placeholder="Enter mobile number (e.g. 9876543210)"
                autoComplete="tel"
                className="flex-1 border-[oklch(0.82_0.04_200)] focus:border-[oklch(0.38_0.1_210)]"
              />
              <Button
                type="submit"
                disabled={mobileSaving}
                className="bg-[oklch(0.45_0.12_175)] hover:bg-[oklch(0.38_0.12_175)] text-white shrink-0"
              >
                {mobileSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span className="ml-1.5">Save</span>
              </Button>
            </form>
            <p className="text-xs text-[oklch(0.6_0.025_215)] mt-2">
              This number will be used to verify your identity when using
              "Forgot Password."
            </p>
          </div>

          <Separator className="bg-[oklch(0.9_0.01_215)]" />

          {/* Change Password Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="w-4 h-4 text-[oklch(0.38_0.1_210)]" />
              <h3 className="font-semibold text-[oklch(0.3_0.05_215)] text-sm">
                Change Password (Frontend)
              </h3>
            </div>
            <div className="mb-3 px-3 py-2 bg-[oklch(0.95_0.015_200)] rounded-lg border border-[oklch(0.88_0.04_200)] text-xs text-[oklch(0.52_0.025_215)]">
              This sets your login password for this browser. The default
              password is <span className="font-mono font-semibold">12345</span>
              .{" "}
              {getPasswordOverride()
                ? "A custom password is currently active."
                : "No custom password set — using default."}
            </div>
            <form onSubmit={handleSavePassword} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[oklch(0.3_0.05_215)] text-sm font-medium">
                  New Password
                </Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className="border-[oklch(0.82_0.04_200)] focus:border-[oklch(0.38_0.1_210)]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[oklch(0.3_0.05_215)] text-sm font-medium">
                  Confirm Password
                </Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className="border-[oklch(0.82_0.04_200)] focus:border-[oklch(0.38_0.1_210)]"
                />
              </div>
              <Button
                type="submit"
                disabled={pwSaving}
                className="bg-[oklch(0.38_0.1_210)] hover:bg-[oklch(0.32_0.1_210)] text-white"
              >
                {pwSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {pwSaving ? "Saving..." : "Update Password"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { sessionToken, logout } = useAuth();
  const token = sessionToken || "";

  const { data: tests = [], isLoading: testsLoading } = useGetAllTests();
  const { data: subaccounts = [], isLoading: subaccountsLoading } =
    useGetAllSubAccounts(token);
  const addTestMutation = useAddPathologyTest(token);
  const updateTestMutation = useUpdatePathologyTest(token);
  const deleteTestMutation = useDeletePathologyTest(token);
  const createSubAccountMutation = useCreateSubAccount(token);
  const deleteSubAccountMutation = useDeleteSubAccount(token);
  const logoutMutation = useAdminLogout();
  const addSampleData = useAddSampleData();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingTest, setEditingTest] = useState<PathologyTest | null>(null);
  const [addTestOpen, setAddTestOpen] = useState(false);
  const [formValues, setFormValues] = useState<TestFormValues>(DEFAULT_FORM);
  const [deleteTestId, setDeleteTestId] = useState<bigint | null>(null);
  const [deleteSubId, setDeleteSubId] = useState<bigint | null>(null);
  const [newSubAccountName, setNewSubAccountName] = useState("");
  const [sampleDataLoaded, setSampleDataLoaded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Seed sample data if tests list is empty
  // biome-ignore lint/correctness/useExhaustiveDependencies: addSampleData mutation is intentionally omitted
  useEffect(() => {
    if (!testsLoading && tests.length === 0 && !sampleDataLoaded) {
      setSampleDataLoaded(true);
      addSampleData.mutate();
    }
  }, [testsLoading, tests.length, sampleDataLoaded]);

  // Cache subaccounts in localStorage for public access
  useEffect(() => {
    if (subaccounts.length > 0) {
      try {
        // Convert bigint to string for JSON serialization
        const serializable = subaccounts.map((s) => ({
          id: String(s.id),
          name: s.name,
        }));
        localStorage.setItem(
          SUBACCOUNTS_CACHE_KEY,
          JSON.stringify(serializable),
        );
      } catch {
        // ignore
      }
    }
  }, [subaccounts]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // ignore
    }
    logout();
    onLogout();
  };

  // Filtered tests
  const filteredTests = tests.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      categoryFilter === "all" || t.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const categories = Array.from(new Set(tests.map((t) => t.category)));

  // Selection helpers
  const filteredIds = filteredTests.map((t) => String(t.id));
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));
  const someFilteredSelected = filteredIds.some((id) => selectedIds.has(id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const id of filteredIds) next.delete(id);
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const id of filteredIds) next.add(id);
        return next;
      });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedTests = tests.filter((t) => selectedIds.has(String(t.id)));
  const totalMrp = selectedTests.reduce((sum, t) => sum + t.mrp, 0);
  const totalB2b = selectedTests.reduce((sum, t) => sum + t.b2bRate, 0);
  const grandTotal = totalMrp + totalB2b;

  // Add test form
  const openAddTest = () => {
    setFormValues(DEFAULT_FORM);
    setAddTestOpen(true);
  };

  const openEditTest = (test: PathologyTest) => {
    setEditingTest(test);
    setFormValues({
      name: test.name,
      category: test.category,
      mrp: String(test.mrp),
      b2bRate: String(test.b2bRate),
    });
  };

  const validateForm = (vals: TestFormValues): string | null => {
    if (!vals.name.trim()) return "Test name is required";
    if (!vals.category.trim()) return "Category is required";
    const mrp = Number.parseFloat(vals.mrp);
    const b2b = Number.parseFloat(vals.b2bRate);
    if (Number.isNaN(mrp) || mrp < 0) return "Valid MRP is required";
    if (Number.isNaN(b2b) || b2b < 0) return "Valid B2B rate is required";
    return null;
  };

  const handleAddTest = async () => {
    const err = validateForm(formValues);
    if (err) {
      toast.error(err);
      return;
    }
    try {
      await addTestMutation.mutateAsync({
        name: formValues.name.trim(),
        category: formValues.category.trim(),
        mrp: Number.parseFloat(formValues.mrp),
        b2bRate: Number.parseFloat(formValues.b2bRate),
      });
      toast.success("Test added successfully");
      setAddTestOpen(false);
      setFormValues(DEFAULT_FORM);
    } catch {
      toast.error("Failed to add test");
    }
  };

  const handleUpdateTest = async () => {
    if (!editingTest) return;
    const err = validateForm(formValues);
    if (err) {
      toast.error(err);
      return;
    }
    try {
      await updateTestMutation.mutateAsync({
        id: editingTest.id,
        name: formValues.name.trim(),
        category: formValues.category.trim(),
        mrp: Number.parseFloat(formValues.mrp),
        b2bRate: Number.parseFloat(formValues.b2bRate),
      });
      toast.success("Test updated successfully");
      setEditingTest(null);
    } catch {
      toast.error("Failed to update test");
    }
  };

  const handleDeleteTest = async () => {
    if (deleteTestId === null) return;
    try {
      await deleteTestMutation.mutateAsync(deleteTestId);
      toast.success("Test deleted");
      setDeleteTestId(null);
    } catch {
      toast.error("Failed to delete test");
    }
  };

  const handleCreateSubAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubAccountName.trim()) {
      toast.error("Subaccount name is required");
      return;
    }
    try {
      await createSubAccountMutation.mutateAsync(newSubAccountName.trim());
      toast.success(`Subaccount "${newSubAccountName.trim()}" created`);
      setNewSubAccountName("");
    } catch {
      toast.error("Failed to create subaccount");
    }
  };

  const handleDeleteSubAccount = async () => {
    if (deleteSubId === null) return;
    try {
      await deleteSubAccountMutation.mutateAsync(deleteSubId);
      toast.success("Subaccount deleted");
      setDeleteSubId(null);
      // Update cache
      const remaining = subaccounts.filter((s) => s.id !== deleteSubId);
      const serializable = remaining.map((s) => ({
        id: String(s.id),
        name: s.name,
      }));
      localStorage.setItem(SUBACCOUNTS_CACHE_KEY, JSON.stringify(serializable));
    } catch {
      toast.error("Failed to delete subaccount");
    }
  };

  const TestForm = ({
    onSubmit,
    loading,
  }: { onSubmit: () => void; loading: boolean }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="test-name">Test Name</Label>
          <Input
            id="test-name"
            value={formValues.name}
            onChange={(e) =>
              setFormValues((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="e.g., Complete Blood Count"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="test-category">Category</Label>
          <Select
            value={formValues.category}
            onValueChange={(v) => setFormValues((p) => ({ ...p, category: v }))}
          >
            <SelectTrigger id="test-category">
              <SelectValue placeholder="Select category" />
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="test-mrp">MRP (₹)</Label>
            <Input
              id="test-mrp"
              type="number"
              min="0"
              step="0.01"
              value={formValues.mrp}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, mrp: e.target.value }))
              }
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-b2b">B2B Rate (₹)</Label>
            <Input
              id="test-b2b"
              type="number"
              min="0"
              step="0.01"
              value={formValues.b2bRate}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, b2bRate: e.target.value }))
              }
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          onClick={onSubmit}
          disabled={loading}
          className="bg-[oklch(0.38_0.1_210)] hover:bg-[oklch(0.32_0.1_210)] text-white"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          {loading ? "Saving..." : "Save Test"}
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[oklch(0.25_0.07_215)] text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="bg-[oklch(0.55_0.15_175)] p-2 rounded-lg">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-fraunces font-bold">
              PathLab Rate Manager
            </h1>
            <p className="text-xs text-white/60">Admin Dashboard</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
              <ShieldCheck className="w-4 h-4 text-[oklch(0.65_0.18_175)]" />
              <span className="text-sm font-medium">Arit</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b border-[oklch(0.88_0.02_200)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[oklch(0.92_0.06_200)] rounded-lg flex items-center justify-center">
              <TestTube className="w-4 h-4 text-[oklch(0.38_0.1_210)]" />
            </div>
            <div>
              <div className="text-lg font-fraunces font-bold text-[oklch(0.25_0.06_215)]">
                {tests.length}
              </div>
              <div className="text-xs text-[oklch(0.55_0.025_215)]">
                Total Tests
              </div>
            </div>
          </div>
          <div className="h-8 w-px bg-[oklch(0.88_0.02_200)]" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[oklch(0.92_0.06_175)] rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-[oklch(0.45_0.12_175)]" />
            </div>
            <div>
              <div className="text-lg font-fraunces font-bold text-[oklch(0.25_0.06_215)]">
                {subaccounts.length}
              </div>
              <div className="text-xs text-[oklch(0.55_0.025_215)]">
                Subaccounts
              </div>
            </div>
          </div>
          <div className="h-8 w-px bg-[oklch(0.88_0.02_200)]" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[oklch(0.91_0.06_90)] rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-[oklch(0.38_0.1_90)]">
                {categories.length}
              </span>
            </div>
            <div>
              <div className="text-xs text-[oklch(0.55_0.025_215)]">
                Categories
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="tests">
          <TabsList className="mb-6 bg-[oklch(0.93_0.015_200)] border border-[oklch(0.88_0.02_200)]">
            <TabsTrigger
              value="tests"
              className="data-[state=active]:bg-white data-[state=active]:text-[oklch(0.25_0.07_215)] data-[state=active]:shadow-sm"
            >
              <TestTube className="mr-2 h-4 w-4" />
              Tests Management
            </TabsTrigger>
            <TabsTrigger
              value="subaccounts"
              className="data-[state=active]:bg-white data-[state=active]:text-[oklch(0.25_0.07_215)] data-[state=active]:shadow-sm"
            >
              <Users className="mr-2 h-4 w-4" />
              Subaccounts
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-white data-[state=active]:text-[oklch(0.25_0.07_215)] data-[state=active]:shadow-sm"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Tests Tab */}
          <TabsContent value="tests">
            <Card className="border-[oklch(0.88_0.02_200)] shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <CardTitle className="font-fraunces text-[oklch(0.25_0.06_215)]">
                    Pathological Tests
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.55_0.025_215)]" />
                      <Input
                        placeholder="Search tests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <X className="w-3 h-3 text-[oklch(0.55_0.025_215)]" />
                        </button>
                      )}
                    </div>
                    {/* Category filter */}
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="All categories" />
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
                    {/* Add test */}
                    <Button
                      onClick={openAddTest}
                      className="bg-[oklch(0.38_0.1_210)] hover:bg-[oklch(0.32_0.1_210)] text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Test
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[oklch(0.96_0.01_215)] hover:bg-[oklch(0.96_0.01_215)]">
                        <TableHead className="pl-4 w-10">
                          <Checkbox
                            checked={allFilteredSelected}
                            data-state={
                              someFilteredSelected && !allFilteredSelected
                                ? "indeterminate"
                                : undefined
                            }
                            onCheckedChange={toggleSelectAll}
                            aria-label="Select all tests"
                          />
                        </TableHead>
                        <TableHead className="font-semibold text-[oklch(0.3_0.05_215)] pl-2">
                          Test Name
                        </TableHead>
                        <TableHead className="font-semibold text-[oklch(0.3_0.05_215)]">
                          Category
                        </TableHead>
                        <TableHead className="font-semibold text-[oklch(0.3_0.05_215)] text-right">
                          MRP
                        </TableHead>
                        <TableHead className="font-semibold text-[oklch(0.3_0.05_215)] text-right">
                          B2B Rate
                        </TableHead>
                        <TableHead className="font-semibold text-[oklch(0.3_0.05_215)] text-right">
                          Total
                        </TableHead>
                        <TableHead className="font-semibold text-[oklch(0.3_0.05_215)] text-right pr-6">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testsLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
                          <TableRow key={`skel-test-${i}`}>
                            <TableCell className="pl-4 w-10">
                              <Skeleton className="h-4 w-4 rounded" />
                            </TableCell>
                            <TableCell className="pl-2">
                              <Skeleton className="h-4 w-48" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-24 rounded-full" />
                            </TableCell>
                            <TableCell className="text-right">
                              <Skeleton className="h-4 w-16 ml-auto" />
                            </TableCell>
                            <TableCell className="text-right">
                              <Skeleton className="h-4 w-16 ml-auto" />
                            </TableCell>
                            <TableCell className="text-right">
                              <Skeleton className="h-4 w-16 ml-auto" />
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Skeleton className="h-8 w-20 ml-auto" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : filteredTests.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-12 text-[oklch(0.55_0.025_215)]"
                          >
                            <TestTube className="w-10 h-10 mx-auto mb-2 text-[oklch(0.75_0.02_215)]" />
                            <p className="font-medium">No tests found</p>
                            <p className="text-sm">
                              {searchQuery || categoryFilter !== "all"
                                ? "Try adjusting your search or filter"
                                : "Add your first pathological test"}
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTests.map((test) => {
                          const testId = String(test.id);
                          const isSelected = selectedIds.has(testId);
                          return (
                            <tr
                              key={testId}
                              className={`border-b border-[oklch(0.93_0.01_215)] transition-colors cursor-pointer ${isSelected ? "bg-[oklch(0.93_0.05_210)]" : "hover:bg-[oklch(0.97_0.008_200)]"}`}
                              onClick={() => toggleSelect(testId)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ")
                                  toggleSelect(testId);
                              }}
                            >
                              <TableCell
                                className="pl-4 w-10 py-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleSelect(testId)}
                                  aria-label={`Select ${test.name}`}
                                />
                              </TableCell>
                              <TableCell className="font-medium text-[oklch(0.25_0.06_215)] pl-2 py-3">
                                {test.name}
                              </TableCell>
                              <TableCell className="py-3">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryClass(test.category)}`}
                                >
                                  {test.category}
                                </span>
                              </TableCell>
                              <TableCell className="text-right py-3 font-mono text-[oklch(0.35_0.1_205)] font-semibold">
                                {formatCurrency(test.mrp)}
                              </TableCell>
                              <TableCell className="text-right py-3 font-mono text-[oklch(0.4_0.12_160)] font-semibold">
                                {formatCurrency(test.b2bRate)}
                              </TableCell>
                              <TableCell className="text-right py-3 font-mono text-[oklch(0.32_0.1_270)] font-bold">
                                {formatCurrency(test.mrp + test.b2bRate)}
                              </TableCell>
                              <TableCell
                                className="text-right py-3 pr-6"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditTest(test)}
                                    className="h-8 px-3 border-[oklch(0.82_0.04_200)] text-[oklch(0.38_0.1_210)] hover:bg-[oklch(0.92_0.05_200)] hover:border-[oklch(0.38_0.1_210)]"
                                  >
                                    <Pencil className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteTestId(test.id)}
                                    className="h-8 px-3 border-[oklch(0.82_0.08_25)] text-[oklch(0.55_0.2_25)] hover:bg-[oklch(0.96_0.04_25)] hover:border-[oklch(0.55_0.2_25)]"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </tr>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
                {/* Summary / Calculator Bar */}
                <AnimatePresence>
                  {selectedTests.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: 12, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden border-t border-[oklch(0.82_0.05_270)]"
                    >
                      <div className="px-6 py-4 bg-[oklch(0.94_0.04_270)]">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2 text-[oklch(0.32_0.1_270)]">
                            <Calculator className="w-4 h-4" />
                            <span className="font-semibold text-sm">
                              {selectedTests.length} test
                              {selectedTests.length > 1 ? "s" : ""} selected
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 ml-auto">
                            <div className="text-sm text-[oklch(0.4_0.06_270)]">
                              <span className="text-[oklch(0.55_0.04_270)]">
                                Total MRP:
                              </span>{" "}
                              <span className="font-mono font-semibold text-[oklch(0.35_0.1_205)]">
                                {formatCurrency(totalMrp)}
                              </span>
                            </div>
                            <div className="w-px h-4 bg-[oklch(0.78_0.06_270)]" />
                            <div className="text-sm text-[oklch(0.4_0.06_270)]">
                              <span className="text-[oklch(0.55_0.04_270)]">
                                Total B2B:
                              </span>{" "}
                              <span className="font-mono font-semibold text-[oklch(0.4_0.12_160)]">
                                {formatCurrency(totalB2b)}
                              </span>
                            </div>
                            <div className="w-px h-4 bg-[oklch(0.78_0.06_270)]" />
                            <div className="bg-[oklch(0.32_0.1_270)] text-white px-4 py-1.5 rounded-lg">
                              <span className="text-xs text-white/70 mr-1">
                                Grand Total:
                              </span>
                              <span className="font-mono font-bold">
                                {formatCurrency(grandTotal)}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedIds(new Set())}
                              className="h-7 px-2 text-[oklch(0.45_0.08_270)] hover:bg-[oklch(0.88_0.06_270)] hover:text-[oklch(0.3_0.1_270)]"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Clear
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {filteredTests.length > 0 && (
                  <div className="px-6 py-3 text-sm text-[oklch(0.55_0.025_215)] border-t border-[oklch(0.93_0.01_215)]">
                    Showing {filteredTests.length} of {tests.length} tests
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subaccounts Tab */}
          <TabsContent value="subaccounts">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Create subaccount form */}
              <Card className="border-[oklch(0.88_0.02_200)] shadow-sm">
                <CardHeader>
                  <CardTitle className="font-fraunces text-[oklch(0.25_0.06_215)] text-lg">
                    Create Subaccount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateSubAccount} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sub-name">Subaccount Name</Label>
                      <Input
                        id="sub-name"
                        value={newSubAccountName}
                        onChange={(e) => setNewSubAccountName(e.target.value)}
                        placeholder="e.g., City Hospital"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={createSubAccountMutation.isPending}
                      className="w-full bg-[oklch(0.45_0.12_175)] hover:bg-[oklch(0.38_0.12_175)] text-white"
                    >
                      {createSubAccountMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      Create Subaccount
                    </Button>
                  </form>
                  <div className="mt-4 p-3 bg-[oklch(0.95_0.015_200)] rounded-lg text-xs text-[oklch(0.52_0.025_215)]">
                    Subaccounts can view test rates without any login
                    credentials.
                  </div>
                </CardContent>
              </Card>

              {/* Subaccounts list */}
              <div className="lg:col-span-2">
                <Card className="border-[oklch(0.88_0.02_200)] shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-fraunces text-[oklch(0.25_0.06_215)] text-lg">
                      Active Subaccounts ({subaccounts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {subaccountsLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton
                            // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
                            key={`skel-sub-${i}`}
                            className="h-14 w-full rounded-lg"
                          />
                        ))}
                      </div>
                    ) : subaccounts.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-14 h-14 bg-[oklch(0.93_0.015_200)] rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users className="w-7 h-7 text-[oklch(0.55_0.06_200)]" />
                        </div>
                        <p className="text-[oklch(0.52_0.025_215)] font-medium">
                          No subaccounts yet
                        </p>
                        <p className="text-sm text-[oklch(0.65_0.02_215)]">
                          Create your first subaccount using the form.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <AnimatePresence>
                          {subaccounts.map((sub, idx) => (
                            <motion.div
                              key={String(sub.id)}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ delay: idx * 0.05 }}
                              className="flex items-center justify-between p-4 rounded-lg border border-[oklch(0.88_0.02_200)] hover:border-[oklch(0.78_0.05_200)] hover:bg-[oklch(0.97_0.008_200)] transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[oklch(0.88_0.06_175)] rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-[oklch(0.35_0.1_185)] font-bold">
                                    {sub.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-[oklch(0.25_0.06_215)]">
                                    {sub.name}
                                  </div>
                                  <div className="text-xs text-[oklch(0.6_0.025_215)]">
                                    No auth required · Read-only access
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteSubId(sub.id)}
                                className="text-[oklch(0.55_0.2_25)] hover:bg-[oklch(0.96_0.04_25)] hover:text-[oklch(0.45_0.22_25)]"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Test Dialog */}
      <Dialog open={addTestOpen} onOpenChange={setAddTestOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-fraunces text-[oklch(0.25_0.06_215)]">
              Add New Test
            </DialogTitle>
          </DialogHeader>
          <TestForm
            onSubmit={handleAddTest}
            loading={addTestMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Test Dialog */}
      <Dialog
        open={!!editingTest}
        onOpenChange={(open) => !open && setEditingTest(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-fraunces text-[oklch(0.25_0.06_215)]">
              Edit Test: {editingTest?.name}
            </DialogTitle>
          </DialogHeader>
          <TestForm
            onSubmit={handleUpdateTest}
            loading={updateTestMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Test Confirmation */}
      <AlertDialog
        open={deleteTestId !== null}
        onOpenChange={(open) => !open && setDeleteTestId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-fraunces">
              Delete Test?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this test and its pricing data. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTest}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteTestMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete SubAccount Confirmation */}
      <AlertDialog
        open={deleteSubId !== null}
        onOpenChange={(open) => !open && setDeleteSubId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-fraunces">
              Delete Subaccount?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the subaccount. Users with this subaccount will
              lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubAccount}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteSubAccountMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete Subaccount
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-[oklch(0.88_0.02_200)] text-center">
        <p className="text-sm text-[oklch(0.58_0.025_215)]">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[oklch(0.38_0.1_210)] hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
