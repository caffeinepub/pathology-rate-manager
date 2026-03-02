import { FlaskConical, Lock, Users } from "lucide-react";
import { motion } from "motion/react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            <p className="text-xs text-white/60">
              Diagnostic Test Price Management System
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-16 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl font-fraunces font-bold text-[oklch(0.2_0.06_215)] mb-3">
            Welcome to PathLab Portal
          </h2>
          <p className="text-[oklch(0.52_0.025_215)] text-lg max-w-xl mx-auto">
            Choose your access type to continue. Each portal is fully isolated
            for security.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
          {/* Admin Portal Card */}
          <motion.button
            type="button"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => {
              window.location.hash = "#/admin";
            }}
            className="group relative flex flex-col items-center gap-5 p-10 rounded-2xl border-2 border-[oklch(0.82_0.06_210)] bg-white shadow-md hover:shadow-xl hover:border-[oklch(0.38_0.1_210)] transition-all text-left"
          >
            <div className="w-16 h-16 bg-[oklch(0.22_0.07_215)] rounded-2xl flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-fraunces font-bold text-[oklch(0.22_0.07_215)] mb-2">
                Admin Portal
              </h3>
              <p className="text-[oklch(0.52_0.025_215)] text-sm leading-relaxed">
                Manage tests, set prices, control subaccounts, view all
                transactions and billing details.
              </p>
            </div>
            <div className="mt-auto w-full py-3 bg-[oklch(0.22_0.07_215)] text-white rounded-xl font-semibold text-sm group-hover:bg-[oklch(0.32_0.1_210)] transition-colors">
              Sign In as Admin →
            </div>
          </motion.button>

          {/* Subaccount Access Card */}
          <motion.button
            type="button"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => {
              window.location.hash = "#/sub";
            }}
            className="group relative flex flex-col items-center gap-5 p-10 rounded-2xl border-2 border-[oklch(0.82_0.08_160)] bg-white shadow-md hover:shadow-xl hover:border-[oklch(0.45_0.12_175)] transition-all text-left"
          >
            <div className="w-16 h-16 bg-[oklch(0.42_0.12_175)] rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-fraunces font-bold text-[oklch(0.28_0.1_175)] mb-2">
                Subaccount Access
              </h3>
              <p className="text-[oklch(0.52_0.025_215)] text-sm leading-relaxed">
                View your assigned test rates, transaction history, and billing
                details with PIN verification.
              </p>
            </div>
            <div className="mt-auto w-full py-3 bg-[oklch(0.42_0.12_175)] text-white rounded-xl font-semibold text-sm group-hover:bg-[oklch(0.35_0.12_175)] transition-colors">
              Enter Subaccount →
            </div>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex items-center gap-2 text-sm text-[oklch(0.58_0.025_215)]"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>
            Each portal is completely isolated — subaccounts cannot access admin
            data
          </span>
        </motion.div>
      </main>

      {/* Footer */}
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
