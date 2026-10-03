"use client";

/**
 * Turneringsplan. Tapp på plan-taggen legger inn turneringen eller bytter A→B→C.
 * Påmelding åpnes bare på detaljsiden — aldri fra lista. Resultater er brutto.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flag, Pencil, Sparkles } from "lucide-react";
import { TomTilstand } from "@/components/precision/pa";
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

/** «frist 20.08» — kompakt fristvisning. */
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
  const linje = [`${dag} ${mnd}`, meta].filter(Boolean).join(" · ");
  return (
    <>
      <Link href={`/portal/tren/turneringer/${t.id}`}>
        <span>
          <strong>{t.name}</strong>
          <small>{linje}</small>
        </span>
      </Link>
      <button
        type="button"
        disabled={pending}
        aria-busy={pending || undefined}
        onClick={onTag}
        aria-label={
          tier
            ? `Plan ${tier} — tapp for å bytte nivå`
            : "Legg turneringen i planen din"
        }
      >
        <span>
          <strong>{tier ? `plan ${tier}` : "+ plan"}</strong>
        </span>
      </button>
    </>
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

  // Nærmeste kommende påmeldingsfrist i planen der spilleren ikke er påmeldt.
  // Ingen kandidat → blokken utelates.
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
    <div className="ph-flate">
      <header>
        <p>Tren · Turneringer</p>
        <h1>Turneringer</h1>
        <p>Planen din + katalogen · brutto score</p>
      </header>

      {feil && (
        <p role="alert">{feil}</p>
      )}

      {frist && frist.entryClosesLabel && (
        <section className="pa-card ph-kort">
          <p>Én ting nå</p>
          <strong>
            Påmeldingsfristen for {frist.name} går ut {frist.entryClosesLabel}
          </strong>
          <div>
            {frist.venue ? `${frist.venue} ` : ""}
            {fristKort(frist.startDate)}. Turneringen står som plan{" "}
            {frist.entry?.planTier ?? "B"} i sesongplanen din, men du er ikke
            påmeldt ennå. Påmeldingen er din — to trykk på detaljsiden.
          </div>
          <Link
            href={`/portal/tren/turneringer/${frist.id}`}
            className="pa-btn pa-btn--primary pa-btn--full"
          >
            Åpne påmeldingen
          </Link>
        </section>
      )}

      {planTom && (
        <>
          <TomTilstand
            icon={Flag}
            title="Ingen turneringer i planen din"
            text="Sesongplanen din har ingen turneringer ennå. Katalogen under viser hva som finnes — eller be Anders foreslå en turneringsplan."
          />
          <Link href="/portal" className="pa-btn pa-btn--primary pa-btn--full">
            Be Anders om turneringsplan
          </Link>
        </>
      )}

      {paameldt.length > 0 && (
        <section className="pa-card ph-kort">
          <p>påmeldt · {paameldt.length}</p>
          <ul className="ph-rader">
            {paameldt.map((t) => (
              <li key={t.id}>
                <TurnRad
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
              </li>
            ))}
          </ul>
        </section>
      )}

      <ul className="ph-rader">
        <li>
          <Link href="/portal/ai/foresla-turnering">
            <Sparkles size={16} aria-hidden />
            <span>
              <strong>La AI foreslå turneringer</strong>
              <small>Rangert etter nivået og planen din</small>
            </span>
          </Link>
        </li>
      </ul>

      <section className="pa-card ph-kort">
        <p>katalogen · {iKatalogen.length}</p>
        {iKatalogen.length === 0 ? (
          <div>
            Ingen kommende turneringer i katalogen akkurat nå — den fylles av
            GolfBox-synken.
          </div>
        ) : (
          <ul className="ph-rader">
            {iKatalogen.map((t) => (
              <li key={t.id}>
                <TurnRad
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
              </li>
            ))}
          </ul>
        )}
      </section>

      <p>
        <Pencil size={14} aria-hidden /> Påmelding og avmelding er ditt ansvar — appen
        minner deg om frister, men trykker aldri for deg. Anders ser planen din og gir
        råd, ikke pålegg.
      </p>
    </div>
  );
}
