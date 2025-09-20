import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BadgeCheck,
  FileText,
  Globe2,
  HandCoins,
  IdCard,
  Plus,
  Save,
  Shield,
  Upload,
  Wallet,
  CalendarClock,
  Download,
  Search,
  Edit3,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Residency = "US" | "EU" | "UK" | "ZA" | "IN" | "BR";
type Rail = "ACH" | "Bank" | "Payoneer" | "Local Partner";
type Currency = "USD" | "EUR" | "GBP" | "ZAR";

interface Contractor {
  id: string;
  name: string;
  email: string;
  residency: Residency;
  currency: Currency;
  rail: Rail;
  schedule: "weekly" | "biweekly" | "monthly" | "ad-hoc";
  active: boolean;
  docs: { contract: boolean; taxForm: boolean; permit: boolean };
}

const seed: Contractor[] = [
  {
    id: crypto.randomUUID(),
    name: "Lena Ortiz",
    email: "lena@example.com",
    residency: "US",
    currency: "USD",
    rail: "ACH",
    schedule: "biweekly",
    active: true,
    docs: { contract: true, taxForm: true, permit: true },
  },
  {
    id: crypto.randomUUID(),
    name: "Daniela Rossi",
    email: "d.rossi@example.eu",
    residency: "EU",
    currency: "EUR",
    rail: "Bank",
    schedule: "monthly",
    active: true,
    docs: { contract: true, taxForm: false, permit: true },
  },
  {
    id: crypto.randomUUID(),
    name: "Tendai Moyo",
    email: "tendai@example.za",
    residency: "ZA",
    currency: "ZAR",
    rail: "Local Partner",
    schedule: "weekly",
    active: true,
    docs: { contract: true, taxForm: true, permit: true },
  },
];

export default function Employees() {
  const [contractors, setContractors] = useState<Contractor[]>(seed);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [editing, setEditing] = useState<Contractor | null>(null);
  const [form, setForm] = useState<Partial<Contractor>>({
    residency: "US",
    currency: "USD",
    rail: "ACH",
    schedule: "biweekly",
  });

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return contractors.filter((c) =>
      [c.name, c.email, c.residency, c.currency, c.rail, c.schedule]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [contractors, q]);

  const visible = useMemo(() => filtered.slice(0, page * pageSize), [filtered, page]);

  function addContractor() {
    if (!form.name || !form.email) {
      toast({ title: "Missing", description: "Name and email are required." });
      return;
    }
    const c: Contractor = {
      id: crypto.randomUUID(),
      name: form.name!,
      email: form.email!,
      residency: (form.residency || "US") as Residency,
      currency: (form.currency || "USD") as Currency,
      rail: (form.rail || "ACH") as Rail,
      schedule: (form.schedule || "biweekly") as Contractor["schedule"],
      active: true,
      docs: { contract: true, taxForm: false, permit: true },
    };
    setContractors((p) => [c, ...p]);
    setPage(1);
    toast({
      title: "Invited",
      description: `Onboarding email sent to ${c.email}.`,
    });
    setForm({
      residency: "US",
      currency: "USD",
      rail: "ACH",
      schedule: "biweekly",
    });
  }

  function update(id: string, patch: Partial<Contractor>) {
    setContractors((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  const readyCount = useMemo(
    () =>
      contractors.filter(
        (c) => c.docs.contract && c.docs.taxForm && c.docs.permit,
      ).length,
    [contractors],
  );

  return (
    <div className="container mx-auto py-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-sm font-semibold">Employees & contractors</h1>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
            Onboard globally with digital contracts, tax forms, and payment
            setup. Ensure local compliance (permits, tax IDs). Pay via multiple
            rails with payout scheduling. Export 1099 and international
            equivalents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() =>
              toast({
                title: "Export queued",
                description: "1099 & international forms generated.",
              })
            }
          >
            <Download className="mr-1 h-3.5 w-3.5" />
            Export 1099/Intl
          </Button>
          <Button
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() =>
              toast({ title: "Imported", description: "CSV parsed and added." })
            }
          >
            <Upload className="mr-1 h-3.5 w-3.5" />
            Import CSV/XLSX
          </Button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <section className="rounded-md border p-3 lg:col-span-2">
          <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium">
            <IdCard className="h-3.5 w-3.5" /> Contractor onboarding
          </header>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded border p-3">
              <div className="text-xs font-medium">Invite contractor</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                <input
                  className="rounded border px-2 py-1"
                  placeholder="Full name"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  className="rounded border px-2 py-1"
                  placeholder="Email"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <select
                  className="rounded border px-2 py-1"
                  value={form.residency}
                  onChange={(e) =>
                    setForm({ ...form, residency: e.target.value as Residency })
                  }
                >
                  {(["US", "EU", "UK", "ZA", "IN", "BR"] as Residency[]).map(
                    (r) => (
                      <option key={r}>{r}</option>
                    ),
                  )}
                </select>
                <select
                  className="rounded border px-2 py-1"
                  value={form.currency}
                  onChange={(e) =>
                    setForm({ ...form, currency: e.target.value as Currency })
                  }
                >
                  {(["USD", "EUR", "GBP", "ZAR"] as Currency[]).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <select
                  className="rounded border px-2 py-1"
                  value={form.rail}
                  onChange={(e) =>
                    setForm({ ...form, rail: e.target.value as Rail })
                  }
                >
                  {(["ACH", "Bank", "Payoneer", "Local Partner"] as Rail[]).map(
                    (r) => (
                      <option key={r}>{r}</option>
                    ),
                  )}
                </select>
                <select
                  className="rounded border px-2 py-1"
                  value={form.schedule}
                  onChange={(e) =>
                    setForm({ ...form, schedule: e.target.value as any })
                  }
                >
                  {(
                    [
                      "weekly",
                      "biweekly",
                      "monthly",
                      "ad-hoc",
                    ] as Contractor["schedule"][]
                  ).map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <Button className="mt-2 h-7 px-2 text-xs" onClick={addContractor}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                Invite
              </Button>
              <p className="mt-2 text-[10px] text-muted-foreground">
                Invite sends digital contract + tax form to e‑sign and collects
                payout details.
              </p>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs font-medium">Compliance checklist</div>
              <ul className="mt-2 space-y-1 text-[11px]">
                <li className="flex items-center gap-1">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />{" "}
                  Digital contract
                </li>
                <li className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-emerald-600" /> Tax
                  forms (W‑9/1099, W‑8BEN, local)
                </li>
                <li className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-emerald-600" /> Permits /
                  IDs stored
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-3 overflow-hidden rounded border">
            <div className="flex items-center justify-between border-b px-3 py-2 text-xs">
              <span className="font-medium inline-flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5" /> Payout scheduling
              </span>
              <div className="flex items-center gap-2">
                <span className="hidden text-[10px] text-muted-foreground md:block">
                  Supports ACH, bank, Payoneer, local partners
                </span>
                <div className="inline-flex items-center gap-2 rounded border bg-white px-2 py-1">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search name, email, rail..."
                    className="w-48 text-[11px] outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-auto">
              <table className="min-w-[900px] text-left text-xs">
                <thead className="bg-secondary/60">
                  <tr className="border-b">
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Residency</Th>
                    <Th>Curr</Th>
                    <Th>Rail</Th>
                    <Th>Schedule</Th>
                    <Th>Docs</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((c) => (
                    <tr key={c.id} className="border-b">
                      <Td>{c.name}</Td>
                      <Td className="text-muted-foreground">{c.email}</Td>
                      <Td>{c.residency}</Td>
                      <Td>{c.currency}</Td>
                      <Td>
                        <select
                          className="rounded border px-2 py-1 text-[11px]"
                          value={c.rail}
                          onChange={(e) =>
                            update(c.id, { rail: e.target.value as Rail })
                          }
                        >
                          {(
                            [
                              "ACH",
                              "Bank",
                              "Payoneer",
                              "Local Partner",
                            ] as Rail[]
                          ).map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </Td>
                      <Td>
                        <select
                          className="rounded border px-2 py-1 text-[11px]"
                          value={c.schedule}
                          onChange={(e) =>
                            update(c.id, { schedule: e.target.value as any })
                          }
                        >
                          {(
                            [
                              "weekly",
                              "biweekly",
                              "monthly",
                              "ad-hoc",
                            ] as Contractor["schedule"][]
                          ).map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </Td>
                      <Td>
                        <span
                          className={
                            c.docs.contract && c.docs.taxForm && c.docs.permit
                              ? "rounded bg-emerald-600/10 px-1.5 py-0.5 text-[10px] text-emerald-700"
                              : "rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-700"
                          }
                        >
                          {c.docs.contract && c.docs.taxForm && c.docs.permit
                            ? "complete"
                            : "pending"}
                        </span>
                      </Td>
                      <Td>
                        <span
                          className={
                            c.active
                              ? "rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary"
                              : "text-[10px] text-muted-foreground"
                          }
                        >
                          {c.active ? "active" : "inactive"}
                        </span>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            className="h-6 px-2 text-[10px]"
                            onClick={() =>
                              toast({
                                title: "Scheduled",
                                description: `${c.name} on ${c.schedule}`,
                              })
                            }
                          >
                            <CalendarClock className="mr-1 h-3 w-3" />
                            Schedule
                          </Button>
                          <Button
                            variant="outline"
                            className="h-6 px-2 text-[10px]"
                            onClick={() => setEditing(c)}
                          >
                            <Edit3 className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button
                            className="h-6 px-2 text-[10px]"
                            onClick={() =>
                              toast({
                                title: "Paid",
                                description: `Payout sent via ${c.rail}`,
                              })
                            }
                          >
                            <HandCoins className="mr-1 h-3 w-3" />
                            Pay now
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
                {readyCount} ready for payout • Showing {visible.length} of {filtered.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="h-7 px-2 text-xs"
                  onClick={() =>
                    toast({
                      title: "Payouts queued",
                      description: "Batch scheduled.",
                    })
                  }
                >
                  Batch schedule
                </Button>
                {visible.length < filtered.length ? (
                  <Button
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Load more
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  className="h-7 px-2 text-xs"
                  onClick={() =>
                    toast({
                      title: "CSV exported",
                      description: "Payout batch exported.",
                    })
                  }
                >
                  Export CSV
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-md border p-3">
          <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium">
            <Globe2 className="h-3.5 w-3.5" /> Documentation
          </header>
          <ul className="space-y-2 text-[11px]">
            <li className="rounded border p-2">
              Store tax IDs, W‑9/W‑8BEN, local equivalents by residency.
            </li>
            <li className="rounded border p-2">
              Keep signed contracts and permits for audits.
            </li>
            <li className="rounded border p-2">
              Data residency controls enforced per region.
            </li>
          </ul>
        </section>
      </div>

      {editing ? (
        <EditContractorModal
          contractor={editing}
          onClose={() => setEditing(null)}
          onSave={(updated) => {
            setContractors((p) => p.map((c) => (c.id === updated.id ? updated : c)));
            setEditing(null);
            toast({ title: "Saved", description: `${updated.name} updated.` });
          }}
        />
      ) : null}
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

function EditContractorModal({
  contractor,
  onClose,
  onSave,
}: {
  contractor: Contractor;
  onClose: () => void;
  onSave: (c: Contractor) => void;
}) {
  const [form, setForm] = useState<Contractor>({ ...contractor });
  return (
    <div role="dialog" aria-modal className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3">
      <div className="w-full max-w-2xl rounded-md border bg-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-medium">Edit contractor</div>
          <button className="text-xs text-muted-foreground hover:underline inline-flex items-center gap-1" onClick={onClose}>
            <X className="h-3.5 w-3.5" /> Close
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded border p-3">
            <div className="grid gap-2 text-[11px]">
              <label className="grid gap-1">
                <span className="text-[10px] text-muted-foreground">Name</span>
                <input className="rounded border px-2 py-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] text-muted-foreground">Email</span>
                <input className="rounded border px-2 py-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] text-muted-foreground">Residency</span>
                <select className="rounded border px-2 py-1" value={form.residency} onChange={(e) => setForm({ ...form, residency: e.target.value as Residency })}>
                  {["US", "EU", "UK", "ZA", "IN", "BR"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] text-muted-foreground">Currency</span>
                <select className="rounded border px-2 py-1" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}>
                  {["USD", "EUR", "GBP", "ZAR"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] text-muted-foreground">Payout rail</span>
                <select className="rounded border px-2 py-1" value={form.rail} onChange={(e) => setForm({ ...form, rail: e.target.value as Rail })}>
                  {["ACH", "Bank", "Payoneer", "Local Partner"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] text-muted-foreground">Schedule</span>
                <select className="rounded border px-2 py-1" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value as any })}>
                  {["weekly", "biweekly", "monthly", "ad-hoc"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="rounded border p-3">
            <div className="text-xs font-medium">Status & docs</div>
            <div className="mt-2 grid gap-2 text-[11px]">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="scale-90" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="scale-90" checked={form.docs.contract} onChange={(e) => setForm({ ...form, docs: { ...form.docs, contract: e.target.checked } })} /> Contract
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="scale-90" checked={form.docs.taxForm} onChange={(e) => setForm({ ...form, docs: { ...form.docs, taxForm: e.target.checked } })} /> Tax form
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="scale-90" checked={form.docs.permit} onChange={(e) => setForm({ ...form, docs: { ...form.docs, permit: e.target.checked } })} /> Permit/ID
              </label>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button variant="outline" className="h-7 px-2 text-xs" onClick={onClose}>Cancel</Button>
          <Button className="h-7 px-2 text-xs" onClick={() => onSave(form)}>Save changes</Button>
        </div>
      </div>
    </div>
  );
}
