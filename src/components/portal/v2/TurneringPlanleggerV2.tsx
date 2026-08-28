"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * PlayerHQ · Turneringer — Paper-port W1 (fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-turneringer.html.
 *
 * Struktur per fasit: «Én ting nå» (nærmeste påmeldingsfrist i planen,
 * clay-CTA «Åpne påmeldingen» → detaljsiden — påmelding skjer ALDRI fra
 * lista) → «påmeldt · N» → «katalogen» → eier-note. Radformat: dato-blokk
 * (dag/mnd) + navn + mono-meta + plan-tag A/B/C.
 *
 * Plan-taggen er interaktiv (Enkelhet: behold funksjoner): tapp legger
 * turneringen i plan (leggTilTurnering) eller bytter nivå A→B→C
 * (settPlanTier). Resultater er alltid BRUTTO (bæres av loaderen).
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Caps } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import type {
  PlanleggerTurnering,
  PlanTier,
} from "@/lib/portal-turnering/planlegger-data";
import {
  leggTilTurnering,
  settPlanTier,
} from "@/app/portal/(legacy)/tren/turneringer/actions";

export type TurneringPlanleggerV2Props = {
  katalog: PlanleggerTurnering[];
  minPlan: PlanleggerTurnering[];
  spillerNavn: string;
};

const MND_KORT = [
  "jan", "feb", "mar", "apr", "mai", "jun",
  "jul", "aug", "sep", "okt", "nov", "des",
];

function dagBlokk(d: Date): { dag: string; mnd: string } {
  return {
    dag: String(d.getDate()).padStart(2, "0"),
    mnd: MND_KORT[d.getMonth()],
  };
}

/** «frist 20.08» — kompakt fristvisning i mono-metaen. */
function fristKort(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const NESTE_TIER: Record<PlanTier, PlanTier> = { A: "B", B: "C", C: "A" };

function erPaameldt(t: PlanleggerTurnering): boolean {
  return (
    t.entry?.entryStatus === "CONFIRMED" ||
    t.entry?.entryStatus === "CLAIMED_REGISTERED"
  );
}

/** Fasitens .turn-rad: dato-blokk + navn + mono-meta + plan-tag. */
function TurnRad({
  t,
  meta,
  pending,
  onTag,
}: {
  t: PlanleggerTurnering;
  meta: string;
  pending: boolean;
  onTag: () => void;
}) {
  const { dag, mnd } = dagBlokk(t.startDate);
  const tier = t.entry?.planTier ?? null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: TL.elev,
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.card,
        padding: "12px 16px",
        marginBottom: 8,
        minWidth: 0,
      }}
    >
      <Link
        href={`/portal/tren/turneringer/${t.id}`}
        className="v2-focus"
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <span style={{ flex: "none", width: 44, textAlign: "center" }}>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: TL.text }}>
            {dag}
          </span>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 9.5, textTransform: "uppercase", color: TL.mute }}>
            {mnd}
          </span>
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, fontFamily: TL.font.sans, color: TL.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {t.name}
          </span>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {meta}
          </span>
        </span>
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={onTag}
        aria-label={
          tier
            ? `Plan ${tier} — tapp for å bytte nivå`
            : "Legg turneringen i planen din"
        }
        className="v2-focus"
        style={{
          flex: "none",
          display: "inline-flex",
          alignItems: "center",
          padding: "3px 8px",
          minHeight: 28,
          borderRadius: TL.radius.pill,
          fontFamily: TL.font.mono,
          fontSize: 10,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          background: TL.dock,
          color: tier === "A" ? TL.viz.target : TL.mute,
          border: `1px solid ${TL.hair}`,
          cursor: pending ? "wait" : "pointer",
        }}
      >
        {tier ? `plan ${tier}` : "+ plan"}
      </button>
    </div>
  );
}

export function TurneringPlanleggerV2({
  katalog,
  minPlan,
}: TurneringPlanleggerV2Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  // Stabil «nå» for fristfiltrering (aldri Date.now() i render-body).
  const [naa] = useState(() => Date.now());

  function tagTapp(t: PlanleggerTurnering) {
    setFeil(null);
    startTransition(async () => {
      const r = t.entry
        ? await settPlanTier(t.entry.id, NESTE_TIER[t.entry.planTier])
        : await leggTilTurnering({
            tournamentId: t.id,
            priority: "NORMAL",
            planTier: "B",
          });
      if (!r.ok) setFeil(r.feil);
      else router.refresh();
    });
  }

  // «Én ting nå»: nærmeste kommende påmeldingsfrist i planen der spilleren
  // IKKE er påmeldt ennå. Ingen kandidat → blokken utelates ærlig.
  const frist = minPlan
    .filter(
      (t) =>
        t.entry?.entryStatus === "PLANNED" &&
        t.entryCloses != null &&
        t.entryCloses.getTime() >= naa,
    )
    .sort((a, b) => a.entryCloses!.getTime() - b.entryCloses!.getTime())[0];

  const paameldt = minPlan.filter(erPaameldt);
  const paameldtIds = new Set(paameldt.map((t) => t.id));
  const iKatalogen = katalog.filter((t) => !paameldtIds.has(t.id));
  const planTom = minPlan.length === 0;

  return (
    <div
      data-paper-slug="playerhq-turneringer"
      data-od-id="playerhq-turneringer"
      style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}
    >
      {feil && (
        <div
          role="alert"
          style={{
            padding: "12px 14px",
            borderRadius: TL.radius.card,
            border: `1px solid color-mix(in srgb, ${TL.warn} 40%, ${TL.hair})`,
            background: `color-mix(in srgb, ${TL.warn} 10%, ${TL.dock})`,
            fontFamily: TL.font.sans,
            fontSize: 13,
            color: TL.text,
          }}
        >
          {feil}
        </div>
      )}

      {/* Én ting nå — nærmeste påmeldingsfrist (kun når den finnes) */}
      {frist && frist.entryClosesLabel && (
        <div
          style={{
            background: TL.dim,
            border: `1px solid ${TL.hair}`,
            borderRadius: TL.radius.card,
            padding: 16,
          }}
        >
          <Caps>Én ting nå</Caps>
          <h3 style={{ margin: "8px 0", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
            Påmeldingsfristen for {frist.name} går ut {frist.entryClosesLabel}
          </h3>
          <p style={{ margin: "0 0 16px", fontFamily: TL.font.sans, fontSize: 14, color: TL.mute, maxWidth: "52ch" }}>
            {frist.venue ? `${frist.venue} ` : ""}
            {fristKort(frist.startDate)}. Turneringen står som plan{" "}
            {frist.entry?.planTier ?? "B"} i sesongplanen din, men du er ikke
            påmeldt ennå. Påmeldingen er din — to trykk på detaljsiden.
          </p>
          {/* Kontrakt §3: skjermens ene aksenthandling — åpner detaljsiden der
              dobbel bekreftelse skjer. Påmelding skjer aldri fra lista. */}
          <Link
            href={`/portal/tren/turneringer/${frist.id}`}
            data-od-id="turn-frist-apne"
            data-paper-en-ting="true"
            className="v2-press v2-focus"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 56,
              width: "100%",
              borderRadius: TL.radius.card,
              background: TL.fill,
              color: TL.onFill,
              fontFamily: TL.font.sans,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Åpne påmeldingen
          </Link>
        </div>
      )}

      {/* Tom plan — fasit-copy; katalogen vises fortsatt under */}
      {planTom && (
        <div
          style={{
            padding: "24px 16px",
            background: TL.dock,
            border: `1px dashed ${TL.hair}`,
            borderRadius: TL.radius.card,
          }}
        >
          <h3 style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
            Ingen turneringer i planen din
          </h3>
          <p style={{ margin: "0 0 12px", fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute }}>
            Sesongplanen din har ingen turneringer ennå. Katalogen under viser
            hva som finnes — eller be Anders foreslå en turneringsplan.
          </p>
          <Link
            href="/portal"
            data-od-id="turn-tom-be"
            data-paper-en-ting="true"
            className="v2-press v2-focus"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 56,
              width: "100%",
              borderRadius: TL.radius.card,
              background: TL.fill,
              color: TL.onFill,
              fontFamily: TL.font.sans,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Be Anders om turneringsplan
          </Link>
        </div>
      )}

      {/* Påmeldt */}
      {paameldt.length > 0 && (
        <div>
          <Caps>påmeldt · {paameldt.length}</Caps>
          <div style={{ marginTop: 8 }}>
            {paameldt.map((t) => (
              <TurnRad
                key={t.id}
                t={t}
                meta={[
                  t.venue,
                  `plan ${t.entry!.planTier}`,
                  t.entry!.entryStatus === "CONFIRMED"
                    ? "påmeldt"
                    : "venter bekreftelse",
                ]
                  .filter(Boolean)
                  .join(" · ")}
                pending={pending}
                onTag={() => tagTapp(t)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Videre-lenke — AI-forslag basert på HCP + katalog. Ordinær rad,
          ingen ny clay-CTA (skjermen har allerede sin ene i «Én ting nå»). */}
      <Link
        href="/portal/ai/foresla-turnering"
        data-od-id="turn-ai-foresla"
        className="v2-press v2-focus"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: TL.elev,
          border: `1px solid ${TL.hair}`,
          borderRadius: TL.radius.card,
          padding: "12px 16px",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <Icon name="sparkles" size={16} style={{ color: TL.mute, flex: "none" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>
            La AI foreslå turneringer
          </span>
          <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, marginTop: 1 }}>
            Rangert etter nivået og planen din
          </span>
        </div>
        <Icon name="chevron-right" size={15} style={{ color: TL.mute, flex: "none" }} />
      </Link>

      {/* Katalogen */}
      <div>
        <Caps>katalogen · {iKatalogen.length}</Caps>
        <div style={{ marginTop: 8 }}>
          {iKatalogen.length === 0 ? (
            <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute }}>
              Ingen kommende turneringer i katalogen akkurat nå — den fylles av
              GolfBox-synken.
            </p>
          ) : (
            iKatalogen.map((t) => (
              <TurnRad
                key={t.id}
                t={t}
                meta={[
                  t.venue,
                  t.entryCloses ? `frist ${fristKort(t.entryCloses)}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                pending={pending}
                onTag={() => tagTapp(t)}
              />
            ))
          )}
        </div>
      </div>

      {/* Eier-note — påmelding er spillerens ansvar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: "12px 16px",
          borderRadius: TL.radius.card,
          background: TL.dock,
          border: `1px solid ${TL.hair}`,
          fontFamily: TL.font.sans,
          fontSize: 12.5,
          color: TL.mute,
        }}
      >
        <Icon name="pencil" size={16} style={{ color: TL.mute, flex: "none", marginTop: 2 }} />
        <span>
          Påmelding og avmelding er ditt ansvar — appen minner deg om frister,
          men trykker aldri for deg. Anders ser planen din og gir råd, ikke
          pålegg.
        </span>
      </div>
    </div>
  );
}
