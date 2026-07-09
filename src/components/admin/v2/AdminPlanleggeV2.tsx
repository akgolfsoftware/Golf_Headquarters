"use client";

/**
 * AgencyOS Planlegge-hub — v2 (retning C «Presis»). Coach-inngang til
 * planlegging. Ingen mockup fantes — komponert utelukkende av v2-biblioteket
 * (src/components/v2), ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Den EKTE skjermen (src/app/admin/planlegge/page.tsx) er en tynn redirect:
 * den finner en spiller (role=PLAYER, deletedAt=null, navn asc) og sender
 * coachen rett inn i den spillerens Workbench — «Planlegge er ETT trykkpunkt
 * dit, ikke en meny av 6 kort» (låst beslutning). En redirect har ingen egen
 * flate å forhåndsvise, så dette er en ærlig v2-inngang som bevarer
 * datakontrakten (spillerliste) og målet (Workbench per spiller): coachen
 * velger hvilken spiller planleggingen gjelder, hver rad er ett trykk til
 * spillerens Workbench. Ingen planlegging skjer utenfor Workbench.
 *
 * All planlegging går gjennom Workbench — se lib/CLAUDE.md låste beslutninger.
 */

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  KpiFlis,
  AvatarInit,
  CTAPill,
  Knapp,
  InnsiktChip,
  TomTilstand,
  StatusPill,
  T,
} from "@/components/v2";

// ── Datakontrakt (mappes fra loaderen i ruten) ─────────────────
export interface PlanleggeSpiller {
  id: string;
  navn: string;
  /** Antall aktive tekniske planer (ACTIVE) — ekte tall fra Prisma. */
  aktivePlaner: number;
}
export interface AdminPlanleggeData {
  coachFornavn: string;
  spillere: PlanleggeSpiller[];
}

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

/** Workbench-adressen for en spiller — samme mål som den ekte redirecten. */
const workbenchHref = (id: string) => `/admin/spillere/${id}/workbench`;

export function AdminPlanleggeV2({ data }: { data: AdminPlanleggeData }) {
  const router = useRouter();
  const { spillere } = data;

  const totalt = spillere.length;
  const medAktiv = spillere.filter((s) => s.aktivePlaner > 0).length;
  const utenAktiv = totalt - medAktiv;

  // Primærmål (mobil-CTA + innsikt): den ekte redirecten valgte første spiller
  // alfabetisk — behold samme innløp her.
  const primaer = spillere[0] ?? null;

  // ── Hode ──────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>AgencyOS · Planlegging</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="planlegg.">La oss</Tittel>
        </div>
      </div>
      {primaer && (
        <div className="hidden md:inline-flex">
          <Link href={workbenchHref(primaer.id)} style={{ textDecoration: "none" }}>
            <CTAPill icon="arrow-right">Åpne Workbench</CTAPill>
          </Link>
        </div>
      )}
    </div>
  );

  // Ingen spillere → ærlig tom-tilstand, ingen fabrikerte tall.
  if (totalt === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        <Kort>
          <TomTilstand
            icon="users"
            title="Ingen spillere å planlegge for"
            sub="Ingen aktive spillere er koblet til deg ennå. Når en spiller kobles, planlegger du for hen i Workbench."
          />
        </Kort>
      </div>
    );
  }

  // ── KPI-flis (ekte tall) ──────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-3" style={{ gap: T.gap }}>
      <KpiFlis label="Spillere" value={totalt} />
      <KpiFlis label="Med aktiv plan" value={medAktiv} />
      <KpiFlis label="Uten aktiv plan" value={utenAktiv} varsle={utenAktiv > 0} />
    </div>
  );

  // ── Mobil-primærknapp: full bredde, tommelvennlig (kun < md) ───
  const mobilCTA = primaer ? (
    <div className="md:hidden">
      <Knapp icon="arrow-right" full onClick={() => router.push(workbenchHref(primaer.id))}>
        Planlegg for {primaer.navn.split(" ")[0]}
      </Knapp>
    </div>
  ) : null;

  // ── Spillerliste — hver rad er ETT trykk til Workbench ─────────
  const liste = (
    <Kort
      eyebrow="Velg spiller å planlegge for"
      action={<Caps size={9}>{pl(totalt, "spiller", "spillere")}</Caps>}
    >
      {spillere.map((s, i) => (
        <Rad
          key={s.id}
          onClick={() => router.push(workbenchHref(s.id))}
          leading={<AvatarInit navn={s.navn} size={34} />}
          title={s.navn}
          sub="Åpne Workbench for å planlegge"
          meta={
            s.aktivePlaner > 0 ? (
              <StatusPill tone="lime">
                {pl(s.aktivePlaner, "aktiv plan", "aktive planer")}
              </StatusPill>
            ) : (
              <StatusPill tone="warn">Ingen aktiv plan</StatusPill>
            )
          }
          last={i === spillere.length - 1}
        />
      ))}
    </Kort>
  );

  // ── AI-innsikt → Workbench ────────────────────────────────────
  const innsiktTekst =
    utenAktiv > 0
      ? `${pl(utenAktiv, "spiller mangler", "spillere mangler")} en aktiv plan — sett mål og periodisering samlet i Workbench.`
      : "Alle spillere har en aktiv plan — bruk roen til å finjustere mål og drills i Workbench.";
  const innsikt = primaer ? (
    <Link href={workbenchHref(primaer.id)} style={{ textDecoration: "none" }}>
      <InnsiktChip cta="Planlegg i Workbench">{innsiktTekst}</InnsiktChip>
    </Link>
  ) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {kpi}
      {mobilCTA}
      {liste}
      {innsikt}
    </div>
  );
}
