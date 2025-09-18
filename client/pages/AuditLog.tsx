import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";

interface Entry {
  id: string;
  user: string;
  action: string;
  at: string;
}
const seed: Entry[] = [
  {
    id: crypto.randomUUID(),
    user: "alice@corp.com",
    action: "payroll.submit",
    at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    user: "ben@corp.com",
    action: "employee.update",
    at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    user: "auditor@corp.com",
    action: "report.export",
    at: new Date().toISOString(),
  },
];

export default function AuditLog() {
  const [qUser, setQUser] = useState("");
  const [qAction, setQAction] = useState("");
  const [rows] = useState<Entry[]>(seed);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!qUser || r.user.includes(qUser)) &&
          (!qAction || r.action.includes(qAction)),
      ),
    [rows, qUser, qAction],
  );

  return (
    <div className="container mx-auto py-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-sm font-semibold">Audit log</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Filter by user, action, or date and export results.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() =>
            navigator.clipboard.writeText(JSON.stringify(filtered))
          }
        >
          <Download className="mr-1 h-3.5 w-3.5" />
          Export JSON
        </Button>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="inline-flex items-center gap-1">
          <Filter className="h-3.5 w-3.5" /> Filters
        </span>
        <input
          className="rounded border px-2 py-1"
          placeholder="User"
          value={qUser}
          onChange={(e) => setQUser(e.target.value)}
        />
        <input
          className="rounded border px-2 py-1"
          placeholder="Action"
          value={qAction}
          onChange={(e) => setQAction(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded border">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-secondary/60">
            <tr className="border-b">
              <Th>User</Th>
              <Th>Action</Th>
              <Th>At</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-b">
                <Td>{e.user}</Td>
                <Td>{e.action}</Td>
                <Td>{new Date(e.at).toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </table>
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
