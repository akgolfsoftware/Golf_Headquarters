"use client";

/**
 * AK Golf HQ v2 — /stats/spillere (retning C, mørk).
 * Swap av (mlegacy)/stats/spillere/page.tsx → v2-utseende. Data-lag
 * (hentSideData/hentAarganger, parseKlubb, formaterTierLabel) videreført 1:1
 * fra legacy-siden; kun presentasjonen er byttet til StatsRamme/StatsListe +
 * v2-komponenter. Søk/filter er fortsatt Link/GET-basert (samme URL-kontrakt).
 */
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, TomTilstand } from "@/components/v2";
import { StatsRamme, StatsListe, useMobile } from "./stats-ramme";
import { MCta } from "./marked-ramme";

export type Spiller = {
  id: string;
  slug: string;
  name: string;
  birthYear: number | null;
  tier: string;
  bio: string | null;
  _count: { entries: number };
};

function parseKlubb(bio: string | null): string | null {
  if (!bio) return null;
  const match = bio.match(/[Kk]lubb:\s*([^\n.]+)/);
  return match ? match[1].trim() : null;
}

function formaterTierLabel(tier: string): string {
  switch (tier) {
    case "amateur":  return "Amatør";
    case "junior":   return "Junior";
    case "pro-pga":  return "PRO PGA";
    case "pro-dp":   return "DP World";
    case "pro-lpga": return "LPGA";
    case "college":  return "College";
    default:         return tier.charAt(0).toUpperCase() + tier.slice(1);
  }
}

function Avatar({ navn }: { navn: string }) {
  const initialer = navn.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");
  return (
    <div style={{ width: 36, height: 36, minWidth: 36, borderRadius: "50%", background: T.panel2, border: `1px solid ${T.borderS}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: T.lime }}>
      {initialer}
    </div>
  );
}

function SpillerTabellRad({ rank, s }: { rank: number; s: Spiller }) {
  const klubb = parseKlubb(s.bio);
  return (
    <tr>
      <td style={{ padding: "12px 10px", fontFamily: T.mono, fontSize: 12, color: T.mut, borderBottom: `1px solid ${T.border}`, width: 40 }}>{rank}</td>
      <td style={{ padding: "12px 10px", borderBottom: `1px solid ${T.border}` }}>
        <Link href={`/stats/spillere/${s.slug}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: T.fg, fontFamily: T.ui, fontSize: 13.5, fontWeight: 600 }}>
          <Avatar navn={s.name} />
          {s.name}
        </Link>
      </td>
      <td style={{ padding: "12px 10px", borderBottom: `1px solid ${T.border}`, fontFamily: T.ui, fontSize: 13, color: T.fg2 }}>{klubb ?? "—"}</td>
      <td style={{ padding: "12px 10px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: 11, color: T.fg2 }}>{formaterTierLabel(s.tier)}</td>
      <td style={{ padding: "12px 10px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: 12, color: T.fg2, textAlign: "right" }}>{s.birthYear ?? "—"}</td>
      <td style={{ padding: "12px 10px", borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: 12, color: T.fg, textAlign: "right", fontWeight: 600 }}>{s._count.entries}</td>
    </tr>
  );
}

function SpillerKort({ s }: { s: Spiller }) {
  const klubb = parseKlubb(s.bio);
  const alder = s.birthYear ? new Date().getFullYear() - s.birthYear : null;
  return (
    <Link href={`/stats/spillere/${s.slug}`} style={{ textDecoration: "none" }} aria-label={`Se profil for ${s.name}`}>
      <Kort hover style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 168 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar navn={s.name} />
          <div>
            <div style={{ fontFamily: T.disp, fontSize: 15.5, fontWeight: 600, color: T.fg }}>{s.name}</div>
            <div style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, marginTop: 2 }}>
              {[alder ? `${alder} år` : null, klubb].filter(Boolean).join(" · ")}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.lime, background: T.panel2, borderRadius: 999, padding: "3px 10px" }}>
            {formaterTierLabel(s.tier)}
          </span>
          {s.birthYear && (
            <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut, border: `1px solid ${T.border}`, borderRadius: 999, padding: "3px 10px" }}>
              {s.birthYear}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 6, borderTop: `1px solid ${T.border}` }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>Turneringer</div>
            <div style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: T.fg }}>{s._count.entries}</div>
          </div>
          <Icon name="arrow-right" size={15} style={{ color: T.mut }} />
        </div>
      </Kort>
    </Link>
  );
}

export interface StatsSpillereV2Props {
  q?: string;
  aar?: string;
  tier?: string;
  view: string;
  side: number;
  totalSpillere: number;
  totalTurneringer: number;
  totalResultater: number;
  spillere: Spiller[];
  topp20: Spiller[];
  harFilter: boolean;
  PAGE_SIZE: number;
  aarganger: number[];
}

export function StatsSpillereV2({ q, aar, tier, view, side, totalSpillere, totalResultater, spillere, topp20, harFilter, PAGE_SIZE, aarganger }: StatsSpillereV2Props) {
  const mobile = useMobile();

  function buildUrl(overrides: Record<string, string | undefined>): string {
    const base: Record<string, string> = {};
    if (q) base.q = q;
    if (aar) base.aar = aar;
    if (tier) base.tier = tier;
    if (view !== "grid") base.view = view;
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined) delete base[k];
      else base[k] = v;
    });
    const s = new URLSearchParams(base).toString();
    return `/stats/spillere${s ? `?${s}` : ""}`;
  }

  const TIER_CHIPS = [
    { id: "alle", label: "Alle" },
    { id: "pro", label: "Pro" },
    { id: "college", label: "College" },
    { id: "amateur", label: "Amatør" },
    { id: "junior", label: "Junior" },
  ];
  const aktivTier = tier && tier !== "alle" ? tier : "alle";
  const visTabell = view === "tabell";

  return (
    <StatsRamme mobile={mobile} aktiv="spillere">
      <StatsListe
        mobile={mobile}
        eyebrow="AK Golf Stats · Norsk golfdatabase"
        tittel="Alle norske golfspillere."
        tittelEm="Ett sted."
        lede={`${totalSpillere.toLocaleString("nb-NO")}+ spillere · ${totalResultater.toLocaleString("nb-NO")}+ turneringsresultater siden 2016 · oppdateres månedlig.`}
      >
        {/* SØK */}
        <form id="søk" method="GET" style={{ maxWidth: 520, marginBottom: 20, position: "relative" }}>
          {aar && <input type="hidden" name="aar" value={aar} />}
          {tier && <input type="hidden" name="tier" value={tier} />}
          {view !== "grid" && <input type="hidden" name="view" value={view} />}
          <Icon name="search" size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.mut }} />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Søk etter navn, for eksempel «Hovland» eller «Bærum GK»…"
            autoComplete="off"
            aria-label="Søk etter norsk golfspiller"
            style={{
              width: "100%",
              boxSizing: "border-box",
              appearance: "none",
              background: T.panel2,
              border: `1px solid ${T.borderS}`,
              borderRadius: 9999,
              padding: "11px 16px 11px 40px",
              fontFamily: T.ui,
              fontSize: 13.5,
              color: T.fg,
              outline: "none",
            }}
          />
        </form>

        {/* Tier + årgang filter */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, marginRight: 4 }}>Tier</span>
            {TIER_CHIPS.map((c) => {
              const on = aktivTier === c.id;
              return (
                <Link
                  key={c.id}
                  href={buildUrl({ tier: c.id === "alle" ? undefined : c.id, side: undefined })}
                  aria-pressed={on}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontFamily: T.ui,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: on ? T.fg : T.fg2,
                    background: on ? T.panel2 : "transparent",
                    border: `1px solid ${on ? T.borderS : "transparent"}`,
                    borderRadius: 999,
                    padding: "6px 13px",
                    textDecoration: "none",
                  }}
                >
                  {c.label}
                </Link>
              );
            })}
          </div>
          {aarganger.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, marginRight: 4 }}>Årgang</span>
              <Link href={buildUrl({ aar: undefined, side: undefined })} aria-pressed={!aar} style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: !aar ? T.fg : T.fg2, background: !aar ? T.panel2 : "transparent", border: `1px solid ${!aar ? T.borderS : "transparent"}`, borderRadius: 999, padding: "6px 13px", textDecoration: "none" }}>
                Alle
              </Link>
              {aarganger.map((y) => {
                const on = aar === String(y);
                return (
                  <Link key={y} href={buildUrl({ aar: String(y), side: undefined })} aria-pressed={on} style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: on ? T.fg : T.fg2, background: on ? T.panel2 : "transparent", border: `1px solid ${on ? T.borderS : "transparent"}`, borderRadius: 999, padding: "6px 13px", textDecoration: "none" }}>
                    {y}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Resultat-header + view-toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
          <span style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>
            {harFilter ? `${spillere.length} treff${spillere.length === PAGE_SIZE ? ` (side ${side})` : ""}` : `Viser ${spillere.length} av ${totalSpillere.toLocaleString("nb-NO")} spillere`}
          </span>
          <div style={{ display: "flex", border: `1px solid ${T.borderS}`, borderRadius: 999, overflow: "hidden" }} role="group" aria-label="Visningsmodus">
            {[{ id: "grid", l: "Kort" }, { id: "tabell", l: "Tabell" }].map((v) => {
              const on = v.id === "grid" ? !visTabell : visTabell;
              return (
                <Link key={v.id} href={buildUrl({ view: v.id })} aria-pressed={on} style={{ padding: "7px 16px", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: on ? T.onLime : T.fg2, background: on ? T.lime : "transparent", textDecoration: "none" }}>
                  {v.l}
                </Link>
              );
            })}
          </div>
        </div>

        {spillere.length === 0 ? (
          <Kort>
            <TomTilstand icon="users" title="Ingen spillere funnet" sub="Prøv et annet søkeord eller fjern filtrene." />
          </Kort>
        ) : visTabell ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }} aria-label="Spillerliste">
              <thead>
                <tr>
                  {["#", "Spiller", "Klubb", "Tier", "Årsklasse", "Turneringer"].map((h, i) => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: i >= 4 ? "right" : "left", fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, borderBottom: `1px solid ${T.borderS}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {spillere.map((s, i) => (
                  <SpillerTabellRad key={s.id} rank={(side - 1) * PAGE_SIZE + i + 1} s={s} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap }}>
            {spillere.map((s) => (
              <SpillerKort key={s.id} s={s} />
            ))}
          </div>
        )}

        {spillere.length === PAGE_SIZE && (
          <div style={{ display: "flex", gap: 8, marginTop: 32, justifyContent: "center" }}>
            {side > 1 && (
              <Link href={buildUrl({ side: String(side - 1) })} style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg2, border: `1px solid ${T.borderS}`, borderRadius: 999, padding: "8px 16px", textDecoration: "none" }}>
                ← Forrige
              </Link>
            )}
            <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.onLime, background: T.lime, borderRadius: 999, padding: "8px 16px" }}>Side {side}</span>
            <Link href={buildUrl({ side: String(side + 1) })} style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg2, border: `1px solid ${T.borderS}`, borderRadius: 999, padding: "8px 16px", textDecoration: "none" }}>
              Neste →
            </Link>
          </div>
        )}
      </StatsListe>

      {/* TOPP 20 — kun uten aktivt søk */}
      {!harFilter && topp20.length > 0 && (
        <StatsListe mobile={mobile} eyebrow="Akkurat nå" tittel="Topp 20." tittelEm="norske spillere">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }} aria-label="Topp 20 norske spillere">
              <thead>
                <tr>
                  {["#", "Spiller", "Klubb", "Tier", "Årsklasse", "Turneringer"].map((h, i) => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: i >= 4 ? "right" : "left", fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, borderBottom: `1px solid ${T.borderS}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topp20.map((s, i) => (
                  <SpillerTabellRad key={s.id} rank={i + 1} s={s} />
                ))}
              </tbody>
            </table>
          </div>
        </StatsListe>
      )}

      {/* MERSALG */}
      <div style={{ padding: mobile ? "0 22px 64px" : "0 64px 96px" }}>
        <Kort tint pad={mobile ? "26px 22px" : "40px 44px"} style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.2fr 1fr", gap: 32 }}>
          <div>
            <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.lime }}>Din egen utvikling</span>
            <div style={{ fontFamily: T.disp, fontSize: mobile ? 26 : 32, fontWeight: 700, color: T.fg, marginTop: 12, letterSpacing: "-0.02em" }}>
              Vil <em style={{ fontStyle: "italic", color: T.lime }}>du</em> være i databasen?
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.6, margin: "14px 0 0", maxWidth: 460 }}>
              Spiller du Srixon Tour, OLYO eller Norges Cup? Du er sannsynligvis allerede her. Spillere som vil logge egne runder og se sin egen SG-profil over tid, gjør det i PlayerHQ.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
              <MCta ghost href="#søk">Sjekk om jeg er her</MCta>
              <MCta icon="arrow-right" href="/playerhq">Prøv PlayerHQ gratis</MCta>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.fg, marginBottom: 10 }}>PlayerHQ inkluderer</div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {["Logg og analyser dine egne runder", "Se Strokes Gained-utvikling over tid", "AI-coach-analyser basert på ditt spill", "Sammenlign deg med andre norske spillere"].map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>
                  <Icon name="check" size={13} style={{ color: T.lime, flex: "none", marginTop: 3 }} />
                  {f}
                </li>
              ))}
            </ul>
            <div style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, marginTop: 16 }}>
              Fra <strong>299 kr/mnd</strong> · Gratis de første 30 dagene
            </div>
          </div>
        </Kort>
      </div>

      {/* GDPR */}
      <div style={{ padding: mobile ? "0 22px 48px" : "0 64px 64px" }}>
        <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.6, margin: 0, textAlign: "center" }}>
          Alle resultater her er hentet fra offentlige turneringer publisert av forbundene. Er du, eller har du foreldreansvar for, en spiller som ikke ønsker å være i databasen?{" "}
          <a
            href={`mailto:akgolfgroup@gmail.com?subject=${encodeURIComponent("GDPR slett: Spillerprofil")}&body=${encodeURIComponent("Hei,\n\nJeg ønsker å få slettet informasjon fra AK Golf Stats-databasen.\n\nMvh")}`}
            style={{ color: T.lime, textDecoration: "none" }}
          >
            Klikk her for å be om sletting →
          </a>
        </p>
      </div>
    </StatsRamme>
  );
}
