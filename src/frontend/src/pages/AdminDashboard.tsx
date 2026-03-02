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
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Calculator,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Copy,
  FlaskConical,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Smartphone,
  Star,
  Tag,
  TestTube,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Lab, PathologyTest, SubAccount } from "../backend.d.ts";
import { SUBACCOUNTS_CACHE_KEY, useAuth } from "../context/AuthContext";
import {
  useAddPathologyTest,
  useAddSampleData,
  useAddTransaction,
  useAdminLogout,
  useCreateLab,
  useCreateSubAccount,
  useDeleteLab,
  useDeletePathologyTest,
  useDeleteSubAccount,
  useDeleteSubAccountTestRate,
  useDeleteTransaction,
  useGetAllLabs,
  useGetAllSubAccounts,
  useGetAllTests,
  useGetAllTransactions,
  useGetSubAccountRates,
  useSetSubAccountTestRate,
  useUpdateLab,
  useUpdatePathologyTest,
  useUpdateSubAccount,
  useUpdateTransactionPaid,
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

function formatB2bPercent(b2bRate: number, mrp: number): string {
  if (!mrp || mrp === 0) return "-";
  return `${((b2bRate / mrp) * 100).toFixed(1)}%`;
}

// ─── SubAccount Rates Dialog ──────────────────────────────────────────────────

interface SubAccountRatesDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subAccount: SubAccount;
  tests: PathologyTest[];
  sessionToken: string;
}

function SubAccountRatesDialog({
  open,
  onOpenChange,
  subAccount,
  tests,
  sessionToken,
}: SubAccountRatesDialogProps) {
  const { data: customRates = [], isLoading: ratesLoading } =
    useGetSubAccountRates(open ? subAccount.id : null);

  const setRateMutation = useSetSubAccountTestRate(sessionToken);
  const deleteRateMutation = useDeleteSubAccountTestRate(sessionToken);

  const [localRates, setLocalRates] = useState<Record<string, string>>({});
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && !ratesLoading) {
      const map: Record<string, string> = {};
      for (const r of customRates) {
        map[String(r.testId)] = String(r.b2bRate);
      }
      setLocalRates(map);
    }
  }, [open, customRates, ratesLoading]);

  const customRateMap = new Map<string, number>(
    customRates.map((r) => [String(r.testId), r.b2bRate]),
  );

  const handleSaveRate = async (test: PathologyTest) => {
    const testIdStr = String(test.id);
    const val = localRates[testIdStr];
    const parsedVal =
      val !== undefined && val.trim() !== "" ? Number.parseFloat(val) : null;

    setSavingIds((prev) => new Set(prev).add(testIdStr));
    try {
      if (parsedVal === null || Number.isNaN(parsedVal)) {
        if (customRateMap.has(testIdStr)) {
          await deleteRateMutation.mutateAsync({
            subAccountId: subAccount.id,
            testId: test.id,
          });
          toast.success(`Reset to default for ${test.name}`);
        }
        setLocalRates((prev) => {
          const next = { ...prev };
          delete next[testIdStr];
          return next;
        });
      } else {
        await setRateMutation.mutateAsync({
          subAccountId: subAccount.id,
          testId: test.id,
          b2bRate: parsedVal,
        });
        toast.success(`Custom rate saved for ${test.name}`);
      }
    } catch {
      toast.error(`Failed to save rate for ${test.name}`);
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(testIdStr);
        return next;
      });
    }
  };

  const handleResetRate = async (test: PathologyTest) => {
    const testIdStr = String(test.id);
    setSavingIds((prev) => new Set(prev).add(testIdStr));
    try {
      await deleteRateMutation.mutateAsync({
        subAccountId: subAccount.id,
        testId: test.id,
      });
      setLocalRates((prev) => {
        const next = { ...prev };
        delete next[testIdStr];
        return next;
      });
      toast.success(`Reset to default for ${test.name}`);
    } catch {
      toast.error(`Failed to reset rate for ${test.name}`);
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(testIdStr);
        return next;
      });
    }
  };

  const handleResetAll = async () => {
    if (customRates.length === 0) {
      toast.info("No custom rates to reset");
      return;
    }
    try {
      await Promise.all(
        customRates.map((r) =>
          deleteRateMutation.mutateAsync({
            subAccountId: subAccount.id,
            testId: r.testId,
          }),
        ),
      );
      setLocalRates({});
      toast.success("All custom rates reset to default");
    } catch {
      toast.error("Failed to reset all rates");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[oklch(0.88_0.06_175)] rounded-full flex items-center justify-center">
              <span className="text-[oklch(0.35_0.1_185)] font-bold">
                {subAccount.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <DialogTitle className="font-fraunces text-[oklch(0.25_0.06_215)]">
                B2B Rates for {subAccount.name}
              </DialogTitle>
              <p className="text-xs text-[oklch(0.55_0.025_215)] mt-0.5">
                Set custom B2B rates. Leave blank to use the default rate.
              </p>
            </div>
            {customRates.length > 0 && (
              <Badge className="ml-auto bg-[oklch(0.91_0.08_50)] text-[oklch(0.38_0.14_50)] border border-[oklch(0.82_0.1_50)] hover:bg-[oklch(0.91_0.08_50)]">
                <Star className="w-3 h-3 mr-1 fill-current" />
                {customRates.length} custom
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {ratesLoading ? (
            <div className="space-y-3 p-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
                  key={`rate-skel-${i}`}
                  className="h-12 w-full rounded-lg"
                />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-[oklch(0.96_0.01_215)] hover:bg-[oklch(0.96_0.01_215)]">
                  <TableHead className="font-semibold text-[oklch(0.3_0.05_215)] pl-4">
                    Test Name
                  </TableHead>
                  <TableHead className="font-semibold text-[oklch(0.3_0.05_215)]">
                    Category
                  </TableHead>
                  <TableHead className="font-semibold text-[oklch(0.3_0.05_215)] text-right">
                    MRP
                  </TableHead>
                  <TableHead className="font-semibold text-[oklch(0.3_0.05_215)] text-right">
                    Default B2B
                  </TableHead>
                  <TableHead className="font-semibold text-[oklch(0.3_0.05_215)] text-right w-44">
                    Custom B2B Rate
                  </TableHead>
                  <TableHead className="font-semibold text-[oklch(0.3_0.05_215)] text-right w-28 pr-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => {
                  const testIdStr = String(test.id);
                  const hasCustom = customRateMap.has(testIdStr);
                  const currentCustom = customRateMap.get(testIdStr);
                  const isSaving = savingIds.has(testIdStr);
                  const inputVal = localRates[testIdStr] ?? "";
                  const isDirty =
                    inputVal !==
                    (currentCustom !== undefined ? String(currentCustom) : "");

                  return (
                    <TableRow
                      key={testIdStr}
                      className={`border-b border-[oklch(0.93_0.01_215)] ${hasCustom ? "bg-[oklch(0.97_0.03_50)]" : ""}`}
                    >
                      <TableCell className="pl-4 py-3">
                        <div className="flex items-center gap-2">
                          {hasCustom && (
                            <Star className="w-3 h-3 text-[oklch(0.55_0.14_50)] fill-current flex-shrink-0" />
                          )}
                          <span className="font-medium text-[oklch(0.25_0.06_215)] text-sm">
                            {test.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryClass(test.category)}`}
                        >
                          {test.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right py-3 font-mono text-sm text-[oklch(0.35_0.1_205)] font-semibold">
                        {formatCurrency(test.mrp)}
                      </TableCell>
                      <TableCell className="text-right py-3 font-mono text-sm text-[oklch(0.4_0.12_160)] font-semibold">
                        {formatCurrency(test.b2bRate)}
                      </TableCell>
                      <TableCell className="text-right py-3 pr-2">
                        <Input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          value={inputVal}
                          onChange={(e) =>
                            setLocalRates((prev) => ({
                              ...prev,
                              [testIdStr]: e.target.value,
                            }))
                          }
                          placeholder={formatCurrency(test.b2bRate)}
                          autoComplete="off"
                          className={`w-32 text-right font-mono text-sm h-8 ${hasCustom ? "border-[oklch(0.75_0.1_50)] bg-[oklch(0.97_0.04_50)]" : "border-[oklch(0.82_0.04_200)]"}`}
                        />
                      </TableCell>
                      <TableCell className="text-right py-3 pr-4">
                        <div className="flex items-center justify-end gap-1">
                          {isDirty && (
                            <Button
                              size="sm"
                              onClick={() => handleSaveRate(test)}
                              disabled={isSaving}
                              className="h-7 px-2 text-xs bg-[oklch(0.38_0.1_210)] hover:bg-[oklch(0.32_0.1_210)] text-white"
                            >
                              {isSaving ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                          {hasCustom && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResetRate(test)}
                              disabled={isSaving}
                              className="h-7 px-2 text-xs text-[oklch(0.55_0.2_25)] hover:bg-[oklch(0.96_0.04_25)] hover:text-[oklch(0.45_0.22_25)]"
                              title="Reset to default"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 border-t border-[oklch(0.9_0.01_215)] pt-4 mt-2">
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAll}
              disabled={
                customRates.length === 0 || deleteRateMutation.isPending
              }
              className="border-[oklch(0.82_0.08_25)] text-[oklch(0.55_0.2_25)] hover:bg-[oklch(0.96_0.04_25)] hover:border-[oklch(0.55_0.2_25)]"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset All to Default
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[oklch(0.82_0.04_200)]"
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Share Link Dialog ────────────────────────────────────────────────────────

interface ShareLinkDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subAccount: SubAccount;
}

function ShareLinkDialog({
  open,
  onOpenChange,
  subAccount,
}: ShareLinkDialogProps) {
  const shareUrl = `${window.location.origin + window.location.pathname}#/sub/${String(subAccount.id)}`;

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareMessage = `Access your PathLab rate card here: ${shareUrl}`;

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleEmail = () => {
    window.open(
      `mailto:?subject=${encodeURIComponent("PathLab Rate Card Link")}&body=${encodeURIComponent(shareMessage)}`,
    );
  };

  const handleSms = () => {
    // iOS uses sms:&body=, Android uses sms:?body=
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const sep = isIos ? "&" : "?";
    window.open(`sms:${sep}body=${encodeURIComponent(shareMessage)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[oklch(0.88_0.06_175)] rounded-full flex items-center justify-center flex-shrink-0">
              <Share2 className="w-4 h-4 text-[oklch(0.35_0.1_185)]" />
            </div>
            <div>
              <DialogTitle className="font-fraunces text-[oklch(0.25_0.06_215)]">
                Share Access Link
              </DialogTitle>
              <p className="text-xs text-[oklch(0.55_0.025_215)] mt-0.5">
                Share <span className="font-semibold">{subAccount.name}</span>'s
                rate card link
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* URL display + copy */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-[oklch(0.45_0.05_215)] uppercase tracking-wide">
              Shareable Link
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2.5 bg-[oklch(0.96_0.01_215)] rounded-lg border border-[oklch(0.88_0.02_200)] font-mono text-xs text-[oklch(0.35_0.06_215)] overflow-hidden whitespace-nowrap overflow-ellipsis">
                {shareUrl}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className={`shrink-0 border-[oklch(0.82_0.04_200)] transition-all ${copied ? "bg-[oklch(0.93_0.06_150)] border-[oklch(0.75_0.1_150)] text-[oklch(0.35_0.12_150)]" : "text-[oklch(0.38_0.1_210)] hover:bg-[oklch(0.92_0.05_200)]"}`}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span className="ml-1.5">{copied ? "Copied!" : "Copy"}</span>
              </Button>
            </div>
            <p className="text-xs text-[oklch(0.6_0.025_215)]">
              Anyone with this link and their PIN can access the rate card.
            </p>
          </div>

          {/* Share via buttons */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-[oklch(0.45_0.05_215)] uppercase tracking-wide">
              Share Via
            </p>
            <div className="grid grid-cols-3 gap-3">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsApp}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-[oklch(0.8_0.08_150)] bg-[oklch(0.96_0.04_150)] hover:bg-[oklch(0.91_0.07_150)] transition-colors group"
              >
                <div className="w-10 h-10 bg-[oklch(0.5_0.15_150)] rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-[oklch(0.35_0.1_150)]">
                  WhatsApp
                </span>
              </button>

              {/* Email */}
              <button
                type="button"
                onClick={handleEmail}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-[oklch(0.8_0.06_210)] bg-[oklch(0.96_0.03_210)] hover:bg-[oklch(0.91_0.06_210)] transition-colors group"
              >
                <div className="w-10 h-10 bg-[oklch(0.38_0.1_210)] rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-[oklch(0.3_0.09_210)]">
                  Email
                </span>
              </button>

              {/* SMS */}
              <button
                type="button"
                onClick={handleSms}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-[oklch(0.8_0.07_270)] bg-[oklch(0.96_0.03_270)] hover:bg-[oklch(0.91_0.06_270)] transition-colors group"
              >
                <div className="w-10 h-10 bg-[oklch(0.42_0.12_270)] rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-[oklch(0.32_0.09_270)]">
                  SMS
                </span>
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-[oklch(0.9_0.01_215)] pt-4 mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[oklch(0.82_0.04_200)]"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Test Form ────────────────────────────────────────────────────────────────

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

interface TestFormProps {
  formValues: TestFormValues;
  setFormValues: React.Dispatch<React.SetStateAction<TestFormValues>>;
  onSubmit: () => void;
  loading: boolean;
}

function TestForm({
  formValues,
  setFormValues,
  onSubmit,
  loading,
}: TestFormProps) {
  return (
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
            autoComplete="off"
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
              inputMode="decimal"
              min="0"
              step="0.01"
              value={formValues.mrp}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, mrp: e.target.value }))
              }
              placeholder="0.00"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-b2b">B2B Rate (₹)</Label>
            <Input
              id="test-b2b"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={formValues.b2bRate}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, b2bRate: e.target.value }))
              }
              placeholder="0.00"
              autoComplete="off"
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
}

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
                className="flex-1 border-[oklch(0.82_0.04_200)]"
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
              Used for forgot password verification.
            </p>
          </div>

          <Separator className="bg-[oklch(0.9_0.01_215)]" />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="w-4 h-4 text-[oklch(0.38_0.1_210)]" />
              <h3 className="font-semibold text-[oklch(0.3_0.05_215)] text-sm">
                Change Password
              </h3>
            </div>
            <div className="mb-3 px-3 py-2 bg-[oklch(0.95_0.015_200)] rounded-lg border border-[oklch(0.88_0.04_200)] text-xs text-[oklch(0.52_0.025_215)]">
              Default password is{" "}
              <span className="font-mono font-semibold">12345</span>.{" "}
              {getPasswordOverride()
                ? "A custom password is currently active."
                : "No custom password set — using default."}
            </div>
            <form onSubmit={handleSavePassword} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className="border-[oklch(0.82_0.04_200)]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className="border-[oklch(0.82_0.04_200)]"
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

// ─── Labs Tab ────────────────────────────────────────────────────────────────

interface LabsTabProps {
  sessionToken: string;
}

function LabsTab({ sessionToken }: LabsTabProps) {
  const { data: labs = [], isLoading } = useGetAllLabs();
  const createLabMutation = useCreateLab(sessionToken);
  const updateLabMutation = useUpdateLab(sessionToken);
  const deleteLabMutation = useDeleteLab(sessionToken);

  const [newLabName, setNewLabName] = useState("");
  const [newLabContact, setNewLabContact] = useState("");
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [editLabName, setEditLabName] = useState("");
  const [editLabContact, setEditLabContact] = useState("");
  const [deleteLabId, setDeleteLabId] = useState<bigint | null>(null);

  const handleCreateLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabName.trim()) {
      toast.error("Lab name is required");
      return;
    }
    try {
      await createLabMutation.mutateAsync({
        name: newLabName.trim(),
        contact: newLabContact.trim(),
      });
      toast.success(`Lab "${newLabName.trim()}" created`);
      setNewLabName("");
      setNewLabContact("");
    } catch {
      toast.error("Failed to create lab");
    }
  };

  const handleUpdateLab = async () => {
    if (!editingLab) return;
    if (!editLabName.trim()) {
      toast.error("Lab name is required");
      return;
    }
    try {
      await updateLabMutation.mutateAsync({
        id: editingLab.id,
        name: editLabName.trim(),
        contact: editLabContact.trim(),
      });
      toast.success("Lab updated");
      setEditingLab(null);
    } catch {
      toast.error("Failed to update lab");
    }
  };

  const handleDeleteLab = async () => {
    if (deleteLabId === null) return;
    try {
      await deleteLabMutation.mutateAsync(deleteLabId);
      toast.success("Lab deleted");
      setDeleteLabId(null);
    } catch {
      toast.error("Failed to delete lab");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Create Lab Form */}
      <Card className="border-[oklch(0.88_0.02_200)] shadow-sm">
        <CardHeader>
          <CardTitle className="font-fraunces text-[oklch(0.25_0.06_215)] text-lg">
            Add Lab
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateLab} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lab-name">Lab Name</Label>
              <Input
                id="lab-name"
                value={newLabName}
                onChange={(e) => setNewLabName(e.target.value)}
                placeholder="e.g., City Diagnostic Centre"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lab-contact">Contact / Address</Label>
              <Input
                id="lab-contact"
                value={newLabContact}
                onChange={(e) => setNewLabContact(e.target.value)}
                placeholder="e.g., 9876543210 / City Road"
                autoComplete="off"
              />
            </div>
            <Button
              type="submit"
              disabled={createLabMutation.isPending}
              className="w-full bg-[oklch(0.38_0.1_210)] hover:bg-[oklch(0.32_0.1_210)] text-white"
            >
              {createLabMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Lab
            </Button>
          </form>
          <p className="mt-3 text-xs text-[oklch(0.55_0.025_215)]">
            Labs can be assigned to subaccounts to display the lab name on their
            rate card.
          </p>
        </CardContent>
      </Card>

      {/* Labs List */}
      <div className="lg:col-span-2">
        <Card className="border-[oklch(0.88_0.02_200)] shadow-sm">
          <CardHeader>
            <CardTitle className="font-fraunces text-[oklch(0.25_0.06_215)] text-lg">
              Labs ({labs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton
                    // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
                    key={`lab-skel-${i}`}
                    className="h-14 w-full rounded-lg"
                  />
                ))}
              </div>
            ) : labs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-[oklch(0.93_0.015_200)] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-7 h-7 text-[oklch(0.55_0.06_200)]" />
                </div>
                <p className="text-[oklch(0.52_0.025_215)] font-medium">
                  No labs yet
                </p>
                <p className="text-sm text-[oklch(0.65_0.02_215)]">
                  Add your first lab using the form.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {labs.map((lab) => (
                  <div
                    key={String(lab.id)}
                    className="flex items-center justify-between p-4 rounded-lg border border-[oklch(0.88_0.02_200)] hover:bg-[oklch(0.97_0.008_200)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[oklch(0.92_0.06_210)] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-[oklch(0.38_0.1_210)]" />
                      </div>
                      <div>
                        <div className="font-medium text-[oklch(0.25_0.06_215)]">
                          {lab.name}
                        </div>
                        {lab.contact && (
                          <div className="text-xs text-[oklch(0.6_0.025_215)]">
                            {lab.contact}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingLab(lab);
                          setEditLabName(lab.name);
                          setEditLabContact(lab.contact);
                        }}
                        className="text-[oklch(0.38_0.1_210)] hover:bg-[oklch(0.92_0.05_200)]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteLabId(lab.id)}
                        className="text-[oklch(0.55_0.2_25)] hover:bg-[oklch(0.96_0.04_25)]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Lab Dialog */}
      <Dialog
        open={!!editingLab}
        onOpenChange={(v) => !v && setEditingLab(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-fraunces text-[oklch(0.25_0.06_215)]">
              Edit Lab
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Lab Name</Label>
              <Input
                value={editLabName}
                onChange={(e) => setEditLabName(e.target.value)}
                placeholder="Lab name"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label>Contact / Address</Label>
              <Input
                value={editLabContact}
                onChange={(e) => setEditLabContact(e.target.value)}
                placeholder="Contact or address"
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLab(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateLab}
              disabled={updateLabMutation.isPending}
              className="bg-[oklch(0.38_0.1_210)] hover:bg-[oklch(0.32_0.1_210)] text-white"
            >
              {updateLabMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Lab Confirmation */}
      <AlertDialog
        open={deleteLabId !== null}
        onOpenChange={(v) => !v && setDeleteLabId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-fraunces">
              Delete Lab?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the lab. Subaccounts assigned to it will lose
              their lab assignment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLab}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteLabMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete Lab
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Billing Tab ──────────────────────────────────────────────────────────────

interface BillingTabProps {
  sessionToken: string;
  tests: PathologyTest[];
  subaccounts: SubAccount[];
}

function BillingTab({ sessionToken, tests, subaccounts }: BillingTabProps) {
  const addTransactionMutation = useAddTransaction(sessionToken);
  const updatePaidMutation = useUpdateTransactionPaid(sessionToken);
  const deleteTransactionMutation = useDeleteTransaction(sessionToken);
  const { data: transactions = [], isLoading: txnLoading } =
    useGetAllTransactions(sessionToken);
  // Add Entry form state
  const [selectedSubId, setSelectedSubId] = useState<string>("");
  const [patientName, setPatientName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [testSearchInput, setTestSearchInput] = useState("");
  const [testSearchQuery, setTestSearchQuery] = useState("");
  const testSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [selectedTestIds, setSelectedTestIds] = useState<Set<string>>(
    new Set(),
  );
  const [paidAmountInput, setPaidAmountInput] = useState("");
  const [notes, setNotes] = useState("");

  // Transaction list state
  const [filterSubId, setFilterSubId] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [expandedTxnId, setExpandedTxnId] = useState<string | null>(null);
  const [editingPaidId, setEditingPaidId] = useState<string | null>(null);
  const [editingPaidValue, setEditingPaidValue] = useState("");
  const [deleteTxnId, setDeleteTxnId] = useState<bigint | null>(null);

  // Get subaccount-specific rates for the selected subaccount
  const selectedSubAccountIdBig = selectedSubId ? BigInt(selectedSubId) : null;
  const { data: subAccountRates = [] } = useGetSubAccountRates(
    selectedSubAccountIdBig,
  );

  const customRateMap = new Map<string, number>(
    subAccountRates.map((r) => [String(r.testId), r.b2bRate]),
  );

  const getEffectiveRate = (test: PathologyTest): number => {
    const custom = customRateMap.get(String(test.id));
    return custom !== undefined ? custom : test.b2bRate;
  };

  const filteredTestsForSearch = tests.filter(
    (t) =>
      t.name.toLowerCase().includes(testSearchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(testSearchQuery.toLowerCase()),
  );

  const selectedTestsList = tests.filter((t) =>
    selectedTestIds.has(String(t.id)),
  );
  const totalAmount = selectedTestsList.reduce(
    (sum, t) => sum + getEffectiveRate(t),
    0,
  );
  const paidAmount = Number.parseFloat(paidAmountInput) || 0;
  const dueAmount = Math.max(0, totalAmount - paidAmount);

  const toggleTestSelect = (id: string) => {
    setSelectedTestIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubId) {
      toast.error("Please select a subaccount");
      return;
    }
    if (!patientName.trim()) {
      toast.error("Patient name is required");
      return;
    }
    if (selectedTestIds.size === 0) {
      toast.error("Please select at least one test");
      return;
    }

    try {
      await addTransactionMutation.mutateAsync({
        subAccountId: BigInt(selectedSubId),
        patientName: patientName.trim(),
        date,
        testIds: Array.from(selectedTestIds).map((id) => BigInt(id)),
        paidAmount,
        notes: notes.trim(),
      });
      toast.success("Entry added successfully");
      setSelectedSubId("");
      setPatientName("");
      setDate(new Date().toISOString().split("T")[0]);
      setSelectedTestIds(new Set());
      setPaidAmountInput("");
      setNotes("");
    } catch {
      toast.error("Failed to add entry");
    }
  };

  const handleUpdatePaid = async (txnId: bigint) => {
    const val = Number.parseFloat(editingPaidValue);
    if (Number.isNaN(val) || val < 0) {
      toast.error("Please enter a valid paid amount");
      return;
    }
    try {
      await updatePaidMutation.mutateAsync({
        transactionId: txnId,
        paidAmount: val,
      });
      toast.success("Payment updated");
      setEditingPaidId(null);
    } catch {
      toast.error("Failed to update payment");
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteTxnId) return;
    try {
      await deleteTransactionMutation.mutateAsync(deleteTxnId);
      toast.success("Transaction deleted");
      setDeleteTxnId(null);
    } catch {
      toast.error("Failed to delete transaction");
    }
  };

  // Filtered transaction list
  const subMap = new Map<string, string>(
    subaccounts.map((s) => [String(s.id), s.name]),
  );
  const testMap = new Map<string, string>(
    tests.map((t) => [String(t.id), t.name]),
  );

  const filteredTxns = transactions.filter((txn) => {
    const matchSub =
      filterSubId === "all" || String(txn.subAccountId) === filterSubId;
    const matchFrom = !filterDateFrom || txn.date >= filterDateFrom;
    const matchTo = !filterDateTo || txn.date <= filterDateTo;
    return matchSub && matchFrom && matchTo;
  });

  const summaryTotal = filteredTxns.reduce((s, t) => s + t.totalAmount, 0);
  const summaryPaid = filteredTxns.reduce((s, t) => s + t.paidAmount, 0);
  const summaryDue = filteredTxns.reduce((s, t) => s + t.dueAmount, 0);

  // Invalidate subAccountRates when subaccount changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset
  useEffect(() => {
    setSelectedTestIds(new Set());
  }, [selectedSubId]);

  return (
    <div className="space-y-8">
      {/* Add Entry Form */}
      <Card className="border-[oklch(0.88_0.02_200)] shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[oklch(0.38_0.1_210)]" />
            <CardTitle className="font-fraunces text-[oklch(0.25_0.06_215)]">
              Add Billing Entry
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddEntry} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bill-sub">Subaccount</Label>
                <Select value={selectedSubId} onValueChange={setSelectedSubId}>
                  <SelectTrigger id="bill-sub">
                    <SelectValue placeholder="Select subaccount" />
                  </SelectTrigger>
                  <SelectContent>
                    {subaccounts.map((s) => (
                      <SelectItem key={String(s.id)} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bill-patient">Patient Name</Label>
                <Input
                  id="bill-patient"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Patient full name"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bill-date">Date</Label>
                <Input
                  id="bill-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            {/* Test selection */}
            <div className="space-y-2">
              <Label>Select Tests</Label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.55_0.025_215)]" />
                <Input
                  placeholder="Search tests..."
                  value={testSearchInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTestSearchInput(val);
                    if (testSearchDebounceRef.current)
                      clearTimeout(testSearchDebounceRef.current);
                    testSearchDebounceRef.current = setTimeout(
                      () => setTestSearchQuery(val),
                      180,
                    );
                  }}
                  className="pl-9"
                  autoComplete="off"
                />
              </div>
              <div className="max-h-48 overflow-y-auto border border-[oklch(0.88_0.02_200)] rounded-lg">
                {filteredTestsForSearch.length === 0 ? (
                  <div className="text-center py-6 text-sm text-[oklch(0.55_0.025_215)]">
                    No tests found
                  </div>
                ) : (
                  filteredTestsForSearch.map((test) => {
                    const testId = String(test.id);
                    const isSelected = selectedTestIds.has(testId);
                    const effectiveRate = getEffectiveRate(test);
                    return (
                      <button
                        key={testId}
                        type="button"
                        onClick={() => toggleTestSelect(testId)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left border-b border-[oklch(0.93_0.01_215)] last:border-0 transition-colors ${isSelected ? "bg-[oklch(0.93_0.05_210)]" : "hover:bg-[oklch(0.97_0.008_200)]"}`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleTestSelect(testId)}
                          aria-label={test.name}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="flex-1 font-medium text-sm text-[oklch(0.25_0.06_215)]">
                          {test.name}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryClass(test.category)}`}
                        >
                          {test.category}
                        </span>
                        <span className="font-mono text-sm text-[oklch(0.4_0.12_160)] font-semibold inline-flex items-center gap-1">
                          {customRateMap.has(testId) && (
                            <Star className="w-3 h-3 text-[oklch(0.55_0.14_50)] fill-current" />
                          )}
                          {formatCurrency(effectiveRate)}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Selected tests summary */}
            {selectedTestsList.length > 0 && (
              <div className="bg-[oklch(0.96_0.02_200)] rounded-xl border border-[oklch(0.88_0.04_200)] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm text-[oklch(0.3_0.06_215)]">
                    {selectedTestsList.length} test
                    {selectedTestsList.length > 1 ? "s" : ""} selected
                  </span>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setSelectedTestIds(new Set())}
                    className="text-xs text-[oklch(0.55_0.025_215)] hover:text-[oklch(0.3_0.1_25)]"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTestsList.map((t) => (
                    <span
                      key={String(t.id)}
                      className="text-xs bg-white text-[oklch(0.3_0.08_210)] px-2.5 py-1 rounded-full border border-[oklch(0.86_0.04_210)] inline-flex items-center gap-1"
                    >
                      {t.name} —{" "}
                      {customRateMap.has(String(t.id)) && (
                        <Star className="w-3 h-3 text-[oklch(0.55_0.14_50)] fill-current" />
                      )}
                      {formatCurrency(getEffectiveRate(t))}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* B2B rates info banner */}
            {selectedSubId && (
              <div className="flex items-center gap-2 px-3 py-2 bg-[oklch(0.95_0.04_210)] border border-[oklch(0.86_0.06_210)] rounded-lg text-xs text-[oklch(0.35_0.08_215)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5 shrink-0 text-[oklch(0.45_0.12_210)]"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>
                  Using{" "}
                  <strong>
                    {subaccounts.find((s) => String(s.id) === selectedSubId)
                      ?.name ?? "subaccount"}
                  </strong>
                  's B2B rates
                  {subAccountRates.length > 0 && (
                    <>
                      {" "}
                      —{" "}
                      <span className="inline-flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-[oklch(0.55_0.14_50)] fill-current" />
                        {subAccountRates.length} custom rate
                        {subAccountRates.length !== 1 ? "s" : ""} applied
                      </span>
                    </>
                  )}
                </span>
              </div>
            )}

            {/* Amount calculation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>
                  Total B2B Amount
                  <span className="ml-1 text-xs font-normal text-[oklch(0.55_0.025_215)]">
                    (subaccount B2B rates)
                  </span>
                </Label>
                <div className="px-3 py-2.5 bg-[oklch(0.93_0.02_210)] rounded-lg border border-[oklch(0.86_0.04_210)] font-mono font-bold text-[oklch(0.28_0.09_210)]">
                  {!selectedSubId && selectedTestsList.length > 0 ? (
                    <span className="font-normal text-xs text-[oklch(0.55_0.025_215)]">
                      Select subaccount first
                    </span>
                  ) : (
                    formatCurrency(totalAmount)
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bill-paid">Paid Amount (₹)</Label>
                <Input
                  id="bill-paid"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={paidAmountInput}
                  onChange={(e) => setPaidAmountInput(e.target.value)}
                  placeholder="0.00"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label>Due Amount</Label>
                <div
                  className={`px-3 py-2.5 rounded-lg border font-mono font-bold ${dueAmount > 0 ? "bg-[oklch(0.93_0.06_50)] border-[oklch(0.82_0.1_50)] text-[oklch(0.38_0.18_50)]" : "bg-[oklch(0.93_0.04_160)] border-[oklch(0.82_0.08_160)] text-[oklch(0.35_0.1_160)]"}`}
                >
                  {formatCurrency(dueAmount)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bill-notes">Notes (optional)</Label>
              <Textarea
                id="bill-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={2}
                className="border-[oklch(0.82_0.04_200)]"
              />
            </div>

            <Button
              type="submit"
              disabled={addTransactionMutation.isPending}
              className="bg-[oklch(0.38_0.1_210)] hover:bg-[oklch(0.32_0.1_210)] text-white"
            >
              {addTransactionMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {addTransactionMutation.isPending ? "Adding..." : "Add Entry"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="border-[oklch(0.88_0.02_200)] shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[oklch(0.38_0.1_210)]" />
              <CardTitle className="font-fraunces text-[oklch(0.25_0.06_215)]">
                Transaction History
              </CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
              <Select value={filterSubId} onValueChange={setFilterSubId}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All subaccounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subaccounts</SelectItem>
                  {subaccounts.map((s) => (
                    <SelectItem key={String(s.id)} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-40"
                title="From date"
              />
              <Input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-40"
                title="To date"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {txnLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
                  key={`txn-skel-${i}`}
                  className="h-16 w-full rounded-lg"
                />
              ))}
            </div>
          ) : filteredTxns.length === 0 ? (
            <div className="text-center py-12 text-[oklch(0.55_0.025_215)]">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 text-[oklch(0.75_0.02_215)]" />
              <p className="font-medium">No transactions found</p>
              <p className="text-sm">
                Add billing entries above to see them here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...filteredTxns]
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )
                .map((txn) => {
                  const txnIdStr = String(txn.id);
                  const isExpanded = expandedTxnId === txnIdStr;
                  const isEditingPaid = editingPaidId === txnIdStr;
                  const subName =
                    subMap.get(String(txn.subAccountId)) ??
                    `Sub #${String(txn.subAccountId)}`;

                  return (
                    <div
                      key={txnIdStr}
                      className="bg-white rounded-xl border border-[oklch(0.88_0.02_200)] overflow-hidden"
                    >
                      <div className="flex items-center gap-3 p-4">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedTxnId(isExpanded ? null : txnIdStr)
                          }
                          className="flex-1 flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-[oklch(0.22_0.07_215)]">
                                {txn.patientName}
                              </span>
                              <Badge className="bg-[oklch(0.92_0.04_200)] text-[oklch(0.35_0.08_210)] hover:bg-[oklch(0.92_0.04_200)] border border-[oklch(0.85_0.04_200)] text-xs font-medium">
                                {subName}
                              </Badge>
                              <span className="text-xs text-[oklch(0.58_0.025_215)] bg-[oklch(0.94_0.01_215)] px-2 py-0.5 rounded-full">
                                {txn.testIds.length} test
                                {txn.testIds.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="text-xs text-[oklch(0.58_0.025_215)]">
                              {txn.date}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 mr-2">
                            <div className="font-mono font-bold text-[oklch(0.3_0.08_210)]">
                              {formatCurrency(txn.totalAmount)}
                            </div>
                            <div className="flex items-center gap-2 justify-end mt-0.5">
                              <span className="text-xs text-[oklch(0.38_0.1_160)]">
                                Paid: {formatCurrency(txn.paidAmount)}
                              </span>
                              {txn.dueAmount > 0 && (
                                <span className="text-xs text-white bg-[oklch(0.55_0.18_50)] px-1.5 py-0.5 rounded-full font-semibold">
                                  Due: {formatCurrency(txn.dueAmount)}
                                </span>
                              )}
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[oklch(0.55_0.025_215)] flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[oklch(0.55_0.025_215)] flex-shrink-0" />
                          )}
                        </button>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPaidId(txnIdStr);
                              setEditingPaidValue(String(txn.paidAmount));
                            }}
                            className="h-8 w-8 p-0 text-[oklch(0.38_0.1_210)] hover:bg-[oklch(0.92_0.05_200)]"
                            title="Edit paid amount"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTxnId(txn.id)}
                            className="h-8 w-8 p-0 text-[oklch(0.55_0.2_25)] hover:bg-[oklch(0.96_0.04_25)]"
                            title="Delete transaction"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Edit paid amount row */}
                      {isEditingPaid && (
                        <div className="px-4 pb-3 border-t border-[oklch(0.92_0.01_215)] pt-3 flex items-center gap-3">
                          <Label className="text-sm font-medium text-[oklch(0.3_0.06_215)] w-32 flex-shrink-0">
                            Update Paid:
                          </Label>
                          <Input
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="0.01"
                            value={editingPaidValue}
                            onChange={(e) =>
                              setEditingPaidValue(e.target.value)
                            }
                            className="w-36 font-mono"
                            autoComplete="off"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleUpdatePaid(txn.id)}
                            disabled={updatePaidMutation.isPending}
                            className="bg-[oklch(0.38_0.1_210)] hover:bg-[oklch(0.32_0.1_210)] text-white"
                          >
                            {updatePaidMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingPaidId(null)}
                            className="h-8"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      {/* Expanded details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 border-t border-[oklch(0.92_0.01_215)] pt-3">
                              <div className="text-sm font-medium text-[oklch(0.38_0.06_215)] mb-2">
                                Tests included:
                              </div>
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {txn.testIds.map((tid) => (
                                  <span
                                    key={String(tid)}
                                    className="text-xs bg-[oklch(0.94_0.03_210)] text-[oklch(0.32_0.08_210)] px-2.5 py-1 rounded-full border border-[oklch(0.86_0.04_210)]"
                                  >
                                    {testMap.get(String(tid)) ??
                                      `Test #${String(tid)}`}
                                  </span>
                                ))}
                              </div>
                              {txn.notes && (
                                <div className="text-sm text-[oklch(0.52_0.025_215)] bg-[oklch(0.96_0.01_215)] p-3 rounded-lg">
                                  <span className="font-medium">Notes:</span>{" "}
                                  {txn.notes}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

              {/* Summary row */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[oklch(0.88_0.02_200)]">
                <div className="bg-white rounded-xl border border-[oklch(0.88_0.02_200)] p-4">
                  <div className="text-xs text-[oklch(0.55_0.025_215)] mb-1">
                    Visible Total
                  </div>
                  <div className="font-mono font-bold text-lg text-[oklch(0.3_0.08_210)]">
                    {formatCurrency(summaryTotal)}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-[oklch(0.88_0.05_150)] p-4">
                  <div className="text-xs text-[oklch(0.55_0.025_215)] mb-1">
                    Total Paid
                  </div>
                  <div className="font-mono font-bold text-lg text-[oklch(0.38_0.1_160)]">
                    {formatCurrency(summaryPaid)}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-[oklch(0.88_0.07_50)] p-4">
                  <div className="text-xs text-[oklch(0.55_0.025_215)] mb-1">
                    Total Due
                  </div>
                  <div
                    className={`font-mono font-bold text-lg ${summaryDue > 0 ? "text-[oklch(0.52_0.2_50)]" : "text-[oklch(0.38_0.1_160)]"}`}
                  >
                    {formatCurrency(summaryDue)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Transaction Confirmation */}
      <AlertDialog
        open={deleteTxnId !== null}
        onOpenChange={(v) => !v && setDeleteTxnId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-fraunces">
              Delete Transaction?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this transaction record. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteTransactionMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
  const { data: labs = [] } = useGetAllLabs();

  const addTestMutation = useAddPathologyTest(token);
  const updateTestMutation = useUpdatePathologyTest(token);
  const deleteTestMutation = useDeletePathologyTest(token);
  const createSubAccountMutation = useCreateSubAccount(token);
  const updateSubAccountMutation = useUpdateSubAccount(token);
  const deleteSubAccountMutation = useDeleteSubAccount(token);
  const logoutMutation = useAdminLogout();
  const addSampleData = useAddSampleData();

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingTest, setEditingTest] = useState<PathologyTest | null>(null);
  const [addTestOpen, setAddTestOpen] = useState(false);
  const [formValues, setFormValues] = useState<TestFormValues>(DEFAULT_FORM);
  const [deleteTestId, setDeleteTestId] = useState<bigint | null>(null);
  const [deleteSubId, setDeleteSubId] = useState<bigint | null>(null);

  // Subaccount form
  const [newSubAccountName, setNewSubAccountName] = useState("");
  const [newSubAccountPhone, setNewSubAccountPhone] = useState("");
  const [newSubAccountPin, setNewSubAccountPin] = useState("");
  const [newSubAccountLabId, setNewSubAccountLabId] = useState<string>("none");

  const [editingSubAccount, setEditingSubAccount] = useState<SubAccount | null>(
    null,
  );
  const [editSubName, setEditSubName] = useState("");
  const [editSubPhone, setEditSubPhone] = useState("");
  const [editSubPin, setEditSubPin] = useState("");
  const [editSubLabId, setEditSubLabId] = useState<string>("none");

  const [sampleDataLoaded, setSampleDataLoaded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [ratesDialogSubAccount, setRatesDialogSubAccount] =
    useState<SubAccount | null>(null);
  const [shareLinkSubAccount, setShareLinkSubAccount] =
    useState<SubAccount | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: addSampleData mutation intentionally omitted
  useEffect(() => {
    if (!testsLoading && tests.length === 0 && !sampleDataLoaded) {
      setSampleDataLoaded(true);
      addSampleData.mutate();
    }
  }, [testsLoading, tests.length, sampleDataLoaded]);

  // Cache subaccounts in localStorage
  useEffect(() => {
    if (subaccounts.length > 0) {
      try {
        const serializable = subaccounts.map((s) => ({
          id: String(s.id),
          name: s.name,
          phone: s.phone,
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
      /* ignore */
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
  const grandTotal = totalMrp - totalB2b;

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
    if (!newSubAccountPin.trim()) {
      toast.error("PIN is required");
      return;
    }
    try {
      await createSubAccountMutation.mutateAsync({
        name: newSubAccountName.trim(),
        phone: newSubAccountPhone.trim(),
        pin: newSubAccountPin.trim(),
        labId:
          newSubAccountLabId !== "none" ? BigInt(newSubAccountLabId) : null,
      });
      toast.success(`Subaccount "${newSubAccountName.trim()}" created`);
      setNewSubAccountName("");
      setNewSubAccountPhone("");
      setNewSubAccountPin("");
      setNewSubAccountLabId("none");
    } catch {
      toast.error("Failed to create subaccount");
    }
  };

  const handleUpdateSubAccount = async () => {
    if (!editingSubAccount) return;
    if (!editSubName.trim()) {
      toast.error("Subaccount name is required");
      return;
    }
    if (!editSubPin.trim()) {
      toast.error("PIN is required");
      return;
    }
    try {
      await updateSubAccountMutation.mutateAsync({
        id: editingSubAccount.id,
        name: editSubName.trim(),
        phone: editSubPhone.trim(),
        pin: editSubPin.trim(),
        labId: editSubLabId !== "none" ? BigInt(editSubLabId) : null,
      });
      toast.success("Subaccount updated");
      setEditingSubAccount(null);
      // Update localStorage cache
      const updated = subaccounts.map((s) =>
        s.id === editingSubAccount.id
          ? { ...s, name: editSubName.trim(), phone: editSubPhone.trim() }
          : s,
      );
      const serializable = updated.map((s) => ({
        id: String(s.id),
        name: s.name,
        phone: s.phone,
      }));
      localStorage.setItem(SUBACCOUNTS_CACHE_KEY, JSON.stringify(serializable));
    } catch {
      toast.error("Failed to update subaccount");
    }
  };

  const handleDeleteSubAccount = async () => {
    if (deleteSubId === null) return;
    try {
      await deleteSubAccountMutation.mutateAsync(deleteSubId);
      toast.success("Subaccount deleted");
      setDeleteSubId(null);
      const remaining = subaccounts.filter((s) => s.id !== deleteSubId);
      const serializable = remaining.map((s) => ({
        id: String(s.id),
        name: s.name,
        phone: s.phone,
      }));
      localStorage.setItem(SUBACCOUNTS_CACHE_KEY, JSON.stringify(serializable));
    } catch {
      toast.error("Failed to delete subaccount");
    }
  };

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
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-8 flex-wrap">
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
            <div className="w-8 h-8 bg-[oklch(0.92_0.06_210)] rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[oklch(0.38_0.1_210)]" />
            </div>
            <div>
              <div className="text-lg font-fraunces font-bold text-[oklch(0.25_0.06_215)]">
                {labs.length}
              </div>
              <div className="text-xs text-[oklch(0.55_0.025_215)]">Labs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="tests">
          <TabsList className="mb-6 bg-[oklch(0.93_0.015_200)] border border-[oklch(0.88_0.02_200)] flex-wrap h-auto gap-1">
            <TabsTrigger
              value="tests"
              className="data-[state=active]:bg-white data-[state=active]:text-[oklch(0.25_0.07_215)] data-[state=active]:shadow-sm"
            >
              <TestTube className="mr-2 h-4 w-4" />
              Tests
            </TabsTrigger>
            <TabsTrigger
              value="subaccounts"
              className="data-[state=active]:bg-white data-[state=active]:text-[oklch(0.25_0.07_215)] data-[state=active]:shadow-sm"
            >
              <Users className="mr-2 h-4 w-4" />
              Subaccounts
            </TabsTrigger>
            <TabsTrigger
              value="labs"
              className="data-[state=active]:bg-white data-[state=active]:text-[oklch(0.25_0.07_215)] data-[state=active]:shadow-sm"
            >
              <Building2 className="mr-2 h-4 w-4" />
              Labs
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="data-[state=active]:bg-white data-[state=active]:text-[oklch(0.25_0.07_215)] data-[state=active]:shadow-sm"
            >
              <Calculator className="mr-2 h-4 w-4" />
              Billing
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
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.55_0.025_215)]" />
                      <Input
                        placeholder="Search tests..."
                        value={searchInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSearchInput(val);
                          if (searchDebounceRef.current)
                            clearTimeout(searchDebounceRef.current);
                          searchDebounceRef.current = setTimeout(
                            () => setSearchQuery(val),
                            180,
                          );
                        }}
                        className="pl-9 w-64"
                        autoComplete="off"
                      />
                      {searchInput && (
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchInput("");
                            setSearchQuery("");
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <X className="w-3 h-3 text-[oklch(0.55_0.025_215)]" />
                        </button>
                      )}
                    </div>
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
                          B2B%
                        </TableHead>
                        <TableHead className="font-semibold text-[oklch(0.3_0.05_215)] text-right">
                          Margin
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
                              <Skeleton className="h-4 w-12 ml-auto" />
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
                            colSpan={8}
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
                              <TableCell className="text-right py-3 font-mono text-[oklch(0.42_0.1_160)] text-sm">
                                {formatB2bPercent(test.b2bRate, test.mrp)}
                              </TableCell>
                              <TableCell className="text-right py-3 font-mono text-[oklch(0.32_0.1_270)] font-bold">
                                {formatCurrency(test.mrp - test.b2bRate)}
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
                                    className="h-8 px-3 border-[oklch(0.82_0.04_200)] text-[oklch(0.38_0.1_210)] hover:bg-[oklch(0.92_0.05_200)]"
                                  >
                                    <Pencil className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteTestId(test.id)}
                                    className="h-8 px-3 border-[oklch(0.82_0.08_25)] text-[oklch(0.55_0.2_25)] hover:bg-[oklch(0.96_0.04_25)]"
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

                {/* Summary Bar */}
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
                            <div className="text-sm">
                              <span className="text-[oklch(0.55_0.04_270)]">
                                Total MRP:
                              </span>{" "}
                              <span className="font-mono font-semibold text-[oklch(0.35_0.1_205)]">
                                {formatCurrency(totalMrp)}
                              </span>
                            </div>
                            <div className="w-px h-4 bg-[oklch(0.78_0.06_270)]" />
                            <div className="text-sm">
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
                                Total Margin:
                              </span>
                              <span className="font-mono font-bold">
                                {formatCurrency(grandTotal)}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => setSelectedIds(new Set())}
                              className="h-7 px-2 text-[oklch(0.45_0.08_270)] hover:bg-[oklch(0.88_0.06_270)]"
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
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sub-phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.55_0.025_215)]" />
                        <Input
                          id="sub-phone"
                          type="tel"
                          value={newSubAccountPhone}
                          onChange={(e) =>
                            setNewSubAccountPhone(e.target.value)
                          }
                          placeholder="e.g. 9876543210"
                          className="pl-9"
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sub-pin">PIN (required)</Label>
                      <Input
                        id="sub-pin"
                        type="text"
                        value={newSubAccountPin}
                        onChange={(e) => setNewSubAccountPin(e.target.value)}
                        placeholder="e.g. 1234"
                        autoComplete="off"
                      />
                      <p className="text-xs text-[oklch(0.55_0.025_215)]">
                        Subaccount users will enter this PIN to access their
                        view.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sub-lab">Lab Assignment (optional)</Label>
                      <Select
                        value={newSubAccountLabId}
                        onValueChange={setNewSubAccountLabId}
                      >
                        <SelectTrigger id="sub-lab">
                          <SelectValue placeholder="No lab assigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No lab assigned</SelectItem>
                          {labs.map((l) => (
                            <SelectItem key={String(l.id)} value={String(l.id)}>
                              {l.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                </CardContent>
              </Card>

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
                          {subaccounts.map((sub, idx) => {
                            const labForSub =
                              sub.labId !== undefined && sub.labId !== null
                                ? labs.find((l) => l.id === sub.labId)
                                : null;
                            return (
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
                                    <div className="flex items-center gap-3 text-xs text-[oklch(0.6_0.025_215)]">
                                      {sub.phone && (
                                        <span className="flex items-center gap-1">
                                          <Phone className="w-3 h-3" />
                                          {sub.phone}
                                        </span>
                                      )}
                                      <span>
                                        PIN: {"•".repeat(sub.pin?.length ?? 4)}
                                      </span>
                                      {labForSub && (
                                        <span className="flex items-center gap-1 text-[oklch(0.38_0.1_210)]">
                                          <Building2 className="w-3 h-3" />
                                          {labForSub.name}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShareLinkSubAccount(sub)}
                                    className="text-[oklch(0.38_0.12_175)] hover:bg-[oklch(0.92_0.06_175)]"
                                    title="Share Access Link"
                                  >
                                    <Share2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setRatesDialogSubAccount(sub)
                                    }
                                    className="text-[oklch(0.45_0.12_60)] hover:bg-[oklch(0.93_0.06_60)]"
                                    title="Set B2B Rates"
                                  >
                                    <Tag className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingSubAccount(sub);
                                      setEditSubName(sub.name);
                                      setEditSubPhone(sub.phone || "");
                                      setEditSubPin(sub.pin || "");
                                      setEditSubLabId(
                                        sub.labId !== undefined &&
                                          sub.labId !== null
                                          ? String(sub.labId)
                                          : "none",
                                      );
                                    }}
                                    className="text-[oklch(0.38_0.1_210)] hover:bg-[oklch(0.92_0.05_200)]"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteSubId(sub.id)}
                                    className="text-[oklch(0.55_0.2_25)] hover:bg-[oklch(0.96_0.04_25)]"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Labs Tab */}
          <TabsContent value="labs">
            <LabsTab sessionToken={token} />
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <BillingTab
              sessionToken={token}
              tests={tests}
              subaccounts={subaccounts}
            />
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
            formValues={formValues}
            setFormValues={setFormValues}
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
            formValues={formValues}
            setFormValues={setFormValues}
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

      {/* SubAccount B2B Rates Dialog */}
      {ratesDialogSubAccount && (
        <SubAccountRatesDialog
          open={!!ratesDialogSubAccount}
          onOpenChange={(v) => !v && setRatesDialogSubAccount(null)}
          subAccount={ratesDialogSubAccount}
          tests={tests}
          sessionToken={token}
        />
      )}

      {/* Share Link Dialog */}
      {shareLinkSubAccount && (
        <ShareLinkDialog
          open={!!shareLinkSubAccount}
          onOpenChange={(v) => !v && setShareLinkSubAccount(null)}
          subAccount={shareLinkSubAccount}
        />
      )}

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

      {/* Edit Subaccount Dialog */}
      <Dialog
        open={!!editingSubAccount}
        onOpenChange={(open) => !open && setEditingSubAccount(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-fraunces text-[oklch(0.25_0.06_215)]">
              Edit Subaccount
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="edit-sub-name">Name</Label>
              <Input
                id="edit-sub-name"
                value={editSubName}
                onChange={(e) => setEditSubName(e.target.value)}
                placeholder="e.g., City Hospital"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sub-phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.55_0.025_215)]" />
                <Input
                  id="edit-sub-phone"
                  type="tel"
                  value={editSubPhone}
                  onChange={(e) => setEditSubPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="pl-9"
                  autoComplete="tel"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sub-pin">PIN</Label>
              <Input
                id="edit-sub-pin"
                type="text"
                value={editSubPin}
                onChange={(e) => setEditSubPin(e.target.value)}
                placeholder="e.g. 1234"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sub-lab">Lab Assignment</Label>
              <Select value={editSubLabId} onValueChange={setEditSubLabId}>
                <SelectTrigger id="edit-sub-lab">
                  <SelectValue placeholder="No lab assigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No lab assigned</SelectItem>
                  {labs.map((l) => (
                    <SelectItem key={String(l.id)} value={String(l.id)}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingSubAccount(null)}
              className="border-[oklch(0.82_0.04_200)]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSubAccount}
              disabled={updateSubAccountMutation.isPending}
              className="bg-[oklch(0.38_0.1_210)] hover:bg-[oklch(0.32_0.1_210)] text-white"
            >
              {updateSubAccountMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              {updateSubAccountMutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
