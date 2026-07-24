"use client";

/**
 * AgencyOS Planlegge-hub — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Mørk AgencyOS. Hver rad = ett trykk til Workbench.
 */

import { useRouter, useSearchParams } from "next/navigation";
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
// T is exported from v2 barrel — used for G9 year-wheel chip

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

export function AdminPlanleggeV2({ data }: { data: AdminPlanleggeData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { spillere } = data;
  // HurtigOpprett sender ?start= — følg med inn i Workbench så Ny økt prefylles.
  const startQ = searchParams.get("start");
  const workbenchHref = (id: string, extra?: { zoom?: string }) => {
    const base = `/admin/spillere/${id}/workbench`;
    const params = new URLSearchParams();
    if (startQ) params.set("start", startQ);
    if (extra?.zoom) params.set("zoom", extra.zoom);
    const q = params.toString();
    return q ? `${base}?${q}` : base;
  };

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
        <Caps>AgencyOS · Workbench</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="Workbench.">Åpne</Tittel>
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
      eyebrow="Workbench · velg spiller"
      action={<Caps size={9}>{pl(totalt, "spiller", "spillere")}</Caps>}
    >
      {sortert.map((s, i) => (
        <Rad
          key={s.id}
          onClick={() => router.push(workbenchHref(s.id))}
          leading={<AvatarInit navn={s.navn} size={34} />}
          title={s.navn}
          sub="Ukeplan · trykk rad · årshjul til høyre"
          meta={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              {s.aktivePlaner > 0 ? (
                <StatusPill tone="lime">
                  {pl(s.aktivePlaner, "aktiv plan", "aktive planer")}
                </StatusPill>
              ) : (
                <StatusPill tone="warn">Ingen aktiv plan</StatusPill>
              )}
              {/* G9: stall-tidslinje / årshjul = Workbench årsplan-zoom */}
              <Link
                href={workbenchHref(s.id, { zoom: "ar" })}
                onClick={(e) => e.stopPropagation()}
                title="Årshjul / årsplan"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontFamily: T.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: T.lime,
                  padding: "4px 8px",
                  borderRadius: 8,
                  border: `1px solid ${T.border}`,
                  background: T.panel2,
                }}
              >
                År
              </Link>
            </span>
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
