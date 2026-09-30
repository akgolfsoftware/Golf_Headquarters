/**
 * PH-22 Caddie · Foreslå turnering (/portal/ai/foresla-turnering) — Precision Athletics.
 *
 * Tegningen PH-22 (Claude Design 7d7c2994) viser bare chatten. Denne flaten er den
 * andre ruten skjermlisten knytter til PH-22 og er bygd av samme byggeklosser:
 * sidehode, kort, statuspiller og meta-tekst. Rangeringen er uendret (påmeldinger
 * og katalog, ingen oppdiktede sannsynligheter). Forslagene er bare forslag:
 * ingenting meldes på herfra.
 */
import Link from "next/link";
import { ChevronRight, MapPin, Trophy } from "lucide-react";
import { Ikon, KnappLenke, Meta, StatusPille, TomTilstand } from "@/components/precision/pa";
import { SideHode, Side, Stabel, Kort } from "@/components/precision/pa-a4";

export type TurneringsForslag = {
  id: string;
  href: string;
  day: string;
  month: string;
  badge: string;
  statusLabel: string;
  statusTone: "enrolled" | "recommended" | "stretch";
  name: string;
  venue: string | null;
  meta: string[];
  why: string;
};
export type PH22TurneringsforslagProps = {
  hcpLabel: string;
  catalogCount: number;
  suggestions: TurneringsForslag[];
};

const TONE = { enrolled: "ok", recommended: "neutral", stretch: "warn" } as const;

export function PH22Turneringsforslag({ hcpLabel, catalogCount, suggestions }: PH22TurneringsforslagProps) {
  return <Side max={880}>
    <SideHode kicker="Meg · Caddie" title="Foreslå turnering"
      sub="Vurdert mot handicapet ditt og turneringene du allerede er påmeldt."
      actions={<KnappLenke variant="secondary" href="/portal/tren/turneringer">Se turneringer</KnappLenke>} />
    <Meta>{catalogCount > 0 ? `VURDERT MOT ${catalogCount} KOMMENDE TURNERINGER · HCP ${hcpLabel}` : "INGEN KOMMENDE TURNERINGER I KATALOGEN ENNÅ"}</Meta>
    {suggestions.length === 0
      ? <Kort><TomTilstand icon={Trophy} title="Ingen forslag ennå" text="Når turneringer passer nivået ditt, dukker de opp her."
        actions={<KnappLenke href="/portal/tren/turneringer">Se turneringer</KnappLenke>} /></Kort>
      : <Stabel gap={12}>
        {suggestions.map((t) => <Link key={t.id} href={t.href} className="pa-card" style={{ display: "grid", gridTemplateColumns: "48px minmax(0,1fr) auto", gap: 12, alignItems: "start", padding: 16, textDecoration: "none", color: "inherit", minHeight: 44, minWidth: 0 }}>
          <span style={{ display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid var(--border-hairline)", borderRadius: 8, padding: "6px 0", background: "var(--surface-flat)" }}>
            <span style={{ font: "var(--type-num)", fontVariantNumeric: "tabular-nums", color: "var(--text-primary)" }}>{t.day}</span>
            <Meta>{t.month.toUpperCase()}</Meta>
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><StatusPille tone={TONE[t.statusTone]}>{t.statusLabel}</StatusPille><Meta>{t.badge.toUpperCase()}</Meta></span>
            <span style={{ font: "500 15px/1.35 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{t.name}</span>
            {(t.venue || t.meta.length > 0) && <span style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {t.venue && <Meta><span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><Ikon icon={MapPin} size={12} />{t.venue.toUpperCase()}</span></Meta>}
              {t.meta.map((m) => <Meta key={m}>{m.toUpperCase()}</Meta>)}
            </span>}
            <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty", overflowWrap: "anywhere" }}>{t.why}</span>
          </span>
          <span style={{ color: "var(--text-muted)", paddingTop: 2 }}><Ikon icon={ChevronRight} size={18} /></span>
        </Link>)}
      </Stabel>}
  </Side>;
}
