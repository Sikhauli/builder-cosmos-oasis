import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpenCheck, Cable, Database, Download, Eye, EyeOff, GitCompare, Key, Link as LinkIcon, Plus, RefreshCw, Save, Upload, Webhook } from "lucide-react";
import { toast } from "@/hooks/use-toast";

 type Provider = "QuickBooks" | "Xero" | "Sage";

 interface Mapping { code: string; debit: string; credit: string; }

 const defaultMap: Mapping[] = [
  { code: "Regular", debit: "6000 Payroll Expense", credit: "2100 Wages Payable" },
  { code: "Overtime", debit: "6001 Overtime Expense", credit: "2100 Wages Payable" },
  { code: "Benefits", debit: "6100 Benefits", credit: "2100 Wages Payable" },
  { code: "Taxes", debit: "6200 Employer Taxes", credit: "2200 Taxes Payable" },
 ];

 function mask(t: string, show: boolean) { return show ? t : t.replace(/.(?=.{4})/g, "•"); }

 export default function Integrations() {
  const [provider, setProvider] = useState<Provider>("QuickBooks");
  const [mapping, setMapping] = useState<Mapping[]>(defaultMap);
  const [tokens, setTokens] = useState<{ id: string; value: string; created: string }[]>([
    { id: crypto.randomUUID(), value: crypto.randomUUID(), created: new Date().toISOString() },
  ]);
  const [show, setShow] = useState(false);
  const [endpoint, setEndpoint] = useState("https://example.com/webhooks");
  const [events, setEvents] = useState<{ name: string; selected: boolean }[]>([
    { name: "payroll.submitted", selected: true },
    { name: "payout.sent", selected: true },
    { name: "employee.created", selected: false },
    { name: "timesheet.approved", selected: false },
  ]);

  const preview = useMemo(() => ({
    id: crypto.randomUUID(),
    type: events.filter((e) => e.selected)[0]?.name || "payroll.submitted",
    createdAt: new Date().toISOString(),
    data: {
      runId: "run_123",
      amount: 12345.67,
      currency: "USD",
    },
  }), [events]);

  function updateRow(i: number, patch: Partial<Mapping>) {
    setMapping((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function addRow() { setMapping((p) => [...p, { code: "Custom", debit: "", credit: "" }]); }

  function regenerateToken() {
    const t = { id: crypto.randomUUID(), value: crypto.randomUUID(), created: new Date().toISOString() };
    setTokens((p) => [t, ...p]);
    toast({ title: "Token created", description: "Copy and store it securely." });
  }

  return (
    <div className="container mx-auto py-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-sm font-semibold">Integrations & extensibility</h1>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">Integrate GL with QuickBooks/Xero/Sage, sync HRIS/ATS, bulk CSV/XLSX import/export, and manage REST API tokens and webhook subscriptions with event previews.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-7 px-2 text-xs" onClick={() => toast({ title: "CSV exported", description: "GL and runs exported." })}><Download className="mr-1 h-3.5 w-3.5"/>Export CSV/XLSX</Button>
          <Button variant="outline" className="h-7 px-2 text-xs" onClick={() => toast({ title: "Imported", description: "Bulk edit file processed." })}><Upload className="mr-1 h-3.5 w-3.5"/>Bulk import</Button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <section className="rounded-md border p-3 lg:col-span-2">
          <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium"><GitCompare className="h-3.5 w-3.5"/> GL mapping</header>
          <div className="mb-2 flex items-center gap-2 text-[11px]">
            <span>Provider</span>
            <select className="rounded border px-2 py-1" value={provider} onChange={(e) => setProvider(e.target.value as Provider)}>
              {(["QuickBooks","Xero","Sage"] as Provider[]).map((p) => <option key={p}>{p}</option>)}
            </select>
            <Button variant="outline" className="h-7 px-2 text-xs" onClick={() => toast({ title: `Synced with ${provider}`, description: "Accounts refreshed." })}><RefreshCw className="mr-1 h-3.5 w-3.5"/>Sync accounts</Button>
          </div>
          <div className="overflow-hidden rounded border">
            <table className="min-w-[800px] text-left text-xs">
              <thead className="bg-secondary/60">
                <tr className="border-b">
                  <Th>Code</Th>
                  <Th>Debit account</Th>
                  <Th>Credit account</Th>
                </tr>
              </thead>
              <tbody>
                {mapping.map((m, i) => (
                  <tr key={i} className="border-b">
                    <Td>{m.code}</Td>
                    <Td><input className="w-full rounded border px-2 py-1 text-[11px]" value={m.debit} onChange={(e) => updateRow(i, { debit: e.target.value })}/></Td>
                    <Td><input className="w-full rounded border px-2 py-1 text-[11px]" value={m.credit} onChange={(e) => updateRow(i, { credit: e.target.value })}/></Td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t px-3 py-2 text-[11px]"><div className="text-muted-foreground">Map earnings/deductions/benefits to accounts.</div><div className="flex items-center gap-2"><Button variant="outline" className="h-7 px-2 text-xs" onClick={addRow}><Plus className="mr-1 h-3 w-3"/>Add row</Button><Button className="h-7 px-2 text-xs" onClick={() => toast({ title: "Saved", description: "GL mapping updated." })}><Save className="mr-1 h-3.5 w-3.5"/>Save</Button></div></div>
          </div>
        </section>

        <section className="rounded-md border p-3">
          <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium"><Database className="h-3.5 w-3.5"/> HRIS / ATS</header>
          <ul className="space-y-2 text-[11px]">
            <li className="rounded border p-2">Sync employees and reconcile new hires from HRIS.</li>
            <li className="rounded border p-2">ATS offers candidate -> employee conversion.</li>
            <li className="rounded border p-2">Schedule daily pull or manual sync.</li>
          </ul>
          <Button variant="outline" className="mt-2 h-7 w-full px-2 text-xs" onClick={() => toast({ title: "Synced", description: "HRIS data pulled." })}>Sync now</Button>
        </section>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <section className="rounded-md border p-3">
          <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium"><Key className="h-3.5 w-3.5"/> API tokens</header>
          <div className="space-y-2 text-[11px]">
            {tokens.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded border p-2">
                <div>
                  <div className="font-medium">{mask(t.value, show)}</div>
                  <div className="text-[10px] text-muted-foreground">Created {new Date(t.created).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="h-7 px-2 text-xs" onClick={() => setShow((s) => !s)}>{show ? <Eye className="h-3.5 w-3.5"/> : <EyeOff className="h-3.5 w-3.5"/>}</Button>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-2 h-7 w-full px-2 text-xs" onClick={regenerateToken}>Generate new token</Button>
        </section>

        <section className="rounded-md border p-3 lg:col-span-2">
          <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium"><Webhook className="h-3.5 w-3.5"/> Webhooks</header>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded border p-3 text-[11px]">
              <div className="mb-1">Endpoint</div>
              <input className="w-full rounded border px-2 py-1" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} />
              <div className="mt-2 mb-1">Events</div>
              <div className="grid grid-cols-2 gap-1">
                {events.map((e, i) => (
                  <label key={e.name} className="inline-flex items-center gap-1 text-[11px]"><input type="checkbox" className="scale-90" checked={e.selected} onChange={(ev) => setEvents((prev) => prev.map((x, idx) => idx === i ? { ...x, selected: ev.target.checked } : x))}/> {e.name}</label>
                ))}
              </div>
              <Button className="mt-2 h-7 w-full px-2 text-xs" onClick={() => toast({ title: "Subscribed", description: `Webhook set to ${endpoint}` })}>Save subscription</Button>
            </div>
            <div className="rounded border p-3 text-[11px]">
              <div className="mb-1 inline-flex items-center gap-1 font-medium"><BookOpenCheck className="h-3.5 w-3.5"/> Event preview</div>
              <pre className="h-40 overflow-auto rounded bg-secondary/50 p-2 text-[10px]">{JSON.stringify(preview, null, 2)}</pre>
              <div className="mt-2 flex items-center gap-2">
                <Button variant="outline" className="h-7 px-2 text-xs" onClick={() => toast({ title: "Sent", description: "Test webhook delivered." })}>Send test</Button>
                <Button className="h-7 px-2 text-xs" onClick={() => navigator.clipboard.writeText(JSON.stringify(preview))}>Copy payload</Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
 }

 function Th({ children }: { children: React.ReactNode }) { return <th className="px-2 py-2 text-[11px] font-semibold">{children}</th>; }
 function Td({ children, className }: { children: React.ReactNode; className?: string }) { return <td className={"px-2 py-1.5 "+(className||"")}>{children}</td>; }