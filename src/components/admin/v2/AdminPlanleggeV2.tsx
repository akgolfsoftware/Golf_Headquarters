"use client";

/**
 * AgencyOS Planlegge-hub — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Mørk AgencyOS. Hver rad = ett trykk til Workbench.
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

  // B: primær = spillere uten plan først (trenger deg), ellers første alfabetisk
  const primaer =
    spillere.find((s) => s.aktivePlaner === 0) ?? spillere[0] ?? null;
  const primaerFornavn = primaer?.navn.split(" ")[0] ?? "";
  const primaerTekst =
    primaer && primaer.aktivePlaner === 0
      ? `Planlegg for ${primaerFornavn}`
      : primaer
        ? `Åpne Workbench · ${primaerFornavn}`
        : "Åpne Workbench";

  // ── Hode — B: status ──────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>AgencyOS · Planlegging</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="planlegg.">La oss</Tittel>
        </div>
      </div>
      {totalt > 0 && (
        <StatusPill tone={utenAktiv > 0 ? "warn" : "up"}>
          {utenAktiv > 0
            ? `${pl(utenAktiv, "mangler plan", "mangler plan")}`
            : "Alle har plan"}
        </StatusPill>
      )}
    </div>
  );

  // Ingen spillere → ærlig tom-tilstand + vei
  if (totalt === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        <Kort>
          <TomTilstand
            icon="users"
            title="Ingen spillere å planlegge for"
            sub="Når en spiller kobles til deg, planlegger du for hen i Workbench."
          />
        </Kort>
        <Link href="/admin/spillere/ny" style={{ textDecoration: "none", display: "block" }}>
          <CTAPill icon="user-plus" full>
            Legg til spiller
          </CTAPill>
        </Link>
      </div>
    );
  }

  // ── KPI ───────────────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-3" style={{ gap: T.gap }}>
      <KpiFlis label="Spillere" value={totalt} />
      <KpiFlis label="Med aktiv plan" value={medAktiv} />
      <KpiFlis label="Uten aktiv plan" value={utenAktiv} varsle={utenAktiv > 0} />
    </div>
  );

  // ── B: én primær CTA ──────────────────────────────────────────
  const primaerCta = primaer ? (
    <Link href={workbenchHref(primaer.id)} style={{ textDecoration: "none", display: "block" }}>
      <CTAPill icon="arrow-right" full>
        {primaerTekst}
      </CTAPill>
    </Link>
  ) : null;

  // ── Spillerliste — hver rad er ETT trykk til Workbench ─────────
  // Vis uten plan øverst (trenger deg)
  const sortert = [...spillere].sort((a, b) => {
    if (a.aktivePlaner === 0 && b.aktivePlaner > 0) return -1;
    if (a.aktivePlaner > 0 && b.aktivePlaner === 0) return 1;
    return a.navn.localeCompare(b.navn, "nb");
  });

  const liste = (
    <Kort
      eyebrow="Velg spiller å planlegge for"
      action={<Caps size={9}>{pl(totalt, "spiller", "spillere")}</Caps>}
    >
      {sortert.map((s, i) => (
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
          last={i === sortert.length - 1}
        />
      ))}
    </Kort>
  );

  const innsiktTekst =
    utenAktiv > 0
      ? `${pl(utenAktiv, "spiller mangler", "spillere mangler")} en aktiv plan — sett mål og periodisering i Workbench.`
      : "Alle spillere har en aktiv plan — finjuster mål og drills i Workbench.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {/* B: status/KPI først, deretter én primær */}
      {kpi}
      {primaerCta}
      {liste}
      {primaer && (
        <InnsiktChip cta="Planlegg i Workbench" href={workbenchHref(primaer.id)}>
          {innsiktTekst}
        </InnsiktChip>
      )}
    </div>
  );
}
