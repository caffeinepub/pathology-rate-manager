import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import HomePage from "./pages/HomePage";
import SubaccountView from "./pages/SubaccountView";

type View =
  | { type: "home" }
  | { type: "admin" }
  | { type: "subaccount"; name: string };

export default function App() {
  const [view, setView] = useState<View>({ type: "home" });

  const navigate = (v: View) => setView(v);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background font-outfit">
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
      </div>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
