import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  ListChecks,
  Plus,
  Search,
  Settings2,
  Shield,
  SquarePen,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Plain JS React component (no TypeScript types) implementing pay run management
// - Create multiple pay runs for different cohorts (permanent, contractors, learners)
// - Assign payday date and include any number of people
// - Group runs by date with review-before-finalize flow

const seedPeople = [
  { id: "e1", name: "Alice Rivera", role: "Employee", dept: "Engineering" },
  { id: "e2", name: "Ben Chen", role: "Employee", dept: "Finance" },
  { id: "e3", name: "Chandni Patel", role: "Contractor", dept: "Design" },
  { id: "e4", name: "Diego Ramos", role: "Learner", dept: "Academy" },
  { id: "e5", name: "Eva Müller", role: "Employee", dept: "People" },
  { id: "e6", name: "Fatima Khan", role: "Learner", dept: "Academy" },
];

const seedRuns = [
  {
    id: crypto.randomUUID(),
    name: "Biweekly Staff",
    cohort: "Permanent",
    payday: new Date().toISOString().slice(0, 10),
    status: "Draft",
    sandbox: true,
    people: ["e1", "e2", "e5"],
  },
  {
    id: crypto.randomUUID(),
    name: "Contractors",
    cohort: "Contractors",
    payday: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    status: "Pending Approval",
    sandbox: true,
    people: ["e3"],
  },
];

export default function PayRuns() {
  const [people] = useState(seedPeople);
  const [runs, setRuns] = useState(seedRuns);
  const [expandedDates, setExpandedDates] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [reviewRun, setReviewRun] = useState(null);

  const grouped = useMemo(() => {
    const by = {};
    for (const r of runs) {
      if (!by[r.payday]) by[r.payday] = [];
      by[r.payday].push(r);
    }
    // sort runs by payday desc
    return Object.entries(by)
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, items]) => ({
        date,
        items: items.sort((x, y) => x.name.localeCompare(y.name)),
      }));
  }, [runs]);

  function removeRun(id) {
    setRuns((p) => p.filter((r) => r.id !== id));
    toast({ title: "Deleted", description: "Pay run removed." });
  }

  function setStatus(id, status) {
    setRuns((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
    toast({ title: status, description: `Run set to ${status}.` });
  }

  return (
    <div className="container mx-auto py-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-sm font-semibold">Pay runs</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Create and manage paydays. Include employees and learners, review
            details, and finalize. Grouped by date.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="h-7 px-2 text-xs" onClick={() => setShowNew(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Create run
          </Button>
          <Button variant="outline" className="h-7 px-2 text-xs" asChild>
            <Link to="/payroll">
              <ListChecks className="mr-1 h-3.5 w-3.5" />
              Open Payroll
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="flex items-center justify-between border-b px-3 py-2 text-xs">
          <div className="inline-flex items-center gap-1 font-medium">
            <Calendar className="h-3.5 w-3.5" /> Runs by payday
          </div>
          <div className="text-[10px] text-muted-foreground">
            Draft → Pending Approval → Processed
          </div>
        </div>
        <div className="divide-y">
          {grouped.map((g) => (
            <section key={g.date}>
              <button
                className="flex w-full items-center justify-between bg-secondary/50 px-3 py-2 text-left text-xs font-medium"
                onClick={() =>
                  setExpandedDates((s) => ({ ...s, [g.date]: !s[g.date] }))
                }
                aria-expanded={!!expandedDates[g.date]}
              >
                <span>
                  {new Date(g.date + "T00:00:00").toLocaleDateString()}
                </span>
                {expandedDates[g.date] ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
              <div className={expandedDates[g.date] ? "block" : "hidden"}>
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-secondary/60">
                    <tr className="border-b">
                      <Th>Name</Th>
                      <Th>Cohort</Th>
                      <Th>People</Th>
                      <Th>Status</Th>
                      <Th>Sandbox</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.items.map((r) => (
                      <tr key={r.id} className="border-b">
                        <Td>{r.name}</Td>
                        <Td>{r.cohort}</Td>
                        <Td>{r.people.length}</Td>
                        <Td>
                          <span
                            className={
                              r.status === "Processed"
                                ? "rounded bg-emerald-600/10 px-1.5 py-0.5 text-[10px] text-emerald-700"
                                : r.status === "Pending Approval"
                                  ? "rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-700"
                                  : "rounded bg-muted px-1.5 py-0.5 text-[10px]"
                            }
                          >
                            {r.status}
                          </span>
                        </Td>
                        <Td>
                          <label className="inline-flex items-center gap-1 text-[11px]">
                            <input
                              type="checkbox"
                              className="scale-90"
                              checked={!!r.sandbox}
                              onChange={(e) =>
                                setRuns((p) =>
                                  p.map((x) =>
                                    x.id === r.id
                                      ? { ...x, sandbox: e.target.checked }
                                      : x,
                                  ),
                                )
                              }
                            />{" "}
                            sandbox
                          </label>
                        </Td>
                        <Td>
                          <div className="flex items-center gap-1">
                            <Button
                              className="h-6 px-2 text-[10px]"
                              onClick={() => setReviewRun(r)}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              Review
                            </Button>
                            {r.status !== "Pending Approval" && (
                              <Button
                                variant="outline"
                                className="h-6 px-2 text-[10px]"
                                onClick={() =>
                                  setStatus(r.id, "Pending Approval")
                                }
                              >
                                <Shield className="mr-1 h-3 w-3" />
                                Send for approval
                              </Button>
                            )}
                            {r.status !== "Processed" && (
                              <Button
                                className="h-6 px-2 text-[10px]"
                                onClick={() => setStatus(r.id, "Processed")}
                              >
                                <CircleCheck className="mr-1 h-3 w-3" />
                                Finalize
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              className="h-6 px-2 text-[10px]"
                              onClick={() => removeRun(r.id)}
                            >
                              <Trash2 className="mr-1 h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </div>

      {showNew ? (
        <NewRunModal
          people={people}
          runs={runs}
          onClose={() => setShowNew(false)}
          onCreate={(run) => {
            setRuns((p) => [run, ...p]);
            setShowNew(false);
            toast({
              title: "Run created",
              description: `${run.name} on ${run.payday}`,
            });
          }}
        />
      ) : null}

      {reviewRun ? (
        <ReviewDrawer
          run={reviewRun}
          people={people}
          onClose={() => setReviewRun(null)}
          onUpdate={(updated) =>
            setRuns((p) => p.map((r) => (r.id === updated.id ? updated : r)))
          }
        />
      ) : null}
    </div>
  );
}

function Th({ children }) {
  return <th className="px-2 py-2 text-[11px] font-semibold">{children}</th>;
}
function Td({ children, className }) {
  return <td className={"px-2 py-1.5 " + (className || "")}>{children}</td>;
}

function NewRunModal({ people, runs, onClose, onCreate }) {
  const [name, setName] = useState("New run");
  const [cohort, setCohort] = useState("Permanent");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState({});

  const takenMap = useMemo(() => {
    const byId = {};
    for (const r of runs) {
      if (r.payday !== date) continue;
      for (const id of r.people) {
        if (!byId[id]) byId[id] = r.name;
      }
    }
    return byId;
  }, [runs, date]);

  const filtered = useMemo(
    () =>
      people.filter((p) =>
        [p.name, p.role, p.dept]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase()),
      ),
    [people, q],
  );
  const count = Object.values(selected).filter(Boolean).length;

  function toggleAll(on) {
    const obj = {};
    for (const p of filtered) if (!takenMap[p.id]) obj[p.id] = on;
    setSelected((s) => ({ ...s, ...obj }));
  }

  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3"
    >
      <div className="w-full max-w-3xl rounded-md border bg-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-medium">Create pay run</div>
          <button
            className="text-xs text-muted-foreground hover:underline"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded border p-3 md:col-span-1">
            <div className="text-[11px]">Run name</div>
            <input
              className="mt-1 w-full rounded border px-2 py-1 text-[11px]"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="mt-2 text-[11px]">Cohort</div>
            <select
              className="mt-1 w-full rounded border px-2 py-1 text-[11px]"
              value={cohort}
              onChange={(e) => setCohort(e.target.value)}
            >
              <option>Permanent</option>
              <option>Contractors</option>
              <option>Learners</option>
              <option>Mixed</option>
            </select>
            <div className="mt-2 text-[11px]">Payday</div>
            <input
              type="date"
              className="mt-1 w-full rounded border px-2 py-1 text-[11px]"
              value={date}
              onChange={(e) => {
                const d = e.target.value;
                setDate(d);
                const nextTaken = (() => {
                  const byId = {};
                  for (const r of runs) {
                    if (r.payday !== d) continue;
                    for (const id of r.people) if (!byId[id]) byId[id] = r.name;
                  }
                  return byId;
                })();
                setSelected((s) => {
                  const copy = { ...s };
                  for (const id of Object.keys(copy)) if (nextTaken[id]) delete copy[id];
                  return copy;
                });
              }}
            />
            <p className="mt-2 text-[10px] text-muted-foreground">
              Taxes estimated — final at filing.
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              People already assigned on this payday are disabled.
            </p>
          </div>
          <div className="rounded border p-3 md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <div className="inline-flex items-center gap-1 text-xs font-medium">
                <Users className="h-3.5 w-3.5" /> Select people
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-[10px] text-muted-foreground md:block">
                  {count} selected
                </span>
                <button
                  className="rounded border px-2 py-1 text-[10px]"
                  onClick={() => toggleAll(true)}
                >
                  Select all
                </button>
                <button
                  className="rounded border px-2 py-1 text-[10px]"
                  onClick={() => toggleAll(false)}
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                className="w-full rounded border px-2 py-1 text-[11px]"
                placeholder="Search name, role, dept"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="h-60 overflow-auto rounded border">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-secondary/60">
                  <tr className="border-b">
                    <Th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const takenBy = takenMap[p.id];
                    const disabled = !!takenBy;
                    return (
                      <tr key={p.id} className="border-b">
                        <Td>
                          <label className="inline-flex flex-wrap items-center gap-2">
                            <input
                              type="checkbox"
                              className="scale-90"
                              disabled={disabled}
                              checked={disabled ? false : !!selected[p.id]}
                              onChange={(e) =>
                                !disabled &&
                                setSelected((s) => ({
                                  ...s,
                                  [p.id]: e.target.checked,
                                }))
                              }
                            />
                            <span className="font-medium">{p.name}</span>
                            <span className="text-muted-foreground">
                              • {p.role} • {p.dept}
                            </span>
                            {disabled ? (
                              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-700">
                                already in {takenBy}
                              </span>
                            ) : null}
                          </label>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-[10px] text-muted-foreground">
            Sandbox mode enabled by default. You can change later.
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="h-7 px-2 text-xs"
              onClick={() => {
                const ids = Object.entries(selected)
                  .filter(([, v]) => v)
                  .map(([k]) => k);
                if (ids.length === 0) {
                  toast({
                    title: "Select people",
                    description: "Choose at least one employee/learner.",
                  });
                  return;
                }
                onCreate({
                  id: crypto.randomUUID(),
                  name,
                  cohort,
                  payday: date,
                  status: "Draft",
                  sandbox: true,
                  people: ids,
                });
              }}
            >
              <ListChecks className="mr-1 h-3.5 w-3.5" />
              Create run
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewDrawer({ run, people, onClose, onUpdate }) {
  const roster = people.filter((p) => run.people.includes(p.id));
  const [notes, setNotes] = useState("");

  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-50 grid place-items-end bg-black/40"
    >
      <div className="h-full w-full max-w-2xl overflow-auto border-l bg-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-medium">
            Review run • {run.name} •{" "}
            {new Date(run.payday + "T00:00:00").toLocaleDateString()}
          </div>
          <button
            className="text-xs text-muted-foreground hover:underline"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <section className="rounded border p-3">
            <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium">
              <Users className="h-3.5 w-3.5" /> Included people
            </header>
            <ul className="space-y-1 text-[11px]">
              {roster.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded border px-2 py-1"
                >
                  <span>{p.name}</span>
                  <span className="text-muted-foreground">
                    {p.role} • {p.dept}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Inline edits available on payroll page.
            </p>
          </section>
          <section className="rounded border p-3">
            <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium">
              <FileText className="h-3.5 w-3.5" /> Summary
            </header>
            <ul className="space-y-1 text-[11px]">
              <li className="flex items-center justify-between rounded border px-2 py-1">
                <span>People</span>
                <span>{roster.length}</span>
              </li>
              <li className="flex items-center justify-between rounded border px-2 py-1">
                <span>Status</span>
                <span>{run.status}</span>
              </li>
              <li className="flex items-center justify-between rounded border px-2 py-1">
                <span>Sandbox</span>
                <span>{run.sandbox ? "on" : "off"}</span>
              </li>
            </ul>
            <textarea
              className="mt-2 h-20 w-full rounded border p-2 text-[11px]"
              placeholder="Add approval notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </section>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-[10px] text-muted-foreground">
            Stage changes are recorded in audit log.
          </div>
          <div className="flex items-center gap-2">
            {run.status !== "Pending Approval" && (
              <Button
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  onUpdate({ ...run, status: "Pending Approval" });
                  toast({ title: "Sent for approval" });
                }}
              >
                <Shield className="mr-1 h-3.5 w-3.5" />
                Send for approval
              </Button>
            )}
            {run.status !== "Processed" && (
              <Button
                className="h-7 px-2 text-xs"
                onClick={() => {
                  onUpdate({ ...run, status: "Processed" });
                  toast({
                    title: "Run processed",
                    description: "GL preview available.",
                  });
                }}
              >
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                Process
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
