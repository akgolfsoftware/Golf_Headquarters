"use client";

/**
 * AgencyOS Varsler — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * Agent-forslag · signaler · uleste. T.* only. Lime reservert bulk/primær.
 */

import { useEffect, useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { VarslerData } from "@/lib/admin/load-varsler";
import { avvisPlanAction, godtaPlanAction, markerVarselLest } from "@/app/admin/varsler/actions";
import { T, Caps, Kort, Rad, Knapp, AvatarInit, TomTilstand, MikroMeta, HjelpTips, StatusPill, CTAPill } from "@/components/v2";

/** Touch-mål (Apple HIG/WCAG): ingen klikkbar flate i denne fila under 44px. */
const TOUCH: CSSProperties = { minHeight: 44 };

/** md-breakpoint-speil (samme mønster som AdminGodkjenningerV2/V2Shell). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

export function VarslerClientV2({ data }: { data: VarslerData }) {
  const router = useRouter();
  const mobile = useMobile();
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

  // Kanonisk kø-tall (koTelling) minus det som er fjernet optimistisk lokalt.
  const fjernetPlan = data.planActions.length - planActions.length;
  const venterTall = Math.max(planActions.length, data.ko.planActions - fjernetPlan);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <Caps>AgencyOS · Varsler</Caps>
        <StatusPill tone={venterTall > 0 ? "warn" : "lime"}>
          {venterTall === 0 ? "Ingenting venter" : `${venterTall} venter`}
        </StatusPill>
      </div>

      {/* B: én primær CTA */}
      <Link href="/admin/godkjenninger" style={{ textDecoration: "none", display: "block" }}>
        <CTAPill icon="check-circle" full>
          Åpne godkjenninger
        </CTAPill>
      </Link>

      {/* Venter på deg */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Caps>Venter på deg ({venterTall})</Caps>
        {planActions.length === 0 ? (
          <Kort>
            <TomTilstand icon="check" title="Ingenting venter" sub="Ingen agent-forslag krever handling akkurat nå. Nye lander i godkjenninger." />
          </Kort>
        ) : (
          <Kort pad="6px 18px">
            {planActions.map((a, i, arr) =>
              mobile ? (
                /* Mobil: to etasjer — tekst (aldri trunkert) over handlingsknappene. */
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    padding: "12px 0",
                    borderBottom: i === arr.length - 1 ? "none" : `1px solid ${T.border}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <AvatarInit navn={a.playerName} size={34} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>
                        {a.playerName} <span style={{ fontWeight: 400, color: T.mut }}>· {a.actionLabel}</span>
                      </div>
                      <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 2 }}>
                        {a.summary ?? `${a.agentName} · ${a.when}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Knapp ghost icon="check" full style={TOUCH} disabled={pending} onClick={() => run(a.id, () => godtaPlanAction(a.id))}>
                      Godta
                    </Knapp>
                    <Knapp ghost icon="x" full style={TOUCH} disabled={pending} onClick={() => run(a.id, () => avvisPlanAction(a.id))}>
                      Avvis
                    </Knapp>
                  </div>
                </div>
              ) : (
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
                      <Knapp ghost icon="check" style={TOUCH} disabled={pending} onClick={() => run(a.id, () => godtaPlanAction(a.id))}>
                        Godta
                      </Knapp>
                      <Knapp ghost icon="x" style={TOUCH} disabled={pending} onClick={() => run(a.id, () => avvisPlanAction(a.id))}>
                        Avvis
                      </Knapp>
                    </div>
                  }
                />
              ),
            )}
          </Kort>
        )}
      </div>

      {/* Signaler */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Caps>Signaler ({signals.length})</Caps>
          <HjelpTips k="signalVerdi" size={11} />
        </div>
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
            {notifications.map((n, i, arr) =>
              mobile ? (
                <div
                  key={n.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    padding: "12px 0",
                    borderBottom: i === arr.length - 1 ? "none" : `1px solid ${T.border}`,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{n.title}</div>
                    <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 2 }}>{n.body ?? n.when}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {n.link && (
                      <Link
                        href={n.link}
                        style={{ flex: 1, minWidth: 0, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", ...TOUCH }}
                      >
                        <MikroMeta icon="arrow-right">Åpne</MikroMeta>
                      </Link>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Knapp ghost icon="check" full style={TOUCH} disabled={pending} onClick={() => run(n.id, () => markerVarselLest(n.id))}>
                        Lest
                      </Knapp>
                    </div>
                  </div>
                </div>
              ) : (
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
                        <Link href={n.link} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", ...TOUCH }}>
                          <MikroMeta icon="arrow-right">Åpne</MikroMeta>
                        </Link>
                      )}
                      <Knapp ghost icon="check" style={TOUCH} disabled={pending} onClick={() => run(n.id, () => markerVarselLest(n.id))}>
                        Lest
                      </Knapp>
                    </div>
                  }
                />
              ),
            )}
          </Kort>
        )}
      </div>
    </div>
  );
}
