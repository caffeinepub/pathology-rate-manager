import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Activity,
  ArrowLeft,
  Calculator,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FlaskConical,
  Loader2,
  Lock,
  Search,
  Star,
  TestTube,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { PathologyTest } from "../backend.d.ts";
import {
  useGetAllLabs,
  useGetAllTests,
  useGetSubAccountById,
  useGetSubAccountRates,
  useGetSubAccountTransactions,
  useVerifySubAccountPin,
} from "../hooks/useQueries";

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

interface SubaccountViewProps {
  subaccountId: bigint;
}

// ─── PIN Entry ────────────────────────────────────────────────────────────────

function PinEntry({
  subaccountId,
  onVerified,
}: {
  subaccountId: bigint;
  onVerified: (pin: string) => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const verifyMutation = useVerifySubAccountPin();
  const { data: subaccount, isLoading: subLoading } =
    useGetSubAccountById(subaccountId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError("Please enter your PIN.");
      return;
    }
    setError("");
    try {
      const valid = await verifyMutation.mutateAsync({
        subAccountId: subaccountId,
        pin: pin.trim(),
      });
      if (valid) {
        onVerified(pin.trim());
      } else {
        setError("Incorrect PIN. Please try again.");
        setPin("");
      }
    } catch {
      setError("Failed to verify PIN. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-[oklch(0.42_0.12_175)] text-white py-4 px-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              window.location.hash = "#/sub";
            }}
            className="mr-2 text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="bg-white/20 p-2 rounded-lg">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-fraunces font-bold">
              PathLab Rate Manager
            </h1>
            <p className="text-xs text-white/60">Subaccount Access</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="bg-white rounded-2xl border-2 border-[oklch(0.82_0.08_175)] shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[oklch(0.88_0.06_175)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                {subLoading ? (
                  <Skeleton className="w-8 h-8 rounded" />
                ) : (
                  <span className="text-[oklch(0.32_0.1_185)] font-bold text-2xl">
                    {subaccount?.name?.charAt(0).toUpperCase() ?? "?"}
                  </span>
                )}
              </div>
              {subLoading ? (
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
              ) : (
                <h2 className="text-xl font-fraunces font-bold text-[oklch(0.22_0.07_215)]">
                  {subaccount?.name ?? "Subaccount"}
                </h2>
              )}
              <p className="text-sm text-[oklch(0.55_0.025_215)] mt-1">
                Enter your PIN to access rate card
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="pin"
                  className="text-[oklch(0.3_0.05_215)] font-medium flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  PIN
                </Label>
                <Input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your PIN"
                  autoComplete="current-password"
                  className="border-[oklch(0.82_0.04_200)] text-center text-xl tracking-widest"
                />
                {error && (
                  <p className="text-xs text-[oklch(0.52_0.2_25)]">{error}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={verifyMutation.isPending}
                className="w-full bg-[oklch(0.42_0.12_175)] hover:bg-[oklch(0.35_0.12_175)] text-white font-semibold py-2.5"
              >
                {verifyMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Access Rate Card"
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </main>

      <footer className="py-6 border-t border-[oklch(0.88_0.02_200)] text-center">
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

// ─── Rate Card Tab ─────────────────────────────────────────────────────────────

function RateCardTab({
  subaccountId,
  labName,
}: {
  subaccountId: bigint;
  labName: string | null;
}) {
  const { data: tests = [], isLoading } = useGetAllTests();
  const { data: customRates = [] } = useGetSubAccountRates(subaccountId);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const customRateMap = new Map<string, number>(
    customRates.map((r) => [String(r.testId), r.b2bRate]),
  );

  const getEffectiveB2bRate = (test: PathologyTest): number => {
    const custom = customRateMap.get(String(test.id));
    return custom !== undefined ? custom : test.b2bRate;
  };

  const isCustomRate = (test: PathologyTest): boolean =>
    customRateMap.has(String(test.id));

  const categories = Array.from(new Set(tests.map((t) => t.category)));

  const filteredTests = tests.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      categoryFilter === "all" || t.category === categoryFilter;
    return matchSearch && matchCategory;
  });

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
  const totalB2b = selectedTests.reduce(
    (sum, t) => sum + getEffectiveB2bRate(t),
    0,
  );
  const grandMargin = totalMrp - totalB2b;
  const customRateCount = customRates.length;

  return (
    <div>
      {/* Lab name badge */}
      {labName && (
        <div className="mb-4 flex items-center gap-2">
          <Badge className="bg-[oklch(0.88_0.06_210)] text-[oklch(0.28_0.1_210)] border-[oklch(0.78_0.08_210)] hover:bg-[oklch(0.88_0.06_210)]">
            🏥 {labName}
          </Badge>
          {customRateCount > 0 && (
            <Badge className="bg-[oklch(0.91_0.08_50)] text-[oklch(0.38_0.14_50)] border-[oklch(0.82_0.1_50)] hover:bg-[oklch(0.91_0.08_50)]">
              <Star className="w-3 h-3 mr-1 fill-current" />
              {customRateCount} custom rate{customRateCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      )}

      <Card className="border-[oklch(0.88_0.02_200)] shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <CardTitle className="font-fraunces text-[oklch(0.25_0.06_215)]">
              Diagnostic Test Rate Sheet
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
                  className="pl-9 w-60"
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[oklch(0.25_0.07_215)] hover:bg-[oklch(0.25_0.07_215)]">
                  <TableHead className="pl-4 w-10 py-3">
                    <Checkbox
                      checked={allFilteredSelected}
                      data-state={
                        someFilteredSelected && !allFilteredSelected
                          ? "indeterminate"
                          : undefined
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all tests"
                      className="border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-[oklch(0.25_0.07_215)]"
                    />
                  </TableHead>
                  <TableHead className="text-white font-semibold pl-2 py-3">
                    Test Name
                  </TableHead>
                  <TableHead className="text-white font-semibold py-3">
                    Category
                  </TableHead>
                  <TableHead className="text-white font-semibold text-right py-3">
                    MRP
                  </TableHead>
                  <TableHead className="text-white font-semibold text-right py-3">
                    B2B Rate
                  </TableHead>
                  <TableHead className="text-white font-semibold text-right py-3">
                    B2B%
                  </TableHead>
                  <TableHead className="text-white font-semibold text-right py-3 pr-6">
                    Margin
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow
                      // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
                      key={`skel-${i}`}
                    >
                      <TableCell className="pl-4 w-10">
                        <Skeleton className="h-4 w-4 rounded" />
                      </TableCell>
                      <TableCell className="pl-2">
                        <Skeleton className="h-4 w-52" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-28 rounded-full" />
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
                      <TableCell className="text-right pr-6">
                        <Skeleton className="h-4 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredTests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-16 text-[oklch(0.55_0.025_215)]"
                    >
                      <TestTube className="w-10 h-10 mx-auto mb-2 text-[oklch(0.75_0.02_215)]" />
                      <p className="font-medium text-base">No tests found</p>
                      <p className="text-sm">
                        {searchQuery || categoryFilter !== "all"
                          ? "Try adjusting your search or filter"
                          : "No tests available at the moment"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTests.map((test) => {
                    const testId = String(test.id);
                    const isSelected = selectedIds.has(testId);
                    const effectiveRate = getEffectiveB2bRate(test);
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
                          className="pl-4 w-10 py-3.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(testId)}
                            aria-label={`Select ${test.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-[oklch(0.22_0.06_215)] pl-2 py-3.5">
                          {test.name}
                        </TableCell>
                        <TableCell className="py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryClass(test.category)}`}
                          >
                            {test.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-3.5 font-mono text-[oklch(0.35_0.1_205)] font-semibold">
                          {formatCurrency(test.mrp)}
                        </TableCell>
                        <TableCell className="text-right py-3.5">
                          {isCustomRate(test) ? (
                            <div className="flex flex-col items-end gap-0.5">
                              <div className="inline-flex items-center gap-1 bg-[oklch(0.91_0.08_50)] text-[oklch(0.38_0.14_50)] px-2.5 py-1 rounded-md font-mono font-semibold text-sm border border-[oklch(0.82_0.1_50)]">
                                <Star className="w-3 h-3 fill-current" />
                                {formatCurrency(effectiveRate)}
                              </div>
                              <span className="text-xs text-[oklch(0.6_0.04_215)] line-through font-mono">
                                {formatCurrency(test.b2bRate)}
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 bg-[oklch(0.92_0.07_160)] text-[oklch(0.35_0.12_160)] px-2.5 py-1 rounded-md font-mono font-semibold text-sm">
                              {formatCurrency(effectiveRate)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right py-3.5 font-mono text-[oklch(0.42_0.1_160)] text-sm">
                          {formatB2bPercent(effectiveRate, test.mrp)}
                        </TableCell>
                        <TableCell className="text-right py-3.5 pr-6 font-mono text-[oklch(0.32_0.1_270)] font-bold">
                          {formatCurrency(test.mrp - effectiveRate)}
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
                          {formatCurrency(grandMargin)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onMouseDown={(e) => e.preventDefault()}
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
            <div className="px-6 py-3 flex items-center justify-between text-sm text-[oklch(0.55_0.025_215)] border-t border-[oklch(0.93_0.01_215)]">
              <span>
                Showing {filteredTests.length} of {tests.length} tests
              </span>
              <span className="text-xs">
                Rates are subject to change · Contact admin for queries
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Transactions Tab ──────────────────────────────────────────────────────────

function TransactionsTab({
  subaccountId,
  pin,
}: {
  subaccountId: bigint;
  pin: string;
}) {
  const { data: transactions = [], isLoading } = useGetSubAccountTransactions(
    subaccountId,
    pin,
  );
  const { data: tests = [] } = useGetAllTests();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const testMap = new Map<string, string>(
    tests.map((t) => [String(t.id), t.name]),
  );

  const totalAmount = transactions.reduce((s, t) => s + t.totalAmount, 0);
  const totalPaid = transactions.reduce((s, t) => s + t.paidAmount, 0);
  const totalDue = transactions.reduce((s, t) => s + t.dueAmount, 0);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
            key={`txn-skel-${i}`}
            className="h-16 w-full rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 text-[oklch(0.55_0.025_215)]">
        <ClipboardList className="w-12 h-12 mx-auto mb-3 text-[oklch(0.75_0.02_215)]" />
        <p className="font-medium text-base">No Transactions Yet</p>
        <p className="text-sm mt-1">
          Transaction history will appear here once entries are added.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-[oklch(0.88_0.02_200)] p-4">
          <div className="text-xs text-[oklch(0.55_0.025_215)] mb-1">
            Total Amount
          </div>
          <div className="font-mono font-bold text-lg text-[oklch(0.3_0.08_210)]">
            {formatCurrency(totalAmount)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[oklch(0.88_0.05_150)] p-4">
          <div className="text-xs text-[oklch(0.55_0.025_215)] mb-1">
            Total Paid
          </div>
          <div className="font-mono font-bold text-lg text-[oklch(0.38_0.1_160)]">
            {formatCurrency(totalPaid)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[oklch(0.88_0.07_50)] p-4">
          <div className="text-xs text-[oklch(0.55_0.025_215)] mb-1">
            Total Due
          </div>
          <div
            className={`font-mono font-bold text-lg ${totalDue > 0 ? "text-[oklch(0.52_0.2_50)]" : "text-[oklch(0.38_0.1_160)]"}`}
          >
            {formatCurrency(totalDue)}
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="space-y-2">
        {[...transactions]
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          .map((txn) => {
            const txnId = String(txn.id);
            const isExpanded = expandedId === txnId;
            return (
              <div
                key={txnId}
                className="bg-white rounded-xl border border-[oklch(0.88_0.02_200)] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : txnId)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-[oklch(0.97_0.008_200)] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[oklch(0.22_0.07_215)]">
                        {txn.patientName}
                      </span>
                      <span className="text-xs text-[oklch(0.58_0.025_215)] bg-[oklch(0.94_0.01_215)] px-2 py-0.5 rounded-full">
                        {txn.testIds.length} test
                        {txn.testIds.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="text-xs text-[oklch(0.58_0.025_215)]">
                      {txn.date}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
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
      </div>
    </div>
  );
}

// ─── Main SubaccountView ───────────────────────────────────────────────────────

export default function SubaccountView({ subaccountId }: SubaccountViewProps) {
  const [verifiedPin, setVerifiedPin] = useState<string | null>(null);
  const { data: subaccount } = useGetSubAccountById(subaccountId);
  const { data: labs = [] } = useGetAllLabs();

  // Resolve lab name from labs list
  const labName =
    subaccount?.labId !== undefined && subaccount.labId !== null
      ? (labs.find((l) => l.id === subaccount.labId)?.name ?? null)
      : null;

  if (!verifiedPin) {
    return (
      <PinEntry
        subaccountId={subaccountId}
        onVerified={(pin) => setVerifiedPin(pin)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-[oklch(0.42_0.12_175)] text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              window.location.hash = "#/sub";
            }}
            className="mr-2 text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="bg-white/20 p-2 rounded-lg">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-fraunces font-bold">
              PathLab Rate Card
            </h1>
            <p className="text-xs text-white/60">
              Subaccount:{" "}
              <span className="text-white/90 font-medium">
                {subaccount?.name ?? "..."}
              </span>
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Activity className="w-4 h-4 text-[oklch(0.75_0.18_175)]" />
            <span className="text-sm text-white/70">Live Rates</span>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-[oklch(0.35_0.1_175)] text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="font-bold text-xl">
                  {subaccount?.name?.charAt(0).toUpperCase() ?? "?"}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-fraunces font-bold">
                  {subaccount?.name ?? "Loading..."}
                </h2>
                {labName && (
                  <p className="text-white/80 text-sm">🏥 {labName}</p>
                )}
                {subaccount?.phone && (
                  <p className="text-white/70 text-sm">📞 {subaccount.phone}</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <Tabs defaultValue="rates">
          <TabsList className="mb-6 bg-[oklch(0.93_0.015_200)] border border-[oklch(0.88_0.02_200)]">
            <TabsTrigger
              value="rates"
              className="data-[state=active]:bg-white data-[state=active]:text-[oklch(0.25_0.07_215)] data-[state=active]:shadow-sm"
            >
              <TestTube className="mr-2 h-4 w-4" />
              Rate Card
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-white data-[state=active]:text-[oklch(0.25_0.07_215)] data-[state=active]:shadow-sm"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              My Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rates">
            <RateCardTab subaccountId={subaccountId} labName={labName} />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsTab subaccountId={subaccountId} pin={verifiedPin} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="py-6 border-t border-[oklch(0.88_0.02_200)] text-center">
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
