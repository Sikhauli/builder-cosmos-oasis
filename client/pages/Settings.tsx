import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Eye, EyeOff, Globe, KeyRound, LogOut, ShieldCheck, UserCog } from "lucide-react";
import { toast } from "@/hooks/use-toast";

 type Role = { id: string; name: string; mfa: boolean; permissions: string[] };
 type Session = { id: string; user: string; ip: string; created: string };

 const seedRoles: Role[] = [
  { id: crypto.randomUUID(), name: "Admin", mfa: true, permissions: ["* "] },
  { id: crypto.randomUUID(), name: "HR", mfa: true, permissions: ["employees.read","employees.write","payroll.read"] },
  { id: crypto.randomUUID(), name: "Finance", mfa: true, permissions: ["payroll.read","payroll.submit","gl.export"] },
  { id: crypto.randomUUID(), name: "Auditor", mfa: false, permissions: ["audit.read","reports.read"] },
  { id: crypto.randomUUID(), name: "Employee", mfa: false, permissions: ["self.read"] },
 ];

 const seedSessions: Session[] = [
  { id: crypto.randomUUID(), user: "alice@corp.com", ip: "10.2.3.4", created: new Date().toISOString() },
  { id: crypto.randomUUID(), user: "ben@corp.com", ip: "10.2.3.5", created: new Date().toISOString() },
 ];

 export default function SettingsPage() {
  const [roles, setRoles] = useState<Role[]>(seedRoles);
  const [newRole, setNewRole] = useState("Custom role");
  const [region, setRegion] = useState("us-east");
  const [sessions, setSessions] = useState<Session[]>(seedSessions);
  const [showSensitive, setShowSensitive] = useState(false);

  function addRole() {
    setRoles((p) => [{ id: crypto.randomUUID(), name: newRole || "Custom", mfa: false, permissions: [] }, ...p]);
    toast({ title: "Role created", description: newRole });
    setNewRole("Custom role");
  }

  function toggleMfa(id: string) {
    setRoles((p) => p.map((r) => (r.id === id ? { ...r, mfa: !r.mfa } : r)));
  }

  function invalidate(id: string) {
    setSessions((p) => p.filter((s) => s.id !== id));
    toast({ title: "Session invalidated" });
  }

  return (
    <div className="container mx-auto py-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-sm font-semibold">Security, privacy & access control</h1>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">RBAC with predefined and custom roles, MFA per role, sessions, masking, residency controls, and exportable audit log.</p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <section className="rounded-md border p-3 lg:col-span-2">
          <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium"><UserCog className="h-3.5 w-3.5"/> Roles & permissions</header>
          <div className="mb-2 flex items-center gap-2 text-[11px]">
            <input className="rounded border px-2 py-1" value={newRole} onChange={(e) => setNewRole(e.target.value)} />
            <Button className="h-7 px-2 text-xs" onClick={addRole}>Add role</Button>
          </div>
          <div className="overflow-hidden rounded border">
            <table className="min-w-[800px] text-left text-xs">
              <thead className="bg-secondary/60"><tr className="border-b"><Th>Role</Th><Th>MFA</Th><Th>Permissions</Th></tr></thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.id} className="border-b">
                    <Td>{r.name}</Td>
                    <Td>
                      <label className="inline-flex items-center gap-1 text-[11px]"><input type="checkbox" className="scale-90" checked={r.mfa} onChange={() => toggleMfa(r.id)} /> enforce</label>
                    </Td>
                    <Td className="text-muted-foreground">{r.permissions.join(", ") || "no permissions set"}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-md border p-3">
          <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium"><Globe className="h-3.5 w-3.5"/> Data residency</header>
          <select className="w-full rounded border px-2 py-1 text-[11px]" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="us-east">US East</option>
            <option value="us-west">US West</option>
            <option value="eu-central">EU Central</option>
            <option value="ap-south">AP South</option>
          </select>
          <p className="mt-2 text-[10px] text-muted-foreground">Storage region used for documents and backups.</p>
        </section>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <section className="rounded-md border p-3">
          <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium"><ShieldCheck className="h-3.5 w-3.5"/> Masking</header>
          <div className="text-[11px]">SSN: {showSensitive ? "123-45-6789" : "***-**-****"}</div>
          <div className="text-[11px]">Bank: {showSensitive ? "1234 5678 9012" : "**** **** 9012"}</div>
          <Button variant="outline" className="mt-2 h-7 px-2 text-xs" onClick={() => setShowSensitive((s) => !s)}>{showSensitive ? <EyeOff className="mr-1 h-3.5 w-3.5"/> : <Eye className="mr-1 h-3.5 w-3.5"/>} Reveal</Button>
          <p className="mt-2 text-[10px] text-muted-foreground">Only privileged roles may reveal sensitive fields.</p>
        </section>

        <section className="rounded-md border p-3 lg:col-span-2">
          <header className="mb-2 inline-flex items-center gap-2 text-xs font-medium"><KeyRound className="h-3.5 w-3.5"/> Active sessions</header>
          <table className="min-w-full text-left text-xs">
            <thead className="bg-secondary/60"><tr className="border-b"><Th>User</Th><Th>IP</Th><Th>Created</Th><Th>Action</Th></tr></thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b"><Td>{s.user}</Td><Td>{s.ip}</Td><Td>{new Date(s.created).toLocaleString()}</Td><Td><Button variant="outline" className="h-6 px-2 text-[10px]" onClick={() => invalidate(s.id)}><LogOut className="mr-1 h-3 w-3"/>Invalidate</Button></Td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
 }

 function Th({ children }: { children: React.ReactNode }) { return <th className="px-2 py-2 text-[11px] font-semibold">{children}</th>; }
 function Td({ children, className }: { children: React.ReactNode; className?: string }) { return <td className={"px-2 py-1.5 "+(className||"")}>{children}</td>; }
