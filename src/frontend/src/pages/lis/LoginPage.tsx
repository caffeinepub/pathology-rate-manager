import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLisAuth } from "@/context/LisAuthContext";
import {
  Activity,
  Eye,
  EyeOff,
  Lock,
  Network,
  Shield,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useLisAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    const success = login(username, password);
    if (success) {
      toast.success("Authentication successful");
      window.location.hash = "#/dashboard";
    } else {
      setError("Invalid credentials. Please check your username and password.");
      toast.error("Authentication failed");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-4"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center glow-cyan">
                <Network className="w-8 h-8 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[oklch(0.7_0.18_145)] border-2 border-background flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-background" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              LIS Connect
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Laboratory Information System Middleware
            </p>
          </motion.div>
        </div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Admin Authentication
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm text-foreground/80">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  data-ocid="login.username.input"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9 bg-input/50 border-border focus:border-primary"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-foreground/80">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  data-ocid="login.password.input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 bg-input/50 border-border focus:border-primary"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                data-ocid="login.error_state"
                className="text-xs text-destructive/90 bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              data-ocid="login.submit_button"
              disabled={isLoading || !username || !password}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-spin" />
                  Authenticating...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                {
                  icon: <Network className="w-3.5 h-3.5" />,
                  label: "HL7/ASTM",
                },
                {
                  icon: <Activity className="w-3.5 h-3.5" />,
                  label: "Real-time",
                },
                { icon: <Shield className="w-3.5 h-3.5" />, label: "Secure" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex flex-col items-center gap-1 text-muted-foreground"
                >
                  {f.icon}
                  <span className="text-xs">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
