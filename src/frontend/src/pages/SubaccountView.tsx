import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Activity,
  ArrowLeft,
  FlaskConical,
  Search,
  TestTube,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { PathologyTest } from "../backend.d.ts";
import { useGetAllTests } from "../hooks/useQueries";

interface SubaccountViewProps {
  subaccountName: string;
  onBack: () => void;
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

export default function SubaccountView({
  subaccountName,
  onBack,
}: SubaccountViewProps) {
  const { data: tests = [], isLoading } = useGetAllTests();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = Array.from(
    new Set(tests.map((t: PathologyTest) => t.category)),
  );

  const filteredTests = tests.filter((t: PathologyTest) => {
    const matchSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      categoryFilter === "all" || t.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  // Group for category summary
  const categoryCount = categories.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[oklch(0.25_0.07_215)] text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/10 hover:text-white mr-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="bg-[oklch(0.55_0.15_175)] p-2 rounded-lg">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-fraunces font-bold">
              PathLab Rate Card
            </h1>
            <p className="text-xs text-white/60">
              Subaccount:{" "}
              <span className="text-white/90 font-medium">
                {subaccountName}
              </span>
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Activity className="w-4 h-4 text-[oklch(0.65_0.18_175)]" />
            <span className="text-sm text-white/70">Live Rates</span>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-[oklch(0.45_0.12_175)] text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="font-bold text-lg">
                  {subaccountName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-fraunces font-bold">
                  {subaccountName}
                </h2>
                <p className="text-white/70 text-sm">
                  Authorized Rate Card Access
                </p>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <TestTube className="w-4 h-4 text-white/80" />
              <span className="text-sm text-white/80">
                <strong className="text-white">{tests.length}</strong> tests
                available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/80">
                <strong className="text-white">{categoryCount}</strong>{" "}
                categories
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Card className="border-[oklch(0.88_0.02_200)] shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <CardTitle className="font-fraunces text-[oklch(0.25_0.06_215)]">
                Diagnostic Test Rate Sheet
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.55_0.025_215)]" />
                  <Input
                    placeholder="Search tests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-60"
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
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[oklch(0.25_0.07_215)] hover:bg-[oklch(0.25_0.07_215)]">
                    <TableHead className="text-white font-semibold pl-6 py-3">
                      Test Name
                    </TableHead>
                    <TableHead className="text-white font-semibold py-3">
                      Category
                    </TableHead>
                    <TableHead className="text-white font-semibold text-right py-3">
                      MRP
                    </TableHead>
                    <TableHead className="text-white font-semibold text-right py-3 pr-6">
                      B2B Rate
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
                      <TableRow key={`skel-${i}`}>
                        <TableCell className="pl-6">
                          <Skeleton className="h-4 w-52" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-28 rounded-full" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-4 w-16 ml-auto" />
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Skeleton className="h-4 w-16 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredTests.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
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
                    filteredTests.map((test: PathologyTest, idx: number) => (
                      <motion.tr
                        key={String(test.id)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className="border-b border-[oklch(0.93_0.01_215)] hover:bg-[oklch(0.97_0.008_200)] transition-colors"
                      >
                        <TableCell className="font-medium text-[oklch(0.22_0.06_215)] pl-6 py-3.5">
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
                        <TableCell className="text-right py-3.5 pr-6">
                          <div className="inline-flex items-center gap-1.5 bg-[oklch(0.92_0.07_160)] text-[oklch(0.35_0.12_160)] px-2.5 py-1 rounded-md font-mono font-semibold text-sm">
                            {formatCurrency(test.b2bRate)}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
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

        {/* Category summary cards */}
        {!isLoading && tests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <h3 className="font-fraunces text-lg font-semibold text-[oklch(0.25_0.06_215)] mb-4">
              Available Categories
            </h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => {
                const count = tests.filter(
                  (t: PathologyTest) => t.category === cat,
                ).length;
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() =>
                      setCategoryFilter(cat === categoryFilter ? "all" : cat)
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                      categoryFilter === cat
                        ? "bg-[oklch(0.25_0.07_215)] text-white border-[oklch(0.25_0.07_215)]"
                        : `${getCategoryClass(cat)} hover:opacity-80`
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                        categoryFilter === cat
                          ? "bg-white/20 text-white"
                          : "bg-white/60"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </main>

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
