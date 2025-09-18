import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  CheckCircle2,
  Download,
  FileArchive,
  FileText,
  Mail,
  RefreshCw,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type FormCode = "941" | "940" | "W-2" | "1099" | "Local";
interface Filing {
  id: string;
  code: FormCode;
  period: string;
  due: string;
  status: "queued" | "filed" | "failed";
  error?: string;
}
interface Doc {
  id: string;
  name: string;
  type: "receipt" | "approval" | "evidence";
  created: string;
}

const seedFilings: Filing[] = [
  {
    id: crypto.randomUUID(),
    code: "941",
    period: "Q3 2025",
    due: "2025-10-31",
    status: "queued",
  },
  {
    id: crypto.randomUUID(),
    code: "940",
    period: "2025",
    due: "2026-01-31",
    status: "queued",
  },
  {
    id: crypto.randomUUID(),
    code: "W-2",
    period: "2025",
    due: "2026-01-31",
    status: "queued",
  },
  {
    id: crypto.randomUUID(),
    code: "1099",
    period: "2025",
    due: "2026-01-31",
    status: "queued",
  },
];

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function Compliance() {
  const [filings, setFilings] = useState<Filing[]>(seedFilings);
  const [docs, setDocs] = useState<Doc[]>([
    {
      id: crypto.randomUUID(),
      name: "Q2 payroll approval.pdf",
      type: "approval",
      created: new Date().toISOString(),
    },
  ]);

  function queue(code: FormCode) {
    const item: Filing = {
      id: crypto.randomUUID(),
      code,
      period: code === "941" ? "Q4 2025" : "2025",
      due: code === "941" ? "2026-01-31" : "2026-01-31",
      status: "queued",
    };
    setFilings((p) => [item, ...p]);
    toast({
      title: `${code} generated`,
      description: "Queued for filing/export.",
    });
  }

  function updateStatus(id: string, status: Filing["status"]) {
    setFilings((p) =>
      p.map((f) =>
        f.id === id
          ? {
              ...f,
              status,
              error:
                status === "failed"
                  ? "Validation error: EIN mismatch"
                  : undefined,
            }
          : f,
      ),
    );
  }

  function addDoc(type: Doc["type"]) {
    const d: Doc = {
      id: crypto.randomUUID(),
      name: `${type}-${new Date().toISOString().slice(0, 10)}.pdf`,
      type,
      created: new Date().toISOString(),
    };
    setDocs((p) => [d, ...p]);
    toast({
      title: "Stored",
      description: `${type} added to audit documents.`,
    });
  }

  const calendar = useMemo(() => {
    const nowYear = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => ({
      month: months[i],
      due: filings.filter((f) => new Date(f.due).getMonth() === i).length,
    }));
  }, [filings]);

  return (
    <div className="container mx-auto py-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-sm font-semibold">
            Compliance & tax intelligence
          </h1>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
            Generate forms (941, 940, W‑2, 1099, local) for one‑click
            filing/export. See calendar deadlines with reminders. Statuses
            update automatically. Store audit‑ready documents securely.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() =>
              toast({
                title: "Reminders scheduled",
                description:
                  "Email notifications will be sent before deadlines.",
              })
            }
          >
            <Mail className="mr-1 h-3.5 w-3.5" />
            Enable reminders
          </Button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <section className="rounded-md border p-3 lg:col-span-2">
          <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium">
            <FileText className="h-3.5 w-3.5" /> Forms & filings
          </header>
          <div className="mb-2 flex flex-wrap gap-2 text-[11px]">
            {(["941", "940", "W-2", "1099", "Local"] as FormCode[]).map((c) => (
              <Button
                key={c}
                className="h-7 px-2 text-xs"
                onClick={() => queue(c)}
              >
                {c} • Generate
              </Button>
            ))}
            <Button
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() =>
                toast({
                  title: "Exported",
                  description: "Zip with forms created.",
                })
              }
            >
              <FileArchive className="mr-1 h-3.5 w-3.5" />
              Export all
            </Button>
          </div>
          <div className="overflow-hidden rounded border">
            <table className="min-w-[900px] text-left text-xs">
              <thead className="bg-secondary/60">
                <tr className="border-b">
                  <Th>Form</Th>
                  <Th>Period</Th>
                  <Th>Due</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filings.map((f) => (
                  <tr key={f.id} className="border-b">
                    <Td>{f.code}</Td>
                    <Td>{f.period}</Td>
                    <Td>{new Date(f.due).toLocaleDateString()}</Td>
                    <Td>
                      <span
                        className={
                          f.status === "filed"
                            ? "rounded bg-emerald-600/10 px-1.5 py-0.5 text-[10px] text-emerald-700"
                            : f.status === "failed"
                              ? "rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive"
                              : "rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-700"
                        }
                      >
                        {f.status}
                      </span>
                      {f.error ? (
                        <div className="text-[10px] text-destructive">
                          {f.error}
                        </div>
                      ) : null}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          className="h-6 px-2 text-[10px]"
                          onClick={() => updateStatus(f.id, "filed")}
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Mark filed
                        </Button>
                        <Button
                          variant="outline"
                          className="h-6 px-2 text-[10px]"
                          onClick={() => updateStatus(f.id, "failed")}
                        >
                          <TriangleAlert className="mr-1 h-3 w-3" />
                          Fail
                        </Button>
                        <Button
                          className="h-6 px-2 text-[10px]"
                          onClick={() =>
                            toast({
                              title: "Queued",
                              description: "Submission queued.",
                            })
                          }
                        >
                          <RefreshCw className="mr-1 h-3 w-3" />
                          Submit
                        </Button>
                        <Button
                          variant="outline"
                          className="h-6 px-2 text-[10px]"
                          onClick={() =>
                            toast({
                              title: "Exported",
                              description: `${f.code} exported.`,
                            })
                          }
                        >
                          <Download className="mr-1 h-3 w-3" />
                          Export
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-md border p-3">
          <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium">
            <CalendarDays className="h-3.5 w-3.5" /> Filing calendar
          </header>
          <ul className="grid grid-cols-3 gap-2 text-[11px]">
            {calendar.map((c) => (
              <li
                key={c.month}
                className="rounded border p-2 flex items-center justify-between"
              >
                <span>{c.month}</span>
                <span className="text-muted-foreground">{c.due} due</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Deadlines highlighted by month; reminders sent automatically when
            enabled.
          </p>
        </section>
      </div>

      <div className="mt-4 rounded-md border">
        <div className="flex items-center justify-between border-b px-3 py-2 text-xs">
          <span className="inline-flex items-center gap-1 font-medium">
            <FileArchive className="h-3.5 w-3.5" /> Audit documents
          </span>
          <span className="text-[10px] text-muted-foreground">
            Receipts, approvals, evidence
          </span>
        </div>
        <div className="grid gap-2 p-3 md:grid-cols-3">
          <div className="rounded border p-2 text-[11px]">
            <div className="mb-1">Quick actions</div>
            <div className="flex flex-wrap gap-2">
              <Button
                className="h-7 px-2 text-xs"
                onClick={() => addDoc("receipt")}
              >
                Store receipt
              </Button>
              <Button
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => addDoc("approval")}
              >
                Attach approval
              </Button>
              <Button
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => addDoc("evidence")}
              >
                Add evidence
              </Button>
            </div>
          </div>
          <div className="md:col-span-2 rounded border p-2">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-secondary/60">
                <tr className="border-b">
                  <Th>Name</Th>
                  <Th>Type</Th>
                  <Th>Created</Th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-b">
                    <Td>{d.name}</Td>
                    <Td>{d.type}</Td>
                    <Td>{new Date(d.created).toLocaleString()}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
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
