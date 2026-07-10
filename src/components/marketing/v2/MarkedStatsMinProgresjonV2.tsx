"use client";

/**
 * AK Golf HQ v2 — STATS/MIN PROGRESJON (/stats/min-progresjon), retning C, mørk.
 * Ekte copy + datashape speilet 1:1 fra (mlegacy)-motparten. Data
 * (BrukerSammenligning/BrukerSgInput via Prisma, getCurrentUser) hentes
 * server-side i page.tsx og sendes inn som props — denne fila eier kun
 * presentasjon. Trendgrafen bruker v2 sin `Trend`-komponent i stedet for
 * legacy StatsTrendGraf.
 */
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, Caps, Knapp, Trend } from "@/components/v2";
import { StatsRamme, useMobile } from "./stats-ramme";
import { Eyebrow, HeroT, SeksT, Seksjon } from "./marked-ramme";

const NB_DATO = (d: Date | string) =>
  new Date(d).toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
const NB_DATO_KORT = (d: Date | string) => new Date(d).toLocaleDateString("nb-NO");

export interface Sammenligning {
  id: string;
  createdAt: Date | string;
  refPlayerName: string;
  sgDiffTotal: number | null;
  estPgaTourScore: number | null;
  kommentar: string | null;
}
export interface SgInput {
  dato: Date | string;
  sgTotal: number | null;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
}

const KATEGORIER = [
  { key: "ott", label: "SG: Off the Tee" },
  { key: "app", label: "SG: Approach" },
  { key: "arg", label: "SG: Around Green" },
  { key: "putt", label: "SG: Putting" },
] as const;

export interface MinProgresjonV2Props {
  fornavn: string;
  sammenligninger: Sammenligning[];
  sgInputs: SgInput[];
}

export function MinProgresjonV2({ fornavn, sammenligninger, sgInputs }: MinProgresjonV2Props) {
  const mobile = useMobile();
  const harData = sammenligninger.length > 0;
  const siste = sammenligninger[0];
  const trendSeries = sgInputs.map((s) => s.sgTotal ?? 0);

  return (
    <StatsRamme mobile={mobile}>
      <Seksjon mobile={mobile}>
        <Eyebrow>Innlogget · Min progresjon</Eyebrow>
        <HeroT mobile={mobile}>Velkommen tilbake, {fornavn}.</HeroT>
        <p style={{ fontFamily: T.ui, fontSize: 15, color: T.fg2, marginTop: 18, maxWidth: 560, lineHeight: 1.6 }}>
          {harData
            ? `Du har lagt inn SG ${sammenligninger.length} ganger. Her er trenden din.`
            : "Du har ikke lagt inn SG-data ennå. Start med en sammenligning nedenfor."}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
          <Link href="/stats/sg-sammenlign"><Knapp icon="arrow-right">Ny sammenligning</Knapp></Link>
          <Link href="/stats/verktoy/sg-estimator"><Knapp ghost>SG-estimator</Knapp></Link>
        </div>
      </Seksjon>

      {!harData && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <Kort tint pad="48px 32px" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
            <Icon name="trending-up" size={40} style={{ color: T.lime, opacity: 0.5 }} />
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg, marginTop: 16 }}>Ingen SG-data ennå</div>
            <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.55, marginTop: 8 }}>
              Legg inn din første SG-sammenligning for å starte trenden din. Det tar under 2 minutter.
            </p>
            <div style={{ marginTop: 22 }}>
              <Link href="/stats/sg-sammenlign"><Knapp icon="arrow-right">Start første sammenligning</Knapp></Link>
            </div>
          </Kort>
        </Seksjon>
      )}

      {siste && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <Kort pad={mobile ? "22px" : "32px"}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 8 }}>
              <Caps>Siste sammenligning</Caps>
              <Caps>{NB_DATO(siste.createdAt)}</Caps>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: 24 }}>
              <div>
                <Caps>Din SG total</Caps>
                <div style={{ fontFamily: T.mono, fontSize: 44, fontWeight: 500, marginTop: 8, lineHeight: 1, color: T.fg }}>
                  {siste.sgDiffTotal !== null ? siste.sgDiffTotal.toFixed(1) : "—"}
                </div>
                <div style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, marginTop: 6 }}>per runde</div>
              </div>
              <div>
                <Caps>vs {siste.refPlayerName}</Caps>
                <div style={{ fontFamily: T.mono, fontSize: 44, fontWeight: 500, marginTop: 8, lineHeight: 1, color: T.lime }}>
                  {siste.sgDiffTotal !== null ? (siste.sgDiffTotal > 0 ? "+" : "") + siste.sgDiffTotal.toFixed(2) : "—"}
                </div>
                <div style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, marginTop: 6 }}>SG-differanse</div>
              </div>
              <div>
                <Caps>Tour-ekvivalent score</Caps>
                <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 26, marginTop: 8, color: T.fg }}>
                  {siste.estPgaTourScore !== null ? siste.estPgaTourScore.toFixed(1) : "—"}
                </div>
                <div style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, marginTop: 6 }}>est. på PGA-bane</div>
              </div>
            </div>
            <div style={{ marginTop: 22 }}>
              <Link href="/stats/sg-sammenlign"><Knapp icon="arrow-right">Ny sammenligning</Knapp></Link>
            </div>
          </Kort>
        </Seksjon>
      )}

      {trendSeries.length > 1 && (
        <Seksjon mobile={mobile}>
          <Caps>SG-trend</Caps>
          <div style={{ marginTop: 14 }}>
            <SeksT mobile={mobile}>Din utvikling over tid.</SeksT>
          </div>
          <Kort pad={mobile ? "22px" : "32px"} style={{ marginTop: 24 }}>
            <Trend series={trendSeries} height={mobile ? 200 : 260} baseline={0} />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Caps>Tour-snitt = 0 · Lavere = bedre</Caps>
            </div>
          </Kort>

          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(2, 1fr)", gap: T.gap, marginTop: 20 }}>
            {KATEGORIER.map((kat) => {
              const values = sgInputs.map((s) => {
                const raw = kat.key === "ott" ? s.sgOtt : kat.key === "app" ? s.sgApp : kat.key === "arg" ? s.sgArg : s.sgPutt;
                return Number(raw ?? 0);
              });
              const fra = values[0] ?? 0;
              const til = values[values.length - 1] ?? 0;
              const diff = til - fra;
              const bedre = diff > 0;
              const ikon = bedre ? "trending-up" : diff < 0 ? "trending-down" : "minus";

              return (
                <Kort key={kat.key}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Caps>{kat.label}</Caps>
                    <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: bedre ? T.up : diff < 0 ? T.down : T.mut, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Icon name={ikon} size={12} />
                      {diff > 0 ? "+" : ""}{diff.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                    <span style={{ fontFamily: T.mono, fontSize: 12, color: T.mut }}>{fra.toFixed(1)}</span>
                    <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 500, color: bedre ? T.up : T.fg }}>→ {til.toFixed(1)}</span>
                  </div>
                  {values.length === 0 && <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, marginTop: 8 }}>Ingen data ennå</p>}
                </Kort>
              );
            })}
          </div>
        </Seksjon>
      )}

      {sammenligninger.length > 0 && (
        <Seksjon mobile={mobile}>
          <Caps>Historikk</Caps>
          <div style={{ marginTop: 14 }}>
            <SeksT mobile={mobile}>Alle dine sammenligninger.</SeksT>
          </div>
          <Kort pad="0" style={{ marginTop: 24, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 480, borderCollapse: "collapse", fontFamily: T.mono, fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.panel2 }}>
                    <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut }}>Dato</th>
                    <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut }}>Referanse</th>
                    <th style={{ padding: "12px 18px", textAlign: "right", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut }}>SG-diff</th>
                    <th style={{ padding: "12px 18px", textAlign: "right", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut }}>Tour-score est.</th>
                  </tr>
                </thead>
                <tbody>
                  {sammenligninger.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: `1px solid ${T.border}`, opacity: i > 9 ? 0.55 : 1 }}>
                      <td style={{ padding: "12px 18px", color: T.fg2 }}>{NB_DATO_KORT(s.createdAt)}</td>
                      <td style={{ padding: "12px 18px", color: T.fg2 }}>{s.refPlayerName}</td>
                      <td style={{ padding: "12px 18px", textAlign: "right", color: T.fg2 }}>
                        {s.sgDiffTotal !== null ? (s.sgDiffTotal > 0 ? "+" : "") + s.sgDiffTotal.toFixed(2) : "—"}
                      </td>
                      <td style={{ padding: "12px 18px", textAlign: "right", color: T.lime, fontWeight: 700 }}>
                        {s.estPgaTourScore !== null ? s.estPgaTourScore.toFixed(1) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Kort>
        </Seksjon>
      )}

      {siste?.kommentar && (
        <Seksjon mobile={mobile}>
          <div style={{ borderLeft: `3px solid ${T.lime}`, paddingLeft: 24 }}>
            <div style={{ fontFamily: T.disp, fontSize: mobile ? 17 : 20, fontWeight: 400, fontStyle: "italic", lineHeight: 1.6, color: T.fg }}>
              {siste.kommentar}
            </div>
            <Caps style={{ marginTop: 12, display: "block" }}>Notat · {NB_DATO_KORT(siste.createdAt)}</Caps>
          </div>
        </Seksjon>
      )}

      <Seksjon mobile={mobile}>
        <Kort tint pad={mobile ? "26px 22px" : "40px 44px"} style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.2fr 1fr", gap: 32 }}>
          <div>
            <Caps color={T.lime} style={{ marginBottom: 14 }}>Bli PlayerHQ PRO</Caps>
            <SeksT mobile={mobile} em="automatisk.">Spor alle SG-kategorier</SeksT>
            <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.65, margin: "14px 0 0", maxWidth: 460 }}>
              Med PlayerHQ PRO logges SG automatisk fra Trackman og manuell runderegistrering. Ingen manuell input. Treneren din ser det samme som deg.
            </p>
            <div style={{ marginTop: 22 }}>
              <Link href="/portal/meg/abonnement"><Knapp icon="arrow-right">Oppgrader til PRO</Knapp></Link>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.fg, marginBottom: 10 }}>Inkludert i PRO</div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {["Automatisk SG-tracking fra Trackman", "Ukentlig AI-analyse av din profil", "Ubegrenset sammenligninger", "Eksport til PDF / Excel"].map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>
                  <Icon name="check" size={13} style={{ color: T.lime, flex: "none", marginTop: 3 }} />
                  {f}
                </li>
              ))}
            </ul>
            <div style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, marginTop: 16 }}>
              <strong>299 kr / mnd</strong> · avbryt når som helst
            </div>
          </div>
        </Kort>
      </Seksjon>
    </StatsRamme>
  );
}
