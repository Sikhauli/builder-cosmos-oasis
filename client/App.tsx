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
            <Route path="/employees" element={<PlaceholderPage title="Employees" description="Manage employee data, onboarding, digital contracts, and tax forms." />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/integrations" element={<PlaceholderPage title="Integrations" description="Connect QuickBooks, Xero, Sage, HRIS, CSV/XLSX, REST APIs & webhooks." />} />
            <Route path="/compliance" element={<PlaceholderPage title="Compliance" description="Track tax forms, filing calendars, statuses, and audit‑ready docs." />} />
            <Route path="/audit-log" element={<PlaceholderPage title="Audit Log" description="Review detailed security and payroll activity logs." />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" description="RBAC, MFA, masking, residency controls, and org preferences." />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
