import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Timesheets from "./pages/Timesheets";
import TopNav from "@/components/layout/TopNav";
import PlaceholderPage from "@/components/layout/PlaceholderPage";
import Payroll from "@/pages/Payroll";
import Employees from "@/pages/Employees";
import Integrations from "@/pages/Integrations";
import Compliance from "@/pages/Compliance";
import SettingsPage from "@/pages/Settings";
import AuditLog from "@/pages/AuditLog";
import PayRuns from "@/pages/PayRuns";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TopNav />
        <main className="min-h-[calc(100vh-44px)]">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/timesheets" element={<Timesheets />} />
            <Route path="/pay-runs" element={<PayRuns />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/audit-log" element={<AuditLog />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
