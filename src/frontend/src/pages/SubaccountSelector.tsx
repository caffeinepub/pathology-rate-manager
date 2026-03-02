import { Input } from "@/components/ui/input";
import { ArrowLeft, FlaskConical, Search, Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { SUBACCOUNTS_CACHE_KEY } from "../context/AuthContext";

interface CachedSubAccount {
  id: string;
  name: string;
  phone?: string;
}

export default function SubaccountSelector() {
  const [subaccounts, setSubaccounts] = useState<CachedSubAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SUBACCOUNTS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSubaccounts(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const filtered = subaccounts.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone?.includes(searchQuery),
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-[oklch(0.42_0.12_175)] text-white py-4 px-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              window.location.hash = "#/";
            }}
            className="mr-2 text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>
          <div className="bg-white/20 p-2 rounded-lg">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-fraunces font-bold tracking-tight">
              PathLab Rate Manager
            </h1>
            <p className="text-xs text-white/60">Subaccount Access</p>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-[oklch(0.35_0.1_175)] text-white py-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-fraunces font-bold mb-2">
              Select Your Subaccount
            </h2>
            <p className="text-white/70 text-sm max-w-md mx-auto">
              Choose your subaccount to access your rate card and transaction
              history. PIN verification required.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {subaccounts.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.55_0.025_215)]" />
              <Input
                placeholder="Search subaccounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-[oklch(0.82_0.04_200)]"
                autoComplete="off"
              />
            </div>
          </div>
        )}

        {subaccounts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-[oklch(0.93_0.015_200)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-[oklch(0.55_0.06_200)]" />
            </div>
            <h3 className="font-fraunces text-xl font-semibold text-[oklch(0.3_0.05_215)] mb-2">
              No Subaccounts Available
            </h3>
            <p className="text-[oklch(0.55_0.025_215)] text-sm max-w-xs mx-auto">
              Subaccounts will appear here once created by the admin. Please
              contact your administrator.
            </p>
          </motion.div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-[oklch(0.55_0.025_215)]">
            <p className="font-medium">No results for "{searchQuery}"</p>
            <p className="text-sm mt-1">Try a different name or phone number</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((sub, i) => (
              <motion.button
                key={sub.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                onClick={() => {
                  window.location.hash = `#/sub/${sub.id}`;
                }}
                className="group flex items-center gap-4 p-4 rounded-xl border border-[oklch(0.88_0.04_200)] bg-white hover:border-[oklch(0.45_0.12_175)] hover:shadow-md transition-all text-left"
              >
                <div className="w-12 h-12 bg-[oklch(0.88_0.06_175)] rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-[oklch(0.32_0.1_185)] font-bold text-lg">
                    {sub.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[oklch(0.22_0.07_215)] truncate">
                    {sub.name}
                  </div>
                  {sub.phone && (
                    <div className="text-xs text-[oklch(0.55_0.025_215)] mt-0.5">
                      📞 {sub.phone}
                    </div>
                  )}
                </div>
                <div className="text-[oklch(0.55_0.06_200)] group-hover:text-[oklch(0.42_0.12_175)] transition-colors text-lg">
                  →
                </div>
              </motion.button>
            ))}
          </div>
        )}
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
