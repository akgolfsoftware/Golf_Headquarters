"use client";

/**
 * AK Golf HQ v2 — markedsside ANLEGG-LISTE (/anlegg), retning C, mørk.
 * Ekte copy speilet fra (mlegacy)/anlegg/page.tsx. Data (DB-lokasjoner)
 * hentes server-side i page.tsx og sendes inn som prop.
 */
import Image from "next/image";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, Caps } from "@/components/v2";
import { MRamme, Eyebrow, HeroT, SeksT, Lede, MCta, Seksjon, useMobile } from "./marked-ramme";

export type AnleggLocation = {
  id: string;
  slug: string;
  name: string;
  address: string;
  facilities: { id: string; name: string; isIndoor: boolean }[];
};

const HERO_IMAGES: Record<string, string> = {
  "gamle-fredrikstad-gk": "/images/anlegg/gfgk-1.jpg",
  "miklagard-golfklubb": "/images/anlegg/miklagard-1.jpg",
  default: "/images/akademy/utslag-fairway.jpg",
};

const MULLIGAN = {
  navn: "Mulligan Indoor Golf",
  foto: "/images/akademy/putting-data.jpg",
  fotoAlt: "Datadrevet trening med målepinner og instrumenter",
  steder: [
    { navn: "Produksjonsveien 21", by: "Fredrikstad" },
    { navn: "Bjørnstadveien 12", by: "Sarpsborg" },
  ],
};

export function MarkedAnleggListeV2({ locations }: { locations: AnleggLocation[] }) {
  const mobile = useMobile();
  return (
    <MRamme mobile={mobile} aktiv="anlegg">
      {/* Hero */}
      <Seksjon mobile={mobile}>
        <Eyebrow>Anlegg · AK Golf Group</Eyebrow>
        <HeroT mobile={mobile} em="ute og inne">Hjemmebaner,</HeroT>
        <Lede style={{ marginTop: 22 }}>
          Gamle Fredrikstad Golfklubb og Miklagard Golfklubb ute, Mulligan Indoor Golf med TrackMan-simulatorer inne. Samme coach, samme plan, sømløs booking.
        </Lede>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 26 }}>
          <MCta icon="arrow-right" href="/booking">
            Book en økt
          </MCta>
          <MCta ghost href="/kontakt">
            Kontakt oss
          </MCta>
        </div>
      </Seksjon>

      {/* Anlegg-grid */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <Caps>Hovedanlegg · Østlandet</Caps>
        <div style={{ marginTop: 14 }}>
          <SeksT mobile={mobile} em="anlegg">Velg ditt</SeksT>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(2, 1fr)", gap: T.gap, marginTop: 24 }}>
          {locations.map((loc) => (
            <Link key={loc.id} href={`/anlegg/${loc.slug}`} style={{ textDecoration: "none" }}>
              <Kort pad="0" hover style={{ overflow: "hidden" }}>
                <div style={{ position: "relative", aspectRatio: "16 / 10", width: "100%", background: T.panel2 }}>
                  <Image
                    src={HERO_IMAGES[loc.slug] ?? HERO_IMAGES.default}
                    alt={`Bilde fra ${loc.name}`}
                    fill
                    sizes="(max-width: 860px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div style={{ padding: 24 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut }}>
                    <Icon name="sprout" size={13} style={{ color: T.mut }} />
                    Bane · {loc.facilities.length} {loc.facilities.length === 1 ? "fasilitet" : "fasiliteter"}
                  </span>
                  <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 21, color: T.fg, marginTop: 8, letterSpacing: "-0.015em" }}>{loc.name}</div>
                  <p style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: T.ui, fontSize: 13, color: T.fg2, margin: "6px 0 0" }}>
                    <Icon name="map-pin" size={13} style={{ color: T.lime, flex: "none" }} />
                    {loc.address}
                  </p>
                  {loc.facilities.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
                      {loc.facilities.map((f, i) => (
                        <div
                          key={f.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 0",
                            fontFamily: T.ui,
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: T.fg2,
                            borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
                          }}
                        >
                          <Icon name={f.isIndoor ? "building-2" : "sprout"} size={13} style={{ color: T.lime, flex: "none" }} />
                          {f.name}
                          <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut }}>
                            {f.isIndoor ? "Inne" : "Ute"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.lime, marginTop: 14 }}>
                    Se anlegget
                    <Icon name="arrow-right" size={14} />
                  </span>
                </div>
              </Kort>
            </Link>
          ))}

          {/* Mulligan Indoor Golf — kuratert kort (ingen detaljside ennå) */}
          <Kort pad="0" hover style={{ overflow: "hidden" }}>
            <div style={{ position: "relative", aspectRatio: "16 / 10", width: "100%", background: T.panel2 }}>
              <Image src={MULLIGAN.foto} alt={MULLIGAN.fotoAlt} fill sizes="(max-width: 860px) 100vw, 50vw" style={{ objectFit: "cover" }} />
            </div>
            <div style={{ padding: 24 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut }}>
                <Icon name="building-2" size={13} style={{ color: T.mut }} />
                Inne · TrackMan-simulatorer
              </span>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 21, color: T.fg, marginTop: 8, letterSpacing: "-0.015em" }}>{MULLIGAN.navn}</div>
              <p style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: T.ui, fontSize: 13, color: T.fg2, margin: "6px 0 0" }}>
                <Icon name="map-pin" size={13} style={{ color: T.lime, flex: "none" }} />
                Fredrikstad og Sarpsborg, årsåpent
              </p>
              <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
                {MULLIGAN.steder.map((sted, i) => (
                  <div
                    key={sted.navn}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 0",
                      fontFamily: T.ui,
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: T.fg2,
                      borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
                    }}
                  >
                    <Icon name="building-2" size={13} style={{ color: T.lime, flex: "none" }} />
                    {sted.navn} · {sted.by}
                    <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut }}>Inne</span>
                  </div>
                ))}
              </div>
              <Link href="/booking" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.lime, marginTop: 14, textDecoration: "none" }}>
                Book simulatortid
                <Icon name="arrow-right" size={14} />
              </Link>
            </div>
          </Kort>
        </div>
      </Seksjon>

      {/* Closing CTA */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 20 : 32 }}>
        <Kort tint pad={mobile ? "26px 22px" : "36px 40px"}>
          <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", alignItems: mobile ? "flex-start" : "center", gap: 20 }}>
            <div style={{ flex: 1 }}>
              <SeksT mobile={mobile} em="trene">Klar til å</SeksT>
              <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 480 }}>
                Book en økt på GFGK, Miklagard eller hos Mulligan. Samme coach og samme plan uansett hvor du trener.
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
