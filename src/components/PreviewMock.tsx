import type { Classification } from "../../shared/types";

const ROWS = {
  Dashboard: ["Revenue", "Active seats", "Churn"],
  CRM: ["Northwind", "Acme Labs", "Fieldkit"],
  Analytics: ["Sessions", "Activation", "Retention"],
  Billing: ["Starter", "Growth", "Scale"],
  Agent: ["Inbox triage", "Follow-up", "Handoff"],
  Automation: ["New signup", "Invoice paid", "Seat added"],
  Workspace: ["Spec", "Review", "Ship"],
  Portal: ["Tickets", "Assets", "Billing"],
  Tool: ["Input", "Run", "Export"],
};

export function PreviewMock({
  title,
  classification,
}: {
  title: string;
  classification: Classification;
}) {
  const rows = ROWS[classification];

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0c0c10]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_40%)]" />
      <div className="flex h-7 items-center gap-1.5 border-b border-white/6 px-3">
        <span className="size-1.5 rounded-full bg-white/20" />
        <span className="size-1.5 rounded-full bg-white/12" />
        <span className="size-1.5 rounded-full bg-white/12" />
        <span className="ml-2 truncate font-mono text-[10px] text-white/35">{title}</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 p-3">
        {rows.map((row, index) => (
          <div key={row} className="rounded-md border border-white/6 bg-white/3 px-2 py-2">
            <div className="text-[9px] uppercase tracking-[0.14em] text-white/35">{row}</div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/6">
              <div
                className="h-full rounded-full bg-[var(--accent)]/70"
                style={{ width: `${40 + index * 18}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="px-3 pb-3">
        <div className="h-16 rounded-md border border-white/6 bg-[linear-gradient(90deg,rgba(125,255,179,0.08),transparent_55%),rgba(255,255,255,0.02)]" />
      </div>
    </div>
  );
}
