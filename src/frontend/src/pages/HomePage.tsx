import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  ChevronRight,
  FlaskConical,
  Loader2,
  LogIn,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SubAccount } from "../backend.d.ts";
import { useAuth } from "../context/AuthContext";
import { SUBACCOUNTS_CACHE_KEY } from "../context/AuthContext";
import { useAdminLogin } from "../hooks/useQueries";

interface HomePageProps {
  onAdminLogin: () => void;
  onSelectSubaccount: (name: string) => void;
}

export default function HomePage({
  onAdminLogin,
  onSelectSubaccount,
}: HomePageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setSessionToken, sessionToken, isAdmin } = useAuth();
  const loginMutation = useAdminLogin();

  // Cached subaccounts from localStorage
  const [cachedSubaccounts, setCachedSubaccounts] = useState<SubAccount[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SUBACCOUNTS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setCachedSubaccounts(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // If already logged in, redirect
  useEffect(() => {
    if (isAdmin && sessionToken) {
      onAdminLogin();
    }
  }, [isAdmin, sessionToken, onAdminLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter username and password");
      return;
    }
    try {
      const token = await loginMutation.mutateAsync({ username, password });
      setSessionToken(token);
      toast.success("Welcome, Admin!");
      onAdminLogin();
    } catch {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[oklch(0.25_0.07_215)] text-white py-4 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="bg-[oklch(0.55_0.15_175)] p-2 rounded-lg">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-fraunces font-bold tracking-tight">
              PathLab Rate Manager
            </h1>
            <p className="text-xs text-white/60 font-outfit">
              Diagnostic Test Price Management System
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Activity className="w-4 h-4 text-[oklch(0.65_0.18_175)]" />
            <span className="text-sm text-white/70">System Active</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-fraunces font-bold text-[oklch(0.2_0.06_215)] mb-3">
            Welcome to PathLab Portal
          </h2>
          <p className="text-[oklch(0.52_0.025_215)] text-lg max-w-2xl mx-auto">
            Manage diagnostic test pricing for administrators or access rate
            cards as a subaccount user.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Admin Login Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-2 border-[oklch(0.88_0.05_200)] shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-[oklch(0.25_0.07_215)] text-white rounded-t-lg pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="font-fraunces text-xl">
                      Admin Portal
                    </CardTitle>
                    <CardDescription className="text-white/70 text-sm">
                      Sign in to manage tests and subaccounts
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="username"
                      className="text-[oklch(0.3_0.05_215)] font-medium"
                    >
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter admin username"
                      className="border-[oklch(0.82_0.04_200)] focus:border-[oklch(0.38_0.1_210)] focus:ring-[oklch(0.38_0.1_210)]"
                      autoComplete="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-[oklch(0.3_0.05_215)] font-medium"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="border-[oklch(0.82_0.04_200)] focus:border-[oklch(0.38_0.1_210)]"
                      autoComplete="current-password"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full bg-[oklch(0.38_0.1_210)] hover:bg-[oklch(0.32_0.1_210)] text-white font-semibold py-2.5"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In as Admin
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-4 p-3 bg-[oklch(0.95_0.015_200)] rounded-lg border border-[oklch(0.88_0.04_200)]">
                  <p className="text-xs text-[oklch(0.52_0.025_215)]">
                    <span className="font-semibold">Admin access</span> allows
                    you to manage test prices, add new tests, and create
                    subaccounts.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subaccount Access Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-2 border-[oklch(0.88_0.05_200)] shadow-md hover:shadow-lg transition-shadow h-full">
              <CardHeader className="bg-[oklch(0.45_0.12_175)] text-white rounded-t-lg pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="font-fraunces text-xl">
                      Subaccount Access
                    </CardTitle>
                    <CardDescription className="text-white/70 text-sm">
                      View test rates without login
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {cachedSubaccounts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-[oklch(0.93_0.015_200)] rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-[oklch(0.55_0.06_200)]" />
                    </div>
                    <p className="text-[oklch(0.52_0.025_215)] text-sm font-medium mb-1">
                      No subaccounts available
                    </p>
                    <p className="text-[oklch(0.65_0.02_215)] text-xs">
                      Subaccounts will appear here once created by admin.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-[oklch(0.52_0.025_215)] mb-3 font-medium">
                      Select a subaccount to view test rates:
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {cachedSubaccounts.map((sub) => (
                        <motion.button
                          key={String(sub.id)}
                          whileHover={{ x: 4 }}
                          onClick={() => onSelectSubaccount(sub.name)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-[oklch(0.88_0.04_200)] hover:border-[oklch(0.55_0.12_175)] hover:bg-[oklch(0.96_0.02_185)] transition-all text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[oklch(0.88_0.06_175)] rounded-full flex items-center justify-center">
                              <span className="text-[oklch(0.35_0.1_185)] font-bold text-sm">
                                {sub.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-[oklch(0.25_0.06_215)]">
                              {sub.name}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[oklch(0.55_0.06_200)] group-hover:text-[oklch(0.45_0.12_175)] transition-colors" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                <p className="text-xs text-[oklch(0.6_0.025_215)] text-center">
                  Subaccount users can view all test rates without
                  authentication
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-6 bg-white border border-[oklch(0.88_0.02_200)] rounded-2xl px-8 py-4 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-fraunces font-bold text-[oklch(0.38_0.1_210)]">
                100+
              </div>
              <div className="text-xs text-[oklch(0.55_0.025_215)]">
                Test Types
              </div>
            </div>
            <div className="h-8 w-px bg-[oklch(0.88_0.02_200)]" />
            <div className="text-center">
              <div className="text-2xl font-fraunces font-bold text-[oklch(0.45_0.12_175)]">
                Live
              </div>
              <div className="text-xs text-[oklch(0.55_0.025_215)]">
                Rate Updates
              </div>
            </div>
            <div className="h-8 w-px bg-[oklch(0.88_0.02_200)]" />
            <div className="text-center">
              <div className="text-2xl font-fraunces font-bold text-[oklch(0.38_0.1_210)]">
                B2B
              </div>
              <div className="text-xs text-[oklch(0.55_0.025_215)]">
                Partner Rates
              </div>
            </div>
          </div>
        </motion.div>
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
