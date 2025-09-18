import { Link, NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  Clock,
  FileText,
  Fingerprint,
  Layers3,
  ListChecks,
  Shield,
  Users,
  Webhook,
  Settings,
  Play,
  ScrollText,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: Layers3 },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/payroll", label: "Payroll", icon: Play },
  { to: "/timesheets", label: "Timesheets", icon: Clock },
  { to: "/compliance", label: "Compliance", icon: FileText },
  { to: "/integrations", label: "Integrations", icon: Webhook },
  { to: "/audit-log", label: "Audit", icon: ScrollText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function TopNav() {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:bg-background/80">
      <div className="container mx-auto flex h-11 items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <Fingerprint className="h-4 w-4" />
            <span className="font-semibold tracking-tight">VerdantPay</span>
          </Link>
          <nav className="ml-4 hidden gap-1 md:flex">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-medium text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors",
                    isActive || location.pathname === to
                      ? "text-primary bg-secondary"
                      : undefined,
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/payroll"
            className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow hover:bg-primary/90"
            aria-label="Start payroll run"
          >
            <ListChecks className="h-3.5 w-3.5" /> Run Payroll
          </Link>
          <span className="hidden items-center gap-1 rounded border px-2 py-1 text-[10px] text-foreground/60 md:inline-flex">
            <Shield className="h-3 w-3" /> RBAC • MFA
          </span>
        </div>
      </div>
    </header>
  );
}

export default TopNav;
