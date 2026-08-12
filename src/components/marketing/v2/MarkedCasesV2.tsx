/**
 * AK Golf HQ — markedsside CASES (/cases), Paper.
 * Fasit: designsystem/paper/fase2/marketing/marketing-katalog.html.
 * Ekte copy speilet fra (mlegacy)/cases/page.tsx. Turneringer hentes fra DB
 * i page.tsx (server) og sendes inn som prop.
 */
import { Icon } from "@/components/v2";
import { PkShell } from "./paper/PkShell";
import { PkSek, PkEyebrow, PkHero, PkIng, PkSekt, PkCta, PkKat, PkTom, PkTag } from "./paper/PkPrimitives";

type Case = { slug: string; navn: string; alder: number; hcpFra: number; hcpTil: number; tid: string; sitat: string; badge: string };
const CASES: Case[] = [
  { slug: "marcus", navn: "Marcus R.", alder: 17, hcpFra: 12.4, hcpTil: 6.1, tid: "8 måneder", sitat: "SG Hub-analysene forandret måten jeg trener på.", badge: "Personlig rekord" },
  { slug: "sofie", navn: "Sofie L.", alder: 22, hcpFra: 8.2, hcpTil: 3.7, tid: "6 måneder", sitat: "Endelig data-drevet coaching som faktisk funker.", badge: "Data-drevet" },
];

export type CasesTournament = { day: string; mon: string; name: string; venue: string; format: string; pagar: boolean };

export function MarkedCasesV2({ tournaments }: { tournaments: CasesTournament[] }) {
  return (
    <PkShell aktiv="/cases" dataSlug="marketing-cases">
      <PkSek>
        <PkEyebrow>Resultater vi er stolte av</PkEyebrow>
        <PkHero>Cases &amp; turneringer</PkHero>
        <PkIng>Dokumenterte resultater fra spillere i AK Golf-programmet, fra HCP 12 til nasjonal elite.</PkIng>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <PkCta href="/booking" clay>
            Book gratis kartleggings-økt
          </PkCta>
          <PkCta href="/turneringer" ghost icon={null}>
            Se turneringskalenderen
          </PkCta>
        </div>
      </PkSek>

      <PkSek notop>
        <PkEyebrow>Spillere · Dokumentert fremgang</PkEyebrow>
        <div style={{ marginTop: 12 }}>
          <PkSekt>Historier som kan måles</PkSekt>
        </div>
        <PkKat>
          {CASES.map((c) => (
            <CaseCard key={c.slug} c={c} />
          ))}
        </PkKat>
      </PkSek>

      <PkSek notop>
        <PkEyebrow>Kalender · Neste 90 dager</PkEyebrow>
        <div style={{ marginTop: 12 }}>
          <PkSekt>Kommende turneringer</PkSekt>
        </div>
        {tournaments.length === 0 ? (
          <PkTom
            title="Ingen kommende turneringer akkurat nå"
            description="Se hele kalenderen på /turneringer."
            actions={
              <PkCta href="/turneringer" ghost icon={null}>
                Til turneringskalenderen
              </PkCta>
            }
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tournaments.map((t) => (
              <div
                key={`${t.day}-${t.name}`}
                className="pk-kort"
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px" }}
              >
                <div
                  style={{
                    flex: "none",
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: "var(--p-soft)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontFamily: "var(--p-mono)", fontSize: 14, fontWeight: 700, color: "var(--p-accent-fg)", lineHeight: 1 }}>{t.day}</span>
                  <span style={{ fontFamily: "var(--p-mono)", fontSize: 8, color: "var(--p-muted)", marginTop: 2 }}>{t.mon}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--p-ui)", fontSize: 14, fontWeight: 700, color: "var(--p-fg)" }}>{t.name}</div>
                  <div style={{ fontFamily: "var(--p-ui)", fontSize: 12.5, color: "var(--p-muted)", marginTop: 2 }}>
                    {t.venue} · {t.format}
                  </div>
                </div>
                <span
                  className="pk-tag"
                  style={
                    t.pagar
                      ? { color: "var(--p-info)", background: "color-mix(in srgb, var(--p-info) 14%, transparent)" }
                      : { color: "var(--p-accent-fg)", background: "var(--p-accent-soft)" }
                  }
                >
                  {t.pagar ? "Pågår" : "Kommende"}
                </span>
              </div>
            ))}
          </div>
        )}
      </PkSek>

      <PkSek notop>
        <div className="pk-kort pk-kort-tint" style={{ textAlign: "center" }}>
          <div className="pk-kort-body" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <PkEyebrow>Din tur</PkEyebrow>
            <div style={{ marginTop: 10 }}>
              <PkSekt>Klar for din suksesshistorie?</PkSekt>
            </div>
            <p style={{ fontFamily: "var(--p-body)", fontSize: 14.5, color: "var(--p-muted)", margin: "10px 0 0", maxWidth: 460 }}>
              Start med en gratis kartleggings-økt. Vi finner ut hva som stopper deg, og legger en plan for å komme videre.
            </p>
            <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <PkCta href="/booking" clay>
                Book gratis kartleggings-økt
              </PkCta>
              <PkCta href="/kontakt" ghost icon={null}>
                Snakk med oss
              </PkCta>
            </div>
          </div>
        </div>
      </PkSek>
    </PkShell>
  );
}

function CaseCard({ c }: { c: Case }) {
  const forbedring = (c.hcpFra - c.hcpTil).toFixed(1);
  return (
    <div className="pk-kort">
      <div
        style={{
          position: "relative",
          height: 88,
          background: "var(--p-soft)",
          borderBottom: "1px solid var(--p-hairline)",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: 16,
            top: 14,
            borderRadius: 9999,
            background: "var(--p-accent)",
            color: "var(--p-on-accent)",
            padding: "5px 12px",
            fontFamily: "var(--p-mono)",
            fontSize: 9.5,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {c.badge}
        </span>
        <span
          style={{
            position: "absolute",
            right: 16,
            top: 14,
            width: 32,
            height: 32,
            borderRadius: 9999,
            background: "var(--p-accent)",
            color: "var(--p-on-accent)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="trending-down" size={15} />
        </span>
      </div>
      <div className="pk-kort-body">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <span className="pk-meta">{c.navn}</span>
          <span className="pk-meta">· {c.alder} år</span>
          <PkTag>{c.tid}</PkTag>
        </div>
        <blockquote
          style={{
            margin: "14px 0 0",
            borderLeft: "2px solid var(--p-accent)",
            paddingLeft: 14,
            fontFamily: "var(--p-disp)",
            fontStyle: "italic",
            fontSize: 15,
            lineHeight: 1.5,
            color: "var(--p-muted)",
          }}
        >
          «{c.sitat}»
        </blockquote>
        <div style={{ marginTop: 16, display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: "var(--p-mono)", fontSize: 22, fontWeight: 700, color: "var(--p-accent-fg)" }}>-{forbedring}</span>
          <span style={{ fontFamily: "var(--p-ui)", fontSize: 12, color: "var(--p-muted)" }}>
            HCP-forbedring · {c.hcpFra} → {c.hcpTil}
          </span>
        </div>
      </div>
    </div>
  );
}
