/**
 * AK Golf HQ — markedsside CASES (/cases), Paper.
 * Fasit: designsystem/paper/fase2/marketing/marketing-katalog.html.
 * Ekte copy speilet fra (mlegacy)/cases/page.tsx. Turneringer hentes fra DB
 * i page.tsx (server) og sendes inn som prop.
 */
import { PkShell } from "./kit/PkShell";
import { PkSek, PkEyebrow, PkHero, PkIng, PkSekt, PkCta, PkTom } from "./kit/PkPrimitives";

export type CasesTournament = { day: string; mon: string; name: string; venue: string; format: string; pagar: boolean };

export function MarkedCasesV2({ tournaments }: { tournaments: CasesTournament[] }) {
  return (
    <PkShell aktiv="/cases" dataSlug="marketing-cases">
      <PkSek>
        <PkEyebrow>Turneringsspor</PkEyebrow>
        <PkHero>Cases &amp; turneringer</PkHero>
        <PkIng>Turneringer og resultater fra spillere i AK Golf-programmet — fulgt live, ikke fortalt i etterkant.</PkIng>
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
                    background: "var(--tl-dock)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 14, fontWeight: 700, color: "var(--tl-warm)", lineHeight: 1 }}>{t.day}</span>
                  <span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 8, color: "var(--tl-mute)", marginTop: 2 }}>{t.mon}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--tl-font-sans)", fontSize: 14, fontWeight: 700, color: "var(--tl-text)" }}>{t.name}</div>
                  <div style={{ fontFamily: "var(--tl-font-sans)", fontSize: 12.5, color: "var(--tl-mute)", marginTop: 2 }}>
                    {t.venue} · {t.format}
                  </div>
                </div>
                <span
                  className="pk-tag"
                  style={
                    t.pagar
                      ? { color: "var(--tl-viz-target)", background: "color-mix(in srgb, var(--tl-viz-target) 14%, transparent)" }
                      : { color: "var(--tl-warm)", background: "color-mix(in srgb, var(--tl-warm) 12%, transparent)" }
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
            <p style={{ fontFamily: "var(--tl-font-sans)", fontSize: 14.5, color: "var(--tl-mute)", margin: "10px 0 0", maxWidth: 460 }}>
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
