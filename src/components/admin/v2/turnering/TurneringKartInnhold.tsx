/**
 * Turnering · fane «Kart» — flyttet ORDRETT fra src/app/admin/turnering-kart/page.tsx
 * (MASTERPLAN 15.6). Dekningsdashboard for norske spillere/turneringer — ikke
 * et geografisk kart, navnet er arvet fra fasitens `Turnering.dc.html`-pille.
 *
 * Egen «Tilbake til Stall»-lenke og h1 er fjernet — den nye siden eier
 * overskriften og fanenavigasjonen (samme lærdom som 15.1/15.2: en flyttet
 * helside skal ikke ta med seg sin egen navigasjon inn i fanen).
 */

import { TL } from "@/lib/v2/train-lock";
import { TlKort, TlTomTilstand } from "../oppsett/tl-kit";
import { TlCaps } from "../godkjenninger/tl-inspektor";
import type { TurneringKartData } from "@/lib/admin/turnering/lastere";

export function TurneringKartInnhold({ data }: { data: TurneringKartData }) {
  const { noPlayers, withDg, entriesNo, rounds, tournamentsNo, since2016, byOrigin, topPlayers } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <p style={{ margin: 0, fontSize: 13.5, color: TL.mute, maxWidth: 520, lineHeight: 1.5 }}>
        Oversikt over hva som finnes i basen for norske spillere. Tomme tall = ærlig mangel, ikke demo.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 10 }}>
        {[
          { k: "Norske spillere", v: noPlayers },
          { k: "Med DataGolf-ID", v: withDg },
          { k: "Resultatrader (NO)", v: entriesNo },
          { k: "Runder lagret", v: rounds },
          { k: "NO-turneringer", v: tournamentsNo },
          { k: "Entries siden 2016", v: since2016 },
        ].map((x) => (
          <TlKort key={x.k}>
            <TlCaps size={9}>{x.k}</TlCaps>
            <div
              style={{
                fontFamily: TL.font.mono,
                fontSize: 28,
                fontWeight: 700,
                color: TL.text,
                marginTop: 8,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {x.v.toLocaleString("nb-NO")}
            </div>
          </TlKort>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 18 }}>
        <TlKort eyebrow="Kilder (tournaments)">
          {byOrigin.length === 0 ? (
            <TlTomTilstand icon="database" title="Ingen turneringer" sub="Kjør GolfBox/DataGolf-sync." />
          ) : (
            byOrigin.map((o, i) => (
              <div
                key={o.sourceOrigin ?? "null"}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: i < byOrigin.length - 1 ? `1px solid ${TL.hair}` : "none",
                  fontSize: 13,
                  color: TL.text,
                }}
              >
                <span>{o.sourceOrigin ?? "ukjent"}</span>
                <span style={{ fontFamily: TL.font.mono, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{o.antall}</span>
              </div>
            ))
          )}
        </TlKort>

        <TlKort eyebrow="Flest resultater (NO)">
          {topPlayers.length === 0 ? (
            <TlTomTilstand icon="users" title="Ingen spillere" sub="Importer historikk for å fylle listen." />
          ) : (
            topPlayers.map((p, i) => (
              <div
                key={`${p.navn}-${i}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: i < topPlayers.length - 1 ? `1px solid ${TL.hair}` : "none",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TL.text }}>{p.navn}</div>
                  <div style={{ fontFamily: TL.font.mono, fontSize: 9, color: TL.mute, marginTop: 3 }}>
                    {p.tier}
                    {p.fodselsaar ? ` · ${p.fodselsaar}` : ""}
                  </div>
                </div>
                <span style={{ fontFamily: TL.font.mono, fontSize: 12, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums" }}>
                  {p.antallEntries}
                </span>
              </div>
            ))
          )}
        </TlKort>
      </div>
    </div>
  );
}
