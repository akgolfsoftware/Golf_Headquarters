"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { AgAvatar, AgChip } from "@/components/admin/agencyos/ui";
import { ApprovalActions } from "@/app/admin/approvals/approval-actions";
import {
  batchApproveLowRisk,
  batchApproveSelected,
} from "@/app/admin/approvals/actions";
import { agBtnClass } from "@/components/admin/agencyos/ui";

export type GodkjenningRad = {
  id: string;
  actionType: string;
  playerId: string;
  who: string;
  title: string;
  detail: string;
  signalKind: string | null;
  signalValue: string | null;
  diffPreview: string | null;
  when: string;
  urgent: boolean;
  lowRisk: boolean;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function GodkjenningerInbox({
  rows,
  lowRiskCount,
}: {
  rows: GodkjenningRad[];
  lowRiskCount: number;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const groups = useMemo(() => {
    const map = new Map<string, GodkjenningRad[]>();
    for (const r of rows) {
      const list = map.get(r.playerId) ?? [];
      list.push(r);
      map.set(r.playerId, list);
    }
    return Array.from(map.entries()).map(([playerId, items]) => ({
      playerId,
      who: items[0]?.who ?? "Spiller",
      items,
      urgent: items.some((i) => i.urgent),
    }));
  }, [rows]);

  const allIds = rows.map((r) => r.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  function toggleGroup(ids: string[]) {
    const allIn = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (allIn) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }

  return (
    <>
      <div className="mb-4 flex max-w-[820px] flex-wrap items-center gap-2">
        {lowRiskCount > 0 && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await batchApproveLowRisk();
                router.refresh();
              })
            }
            className={`${agBtnClass("primary", "sm")} disabled:opacity-60`}
          >
            <Check className="h-4 w-4" strokeWidth={2} />
            Godkjenn lav-risiko ({lowRiskCount})
          </button>
        )}
        {selected.size > 0 && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await batchApproveSelected(Array.from(selected));
                setSelected(new Set());
                router.refresh();
              })
            }
            className={`${agBtnClass("primary", "sm")} disabled:opacity-60`}
          >
            Godkjenn valgte ({selected.size})
          </button>
        )}
        {rows.length > 0 && (
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-border"
            />
            Velg alle synlige
          </label>
        )}
      </div>

      <div className="flex max-w-[820px] flex-col gap-4">
        {groups.length === 0 && (
          <div className="rounded-xl border border-border bg-card px-[18px] py-10 text-center text-sm text-muted-foreground">
            Ingenting venter på deg — alt er behandlet.
          </div>
        )}
        {groups.map((g) => {
          const groupIds = g.items.map((i) => i.id);
          const groupAll = groupIds.every((id) => selected.has(id));
          return (
            <section key={g.playerId} className="flex flex-col gap-[10px]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AgAvatar initials={initials(g.who)} size={32} tone={g.urgent ? "pri" : "neu"} />
                  <span className="text-sm font-bold text-foreground">{g.who}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {g.items.length} forslag
                  </span>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await batchApproveSelected(groupIds);
                      router.refresh();
                    })
                  }
                  className={`${agBtnClass("ghost", "sm")} disabled:opacity-60`}
                >
                  Godkjenn alle for {g.who.split(/\s+/)[0]}
                </button>
                <input
                  type="checkbox"
                  checked={groupAll}
                  onChange={() => toggleGroup(groupIds)}
                  className="h-4 w-4 rounded border-border"
                  aria-label={`Velg alle for ${g.who}`}
                />
              </div>
              {g.items.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-border bg-card p-4"
                  style={
                    m.urgent
                      ? { borderLeft: "3px solid hsl(var(--accent))" }
                      : undefined
                  }
                >
                  <div className="grid grid-cols-[24px_40px_1fr] items-start gap-[14px]">
                    <input
                      type="checkbox"
                      checked={selected.has(m.id)}
                      onChange={() => toggle(m.id)}
                      className="mt-2 h-4 w-4 rounded border-border"
                      aria-label={`Velg ${m.title}`}
                    />
                    <AgAvatar
                      initials={initials(m.who)}
                      size={40}
                      tone={m.urgent ? "pri" : "neu"}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[15px] font-bold tracking-[-0.01em] text-foreground">
                          {m.title}
                        </span>
                        {m.urgent && <AgChip tone="lime">Haster</AgChip>}
                        {m.lowRisk && <AgChip tone="neu">Lav risiko</AgChip>}
                      </div>
                      <div className="mb-[6px] mt-[2px] font-mono text-[10px] text-muted-foreground">
                        {m.when} · {m.actionType}
                      </div>
                      {m.detail && (
                        <div className="text-[13px] leading-normal text-foreground">
                          {m.detail}
                        </div>
                      )}
                      {m.signalKind && (
                        <div className="mt-2 font-mono text-[10px] text-muted-foreground">
                          Signal: {m.signalKind}
                          {m.signalValue != null ? ` = ${m.signalValue}` : ""}
                        </div>
                      )}
                      {m.diffPreview && (
                        <div className="mt-2 rounded-md border border-border bg-secondary/40 px-3 py-2 font-mono text-[11px] text-foreground">
                          Diff: {m.diffPreview}
                        </div>
                      )}
                      <ApprovalActions
                        actionId={m.id}
                        playerId={m.playerId}
                        detailHref={`/admin/godkjenninger/${m.id}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}