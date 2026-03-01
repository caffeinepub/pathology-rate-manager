import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { Suspense, lazy, useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SubaccountView = lazy(() => import("./pages/SubaccountView"));

type View =
  | { type: "home" }
  | { type: "admin" }
  | { type: "subaccount"; name: string };

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-6 h-6 animate-spin text-[oklch(0.38_0.1_210)]" />
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>({ type: "home" });

  const navigate = (v: View) => setView(v);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background font-outfit">
        <Suspense fallback={<PageLoader />}>
          {view.type === "home" && (
            <HomePage
              onAdminLogin={() => navigate({ type: "admin" })}
              onSelectSubaccount={(name) =>
                navigate({ type: "subaccount", name })
              }
            />
          )}
          {view.type === "admin" && (
            <AdminDashboard onLogout={() => navigate({ type: "home" })} />
          )}
          {view.type === "subaccount" && (
            <SubaccountView
              subaccountName={view.name}
              onBack={() => navigate({ type: "home" })}
            />
          )}
        </Suspense>
      </div>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
