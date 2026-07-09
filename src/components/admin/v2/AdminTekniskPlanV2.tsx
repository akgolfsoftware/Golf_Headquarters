"use client";

/**
 * AgencyOS Teknisk-plan (oversikt) — v2 (retning C «Presis»). Coach-vinkel:
 * alle spillere med status for sin tekniske trening (TEK-økter i aktiv plan)
 * + tilgjengelige plan-maler. Ingen mockup fantes — komponert utelukkende av
 * v2-biblioteket (src/components/v2), ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Funksjon/data bevart 1:1 fra den ekte skjermen
 * (src/app/admin/teknisk-plan/page.tsx):
 *   - Spillerliste (PLAYER) med aktiv plan, antall TEK-økter + timer, og
 *     TEK-fullført-andel. Hver rad → /admin/teknisk-plan/[spillerId].
 *   - Plan-maler (godkjente PlanTemplate): navn, beskrivelse, varighet i uker.
 *   - Ærlige tom-tilstander for både spillere og maler.
 *
 * GAP: utviklingsplan.tsx (PRail/KravRad/MilepaelKort) speiler TechnicalPlan
 *      (P1–P10 MORAD-posisjoner + PositionTask). Den ekte teknisk-plan-OVERSIKTEN
 *      bærer IKKE P1–P10-data — kun aggregerte TEK-økt-tall per TrainingPlan.
 *      Å bruke PRail/KravRad her ville krevd fabrikerte posisjoner, så de er
 *      bevisst utelatt (aldri fabrikér). De hører hjemme på detalj-/Workbench-flatene.
 *
 * Mobil: KPI 2-kol, spillerrader kollapser til kort med fullført-pille (de
 * detaljerte stat-kolonnene er hidden md:flex → vises kun på desktop).
 */

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  KpiFlis,
  StatusPill,
  CTAPill,
  InnsiktChip,
  TomTilstand,
  AvatarFoto,
  Icon,
} from "@/components/v2";
import { T } from "@/lib/v2/tokens";

// ── Datakontrakt (mappes fra loaderen i ruten) ──────────────────
export interface TekniskPlanSpillerRad {
  id: string;
  navn: string;
  hcp: number | null;
  homeClub: string | null;
  avatarUrl: string | null;
  /** Navn på aktiv TrainingPlan, eller null når ingen aktiv plan. */
  planNavn: string | null;
  /** Antall TEK-økter i aktiv plan. */
  tekTotalt: number;
  /** Antall fullførte TEK-økter (status COMPLETED). */
  tekFullfort: number;
  /** Sum planlagte minutter for TEK-øktene. */
  tekTidMin: number;
}
export interface TekniskPlanMal {
  id: string;
  navn: string;
  beskrivelse: string | null;
  varighetUker: number;
}
export interface AdminTekniskPlanData {
  spillere: TekniskPlanSpillerRad[];
  maler: TekniskPlanMal[];
}

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

function fmtHcp(v: number | null): string {
  if (v == null) return "—";
  return v.toFixed(1).replace(".", ",");
}
function fmtTimer(min: number): string {
  return (min / 60).toFixed(1).replace(".", ",");
}
function pct(fullfort: number, totalt: number): number | null {
  return totalt > 0 ? Math.round((fullfort / totalt) * 100) : null;
}

/** Kompakt tallblokk (mono-verdi + caps-etikett) for desktop-stat-kolonnene. */
function Stat({ verdi, label, sub, accent }: { verdi: string; label: string; sub?: string; accent?: boolean }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: 2, width: 62, flex: "none" }}>
      <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: accent ? T.lime : T.fg, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
        {verdi}
      </span>
      {sub && <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>{sub}</span>}
      <span style={{ fontFamily: T.mono, fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>{label}</span>
    </span>
  );
}

export function AdminTekniskPlanV2({ data }: { data: AdminTekniskPlanData }) {
  const router = useRouter();
  const { spillere, maler } = data;

  // ── Aggregater (ekte tall) ────────────────────────────────────
  const medPlan = spillere.filter((s) => s.planNavn != null).length;
  const tekTotaltSum = spillere.reduce((a, s) => a + s.tekTotalt, 0);
  const tekFullfortSum = spillere.reduce((a, s) => a + s.tekFullfort, 0);
  const fullfortPct = pct(tekFullfortSum, tekTotaltSum);

  // ── Hode ──────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>
          {pl(spillere.length, "spiller", "spillere")} · {pl(maler.length, "mal", "maler")} · AgencyOS
        </Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="plan.">Teknisk</Tittel>
        </div>
      </div>
      <div className="hidden md:inline-flex">
        <CTAPill ghost icon="plus">Ny mal</CTAPill>
      </div>
    </div>
  );

  // ── KPI-flis (4) ──────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
      <KpiFlis label="Spillere" value={spillere.length} />
      <KpiFlis label="Med aktiv plan" value={medPlan} />
      <KpiFlis label="TEK-økter" value={tekTotaltSum} />
      <KpiFlis label="TEK fullført" value={fullfortPct != null ? `${fullfortPct}%` : "—"} />
    </div>
  );

  // ── Spillerliste ──────────────────────────────────────────────
  const spillerListe = (
    <Kort
      eyebrow="Aktive planer per spiller"
      action={spillere.length > 0 ? <Caps size={9}>{pl(spillere.length, "spiller", "spillere")}</Caps> : undefined}
    >
      {spillere.length === 0 ? (
        <TomTilstand icon="users" title="Ingen spillere" sub="Opprett spillere under Stall for å bygge tekniske planer." />
      ) : (
        spillere.map((s, i) => {
          const p = pct(s.tekFullfort, s.tekTotalt);
          const høy = p != null && p >= 75;
          const sub = [
            `Hcp ${fmtHcp(s.hcp)}`,
            s.homeClub || null,
            s.planNavn ?? "Ingen aktiv plan",
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <Rad
              key={s.id}
              onClick={() => router.push(`/admin/teknisk-plan/${s.id}`)}
              leading={<AvatarFoto src={s.avatarUrl ?? null} navn={s.navn} size={34} />}
              title={s.navn}
              sub={sub}
              meta={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
                  {/* Detaljerte stat-kolonner — kun desktop */}
                  <span className="hidden md:inline-flex" style={{ alignItems: "flex-end", gap: 16 }}>
                    <Stat verdi={String(s.tekTotalt)} label="Økter" sub={`${fmtTimer(s.tekTidMin)} t`} />
                    <Stat
                      verdi={p != null ? `${p}%` : "—"}
                      label="Fullført"
                      sub={`${s.tekFullfort}/${s.tekTotalt}`}
                      accent={høy}
                    />
                  </span>
                  {/* Kompakt fullført-pille — alle bredder */}
                  {p != null ? (
                    <StatusPill tone={høy ? "lime" : "info"}>{p}%</StatusPill>
                  ) : (
                    <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>Ingen økter</span>
                  )}
                </span>
              }
              last={i === spillere.length - 1}
            />
          );
        })
      )}
    </Kort>
  );

  // ── Maler ─────────────────────────────────────────────────────
  const malerListe = (
    <Kort
      eyebrow="Plan-maler"
      action={maler.length > 0 ? <Caps size={9}>{pl(maler.length, "mal", "maler")}</Caps> : undefined}
    >
      {maler.length === 0 ? (
        <TomTilstand icon="layers" title="Ingen plan-maler ennå" sub="Lag en mal for å gjenbruke oppsett på tvers av spillere." />
      ) : (
        maler.map((m, i) => (
          <Rad
            key={m.id}
            leading={<Icon name="layers" size={17} style={{ color: T.mut, flex: "none" }} />}
            title={m.navn}
            sub={m.beskrivelse ?? `${pl(m.varighetUker, "uke", "uker")}`}
            meta={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>
                  {m.varighetUker}<span style={{ color: T.mut }}> uker</span>
                </span>
                <span className="hidden md:inline-flex">
                  <CTAPill ghost>Bruk mal</CTAPill>
                </span>
              </span>
            }
            trailing={null}
            last={i === maler.length - 1}
          />
        ))
      )}
    </Kort>
  );

  // ── AI-innsikt → Workbench ────────────────────────────────────
  const innsiktTekst =
    spillere.length === 0
      ? "Ingen spillere ennå — legg til spillere og bygg tekniske planer i Workbench."
      : medPlan === 0
        ? "Ingen spillere har en aktiv teknisk plan ennå — sett mål og periodisering i Workbench."
        : `${pl(medPlan, "spiller", "spillere")} med aktiv teknisk plan — juster mål, drills og periodisering samlet i Workbench.`;
  const innsikt = (
    <Link href="/admin/planlegge" style={{ textDecoration: "none" }}>
      <InnsiktChip cta="Planlegg i Workbench">{innsiktTekst}</InnsiktChip>
    </Link>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {kpi}
      {spillerListe}
      {malerListe}
      {innsikt}
    </div>
  );
}
