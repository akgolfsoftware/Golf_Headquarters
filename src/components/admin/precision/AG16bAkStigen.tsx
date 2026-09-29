"use client";

/**
 * AG-16b AK-stigen i Precision Athletics (tegnet i natt, AG-16b.jsx i Claude
 * Design 7d7c2994). Fire trinn: Mini, Basis, Utvikling, Elite. Knøtt (11-12 år)
 * er ikke et trinn (Anders 22.09.2026) og står sammen med WANG ved siden av stigen.
 * Data fra lastAkStigenData(); ingen tall regnes her.
 */
import { useState, type ReactNode } from "react";
import { GraduationCap, CircleAlert, Users } from "lucide-react";
import { Meta, StatusPille, KnappLenke, Knapp, TomTilstand, FeilTilstand, LasterTilstand } from "@/components/precision/pa";
import { Faner, Side, SideHode } from "@/components/precision/pa-a4";
import "@/styles/precision-a5.css";
import type { AkStigenData } from "@/lib/agencyos/ak-stigen-data";

export type AG16bStigeTilstand = "data" | "tom" | "laster" | "feil";
type Fane = "stigen" | "grupper" | "rydding";

function Seksjon({ k, meta, children }: { k: string; meta?: string; children: ReactNode }) {
  return <section aria-label={k} className="pa-card" style={{ padding: 16, gap: 8, minWidth: 0 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
      <span className="kicker" style={{ flex: "1 1 auto", minWidth: 0 }}>{k}</span>
      {meta && <Meta>{meta}</Meta>}
    </div>
    {children}
  </section>;
}

function Rad({ a, sub, b, forste }: { a: ReactNode; sub?: string | null; b?: ReactNode; forste?: boolean }) {
  return <div role="listitem" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 52, borderTop: forste ? "none" : "1px solid var(--border-hairline)", padding: "6px 0", minWidth: 0 }}>
    <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
      <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{a}</span>
      {sub && <Meta>{sub}</Meta>}
    </span>
    {b != null && <span style={{ font: "600 13px/1.3 var(--font-mono)", color: "var(--text-primary)", textAlign: "right", display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>{b}</span>}
  </div>;
}

const P = ({ children }: { children: ReactNode }) => <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{children}</p>;
const spillere = (n: number) => `${n} ${n === 1 ? "spiller" : "spillere"}`;

export function AG16bAkStigen({ tilstand, data }: { tilstand: AG16bStigeTilstand; data: AkStigenData | null }) {
  const [fane, setFane] = useState<Fane>("stigen");
  if (tilstand === "laster") return <Side max={1200}><SideHode kicker="Mer · Grupper" title="AK-stigen" /><LasterTilstand text="Henter AK-stigen …" /></Side>;
  if (tilstand === "feil") return <Side max={1200}><SideHode kicker="Mer · Grupper" title="AK-stigen" />
    <FeilTilstand icon={CircleAlert} title="AK-stigen kunne ikke hentes" text="Ingen grupper er endret. Prøv igjen." code="FEIL 503 · AK-STIGEN" /></Side>;
  if (tilstand === "tom" || !data) return <Side max={1200}><SideHode kicker="Mer · Grupper" title="AK-stigen" />
    <TomTilstand icon={GraduationCap} title="Ingen juniorgrupper i basen" text="De kanoniske GFGK-juniorgruppene finnes ikke i basen ennå."
      actions={<KnappLenke variant="secondary" href="/admin/grupper" icon={Users}>Åpne Grupper</KnappLenke>} /></Side>;

  const { trinn, grupper, vedSidenAv, rester, ukartlagt } = data;
  const utenGruppe = trinn.filter((t) => !t.gruppeNavn);
  const tomme = trinn.filter((t) => t.gruppeNavn && grupper[t.gruppeNavn] && grupper[t.gruppeNavn].medlemmer === 0);
  const totalt = Object.values(grupper).reduce((n, g) => n + g.medlemmer, 0) + vedSidenAv.reduce((n, g) => n + g.medlemmer, 0);
  const medGruppe = trinn.filter((t) => t.gruppeNavn && grupper[t.gruppeNavn]);

  return <Side max={1200}>
    <SideHode kicker="Mer · Grupper" title="AK-stigen" sub={`${trinn.length} trinn · ${totalt} spillere i gruppene`} />
    <Faner valgt={fane} onEndre={(v) => setFane(v as Fane)} faner={[
      { verdi: "stigen", navn: "AK-stigen" }, { verdi: "grupper", navn: "Grupper" }, { verdi: "rydding", navn: "Rydding", antall: rester.length || undefined },
    ]} />

    {fane === "stigen" && <div className="pa-a5-stack">
      {tomme.length > 0 && <Seksjon k="Én ting nå">
        <span style={{ font: "600 16px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{tomme.length} {tomme.length === 1 ? "juniorgruppe har" : "juniorgrupper har"} null medlemmer</span>
        <P>Treningene står i kalenderen uten at noen er meldt på.</P>
        <div><Knapp onClick={() => setFane("grupper")}>Se gruppene</Knapp></div>
      </Seksjon>}

      <Seksjon k="Stigen" meta={`${trinn.length} TRINN`}>
        <P>Fire trinn fra CANON, lagt over gruppene i basen. Øverst er Elite.</P>
        <div role="list" style={{ display: "flex", flexDirection: "column-reverse" }}>
          {trinn.map((t, i) => {
            const g = t.gruppeNavn ? grupper[t.gruppeNavn] : undefined;
            return <Rad key={t.navn} forste={i === trinn.length - 1}
              a={`${t.kode} · ${t.navn}`}
              sub={`${t.alder} · ${t.gruppeNavn || "ingen gruppe i basen"}`.toUpperCase()}
              b={<><span>{g ? g.medlemmer : "—"}</span><StatusPille tone={!g || g.medlemmer === 0 ? "warn" : "neutral"}>{g ? "Spillere" : "Mangler"}</StatusPille></>} />;
          })}
        </div>
      </Seksjon>

      {vedSidenAv.length > 0 && <Seksjon k="Ved siden av stigen" meta={`${vedSidenAv.length} GRUPPER`}>
        <P>Grupper uten eget trinn. WANG Toppidrett er neste steg etter Elite, og Knøtt er en aldersgruppe med egen gruppe, ikke et trinn i stigen.</P>
        <div role="list">{vedSidenAv.map((g, i) => <Rad key={g.id} forste={i === 0} a={g.navn} sub={[g.level, g.coachNavn].filter(Boolean).join(" · ").toUpperCase() || null} b={spillere(g.medlemmer)} />)}</div>
      </Seksjon>}

      {utenGruppe.length > 0 && <Seksjon k="Mangler gruppe"><P>{utenGruppe.map((t) => t.navn).join(", ")} finnes i AK-stigen, men har ingen gruppe i basen.</P></Seksjon>}
      {ukartlagt.length > 0 && <Seksjon k="Ikke koblet til et trinn"><P>{ukartlagt.map((g) => `«${g.navn}» (${spillere(g.medlemmer)})`).join(", ")} er ikke koblet til noe trinn i stigen.</P></Seksjon>}
      {tomme.length === 0 && utenGruppe.length === 0 && <div><KnappLenke variant="secondary" href="/admin/spillere?filter=junior" icon={Users}>Åpne i Spillere</KnappLenke></div>}
    </div>}

    {fane === "grupper" && <Seksjon k="Juniorgrupper" meta={`${medGruppe.length} GRUPPER`}>
      {medGruppe.length === 0 ? <P>De kanoniske GFGK-juniorgruppene finnes ikke i basen ennå.</P>
        : <div role="list">{medGruppe.map((t, i) => { const g = grupper[t.gruppeNavn]; return <Rad key={t.navn} forste={i === 0} a={t.gruppeNavn}
            sub={[g.coachNavn, ...g.tider].filter(Boolean).join(" · ").toUpperCase() || null} b={g.medlemmer > 0 ? spillere(g.medlemmer) : "Tom"} />; })}</div>}
    </Seksjon>}

    {fane === "rydding" && <Seksjon k="Grupper som bør ryddes" meta={rester.length ? `${rester.length} GRUPPER` : "INGEN"}>
      {rester.length === 0 ? <P>Ingen grupper uten medlemmer og uten timeplan akkurat nå.</P>
        : <div role="list">{rester.map((r, i) => <Rad key={r.id} forste={i === 0} a={r.navn} sub="0 MEDLEMMER · 0 TIMEPLANOPPFØRINGER" b={r.level ?? "—"} />)}</div>}
    </Seksjon>}
  </Side>;
}
