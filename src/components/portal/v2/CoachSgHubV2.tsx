/**
 * PlayerHQ · Coach SG-hub (/portal/coach/sg-hub) — v2.
 * v2-port 17. juli 2026 (Team D3): erstatter hybrid-designet (8 rå hex).
 * Spiller-siden av coach-SG-sammenligningen: H2H per SG-kategori (din verdi
 * som opp/ned-fylt bar fra nullstrek, coachens referanse som markørstrek),
 * innsikt om størst gap, og inngangspunkter til Utstyr og Per-kølle.
 * Coach-verdiene er statiske referanser til coach-profilen har egne data.
 */

import Link from "next/link";
import {
  Kort,
  Caps,
  Tittel,
  TomTilstand,
  InnsiktChip,
  Icon,
  HjelpTips,
  T,
  fmtSg,
} from "@/components/v2";

export interface CoachSgKategori {
  label: string; // "OTT" | "APP" | "ARG" | "PUTT"
  navn: string; // "Tee-slag" | "Innspill" | "Nærspill" | "Putting"
  mine: number;
  coach: number;
}

export interface CoachSgHubV2Data {
  coachNavn: string;
  coachFornavn: string;
  coachEtternavn: string;
  spillerFornavn: string;
  ingenData: boolean;
  kategorier: CoachSgKategori[];
  /** Kategorien der coach er mest foran — null hvis ingen positivt gap. */
  storsteGap: { navn: string; label: string; verdi: number } | null;
  hrefUtstyr: string;
  hrefPerKolle: string;
}

/** Samme fyll-skalering som baseline: |SG| · 25, maks 48 % av halv bar. */
function fillPct(sg: number): number {
  return Math.min(48, Math.abs(sg) * 25);
}

function LenkeKort({ href, tittel, em, sub }: { href: string; tittel: string; em: string; sub: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <Kort hover>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 700, color: T.fg }}>
              {tittel}
              <em style={{ fontStyle: "italic", fontWeight: 500, color: T.lime }}> {em}</em>
            </div>
            <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 3 }}>{sub}</div>
          </div>
          <Icon name="arrow-right" size={16} style={{ color: T.mut, flexShrink: 0 }} />
        </div>
      </Kort>
    </Link>
  );
}

export function CoachSgHubV2({ data }: { data: CoachSgHubV2Data }) {
  return (
    <>
      {/* Topptekst */}
      <div>
        <Caps>Sammenlign med coach</Caps>
        <div style={{ marginTop: 6 }}>
          <Tittel mobile em={data.coachEtternavn}>{data.coachFornavn}</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, margin: "8px 0 0" }}>
          Head Coach · SG-data til inspirasjon
        </p>
      </div>

      {/* H2H — SG per kategori */}
      <Kort>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Caps>SG per kategori</Caps>
            <HjelpTips k="sgOmrade" size={11} />
          </span>
          <span style={{ display: "flex", gap: 12, fontFamily: T.mono, fontSize: 9, color: T.mut }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 3, borderRadius: 2, background: T.up, display: "inline-block" }} />
              {data.spillerFornavn}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 2, height: 10, borderRadius: 1, background: T.fg, display: "inline-block" }} />
              {data.coachFornavn} (referanse)
            </span>
          </span>
        </div>

        {data.ingenData ? (
          <TomTilstand
            icon="bar-chart"
            title="Ingen SG-data ennå"
            sub="Logg runder for å se sammenligningen mot coach."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {data.kategorier.map((k, i) => {
              const minePos = k.mine >= 0;
              const coachPos = k.coach >= 0;
              const minePct = fillPct(k.mine);
              const coachPos50 = coachPos ? 50 + fillPct(k.coach) : 50 - fillPct(k.coach);
              const valColor = minePos ? T.up : T.down;
              return (
                <div
                  key={k.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "84px 1fr 64px",
                    alignItems: "center",
                    gap: 11,
                    padding: "10px 0",
                    borderBottom: i === data.kategorier.length - 1 ? "none" : `1px solid ${T.border}`,
                  }}
                >
                  <span style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {k.navn}
                  </span>

                  <div style={{ position: "relative", height: 10, borderRadius: 9999, background: T.track }}>
                    {/* nullstrek */}
                    <span aria-hidden style={{ position: "absolute", left: "50%", top: -2, width: 1, height: 14, background: T.borderS }} />
                    {/* din fylling fra null */}
                    <span
                      style={{
                        position: "absolute",
                        top: 1,
                        bottom: 1,
                        borderRadius: 9999,
                        background: valColor,
                        opacity: 0.9,
                        ...(minePos
                          ? { left: "50%", width: `${minePct}%` }
                          : { right: "50%", width: `${minePct}%` }),
                      }}
                    />
                    {/* coach-referanse som markørstrek */}
                    <span
                      aria-hidden
                      title={`${data.coachFornavn}: ${fmtSg(k.coach)} SG`}
                      style={{ position: "absolute", left: `${coachPos50}%`, top: -3, width: 2, height: 16, borderRadius: 1, background: T.fg }}
                    />
                  </div>

                  <span style={{ textAlign: "right", fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: valColor, fontVariantNumeric: "tabular-nums" }}>
                    {fmtSg(k.mine)}
                  </span>
                </div>
              );
            })}
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut, marginTop: 10 }}>
              SG i slag/runde · coach-verdier er statiske referanser
            </span>
          </div>
        )}
      </Kort>

      {/* Innsikt — hva du jobber mot */}
      {!data.ingenData && data.storsteGap && (
        <InnsiktChip>
          {data.coachFornavn} er{" "}
          <span style={{ color: T.fg, fontWeight: 600 }}>
            +{data.storsteGap.verdi.toFixed(1).replace(".", ",")} SG {data.storsteGap.navn.toLowerCase()}
          </span>{" "}
          over deg. Det er her den største gevinsten finnes — fokusert arbeid i 6–8 uker kan lukke gapet.
        </InnsiktChip>
      )}

      {/* Inngangspunkter */}
      <LenkeKort
        href={data.hrefUtstyr}
        tittel="Utstyr"
        em="-gap"
        sub={`Din bag vs ${data.coachNavn}`}
      />
      <LenkeKort
        href={data.hrefPerKolle}
        tittel="Coach"
        em="per kølle"
        sub="Per-kølle carry, fart og launch"
      />
    </>
  );
}
