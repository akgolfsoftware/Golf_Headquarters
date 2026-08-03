"use client";

/**
 * PlayerHQ Turneringsplanlegger — katalog i dag+fremtid + plan A/B/C + dobbel bekreftelse.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  T,
  Caps,
  Tittel,
  Kort,
  StatusPill,
  CTAPill,
  TomTilstand,
  Icon,
} from "@/components/v2";
import type { PlanleggerTurnering, PlanTier } from "@/lib/portal-turnering/planlegger-data";
import {
  leggTilTurnering,
  settPlanTier,
  claimPaamelding,
  confirmPaamelding,
} from "@/app/portal/(legacy)/tren/turneringer/actions";

export type TurneringPlanleggerV2Props = {
  katalog: PlanleggerTurnering[];
  minPlan: PlanleggerTurnering[];
  spillerNavn: string;
};

const TIER_LABEL: Record<PlanTier, string> = {
  A: "Plan A",
  B: "Plan B",
  C: "Plan C",
};

export function TurneringPlanleggerV2({
  katalog,
  minPlan,
  spillerNavn,
}: TurneringPlanleggerV2Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"katalog" | "plan">("katalog");
  const [pending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);

  const liste = tab === "katalog" ? katalog : minPlan;

  function leggIPlan(tid: string, planTier: PlanTier) {
    setFeil(null);
    startTransition(async () => {
      const r = await leggTilTurnering({
        tournamentId: tid,
        priority: planTier === "A" ? "MAJOR" : planTier === "C" ? "LOCAL" : "NORMAL",
        planTier,
      });
      if (!r.ok) setFeil(r.feil);
      else router.refresh();
    });
  }

  function byttTier(entryId: string, planTier: PlanTier) {
    setFeil(null);
    startTransition(async () => {
      const r = await settPlanTier(entryId, planTier);
      if (!r.ok) setFeil(r.feil);
      else router.refresh();
    });
  }

  function claim(tid: string) {
    setFeil(null);
    startTransition(async () => {
      const r = await claimPaamelding(tid);
      if (!r.ok) setFeil(r.feil);
      else {
        setConfirmId(tid);
        router.refresh();
      }
    });
  }

  function confirm(tid: string) {
    setFeil(null);
    startTransition(async () => {
      const r = await confirmPaamelding(tid);
      if (!r.ok) setFeil(r.feil);
      else {
        setConfirmId(null);
        router.refresh();
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>Turneringsplanlegger</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile em="plan.">
            Kommende
          </Tittel>
        </div>
        <p
          style={{
            margin: "10px 0 0",
            fontFamily: T.ui,
            fontSize: 13,
            color: T.fg2,
            lineHeight: 1.5,
            maxWidth: 480,
          }}
        >
          {spillerNavn.split(" ")[0]}, her er turneringer i dag og fremover. Du
          legger selv i plan og bekrefter påmelding — appen sjekker ikke hos
          arrangør.
        </p>
      </div>

      {feil && (
        <div
          role="alert"
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: `1px solid color-mix(in srgb, ${T.warn} 40%, ${T.border})`,
            background: `color-mix(in srgb, ${T.warn} 10%, ${T.panel2})`,
            fontFamily: T.ui,
            fontSize: 13,
            color: T.fg,
          }}
        >
          {feil}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {(
          [
            ["katalog", "Katalog", katalog.length],
            ["plan", "Min plan", minPlan.length],
          ] as const
        ).map(([id, label, n]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            style={{
              fontFamily: T.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              padding: "8px 14px",
              borderRadius: 999,
              border: `1px solid ${tab === id ? T.lime : T.border}`,
              background: tab === id ? `color-mix(in srgb, ${T.lime} 15%, ${T.panel})` : T.panel2,
              color: T.fg,
              cursor: "pointer",
            }}
          >
            {label} ({n})
          </button>
        ))}
      </div>

      {liste.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="trophy"
            title={tab === "katalog" ? "Ingen kommende turneringer" : "Ingen på plan"}
            sub={
              tab === "katalog"
                ? "Når GolfBox/DataGolf synker inn events, vises de her."
                : "Gå til katalog og legg til med Plan A, B eller C."
            }
          />
        </Kort>
      ) : (
        liste.map((t) => (
          <Kort key={t.id} hover>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                    {t.tour && (
                      <span
                        style={{
                          fontFamily: T.mono,
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          color: T.fg2,
                          background: T.panel2,
                          border: `1px solid ${T.border}`,
                          borderRadius: 5,
                          padding: "3px 7px",
                        }}
                      >
                        {t.tour}
                      </span>
                    )}
                    {t.entry && (
                      <StatusPill tone={t.entry.entryStatus === "CONFIRMED" ? "up" : t.entry.entryStatus === "CLAIMED_REGISTERED" ? "warn" : "info"}>
                        {t.entry.statusLabel}
                      </StatusPill>
                    )}
                    {t.entry && (
                      <StatusPill tone="lime">{TIER_LABEL[t.entry.planTier]}</StatusPill>
                    )}
                    {t.entryClosesUrgent && t.entryClosesLabel && (
                      <StatusPill tone="warn">Frist snart</StatusPill>
                    )}
                  </div>
                  <Link
                    href={`/portal/tren/turneringer/${t.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div
                      style={{
                        fontFamily: T.disp,
                        fontWeight: 700,
                        fontSize: 17,
                        color: T.fg,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {t.name}
                    </div>
                  </Link>
                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 10,
                      fontFamily: T.mono,
                      fontSize: 10,
                      color: T.mut,
                    }}
                  >
                    <span>{t.datoLabel}</span>
                    {t.venue && <span>· {t.venue}</span>}
                    {t.entryClosesLabel && <span>· Påmeldingsfrist {t.entryClosesLabel}</span>}
                    {t.recommendedLevel && <span>· Nivå: {t.recommendedLevel}</span>}
                  </div>
                  {t.roundDates.length > 1 && (
                    <div style={{ marginTop: 6, fontFamily: T.mono, fontSize: 9.5, color: T.mut }}>
                      Runder: {t.roundDates.join(" · ")}
                    </div>
                  )}
                </div>
              </div>

              {/* Plan A/B/C */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                <Caps size={9}>Plan</Caps>
                {(["A", "B", "C"] as PlanTier[]).map((tier) => {
                  const active = t.entry?.planTier === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        if (t.entry) byttTier(t.entry.id, tier);
                        else leggIPlan(t.id, tier);
                      }}
                      style={{
                        fontFamily: T.mono,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "6px 12px",
                        borderRadius: 999,
                        border: `1px solid ${active ? T.lime : T.border}`,
                        background: active
                          ? `color-mix(in srgb, ${T.lime} 18%, ${T.panel})`
                          : T.panel2,
                        color: T.fg,
                        cursor: pending ? "wait" : "pointer",
                      }}
                    >
                      {tier}
                    </button>
                  );
                })}
              </div>

              {/* Påmelding / lenker */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                {(t.registrationUrl || t.officialUrl) && (
                  <a
                    href={t.registrationUrl ?? t.officialUrl ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <CTAPill icon="external-link">Påmelding hos arrangør</CTAPill>
                  </a>
                )}
                {t.entry && t.entry.entryStatus === "PLANNED" && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => claim(t.id)}
                    style={{
                      fontFamily: T.mono,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      padding: "10px 14px",
                      borderRadius: 999,
                      border: "none",
                      background: T.lime,
                      color: T.bg,
                      cursor: pending ? "wait" : "pointer",
                    }}
                  >
                    Jeg har meldt meg på
                  </button>
                )}
                {t.entry &&
                  (t.entry.entryStatus === "CLAIMED_REGISTERED" ||
                    confirmId === t.id) &&
                  t.entry.entryStatus !== "CONFIRMED" && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => setConfirmId(t.id)}
                      style={{
                        fontFamily: T.mono,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        padding: "10px 14px",
                        borderRadius: 999,
                        border: `1px solid ${T.warn}`,
                        background: `color-mix(in srgb, ${T.warn} 12%, ${T.panel})`,
                        color: T.fg,
                        cursor: pending ? "wait" : "pointer",
                      }}
                    >
                      Bekreft påmelding
                    </button>
                  )}
              </div>

              <p style={{ margin: 0, fontFamily: T.mono, fontSize: 9, color: T.mut, lineHeight: 1.45 }}>
                Du er selv ansvarlig for å være påmeldt hos arrangør før frist.
                AK Golf HQ kan ikke sjekke dette.
              </p>
            </div>
          </Kort>
        ))
      )}

      {/* Dobbel bekreftelse modal */}
      {confirmId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bekreft-tittel"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: T.farge.svartA55,
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
          onClick={() => setConfirmId(null)}
        >
          <div
            style={{
              maxWidth: 420,
              width: "100%",
              background: T.panel,
              border: `1px solid ${T.border}`,
              borderRadius: 16,
              padding: 22,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Icon name="shield-alert" size={20} style={{ color: T.warn, flex: "none" }} />
              <div>
                <div
                  id="bekreft-tittel"
                  style={{
                    fontFamily: T.disp,
                    fontWeight: 700,
                    fontSize: 18,
                    color: T.fg,
                    marginBottom: 10,
                  }}
                >
                  Bekreft at du er påmeldt
                </div>
                <p
                  style={{
                    margin: 0,
                    fontFamily: T.ui,
                    fontSize: 13.5,
                    color: T.fg2,
                    lineHeight: 1.55,
                  }}
                >
                  Jeg bekrefter at jeg faktisk er påmeldt hos arrangør. AK Golf HQ
                  har ikke mulighet til å sjekke dette. Jeg er selv ansvarlig for
                  frist og påmelding.
                </p>
                <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => confirm(confirmId)}
                    style={{
                      fontFamily: T.mono,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      padding: "12px 16px",
                      borderRadius: 999,
                      border: "none",
                      background: T.lime,
                      color: T.bg,
                      cursor: pending ? "wait" : "pointer",
                    }}
                  >
                    Ja, jeg er påmeldt
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    style={{
                      fontFamily: T.mono,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      padding: "12px 16px",
                      borderRadius: 999,
                      border: `1px solid ${T.border}`,
                      background: T.panel2,
                      color: T.fg,
                      cursor: "pointer",
                    }}
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
