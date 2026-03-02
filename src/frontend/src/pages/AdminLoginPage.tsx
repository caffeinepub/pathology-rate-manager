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
  ArrowLeft,
  FlaskConical,
  KeyRound,
  Loader2,
  LogIn,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useAdminLogin } from "../hooks/useQueries";
import {
  getAdminMobile,
  getPasswordOverride,
  setPasswordOverride,
} from "../utils/adminSettings";

type ForgotStep = "mobile" | "newPassword";

function ForgotPasswordModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [step, setStep] = useState<ForgotStep>("mobile");
  const [mobileInput, setMobileInput] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setStep("mobile");
      setMobileInput("");
      setMobileError("");
      setNewPassword("");
      setConfirmPassword("");
      setPwError("");
    }
    onOpenChange(v);
  };

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileError("");
    const registered = getAdminMobile();
    if (!registered) {
      setMobileError(
        "No mobile number registered. Please log in and go to Settings to register your number first.",
      );
      return;
    }
    if (mobileInput.trim() !== registered.trim()) {
      setMobileError("Mobile number not found.");
      return;
    }
    setStep("newPassword");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (!newPassword.trim()) {
      setPwError("New password cannot be empty.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 4) {
      setPwError("Password must be at least 4 characters.");
      return;
    }
    setPasswordOverride(newPassword);
    toast.success("Password updated successfully!");
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-[oklch(0.92_0.06_200)] rounded-lg flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-[oklch(0.38_0.1_210)]" />
            </div>
            <DialogTitle className="font-fraunces text-[oklch(0.25_0.06_215)]">
              Forgot Password
            </DialogTitle>
          </div>
        </DialogHeader>

        {step === "mobile" && (
          <form onSubmit={handleMobileSubmit} className="space-y-4 pt-2">
            <p className="text-sm text-[oklch(0.52_0.025_215)]">
              Enter the mobile number registered to the admin account.
            </p>
            <div className="space-y-2">
              <Label
                htmlFor="forgot-mobile"
                className="text-[oklch(0.3_0.05_215)] font-medium"
              >
                Registered Mobile Number
              </Label>
              <Input
                id="forgot-mobile"
                type="tel"
                value={mobileInput}
                onChange={(e) => setMobileInput(e.target.value)}
                placeholder="Enter your mobile number"
                autoComplete="tel"
                className="border-[oklch(0.82_0.04_200)]"
              />
              {mobileError && (
                <p className="text-xs text-[oklch(0.52_0.2_25)] mt-1">
                  {mobileError}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-[oklch(0.38_0.1_210)] hover:bg-[oklch(0.32_0.1_210)] text-white font-semibold"
              >
                Verify &amp; Continue
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "newPassword" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
            <p className="text-sm text-[oklch(0.52_0.025_215)]">
              Mobile number verified. Set a new password.
            </p>
            <div className="space-y-2">
              <Label
                htmlFor="forgot-newpw"
                className="text-[oklch(0.3_0.05_215)] font-medium"
              >
                New Password
              </Label>
              <Input
                id="forgot-newpw"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                className="border-[oklch(0.82_0.04_200)]"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="forgot-confirmpw"
                className="text-[oklch(0.3_0.05_215)] font-medium"
              >
                Confirm Password
              </Label>
              <Input
                id="forgot-confirmpw"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                className="border-[oklch(0.82_0.04_200)]"
              />
              {pwError && (
                <p className="text-xs text-[oklch(0.52_0.2_25)] mt-1">
                  {pwError}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-[oklch(0.38_0.1_210)] hover:bg-[oklch(0.32_0.1_210)] text-white font-semibold"
              >
                Save New Password
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const { setSessionToken } = useAuth();
  const loginMutation = useAdminLogin();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter username and password");
      return;
    }

    const override = getPasswordOverride();
    const isAdminUser = username === "Arit";
    let backendPassword = password;
    if (isAdminUser && override) {
      if (password === override || password === "12345") {
        backendPassword = "12345";
      }
    }

    try {
      const token = await loginMutation.mutateAsync({
        username,
        password: backendPassword,
      });
      setSessionToken(token);
      toast.success("Welcome, Admin!");
      window.location.hash = "#/admin";
    } catch {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ForgotPasswordModal open={forgotOpen} onOpenChange={setForgotOpen} />

      {/* Header */}
      <header className="bg-[oklch(0.25_0.07_215)] text-white py-4 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
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
          <div className="bg-[oklch(0.55_0.15_175)] p-2 rounded-lg">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-fraunces font-bold tracking-tight">
              PathLab Rate Manager
            </h1>
            <p className="text-xs text-white/60">Admin Portal</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 border-[oklch(0.88_0.05_200)] shadow-xl">
            <CardHeader className="bg-[oklch(0.25_0.07_215)] text-white rounded-t-lg pb-6 pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-xl">
                  <LogIn className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="font-fraunces text-2xl">
                    Admin Portal
                  </CardTitle>
                  <p className="text-white/70 text-sm mt-0.5">
                    Sign in to manage tests and subaccounts
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 pb-6">
              <form onSubmit={handleLogin} className="space-y-5">
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
                    className="border-[oklch(0.82_0.04_200)] focus:border-[oklch(0.38_0.1_210)]"
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
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setForgotOpen(true)}
                      className="text-xs text-[oklch(0.45_0.1_210)] hover:text-[oklch(0.32_0.1_210)] hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
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

              <div className="mt-5 p-3 bg-[oklch(0.95_0.015_200)] rounded-lg border border-[oklch(0.88_0.04_200)]">
                <p className="text-xs text-[oklch(0.52_0.025_215)]">
                  <span className="font-semibold">Admin access</span> — manage
                  tests, prices, subaccounts, labs, and all billing
                  transactions.
                </p>
              </div>
            </CardContent>
          </Card>
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
