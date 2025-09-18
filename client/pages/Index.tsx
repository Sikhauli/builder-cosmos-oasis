import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlarmClockCheck, Banknote, BookCheck, Building2, CalendarClock, FileSpreadsheet, FileText, GitCompare, Globe2, HandCoins, HelpCircle, LockKeyhole, ReceiptText, ShieldCheck, Users, Webhook, Zap } from "lucide-react";
import { DemoResponse } from "@shared/api";

function Stat({ label, value, hint, to }: { label: string; value: string; hint?: string; to?: string }) {
  const content = (
    <div className="rounded-md border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold leading-none">{value}</div>
      {hint ? <div className="mt-1 text-[10px] text-muted-foreground">{hint}</div> : null}
    </div>
  );
  return to ? <Link to={to} className="block hover:bg-secondary/40">{content}</Link> : content;
}

export default function Index() {
  const [exampleFromServer, setExampleFromServer] = useState("");
  useEffect(() => { fetchDemo(); }, []);
  const fetchDemo = async () => {
    try {
      const response = await fetch("/api/demo");
      const data = (await response.json()) as DemoResponse;
      setExampleFromServer(data.message);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="container mx-auto py-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-sm font-semibold tracking-tight">VerdantPay Dashboard</h1>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">Secure payroll with scheduled/ad-hoc runs, gross-to-net, overtime, deductions, benefits, contractors, multi-currency, multi-jurisdiction tax.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="h-7 px-2 text-xs"><Link to="/payroll"><AlarmClockCheck className="mr-1 h-3.5 w-3.5"/> Schedule Run</Link></Button>
          <Button variant="outline" asChild className="h-7 px-2 text-xs"><Link to="/payroll"><Zap className="mr-1 h-3.5 w-3.5"/> Ad‑hoc Run</Link></Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Next scheduled" value="Fri • 09:00" hint="Bi‑weekly • Cycle 18" to="/payroll"/>
        <Stat label="Sandbox ready" value="Draft run #102" hint="Gross-to-net preview" to="/payroll"/>
        <Stat label="Timesheet alerts" value="5 exceptions" hint="> 8h/day or missing" to="/timesheets"/>
        <Stat label="GL preview" value="$184,210.44" hint="By dept • currency split" to="/payroll"/>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <section className="rounded-md border p-3 lg:col-span-2">
          <header className="mb-2 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-xs font-medium"><ReceiptText className="h-3.5 w-3.5"/> Payroll runs</div>
            <Link to="/payroll" className="text-[11px] text-primary hover:underline">Open</Link>
          </header>
          <ul className="grid gap-2 md:grid-cols-2">
            <li className="rounded border p-3">
              <div className="text-xs font-medium">Scheduled & ad‑hoc</div>
              <p className="mt-1 text-[11px] text-muted-foreground">Create recurring schedules or trigger on‑demand. Supports multi‑entity calendars.</p>
            </li>
            <li className="rounded border p-3">
              <div className="text-xs font-medium">Gross‑to‑net</div>
              <p className="mt-1 text-[11px] text-muted-foreground">Overtime, deductions, benefits, contractors, bonuses with audit trails.</p>
            </li>
            <li className="rounded border p-3">
              <div className="text-xs font-medium">Multi‑currency & tax</div>
              <p className="mt-1 text-[11px] text-muted-foreground">Automatic FX, localized tax engines across jurisdictions.</p>
            </li>
            <li className="rounded border p-3">
              <div className="text-xs font-medium">Approvals & staging</div>
              <p className="mt-1 text-[11px] text-muted-foreground">Multi‑step approvals, staged runs, report packs, custom exports.</p>
            </li>
          </ul>
        </section>

        <section className="rounded-md border p-3">
          <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium"><FileSpreadsheet className="h-3.5 w-3.5"/> Time sync</header>
          <ul className="space-y-2">
            <li className="rounded border p-2 text-[11px]">CSV/API import with validation</li>
            <li className="rounded border p-2 text-[11px]">Inline edits & overtime detection</li>
            <li className="rounded border p-2 text-[11px]">Live clock‑in/out with rules</li>
          </ul>
          <div className="mt-2 flex gap-2">
            <Button asChild className="h-7 px-2 text-xs"><Link to="/timesheets">Review</Link></Button>
            <Button variant="outline" className="h-7 px-2 text-xs">Import CSV</Button>
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <section className="rounded-md border p-3">
          <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium"><Users className="h-3.5 w-3.5"/> Employees & contractors</header>
          <p className="text-[11px] text-muted-foreground">Digital contracts, tax forms, self‑service edits, e���sign, flexible payout rails.</p>
        </section>
        <section className="rounded-md border p-3">
          <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium"><Webhook className="h-3.5 w-3.5"/> Integrations</header>
          <p className="text-[11px] text-muted-foreground">QuickBooks, Xero, Sage, HRIS, CSV/XLSX import/export, REST APIs, webhooks.</p>
        </section>
        <section className="rounded-md border p-3">
          <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium"><FileText className="h-3.5 w-3.5"/> Compliance</header>
          <p className="text-[11px] text-muted-foreground">Tax forms, filing calendars, statuses, audit‑ready documents.</p>
        </section>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-4">
        <section className="rounded-md border p-3 lg:col-span-2">
          <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium"><ShieldCheck className="h-3.5 w-3.5"/> Security</header>
          <ul className="grid gap-2 md:grid-cols-2 text-[11px]">
            <li className="rounded border p-2">RBAC roles & fine‑grained permissions</li>
            <li className="rounded border p-2">MFA, masking, residency controls</li>
            <li className="rounded border p-2">Detailed logs & anomaly alerts</li>
            <li className="rounded border p-2">Data retention & export controls</li>
          </ul>
        </section>
        <section className="rounded-md border p-3">
          <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium"><BookCheck className="h-3.5 w-3.5"/> Reports</header>
          <p className="text-[11px] text-muted-foreground">Download GL, payroll journals, and custom exports by entity/currency.</p>
        </section>
        <section className="rounded-md border p-3">
          <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium"><CalendarClock className="h-3.5 w-3.5"/> Filing calendar</header>
          <p className="text-[11px] text-muted-foreground">Upcoming tax filings with statuses and reminders.</p>
        </section>
      </div>

      <div className="sr-only">{exampleFromServer}</div>
    </div>
  );
}
