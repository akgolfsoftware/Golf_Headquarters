"use client";

/**
 * AgencyOS Varsler — v2 klientkomponent. Tre grupper: agent-forslag som
 * krever handling (godta/avvis), ferske signaler (siste per spiller/kind),
 * og coachens egne uleste meldinger. Server-actions (godtaPlanAction/
 * avvisPlanAction/markerVarselLest) bevart 1:1 — kortet fjernes optimistisk
 * lokalt før router.refresh().
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { VarslerData } from "@/lib/admin/load-varsler";
import { avvisPlanAction, godtaPlanAction, markerVarselLest } from "@/app/admin/varsler/actions";
import { T, Caps, Kort, Rad, Knapp, AvatarInit, TomTilstand, MikroMeta } from "@/components/v2";

export function VarslerClientV2({ data }: { data: VarslerData }) {
  const router = useRouter();
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  function run(id: string, fn: () => Promise<unknown>) {
    setRemoved((prev) => new Set(prev).add(id));
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  }

  const planActions = data.planActions.filter((a) => !removed.has(a.id));
  const notifications = data.notifications.filter((n) => !removed.has(n.id));
  const { signals } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Venter på deg */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Caps>Venter på deg ({planActions.length})</Caps>
        {planActions.length === 0 ? (
          <Kort>
            <TomTilstand icon="check" title="Ingenting venter" sub="Ingen agent-forslag krever handling akkurat nå." />
          </Kort>
        ) : (
          <Kort pad="6px 18px">
            {planActions.map((a, i, arr) => (
              <Rad
                key={a.id}
                last={i === arr.length - 1}
                leading={<AvatarInit navn={a.playerName} size={34} />}
                title={
                  <span>
                    {a.playerName} <span style={{ fontWeight: 400, color: T.mut }}>· {a.actionLabel}</span>
                  </span>
                }
                sub={a.summary ?? `${a.agentName} · ${a.when}`}
                trailing={
                  <div style={{ display: "flex", gap: 6 }}>
                    <Knapp icon="check" disabled={pending} onClick={() => run(a.id, () => godtaPlanAction(a.id))}>
                      Godta
                    </Knapp>
                    <Knapp ghost icon="x" disabled={pending} onClick={() => run(a.id, () => avvisPlanAction(a.id))}>
                      Avvis
                    </Knapp>
                  </div>
                }
              />
            ))}
          </Kort>
        )}
      </div>

      {/* Signaler */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Caps>Signaler ({signals.length})</Caps>
        {signals.length === 0 ? (
          <Kort>
            <TomTilstand icon="activity" title="Ingen ferske signaler" sub="Ingen signaler er beregnet for stallen siste 14 dager." />
          </Kort>
        ) : (
          <Kort pad="6px 18px">
            {signals.map((s, i, arr) => (
              <Rad
                key={s.id}
                last={i === arr.length - 1}
                leading={<AvatarInit navn={s.playerName} size={34} />}
                title={s.playerName}
                sub={`${s.kindLabel} · ${s.when}`}
                trailing={
                  s.value !== null ? (
                    <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg }}>{s.value.toFixed(2)}</span>
                  ) : null
                }
              />
            ))}
          </Kort>
        )}
      </div>

      {/* Meldinger */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Caps>Meldinger ({notifications.length})</Caps>
        {notifications.length === 0 ? (
          <Kort>
            <TomTilstand icon="bell" title="Innboksen er tom" sub="Du har ingen uleste varsler." />
          </Kort>
        ) : (
          <Kort pad="6px 18px">
            {notifications.map((n, i, arr) => (
              <Rad
                key={n.id}
                last={i === arr.length - 1}
                leading={
                  <span style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 9999, background: T.panel2 }}>
                    <MikroMeta icon="sparkles">{""}</MikroMeta>
                  </span>
                }
                title={n.title}
                sub={n.body ?? n.when}
                trailing={
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {n.link && (
                      <Link href={n.link} style={{ textDecoration: "none" }}>
                        <MikroMeta icon="arrow-right">Åpne</MikroMeta>
                      </Link>
                    )}
                    <Knapp ghost icon="check" disabled={pending} onClick={() => run(n.id, () => markerVarselLest(n.id))}>
                      Lest
                    </Knapp>
                  </div>
                }
              />
            ))}
          </Kort>
        )}
      </div>
    </div>
  );
}
