/**
 * AK Golf HQ — markedsside ANLEGG-LISTE (/anlegg), Paper.
 * Fasit: designsystem/paper/fase2/marketing/marketing-katalog.html.
 * Ekte copy speilet fra (mlegacy)/anlegg/page.tsx. Data (DB-lokasjoner)
 * hentes server-side i page.tsx og sendes inn som prop.
 */
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/v2";
import { PkShell } from "./kit/PkShell";
import { PkSek, PkEyebrow, PkHero, PkIng, PkSekt, PkCta, PkKat, PkKort } from "./kit/PkPrimitives";

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
  return (
    <PkShell aktiv="/anlegg" dataSlug="marketing-anlegg-liste">
      <PkSek>
        <PkEyebrow>Anlegg · AK Golf Group</PkEyebrow>
        <PkHero>Hjemmebaner, ute og inne</PkHero>
        <PkIng>
          Gamle Fredrikstad Golfklubb og Miklagard Golfklubb ute, Mulligan Indoor Golf med
          TrackMan-simulatorer inne. Samme coach, samme plan, sømløs booking.
        </PkIng>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <PkCta href="/booking" clay>
            Book en økt
          </PkCta>
          <PkCta href="/kontakt" ghost icon={null}>
            Kontakt oss
          </PkCta>
        </div>
      </PkSek>

      <PkSek notop>
        <PkEyebrow>Hovedanlegg · Østlandet</PkEyebrow>
        <div style={{ marginTop: 12 }}>
          <PkSekt>Velg ditt anlegg</PkSekt>
        </div>
        <PkKat>
          {locations.map((loc) => (
            <Link key={loc.id} href={`/anlegg/${loc.slug}`} className="pk-kort pk-kort-hover">
              <div style={{ position: "relative", aspectRatio: "16 / 10", width: "100%", background: "var(--tl-dock)" }}>
                <Image
                  src={HERO_IMAGES[loc.slug] ?? HERO_IMAGES.default}
                  alt={`Bilde fra ${loc.name}`}
                  fill
                  sizes="(max-width: 860px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="pk-kort-body">
                <span className="pk-meta" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="sprout" size={13} />
                  Bane · {loc.facilities.length} {loc.facilities.length === 1 ? "fasilitet" : "fasiliteter"}
                </span>
                <span className="pk-navn">{loc.name}</span>
                <p style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="map-pin" size={13} style={{ color: "var(--tl-warm)", flex: "none" }} />
                  {loc.address}
                </p>
                {loc.facilities.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
                    {loc.facilities.map((f, i) => (
                      <div
                        key={f.id}
                        className="pk-linje"
                        style={{ borderTop: i === 0 ? "none" : "1px solid var(--tl-hair)", borderBottom: "none" }}
                      >
                        <Icon name={f.isIndoor ? "building-2" : "sprout"} size={13} style={{ color: "var(--tl-warm)", flex: "none" }} />
                        {f.name}
                        <span className="pk-v" style={{ fontFamily: "var(--tl-font-mono)", fontSize: 10, textTransform: "uppercase" }}>
                          {f.isIndoor ? "Inne" : "Ute"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <span className="pk-lesmer">Se anlegget →</span>
              </div>
            </Link>
          ))}

          {/* Mulligan Indoor Golf — kuratert kort (ingen detaljside ennå) */}
          <div className="pk-kort">
            <div style={{ position: "relative", aspectRatio: "16 / 10", width: "100%", background: "var(--tl-dock)" }}>
              <Image src={MULLIGAN.foto} alt={MULLIGAN.fotoAlt} fill sizes="(max-width: 860px) 100vw, 50vw" style={{ objectFit: "cover" }} />
            </div>
            <div className="pk-kort-body">
              <span className="pk-meta" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="building-2" size={13} />
                Inne · TrackMan-simulatorer
              </span>
              <span className="pk-navn">{MULLIGAN.navn}</span>
              <p style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="map-pin" size={13} style={{ color: "var(--tl-warm)", flex: "none" }} />
                Fredrikstad og Sarpsborg, årsåpent
              </p>
              <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
                {MULLIGAN.steder.map((sted, i) => (
                  <div
                    key={sted.navn}
                    className="pk-linje"
                    style={{ borderTop: i === 0 ? "none" : "1px solid var(--tl-hair)", borderBottom: "none" }}
                  >
                    <Icon name="building-2" size={13} style={{ color: "var(--tl-warm)", flex: "none" }} />
                    {sted.navn} · {sted.by}
                    <span className="pk-v" style={{ fontFamily: "var(--tl-font-mono)", fontSize: 10, textTransform: "uppercase" }}>
                      Inne
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/booking" className="pk-lesmer" style={{ textDecoration: "none" }}>
                Book simulatortid →
              </Link>
            </div>
          </div>
        </PkKat>
      </PkSek>

      <PkSek notop>
        <PkKort tint>
          <div className="pk-kort-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <PkSekt>Klar til å trene?</PkSekt>
            <p style={{ fontFamily: "var(--tl-font-sans)", fontSize: 14.5, color: "var(--tl-mute)", margin: 0, maxWidth: 480 }}>
              Book en økt på GFGK, Miklagard eller hos Mulligan. Samme coach og samme plan uansett hvor du trener.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <PkCta href="/booking" clay>
                Book en økt
              </PkCta>
              <PkCta href="/kontakt" ghost icon={null}>
                Kontakt oss
              </PkCta>
            </div>
          </div>
        </PkKort>
      </PkSek>
    </PkShell>
  );
}
