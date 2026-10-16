"use client";

/**
 * AG-20 Økonomi i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-mer.jsx, runde 30 — vinner over den eldre
 * AG-20.jsx fordi screen.html laster den sist). Bare for head coach (ADMIN) —
 * beslutninger.md §ØKONOMI BARE FOR HEAD COACH, WEDGE GATE TELLER TREFF …
 * (Anders 28.09.2026).
 *
 * Data uendret fra src/lib/admin/okonomi-data.ts (hentOkonomiFlate). Ingen
 * budsjettkilde eller per-virksomhet-fordeling finnes i dag (data.hull) —
 * tegningens tabell «Resultat mot budsjett per virksomhet» er derfor ikke
 * bygget; se PR-teksten §Parkert. Kroner leses fra Tripletex/Stripe, aldri
 * anslått.
 */
import { ExternalLink, FileSpreadsheet } from "lucide-react";
import { Sidehode, LasterTilstand, TomTilstand, FeilTilstand, Knapp, StatusPille, Meta } from "@/components/precision/pa";
import { Tabell, InlineVarsel, Kort, KortHode, type Kolonne } from "@/components/precision/pa-a5";
import type { AdminOkonomiV2Data, OkonomiFaktura, OkonomiTimeklipp } from "@/lib/admin/okonomi-data";
import { erForfalt, fmtKrNb, klippPrikker, ytdAvvikTekst, ytdAvvik } from "@/lib/admin/okonomi-visning";
import "@/styles/precision-a5.css";

export type AG20Tilstand = "data" | "tom" | "laster" | "feil";
export type AG20Props = { tilstand: AG20Tilstand; data: AdminOkonomiV2Data };

function YtdKort({ data }: { data: AdminOkonomiV2Data }) {
  const avvik = ytdAvvik(data.ytd.budsjettKr, data.ytd.resultatKr);
  return <Kort>
    <KortHode tittel={`Budsjett mot regnskap · hittil i ${data.aar}`} aside={data.tripletexKonfigurert ? "REGNSKAP FRA TRIPLETEX · ALDRI ANSLÅTT" : "TRIPLETEX IKKE KOBLET"} />
    <div className="pa-a5-stat-grid">
      <div className="pa-a5-stat"><span className="pa-a5-stat__label">Budsjett</span><span className="pa-a5-stat__value">{fmtKrNb(data.ytd.budsjettKr)}</span></div>
      <div className="pa-a5-stat"><span className="pa-a5-stat__label">Regnskap</span><span className="pa-a5-stat__value">{fmtKrNb(data.ytd.resultatKr)}</span></div>
    </div>
    <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)" }}>
      AVVIK MOT BUDSJETT: {ytdAvvikTekst(avvik).toUpperCase()}
    </span>
    {!data.hull.budsjettkilde && <InlineVarsel tone="info" tittel="Mangler">Ingen budsjettkilde er koblet ennå. Fordelingen på AK Golfs tjenester vises ikke før den finnes.</InlineVarsel>}
  </Kort>;
}

function FakturaTabell({ rader }: { rader: OkonomiFaktura[] }) {
  const cols: Kolonne<OkonomiFaktura>[] = [
    { key: "navn", label: "Navn", render: (r) => r.navn },
    { key: "beskrivelse", label: "Beskrivelse", render: (r) => r.beskrivelse ?? "—" },
    { key: "dato", label: "Dato", mono: true, render: (r) => r.dato },
    { key: "belop", label: "Beløp", mono: true, align: "right", render: (r) => fmtKrNb(r.belopKr) },
    { key: "status", label: "Status", render: (r) => <StatusPille tone={erForfalt(r.status) ? "warn" : r.status === "Betalt" ? "ok" : "neutral"}>{r.status}</StatusPille> },
  ];
  return <Tabell caption="Betalinger fra Stripe" columns={cols} rows={rader.map((r) => ({ ...r, id: r.id }))} tomTekst="Ingen fakturaer å vise." />;
}

function TimeklippListe({ rader }: { rader: OkonomiTimeklipp[] }) {
  return <Kort>
    <KortHode tittel="Timeklipp" aside="COACH · IKKE APP-NIVÅ" />
    {rader.length === 0 ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen klipp registrert.</p> : rader.map((k) => {
      const prikker = klippPrikker(k.brukt, k.totalt);
      return <div key={k.id} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 32 }}>
        <span style={{ flex: 1, font: "500 14px/1.3 var(--font-sans)", minWidth: 0 }}>{k.navn}</span>
        <span style={{ display: "flex", gap: 4 }} aria-hidden>{prikker.map((fylt, i) => <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: fylt ? "var(--text-primary)" : "var(--border-strong)" }} />)}</span>
        <span style={{ font: "var(--type-num-s)", color: "var(--text-muted)", width: 56, textAlign: "right" }}>{k.brukt} av {k.totalt}</span>
      </div>;
    })}
  </Kort>;
}

export function AG20Okonomi({ tilstand, data }: AG20Props) {
  return <div className="pa-side">
    <Sidehode kicker="Mer · Økonomi · bare head coach" title="Økonomi" sub="Kroner leses fra Tripletex og Stripe. Ingenting estimeres." />
    {tilstand === "laster" && <LasterTilstand text="Leser Tripletex-eksporten …" />}
    {tilstand === "feil" && <FeilTilstand icon={FileSpreadsheet} title="Tripletex-eksporten kunne ikke leses" text="Ingen tall er endret. Prøv igjen." code="TRIPLETEX · FEIL" />}
    {tilstand === "tom" && <TomTilstand icon={FileSpreadsheet} title="Ingen eksport lest ennå" text="Økonomitallene hentes fra Tripletex. Første eksport kommer om kort tid." />}
    {tilstand === "data" && <div className="pa-a5-stack">
      {!data.tripletexKonfigurert && <InlineVarsel tone="warn" tittel="Tripletex er ikke koblet">Resultattallet mangler til integrasjonen er satt opp i Oppsett.</InlineVarsel>}
      <div className="pa-a5-grid pa-a5-grid--2">
        <YtdKort data={data} />
        <FakturaTabell rader={data.fakturaer} />
      </div>
      <TimeklippListe rader={data.timeklipp} />
      <Meta>ALLE BELØP EKS. MVA · CREDITS = TIMEKLIPP, ALDRI APP-NIVÅ · FORFALT LESES FRA STRIPE</Meta>
      <div><Knapp variant="secondary" icon={ExternalLink} iconName="external-link" onClick={() => window.open(data.stripeHref, "_blank", "noopener,noreferrer")}>Åpne Stripe</Knapp></div>
    </div>}
  </div>;
}
