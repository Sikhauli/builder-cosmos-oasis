import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlarmClock,
  Calendar,
  CheckCircle2,
  Coins,
  Download,
  Edit3,
  FileSpreadsheet,
  Globe2,
  HandCoins,
  ListChecks,
  Lock,
  Percent,
  Play,
  Settings2,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type PayType = "employee" | "contractor";
type Currency = "USD" | "EUR" | "GBP" | "ZAR";

interface LineItem {
  id: string;
  name: string;
  type: PayType;
  currency: Currency;
  jurisdiction: { country: string; state?: string; local?: string };
  hoursRegular: number;
  hoursOvertime: number;
  rateRegular: number; // per hour, in currency
  rateOvertime: number; // per hour, in currency
  shiftDifferential?: number; // flat in currency
  deductionsPreTax?: number; // in currency
  deductionsPostTax?: number; // in currency
  garnishments?: number; // in currency
  employerBenefits?: number; // in currency
  workersCompRate?: number; // percentage of gross, employer-paid
  overrideTax?: boolean;
  taxOverride?: { federal?: number; state?: number; local?: number }; // in currency
}

const FX_SNAPSHOT: Record<Currency, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  ZAR: 0.055,
};
const FX_AS_OF = new Date().toISOString();

const initialLines: LineItem[] = [
  {
    id: crypto.randomUUID(),
    name: "Alice Rivera",
    type: "employee",
    currency: "USD",
    jurisdiction: { country: "US", state: "CA", local: "SF" },
    hoursRegular: 80,
    hoursOvertime: 6,
    rateRegular: 45,
    rateOvertime: 67.5,
    shiftDifferential: 120,
    deductionsPreTax: 150,
    deductionsPostTax: 90,
    garnishments: 0,
    employerBenefits: 500,
    workersCompRate: 0.8,
  },
  {
    id: crypto.randomUUID(),
    name: "Ben Chen",
    type: "employee",
    currency: "EUR",
    jurisdiction: { country: "DE" },
    hoursRegular: 80,
    hoursOvertime: 0,
    rateRegular: 38,
    rateOvertime: 57,
    shiftDifferential: 0,
    deductionsPreTax: 120,
    deductionsPostTax: 60,
    garnishments: 0,
    employerBenefits: 420,
    workersCompRate: 0.6,
  },
  {
    id: crypto.randomUUID(),
    name: "Chandni Patel",
    type: "contractor",
    currency: "GBP",
    jurisdiction: { country: "UK" },
    hoursRegular: 70,
    hoursOvertime: 0,
    rateRegular: 60,
    rateOvertime: 90,
    shiftDifferential: 0,
    deductionsPreTax: 0,
    deductionsPostTax: 0,
    garnishments: 0,
    employerBenefits: 0,
    workersCompRate: 0,
  },
  {
    id: crypto.randomUUID(),
    name: "Sello Dlamini",
    type: "employee",
    currency: "ZAR",
    jurisdiction: { country: "ZA" },
    hoursRegular: 80,
    hoursOvertime: 10,
    rateRegular: 300,
    rateOvertime: 450,
    shiftDifferential: 0,
    deductionsPreTax: 0,
    deductionsPostTax: 0,
    garnishments: 30,
    employerBenefits: 1000,
    workersCompRate: 1.2,
  },
];

function fmt(n: number, currency: Currency) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    n,
  );
}

function usd(n: number, currency: Currency) {
  return n * FX_SNAPSHOT[currency];
}

function taxesFor(item: LineItem, taxableWages: number) {
  if (item.type === "contractor") return { federal: 0, state: 0, local: 0 };
  const base = {
    federal: taxableWages * 0.1,
    state: taxableWages * 0.05,
    local: taxableWages * 0.01,
  };
  if (!item.overrideTax) return base;
  return {
    federal: item.taxOverride?.federal ?? base.federal,
    state: item.taxOverride?.state ?? base.state,
    local: item.taxOverride?.local ?? base.local,
  };
}

export default function Payroll() {
  const [mode, setMode] = useState<"scheduled" | "adhoc">("scheduled");
  const [lines, setLines] = useState<LineItem[]>(initialLines);
  const [locked, setLocked] = useState(false);

  const computed = useMemo(() => {
    return lines.map((it) => {
      const gross =
        it.hoursRegular * it.rateRegular +
        it.hoursOvertime * it.rateOvertime +
        (it.shiftDifferential || 0);
      const employerWorkersComp = it.workersCompRate
        ? (gross * it.workersCompRate) / 100
        : 0;
      const preTax = it.deductionsPreTax || 0;
      const taxable = Math.max(0, gross - preTax);
      const tx = taxesFor(it, taxable);
      const postTax = it.deductionsPostTax || 0;
      const garn = it.garnishments || 0;
      const totalTax = tx.federal + tx.state + tx.local;
      const net = gross - preTax - totalTax - postTax - garn;
      return {
        it,
        gross,
        preTax,
        postTax,
        garn,
        employerWorkersComp,
        tx,
        totalTax,
        net,
      };
    });
  }, [lines]);

  const totalsByCurrency = useMemo(() => {
    const t: Record<Currency, { gross: number; net: number }> = {
      USD: { gross: 0, net: 0 },
      EUR: { gross: 0, net: 0 },
      GBP: { gross: 0, net: 0 },
      ZAR: { gross: 0, net: 0 },
    };
    for (const row of computed) {
      t[row.it.currency].gross += row.gross;
      t[row.it.currency].net += row.net;
    }
    return t;
  }, [computed]);

  const totalsUSD = useMemo(() => {
    let gross = 0,
      net = 0;
    for (const c of Object.keys(totalsByCurrency) as Currency[]) {
      gross += usd(totalsByCurrency[c].gross, c);
      net += usd(totalsByCurrency[c].net, c);
    }
    return { gross, net };
  }, [totalsByCurrency]);

  function update(id: string, patch: Partial<LineItem>) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  return (
    <div className="container mx-auto py-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-sm font-semibold">Payroll</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Scheduled (biweekly/monthly) and ad‑hoc (bonus, corrections).
            Gross‑to‑net with overtime, shift differentials, multi‑rates,
            deductions, garnishments, employer benefits, workers’ comp.
            Contractors supported with no default withholding. Multi‑currency
            with FX snapshots. Multi‑jurisdiction taxes with overrides.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded border bg-secondary px-2 py-1 text-[11px]">
            <button
              className={
                mode === "scheduled"
                  ? "rounded bg-primary px-2 py-0.5 text-primary-foreground"
                  : "px-2 py-0.5"
              }
              onClick={() => setMode("scheduled")}
            >
              <AlarmClock className="mr-1 inline h-3.5 w-3.5" />
              Scheduled
            </button>
            <button
              className={
                mode === "adhoc"
                  ? "rounded bg-primary px-2 py-0.5 text-primary-foreground"
                  : "px-2 py-0.5"
              }
              onClick={() => setMode("adhoc")}
            >
              <Sparkles className="mr-1 inline h-3.5 w-3.5" />
              Ad‑hoc
            </button>
          </div>
          <Button
            className="h-7 px-2 text-xs"
            onClick={() => {
              setLocked(true);
              toast({
                title: "Run locked",
                description:
                  "Timesheets snapshot captured. Calculations ready.",
              });
            }}
          >
            <Lock className="mr-1 h-3.5 w-3.5" />
            Lock & Calculate
          </Button>
          <Button
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() =>
              toast({ title: "Exported", description: "CSV export generated." })
            }
          >
            <Download className="mr-1 h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="mb-3 grid gap-3 md:grid-cols-3">
        <div className="rounded-md border p-3">
          <div className="mb-1 text-xs font-medium">Schedule</div>
          {mode === "scheduled" ? (
            <div className="text-[11px]">
              <div className="mb-1">
                Frequency:{" "}
                <select className="rounded border px-1 py-0.5 text-[11px]">
                  <option>Biweekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div>
                Next pay date:{" "}
                <input
                  type="date"
                  className="rounded border px-1 py-0.5 text-[11px]"
                />
              </div>
            </div>
          ) : (
            <div className="text-[11px]">
              <div className="mb-1">
                Reason:{" "}
                <select className="rounded border px-1 py-0.5 text-[11px]">
                  <option>Bonus</option>
                  <option>Correction</option>
                  <option>Off-cycle</option>
                </select>
              </div>
              <div>
                Pay date:{" "}
                <input
                  type="date"
                  className="rounded border px-1 py-0.5 text-[11px]"
                />
              </div>
            </div>
          )}
        </div>
        <div className="rounded-md border p-3">
          <div className="mb-1 inline-flex items-center gap-1 text-xs font-medium">
            <Globe2 className="h-3.5 w-3.5" /> FX Snapshot
          </div>
          <div className="text-[11px]">
            As of: {new Date(FX_AS_OF).toLocaleString()}
          </div>
          <ul className="mt-1 grid grid-cols-2 gap-1 text-[11px]">
            {(Object.keys(FX_SNAPSHOT) as Currency[]).map((c) => (
              <li key={c} className="rounded border px-2 py-1">
                1 {c} = {fmt(FX_SNAPSHOT[c], "USD")} USD
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-md border p-3">
          <div className="mb-1 inline-flex items-center gap-1 text-xs font-medium">
            <Coins className="h-3.5 w-3.5" /> Totals
          </div>
          <ul className="grid gap-1 text-[11px]">
            {(Object.keys(totalsByCurrency) as Currency[]).map((c) => (
              <li
                key={c}
                className="flex items-center justify-between rounded border px-2 py-1"
              >
                <span>{c}</span>
                <span className="text-muted-foreground">
                  Gross {fmt(totalsByCurrency[c].gross, c)} • Net{" "}
                  {fmt(totalsByCurrency[c].net, c)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-2 rounded border px-2 py-1 text-[11px]">
            USD equiv • Gross {fmt(totalsUSD.gross, "USD")} • Net{" "}
            {fmt(totalsUSD.net, "USD")}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <div className="flex items-center justify-between border-b px-3 py-2 text-xs">
          <span className="font-medium inline-flex items-center gap-1">
            <ListChecks className="h-3.5 w-3.5" /> Draft run
          </span>
          <span className="text-[10px] text-muted-foreground">
            Edit hours, rates, or override taxes. Contractors have no default
            withholding.
          </span>
        </div>
        <div className="overflow-auto">
          <table className="min-w-[1000px] text-left text-xs">
            <thead className="bg-secondary/60">
              <tr className="border-b">
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Jurisdiction</Th>
                <Th>Curr</Th>
                <Th>Reg H</Th>
                <Th>OT H</Th>
                <Th>Rate</Th>
                <Th>OT Rate</Th>
                <Th>Shift diff</Th>
                <Th>Pre‑tax</Th>
                <Th>Post‑tax</Th>
                <Th>Garnish</Th>
                <Th>Gross</Th>
                <Th>Override tax</Th>
                <Th>Fed</Th>
                <Th>State</Th>
                <Th>Local</Th>
                <Th>Net</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {computed.map((row) => (
                <tr
                  key={row.it.id}
                  className={
                    row.it.hoursOvertime > 0
                      ? "border-b bg-primary/5"
                      : "border-b"
                  }
                >
                  <Td>{row.it.name}</Td>
                  <Td>{row.it.type}</Td>
                  <Td>
                    {[
                      row.it.jurisdiction.country,
                      row.it.jurisdiction.state,
                      row.it.jurisdiction.local,
                    ]
                      .filter(Boolean)
                      .join("/")}
                  </Td>
                  <Td>{row.it.currency}</Td>

                  <Td>
                    <Num
                      value={row.it.hoursRegular}
                      onChange={(v) => update(row.it.id, { hoursRegular: v })}
                      disabled={locked}
                    />
                  </Td>
                  <Td>
                    <Num
                      value={row.it.hoursOvertime}
                      onChange={(v) => update(row.it.id, { hoursOvertime: v })}
                      disabled={locked}
                      highlight={row.it.hoursOvertime > 0}
                    />
                  </Td>
                  <Td>
                    <Num
                      value={row.it.rateRegular}
                      onChange={(v) => update(row.it.id, { rateRegular: v })}
                      disabled={locked}
                    />
                  </Td>
                  <Td>
                    <Num
                      value={row.it.rateOvertime}
                      onChange={(v) => update(row.it.id, { rateOvertime: v })}
                      disabled={locked}
                    />
                  </Td>
                  <Td>
                    <Num
                      value={row.it.shiftDifferential || 0}
                      onChange={(v) =>
                        update(row.it.id, { shiftDifferential: v })
                      }
                      disabled={locked}
                    />
                  </Td>
                  <Td>
                    <Num
                      value={row.it.deductionsPreTax || 0}
                      onChange={(v) =>
                        update(row.it.id, { deductionsPreTax: v })
                      }
                      disabled={locked}
                    />
                  </Td>
                  <Td>
                    <Num
                      value={row.it.deductionsPostTax || 0}
                      onChange={(v) =>
                        update(row.it.id, { deductionsPostTax: v })
                      }
                      disabled={locked}
                    />
                  </Td>
                  <Td>
                    <Num
                      value={row.it.garnishments || 0}
                      onChange={(v) => update(row.it.id, { garnishments: v })}
                      disabled={locked}
                    />
                  </Td>

                  <Td className="font-medium">
                    {fmt(row.gross, row.it.currency)}
                  </Td>

                  <Td>
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        className="scale-90"
                        checked={!!row.it.overrideTax}
                        onChange={(e) =>
                          update(row.it.id, { overrideTax: e.target.checked })
                        }
                      />{" "}
                      override
                    </label>
                  </Td>

                  <Td>
                    {row.it.overrideTax ? (
                      <Num
                        value={row.it.taxOverride?.federal ?? row.tx.federal}
                        onChange={(v) =>
                          update(row.it.id, {
                            taxOverride: { ...row.it.taxOverride, federal: v },
                          })
                        }
                      />
                    ) : (
                      <span className="text-muted-foreground">
                        {fmt(row.tx.federal, row.it.currency)}
                      </span>
                    )}
                  </Td>
                  <Td>
                    {row.it.overrideTax ? (
                      <Num
                        value={row.it.taxOverride?.state ?? row.tx.state}
                        onChange={(v) =>
                          update(row.it.id, {
                            taxOverride: { ...row.it.taxOverride, state: v },
                          })
                        }
                      />
                    ) : (
                      <span className="text-muted-foreground">
                        {fmt(row.tx.state, row.it.currency)}
                      </span>
                    )}
                  </Td>
                  <Td>
                    {row.it.overrideTax ? (
                      <Num
                        value={row.it.taxOverride?.local ?? row.tx.local}
                        onChange={(v) =>
                          update(row.it.id, {
                            taxOverride: { ...row.it.taxOverride, local: v },
                          })
                        }
                      />
                    ) : (
                      <span className="text-muted-foreground">
                        {fmt(row.tx.local, row.it.currency)}
                      </span>
                    )}
                  </Td>

                  <Td className="font-semibold">
                    {fmt(row.net, row.it.currency)}
                  </Td>

                  <Td>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        className="h-6 px-2 text-[10px]"
                        onClick={() =>
                          toast({
                            title: "Approved",
                            description: `${row.it.name} ready for payout.`,
                          })
                        }
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="h-6 px-2 text-[10px]"
                        onClick={() =>
                          toast({
                            title: "Removed",
                            description: `${row.it.name} removed from run.`,
                          })
                        }
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Remove
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t px-3 py-2 text-[11px]">
          <div className="text-muted-foreground">
            Employer costs include workers’ comp and benefits.
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="h-7 px-2 text-xs"
              onClick={() =>
                toast({
                  title: "Submitted",
                  description: "Payroll submitted for approvals.",
                })
              }
            >
              <Play className="mr-1 h-3.5 w-3.5" />
              Submit for Approval
            </Button>
            <Button
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => {
                setLocked(false);
                toast({
                  title: "Unlocked",
                  description: "Run reopened for edits.",
                });
              }}
            >
              <Undo2 className="mr-1 h-3.5 w-3.5" />
              Unlock
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-2 py-2 text-[11px] font-semibold">{children}</th>;
}
function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={"px-2 py-1.5 " + (className || "")}>{children}</td>;
}
function Num({
  value,
  onChange,
  disabled,
  highlight,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <input
      type="number"
      step="0.01"
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value || "0"))}
      className={`w-24 rounded border px-1 py-1 text-[11px] ${highlight ? "bg-primary/10" : ""}`}
    />
  );
}
