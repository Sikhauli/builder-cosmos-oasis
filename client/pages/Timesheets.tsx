import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, PlayCircle, Square, Clock3, Edit3, Save } from "lucide-react";

interface Row {
  id: string;
  employee: string;
  date: string; // ISO date
  hours: number;
  type: "regular" | "overtime" | "pto";
}

const initialRows: Row[] = [
  { id: "1", employee: "A. Rivera", date: new Date().toISOString().slice(0, 10), hours: 8, type: "regular" },
  { id: "2", employee: "B. Chen", date: new Date().toISOString().slice(0, 10), hours: 9.5, type: "overtime" },
  { id: "3", employee: "C. Patel", date: new Date().toISOString().slice(0, 10), hours: 7.5, type: "regular" },
];

export default function Timesheets() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [editing, setEditing] = useState<{ id: string; field: keyof Row } | null>(null);
  const [clockedIn, setClockedIn] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const overtimeAlerts = useMemo(() =>
    rows.filter((r) => r.hours > 8 || r.type === "overtime").length,
  [rows]);

  const totalHours = useMemo(() => rows.reduce((a, r) => a + r.hours, 0), [rows]);

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function handleClockToggle() {
    if (clockedIn) {
      // clock out
      if (startedAt) {
        const deltaHours = (Date.now() - startedAt) / (1000 * 60 * 60);
        const today = new Date().toISOString().slice(0, 10);
        const me = rows.find((r) => r.employee === "You" && r.date === today);
        if (me) updateRow(me.id, { hours: Math.round((me.hours + deltaHours) * 100) / 100 });
        else setRows((prev) => [{ id: crypto.randomUUID(), employee: "You", date: today, hours: Math.round(deltaHours * 100) / 100, type: "regular" }, ...prev]);
      }
      setClockedIn(false);
      setStartedAt(null);
    } else {
      // clock in
      setClockedIn(true);
      setStartedAt(Date.now());
    }
  }

  return (
    <div className="container mx-auto py-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-sm font-semibold">Timesheets</h1>
          <p className="mt-1 text-xs text-muted-foreground">CSV/API import, inline edits, overtime detection, live clock-in/out.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-7 px-2 text-xs">
            <Upload className="mr-1 h-3.5 w-3.5" /> Import CSV/XLSX
          </Button>
          <Button variant="default" className="h-7 px-2 text-xs" onClick={handleClockToggle}>
            {clockedIn ? (
              <>
                <Square className="mr-1 h-3.5 w-3.5" /> Clock out
              </>
            ) : (
              <>
                <PlayCircle className="mr-1 h-3.5 w-3.5" /> Clock in
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2 overflow-hidden rounded-md border bg-card">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-xs font-medium">Inline Timesheet</span>
            <span className="text-[10px] text-muted-foreground">Total hours: {totalHours.toFixed(2)}</span>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-secondary/60">
                <tr className="border-b">
                  <th className="px-3 py-2 font-semibold">Employee</th>
                  <th className="px-3 py-2 font-semibold">Date</th>
                  <th className="px-3 py-2 font-semibold">Hours</th>
                  <th className="px-3 py-2 font-semibold">Type</th>
                  <th className="px-3 py-2 font-semibold">Overtime</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const isOt = r.hours > 8 || r.type === "overtime";
                  return (
                    <tr key={r.id} className={cnRow(isOt)}>
                      <td className="px-3 py-1.5">
                        {editing?.id === r.id && editing.field === "employee" ? (
                          <InlineInput value={r.employee} onSave={(v) => { updateRow(r.id, { employee: v }); setEditing(null); }} />
                        ) : (
                          <button className="inline-flex items-center gap-1 hover:underline" onClick={() => setEditing({ id: r.id, field: "employee" })}>
                            <Edit3 className="h-3 w-3 text-muted-foreground" /> {r.employee}
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-1.5">
                        {editing?.id === r.id && editing.field === "date" ? (
                          <input className="rounded border px-2 py-1 text-xs" type="date" value={r.date} onChange={(e) => updateRow(r.id, { date: e.target.value })} onBlur={() => setEditing(null)} />
                        ) : (
                          <button className="hover:underline" onClick={() => setEditing({ id: r.id, field: "date" })}>{r.date}</button>
                        )}
                      </td>
                      <td className="px-3 py-1.5">
                        {editing?.id === r.id && editing.field === "hours" ? (
                          <input className="w-20 rounded border px-2 py-1 text-xs" type="number" step="0.25" value={r.hours} onChange={(e) => updateRow(r.id, { hours: Number(e.target.value) })} onBlur={() => setEditing(null)} />
                        ) : (
                          <button className="hover:underline" onClick={() => setEditing({ id: r.id, field: "hours" })}>{r.hours.toFixed(2)}</button>
                        )}
                      </td>
                      <td className="px-3 py-1.5">
                        {editing?.id === r.id && editing.field === "type" ? (
                          <select className="rounded border px-2 py-1 text-xs" value={r.type} onChange={(e) => updateRow(r.id, { type: e.target.value as Row["type"] })} onBlur={() => setEditing(null)}>
                            <option value="regular">regular</option>
                            <option value="overtime">overtime</option>
                            <option value="pto">pto</option>
                          </select>
                        ) : (
                          <button className="hover:underline" onClick={() => setEditing({ id: r.id, field: "type" })}>{r.type}</button>
                        )}
                      </td>
                      <td className="px-3 py-1.5">
                        <span className={isOt ? "rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary" : "text-[10px] text-muted-foreground"}>
                          {isOt ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="grid gap-3">
          <div className="rounded-md border p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-xs font-medium"><Clock3 className="h-3.5 w-3.5" /> Live Clock</span>
              <span className="text-[10px] text-muted-foreground">Status: {clockedIn ? "Clocked in" : "Idle"}</span>
            </div>
            <Button className="h-7 px-2 text-xs w-full" onClick={handleClockToggle}>
              {clockedIn ? "Clock out" : "Clock in"}
            </Button>
            <p className="mt-2 text-[10px] text-muted-foreground">Times accumulate in real time and trigger overtime detection after 8h/day.</p>
          </div>

          <div className="rounded-md border p-3">
            <div className="mb-1 text-xs font-medium">Overtime alerts</div>
            <div className="text-2xl font-semibold leading-none">{overtimeAlerts}</div>
            <p className="mt-1 text-[10px] text-muted-foreground">Rows above 8h/day or marked overtime are counted.</p>
          </div>

          <div className="rounded-md border p-3">
            <div className="mb-2 text-xs font-medium">API Import</div>
            <p className="text-[10px] text-muted-foreground">Connect HRIS or time systems to sync via API/webhooks. Supports CSV & XLSX.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function cnRow(isOt: boolean) {
  return isOt ? "border-b bg-primary/5" : "border-b";
}

function InlineInput({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [val, setVal] = useState(value);
  return (
    <span className="inline-flex items-center gap-1">
      <input className="w-40 rounded border px-2 py-1 text-xs" value={val} onChange={(e) => setVal(e.target.value)} />
      <button className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-[10px] font-medium" onClick={() => onSave(val)}>
        <Save className="h-3 w-3" /> Save
      </button>
    </span>
  );
}
