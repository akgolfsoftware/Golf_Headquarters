"use client";

/**
 * AK Golf HQ v2 — markedsside COACHER-LISTE (/coacher), retning C, mørk.
 * Bruker delt marked-ramme (marked-ramme.tsx) — IKKE M1–M4-mønsteret med
 * lokal MRamme. Ekte copy speilet fra (mlegacy)/coacher/page.tsx. Data
 * (DB-foto-berikelse) hentes server-side i page.tsx og sendes inn som prop.
 */
import Image from "next/image";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, Caps } from "@/components/v2";
import { MRamme, Eyebrow, HeroT, SeksT, Lede, MCta, Seksjon, useMobile } from "./marked-ramme";

export type CoachKort = {
  slug: string;
  navn: string;
  tittel: string;
  bio: string;
  initialer: string;
  foto: string | null;
  tags: string[];
};

type Fasilitet = {
  type: string;
  navn: string;
  beskrivelse: string;
  feats: string[];
};

const FASILITETER: Fasilitet[] = [
  {
    type: "Innendørs",
    navn: "Mulligan Indoor Golf",
    beskrivelse:
      "TrackMan-simulatorer i Fredrikstad og Sarpsborg. Datadrevet trening og videoanalyse, åpent hele året.",
    feats: ["TrackMan", "Videoanalyse", "Årsåpent"],
  },
  {
    type: "Utendørs",
    navn: "Gamle Fredrikstad GK",
    beskrivelse:
      "Driving range, nærspill-områder og bane. Hovedanlegg for AK Golf Academy gjennom sesongen.",
    feats: ["Driving range", "Nærspill", "Bane"],
  },
];

export function MarkedCoacherListeV2({ coacher }: { coacher: CoachKort[] }) {
  const mobile = useMobile();
  return (
    <MRamme mobile={mobile} aktiv="coacher">
      {/* Hero */}
      <Seksjon mobile={mobile}>
        <Eyebrow>Coachene · AK Golf Academy</Eyebrow>
        <HeroT mobile={mobile} em="coachene">Møt</HeroT>
        <Lede style={{ marginTop: 22 }}>
          To trenere som utfyller hverandre. Felles plattform, samme forventning til kvalitet og oppfølging.
        </Lede>
      </Seksjon>

      {/* Coach-kort */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: T.gap }}>
          {coacher.map((c) => (
            <CoachCard key={c.slug} c={c} />
          ))}
        </div>
      </Seksjon>

      {/* Hvor vi trener */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <Caps>Hvor vi trener</Caps>
        <div style={{ marginTop: 14 }}>
          <SeksT mobile={mobile} em="fasiliteter">Anlegg &amp;</SeksT>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: T.gap, marginTop: 24 }}>
          {FASILITETER.map((f) => (
            <Kort key={f.navn} pad="24px" hover>
              <span
                style={{
                  display: "inline-flex",
                  width: "fit-content",
                  fontFamily: T.mono,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: T.mut,
                }}
              >
                {f.type}
              </span>
              <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, color: T.fg, marginTop: 8, letterSpacing: "-0.015em" }}>
                {f.navn}
              </span>
              <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55, margin: "8px 0 0" }}>{f.beskrivelse}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                {f.feats.map((x) => (
                  <span
                    key={x}
                    style={{
                      fontFamily: T.mono,
                      fontSize: 9,
                      fontWeight: 700,
                      color: T.fg2,
                      background: T.panel2,
                      border: `1px solid ${T.border}`,
                      borderRadius: 9999,
                      padding: "3px 9px",
                    }}
                  >
                    {x}
                  </span>
                ))}
              </div>
            </Kort>
          ))}
        </div>
        <div style={{ marginTop: 18 }}>
          <MCta ghost small icon="arrow-right" href="/anlegg">
            Se alle anlegg
          </MCta>
        </div>
      </Seksjon>

      {/* Closing CTA */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 20 : 32 }}>
        <Kort tint pad={mobile ? "26px 22px" : "36px 40px"}>
          <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", alignItems: mobile ? "flex-start" : "center", gap: 20 }}>
            <div style={{ flex: 1 }}>
              <SeksT mobile={mobile} em="oss">Tren med</SeksT>
              <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 480 }}>
                Book en økt med Anders eller Markus. Er du usikker på hvor du bør starte, ta kontakt, så finner vi ut av det sammen.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <MCta icon="arrow-right" href="/booking">
                Book en økt
              </MCta>
              <MCta ghost href="/kontakt">
                Kontakt oss
              </MCta>
            </div>
          </div>
        </Kort>
      </Seksjon>
    </MRamme>
  );
}

function CoachCard({ c }: { c: CoachKort }) {
  const rolleKort = c.tittel.split("·")[0]?.trim() ?? c.tittel;
  return (
    <Link href={`/coacher/${c.slug}`} style={{ textDecoration: "none" }}>
      <Kort pad="0" hover style={{ overflow: "hidden" }}>
        <div style={{ position: "relative", aspectRatio: "3 / 4", width: "100%", background: T.panel2 }}>
          {c.foto ? (
            <Image src={c.foto} alt={c.navn} fill sizes="(max-width: 860px) 100vw, 440px" style={{ objectFit: "cover" }} />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(160deg, ${T.forest} 0%, color-mix(in srgb, ${T.forest} 55%, ${T.panel}) 45%, ${T.panel} 100%)`,
              }}
            >
              <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 64, letterSpacing: "-0.02em", color: T.lime }}>
                {c.initialer}
              </span>
            </div>
          )}
          <div
            aria-hidden
            style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.75) 100%)" }}
          />
          <span
            style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              display: "inline-flex",
              alignItems: "center",
              fontFamily: T.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: T.onLime,
              background: T.lime,
              borderRadius: 9999,
              padding: "5px 10px",
            }}
          >
            {rolleKort}
          </span>
        </div>
        <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 21, color: T.fg, letterSpacing: "-0.015em" }}>{c.navn}</span>
          <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: T.mut, marginTop: 4 }}>
            {c.tittel}
          </span>
          <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.55, margin: "12px 0 0" }}>{c.bio}</p>
          {c.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
              {c.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: T.mono,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: T.lime,
                    background: "color-mix(in srgb, " + T.lime + " 12%, transparent)",
                    borderRadius: 9999,
                    padding: "4px 10px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.lime, marginTop: 18 }}>
            Les mer
            <Icon name="arrow-right" size={14} />
          </span>
        </div>
      </Kort>
    </Link>
  );
}
