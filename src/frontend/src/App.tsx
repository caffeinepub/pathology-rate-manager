import { Sidebar } from "@/components/lis/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { LisAuthProvider, useLisAuth } from "@/context/LisAuthContext";
import { LisDataProvider } from "@/context/LisDataContext";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Suspense, lazy, useEffect, useState } from "react";

// Lazy-loaded pages
const LoginPage = lazy(() => import("./pages/lis/LoginPage"));
const Dashboard = lazy(() => import("./pages/lis/Dashboard"));
const MachinesPage = lazy(() => import("./pages/lis/MachinesPage"));
const LdmsPage = lazy(() => import("./pages/lis/LdmsPage"));
const ParametersPage = lazy(() => import("./pages/lis/ParametersPage"));
const PatientsPage = lazy(() => import("./pages/lis/PatientsPage"));
const ResultsPage = lazy(() => import("./pages/lis/ResultsPage"));
const TransferLogsPage = lazy(() => import("./pages/lis/TransferLogsPage"));

type LisRoute =
  | "login"
  | "dashboard"
  | "machines"
  | "ldms"
  | "parameters"
  | "patients"
  | "results"
  | "logs";

function parseRoute(hash: string): LisRoute {
  const path = hash.replace(/^#/, "") || "/";
  if (path === "/dashboard") return "dashboard";
  if (path === "/machines") return "machines";
  if (path === "/ldms") return "ldms";
  if (path === "/parameters") return "parameters";
  if (path === "/patients") return "patients";
  if (path === "/results") return "results";
  if (path === "/logs") return "logs";
  return "login";
}

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
    </div>
  );
}

const PROTECTED_ROUTES: LisRoute[] = [
  "dashboard",
  "machines",
  "ldms",
  "parameters",
  "patients",
  "results",
  "logs",
];

function AppRoutes() {
  const { isAuthenticated } = useLisAuth();
  const [route, setRoute] = useState<LisRoute>(() =>
    parseRoute(window.location.hash),
  );
  const [hash, setHash] = useState(() => window.location.hash || "#/");

  useEffect(() => {
    const handleHashChange = () => {
      const newRoute = parseRoute(window.location.hash);
      setRoute(newRoute);
      setHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isAuthenticated && PROTECTED_ROUTES.includes(route)) {
      window.location.hash = "#/";
    }
    // Redirect authenticated users away from login
    if (isAuthenticated && route === "login") {
      window.location.hash = "#/dashboard";
    }
  }, [isAuthenticated, route]);

  if (!isAuthenticated || route === "login") {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        }
      >
        <LoginPage />
      </Suspense>
    );
  }

  const renderPage = () => {
    switch (route) {
      case "dashboard":
        return <Dashboard />;
      case "machines":
        return <MachinesPage />;
      case "ldms":
        return <LdmsPage />;
      case "parameters":
        return <ParametersPage />;
      case "patients":
        return <PatientsPage />;
      case "results":
        return <ResultsPage />;
      case "logs":
        return <TransferLogsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar currentHash={hash} />
      <main className="flex-1 overflow-y-auto">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={route}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="min-h-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LisAuthProvider>
      <LisDataProvider>
        <div className="min-h-screen bg-background font-sora">
          <AppRoutes />
        </div>
        <Toaster position="top-right" richColors />
      </LisDataProvider>
    </LisAuthProvider>
  );
}
