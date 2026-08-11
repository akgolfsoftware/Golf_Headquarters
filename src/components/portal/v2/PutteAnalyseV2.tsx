"use client";

/**
 * PutteAnalyseV2 — PlayerHQ «Putte-lab» under Analyse (Paper-port W2, fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-putte-lab.html.
 *
 * NY analyse-flate (Anders 11.08): bygges I TILLEGG TIL putte-simulatoren på
 * /portal/trening/putte-laboratoriet — simulatoren er urørt og lenkes som
 * «Tren putting»-vei ut fra Økter-fanen.
 *
 * Ærlige avvik fra fasiten (kun der fasit-innholdet mangler datakilde):
 *  - Avstander vises i FOT, ikke meter (CANON v3.5 + sg.ts: «putt-avstand
 *    vises i FOT»). Båndene er SG-motorens buckets (Round.sgPutt0_3 …).
 *  - Fasitens «HCP 12-referanse»-strek på treffprosent har ingen datakilde i
 *    appen — den tegnes ikke (ingen fabrikkerte referansetall).
 *  - «Coach-tips» bruker putte-hjernens fokuslinje (derivePuttingFocus, ekte
 *    domenelogikk) — ikke en oppdiktet melding fra coach.
 *  - Manifest-datakrav håndheves: minst 30 putter før treff % per avstand,
 *    minst 3 økter før distansekontroll tegnes.
 */

import { useState } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Kort, KpiFlis, PillTabs, TomTilstand, Caps } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import type { Distansekontroll, SgPerAvstand, TreffPerAvstand } from "@/lib/domain/putte-lab";

export type PutteAnalyseOktRad = {
  id: string;
  /** Ferdigformatert Oslo-dato («14. mai»). */
  dato: string;
  navn: string;
  /** Antall putter i økten — null når ukjent (plan-økter). */
  putter: number | null;
  /** Ferdigformatert resultat («7 av 10» · «0,42 m» · «45 min»). */
  resultat: string;
  href: string | null;
};

export type PutteAnalyseData = {
  navn: string;
  /** Antall runder i grunnlaget (siste 90 dager). */
  runder: number;
  kpi: {
    sgPuttSnitt: number | null;
    runderMedSg: number;
    putterPer18: number | null;
    trePuttPer18: number | null;
    runderMedPutter: number;
  };
  treff: TreffPerAvstand;
  sgPerAvstand: SgPerAvstand;
  distanse: Distansekontroll;
  /** Putte-hjernens fokuslinje — null når grunnlaget er for tynt. */
  fokusLinje: string | null;
  okter: PutteAnalyseOktRad[];
};

const MIN_PUTTER_FOR_TREFF = 30;
const MIN_OKTER_FOR_DISTANSE = 3;

function komma(n: number, desimaler = 1): string {
  return n.toLocaleString("nb-NO", { minimumFractionDigits: desimaler, maximumFractionDigits: desimaler });
}

function fmtSg2(v: number): string {
  const abs = komma(Math.abs(v), 2);
  return v > 0 ? `+${abs}` : v < 0 ? `−${abs}` : abs;
}

/* ── Små fasit-byggeklosser (spor / spor2 / forklar) ────────────────────── */

function Forklar({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: "10px 0 0", fontFamily: T.mono, fontSize: 10.5, color: T.mut, letterSpacing: "0.03em" }}>
      {children}
    </p>
  );
}

/** Fasitens .drad: etikett | spor | verdi — med min-w-0 på sporet. */
function DataRad({ label, verdi, tone, children }: { label: string; verdi: string; tone?: "pos" | "neg" | null; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "62px minmax(0,1fr) 66px", gap: 8, alignItems: "center", minHeight: 38, minWidth: 0 }}>
      <span className="num" style={{ fontFamily: T.mono, fontSize: 12, color: T.mut }}>{label}</span>
      {children}
      <span
        className="num"
        style={{ fontFamily: T.mono, fontSize: 12.5, textAlign: "right", fontWeight: 600, color: tone === "pos" ? T.up : tone === "neg" ? T.down : T.fg }}
      >
        {verdi}
      </span>
    </div>
  );
}

/** Fasitens .spor: fylt bånd 0–100 %. */
function Spor({ pct, svak }: { pct: number; svak?: boolean }) {
  return (
    <div style={{ position: "relative", height: 12, background: T.panel2, borderRadius: T.rPill, overflow: "hidden", minWidth: 0 }}>
      <i style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${Math.max(0, Math.min(100, pct))}%`, borderRadius: T.rPill, background: svak ? T.down : T.up }} />
    </div>
  );
}

/** Fasitens .spor2: divergerende bånd rundt 0-linje. */
function SporDivergerende({ verdi, maks }: { verdi: number; maks: number }) {
  const bredde = Math.min((Math.abs(verdi) / maks) * 50, 50);
  return (
    <div style={{ position: "relative", height: 12, background: T.panel2, borderRadius: T.rPill, minWidth: 0 }}>
      <span style={{ position: "absolute", left: "50%", top: -3, bottom: -3, width: 1, background: T.borderS }} />
      <i
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          borderRadius: T.rPill,
          width: `${bredde}%`,
          ...(verdi >= 0 ? { left: "50%", background: T.up } : { right: "50%", background: T.down }),
        }}
      />
    </div>
  );
}

/** why-details for beregnede tall — samme <details>-mønster som testbatteriet. */
function HvorforDetaljer({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <details style={{ marginTop: 10, border: `1px solid ${T.border}`, borderRadius: T.rCard, background: T.panel }}>
      <summary style={{ cursor: "pointer", padding: "8px 12px", fontFamily: T.ui, fontSize: 11.5, fontWeight: 600, color: T.fg2 }}>
        {tittel}
      </summary>
      <div style={{ padding: "0 12px 10px", fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.5 }}>{children}</div>
    </details>
  );
}

/* ── Faner ──────────────────────────────────────────────────────────────── */

function TreffFane({ treff, sgPerAvstand, fokusLinje }: { treff: TreffPerAvstand; sgPerAvstand: SgPerAvstand; fokusLinje: string | null }) {
  const harTreff = treff.totaltForsok >= MIN_PUTTER_FOR_TREFF;
  const harSg = sgPerAvstand.some((b) => b.n > 0);
  const sgMaks = Math.max(0.3, ...sgPerAvstand.map((b) => Math.abs(b.snitt ?? 0)));

  return (
    <>
      <Kort eyebrow="Treff % per avstand" action={<Caps size={9}>{treff.totaltForsok} putter · {treff.komplettHull} hull</Caps>}>
        {harTreff ? (
          <>
            {treff.band
              .filter((b) => b.forsok > 0)
              .map((b) => {
                const pct = Math.round((b.treff / b.forsok) * 100);
                return (
                  <DataRad key={b.id} label={b.label} verdi={`${pct} %`}>
                    <Spor pct={pct} />
                  </DataRad>
                );
              })}
            <Forklar>Kun hull der hele slag-kjeden er ført teller — {treff.komplettHull} hull i grunnlaget.</Forklar>
            <HvorforDetaljer tittel="Hvordan er treffprosenten regnet ut?">
              Hver putt du har ført slag-for-slag telles i avstandsbåndet den ble slått fra (målt i fot).
              En putt regnes som truffet når den var siste slag på hullet. Hull der scoren ikke stemmer
              med antall førte slag holdes utenfor — da vet vi ikke sikkert hvilken putt som gikk i.
              Fasitens HCP-referansestrek vises ikke: appen har ingen ekte referansetall for treffprosent.
            </HvorforDetaljer>
          </>
        ) : (
          <TomTilstand
            icon="circle-dot"
            title="For få putter ført slag for slag"
            sub={`Treffprosent per avstand trenger minst ${MIN_PUTTER_FOR_TREFF} putter fra runder ført slag-for-slag — du har ${treff.totaltForsok}. Før runder med slag-registrering, så tegnes båndene her.`}
          />
        )}
      </Kort>

      <Kort eyebrow="SG putt per avstand" action={<Caps size={9}>Snitt per runde</Caps>}>
        {harSg ? (
          <>
            {sgPerAvstand
              .filter((b) => b.n > 0)
              .map((b) => (
                <DataRad key={b.id} label={b.label} verdi={fmtSg2(b.snitt ?? 0)} tone={(b.snitt ?? 0) >= 0 ? "pos" : "neg"}>
                  <SporDivergerende verdi={b.snitt ?? 0} maks={sgMaks} />
                </DataRad>
              ))}
            <HvorforDetaljer tittel="Hvordan er SG per avstand regnet ut?">
              Strokes Gained per avstandsbånd beregnes automatisk fra slag-kjeden når en runde føres
              slag-for-slag, og lagres per runde. Tallet her er snittet over rundene som har verdi i
              båndet. Positivt = du vinner slag mot referansen fra den avstanden, negativt = du taper.
            </HvorforDetaljer>
          </>
        ) : (
          <TomTilstand
            icon="bar-chart"
            title="Ingen SG-fordeling ennå"
            sub="SG per putte-avstand beregnes fra runder som er ført slag-for-slag. Før en runde med slag-registrering, så brytes putting-tapet ned per avstand her."
          />
        )}
      </Kort>

      <Kort eyebrow="Fokus">
        {fokusLinje ? (
          <div style={{ background: T.panel2, borderRadius: T.rTag, padding: "12px 16px", fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>
            <strong style={{ color: T.fg, fontSize: 12.5 }}>Putte-hjernen: </strong>
            {fokusLinje}
          </div>
        ) : (
          <TomTilstand icon="lightbulb" title="Ikke nok data for et fokusråd" sub="Logg en runde med putt-tall eller en puttetest, så peker putte-hjernen på lekkasjen." />
        )}
      </Kort>
    </>
  );
}

function DistanseFane({ distanse }: { distanse: Distansekontroll }) {
  const har = distanse.okterMedData >= MIN_OKTER_FOR_DISTANSE && distanse.punkter.length > 0;
  if (!har) {
    return (
      <Kort eyebrow="Spredning · lengdeavvik">
        <TomTilstand
          icon="ruler"
          title="For få distansekontroll-økter"
          sub={`Distansekontroll tegnes fra speed-testene (Putt Speed 1x5 / 3x3) — minst ${MIN_OKTER_FOR_DISTANSE} økter trengs, du har ${distanse.okterMedData}. Gjennomfør en speed-test, så plottes avvikene her.`}
        />
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <Link
            href="/portal/tren/tester"
            data-od-id="puttelab-distanse-tester"
            className="v2-press v2-focus"
            style={{ display: "inline-flex", alignItems: "center", minHeight: 44, padding: "0 16px", borderRadius: T.rTag, border: `1px solid ${T.border}`, background: T.panel, color: T.fg, fontFamily: T.ui, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
          >
            Se puttetestene
          </Link>
        </div>
      </Kort>
    );
  }

  const maksAvstand = Math.max(...distanse.punkter.map((p) => p.avstandFot), 10);
  const maksAvvik = Math.max(...distanse.punkter.map((p) => Math.abs(p.avvikFot)), 3);
  const X0 = 46;
  const X1 = 386;
  const midtX = Math.round((maksAvstand + 6) / 2);

  return (
    <>
      <Kort eyebrow="Spredning · lengdeavvik" action={<Caps size={9}>{distanse.punkter.length} putter · {distanse.okterMedData} økter</Caps>}>
        <div style={{ border: `1px solid ${T.border}`, borderRadius: T.rCard, background: T.panel, overflow: "hidden", minWidth: 0 }}>
          <svg viewBox="0 0 400 240" role="img" aria-label="Spredningsplot: puttlengde mot lengdeavvik, begge i fot" style={{ display: "block", width: "100%", height: 240 }}>
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={X0} y1={40 + i * 53.3} x2={X1} y2={40 + i * 53.3} stroke={T.borderS} strokeWidth={1} />
            ))}
            <line x1={X0} y1={120} x2={X1} y2={120} stroke={T.border} strokeWidth={1} />
            {distanse.punkter.map((p, i) => {
              const x = X0 + ((p.avstandFot - 6) / Math.max(1, maksAvstand - 6)) * (X1 - X0);
              const y = 120 - (p.avvikFot / maksAvvik) * 80;
              return <circle key={i} cx={x} cy={y} r={3.6} fill={p.innenforKrav ? T.up : T.down} fillOpacity={0.7} />;
            })}
            {[
              [`6 fot`, X0],
              [`${midtX} fot`, (X0 + X1) / 2],
              [`${Math.round(maksAvstand)} fot`, X1],
            ].map(([t, x]) => (
              <text key={String(t)} x={Number(x)} y={232} fontFamily={T.mono} fontSize={9} fill={T.mut} textAnchor="middle">
                {t}
              </text>
            ))}
            {[
              [`+${komma(maksAvvik, 0)} fot`, 43],
              ["0", 123],
              [`−${komma(maksAvvik, 0)} fot`, 203],
            ].map(([t, y]) => (
              <text key={String(t)} x={X0 - 6} y={Number(y)} fontFamily={T.mono} fontSize={9} fill={T.mut} textAnchor="end">
                {t}
              </text>
            ))}
          </svg>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 8 }}>
          <span><i style={{ display: "inline-block", width: 7, height: 7, borderRadius: 999, background: T.up, marginRight: 6 }} />innenfor 5 % av puttlengden</span>
          <span><i style={{ display: "inline-block", width: 7, height: 7, borderRadius: 999, background: T.down, marginRight: 6 }} />utenfor kravet</span>
        </div>
        {distanse.andelLange != null && (
          <Forklar>
            Over 0-linja = for langt. {Math.round(distanse.andelLange * 100)} % av avvikene er lange
            {distanse.andelLange >= 0.6 ? " — tendens til å slå forbi." : distanse.andelLange <= 0.4 ? " — tendens til å legge igjen kort." : "."}
          </Forklar>
        )}
        <HvorforDetaljer tittel="Hvor kommer punktene fra?">
          Hvert punkt er én putt fra speed-testene (Putt Speed 1x5 / 3x3): vannrett = puttlengden,
          loddrett = hvor langt forbi (+) eller kort (−) hullet ballen stoppet. Testene registreres i
          meter og regnes om til fot (1 fot = 0,305 m) — putting vises alltid i fot.
          Grønt = innenfor lab-kravet på 5 % av puttlengden.
        </HvorforDetaljer>
      </Kort>

      <Kort eyebrow="Snittavvik per avstand">
        {distanse.snittPerAvstand.map((r) => (
          <DataRad key={r.avstandFot} label={`${r.avstandFot} fot`} verdi={`${komma(r.snittAvvikFot, 2)} fot`}>
            <Spor pct={(r.snittAvvikFot / Math.max(1, maksAvvik)) * 100} svak={r.snittAvvikFot > r.avstandFot * 0.05} />
          </DataRad>
        ))}
        <Forklar>Mål fra lab-protokollen: snittavvik under 5 % av puttlengden.</Forklar>
      </Kort>
    </>
  );
}

function OkterFane({ okter }: { okter: PutteAnalyseOktRad[] }) {
  return (
    <>
      <Kort eyebrow="Putte-økter og tester" action={<Caps size={9}>{okter.length} økter</Caps>}>
        {okter.length > 0 ? (
          <div style={{ overflowX: "auto", minWidth: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Dato", "Økt", "Putter", "Resultat"].map((h, i) => (
                    <th
                      key={h}
                      style={{ textAlign: i > 1 ? "right" : "left", fontFamily: T.mono, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, fontWeight: 500, padding: "8px 4px", borderBottom: `1px solid ${T.border}` }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {okter.map((o) => (
                  <tr key={o.id}>
                    <td style={{ padding: "9px 4px", borderBottom: `1px solid ${T.borderS}`, fontFamily: T.mono, fontSize: 11.5, color: T.mut, whiteSpace: "nowrap" }}>{o.dato}</td>
                    <td style={{ padding: "9px 4px", borderBottom: `1px solid ${T.borderS}`, fontFamily: T.ui, fontSize: 12.5, color: T.fg, minWidth: 0 }}>
                      {o.href ? (
                        <Link href={o.href} data-od-id={`puttelab-okt-${o.id}`} style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>
                          {o.navn}
                        </Link>
                      ) : (
                        o.navn
                      )}
                    </td>
                    <td className="num" style={{ padding: "9px 4px", borderBottom: `1px solid ${T.borderS}`, fontFamily: T.mono, fontSize: 12.5, textAlign: "right" }}>{o.putter ?? "—"}</td>
                    <td className="num" style={{ padding: "9px 4px", borderBottom: `1px solid ${T.borderS}`, fontFamily: T.mono, fontSize: 12.5, textAlign: "right", whiteSpace: "nowrap" }}>{o.resultat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <TomTilstand icon="history" title="Ingen putte-økter ennå" sub="Puttetester og plan-økter med putting samles her etter hvert som de gjennomføres." />
        )}
      </Kort>

      <Kort>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Link
            href="/portal/tren/tester"
            data-od-id="puttelab-alle-tester"
            className="v2-press v2-focus"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 44, borderRadius: T.rTag, border: `1px solid ${T.border}`, background: T.panel, color: T.fg, fontFamily: T.ui, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
          >
            Se alle puttetester
          </Link>
          <Link
            href="/portal/trening/putte-laboratoriet"
            data-od-id="puttelab-tren-putting"
            className="v2-press v2-focus"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 44, borderRadius: T.rTag, border: `1px solid ${T.border}`, background: T.panel2, color: T.fg, fontFamily: T.ui, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
          >
            <Icon name="circle-dot" size={15} />
            Tren putting i simulatoren
          </Link>
        </div>
      </Kort>
    </>
  );
}

/* ── Hovedkomponent ─────────────────────────────────────────────────────── */

export function PutteAnalyseV2({ data }: { data: PutteAnalyseData }) {
  const [fane, setFane] = useState("treff");

  const harNoenData =
    data.kpi.runderMedSg > 0 ||
    data.kpi.runderMedPutter > 0 ||
    data.treff.totaltForsok > 0 ||
    data.distanse.punkter.length > 0 ||
    data.okter.length > 0;

  return (
    <div
      data-paper-slug="playerhq-putte-lab"
      data-od-id="playerhq-putte-lab"
      style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720, margin: "0 auto", width: "100%", minWidth: 0 }}
    >
      <div style={{ minWidth: 0 }}>
        <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>Putte-lab</h1>
        <span className="num" style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
          {harNoenData ? `${data.navn} · ${data.runder} runder · siste 90 dager` : `${data.navn} · ingen registreringer`}
        </span>
      </div>

      {!harNoenData ? (
        /* Tom tilstand — fasit-teksten med reelle datakrav, én vei videre. */
        <Kort>
          <TomTilstand
            icon="circle-dot"
            title="Ingen putte-data ennå"
            sub={`Putte-laben bygger på registrerte putter — fra runder med putt-tall eller fra en puttetest. Minst ${MIN_PUTTER_FOR_TREFF} putter trengs før treffprosent per avstand vises, og minst ${MIN_OKTER_FOR_DISTANSE} økter før distansekontroll tegnes.`}
          />
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <Link
              href="/portal/tren/tester"
              data-od-id="puttelab-tom-tester"
              className="v2-press v2-focus"
              style={{ display: "inline-flex", alignItems: "center", minHeight: 44, padding: "0 16px", borderRadius: T.rTag, border: `1px solid ${T.border}`, background: T.panel, color: T.fg, fontFamily: T.ui, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
            >
              Se puttetestene
            </Link>
          </div>
        </Kort>
      ) : (
        <>
          {/* KPI-rad — fasit: SG putt · runde / Putter · runde / 3-putter */}
          <div className="grid grid-cols-3" style={{ gap: T.gap }}>
            <KpiFlis
              label="SG putt · runde"
              value={data.kpi.sgPuttSnitt != null ? fmtSg2(data.kpi.sgPuttSnitt) : "—"}
              dir={data.kpi.sgPuttSnitt == null ? undefined : data.kpi.sgPuttSnitt >= 0 ? "up" : "down"}
              instant
            />
            <KpiFlis label="Putter · runde" value={data.kpi.putterPer18 != null ? komma(data.kpi.putterPer18) : "—"} instant />
            <KpiFlis label="3-putter · runde" value={data.kpi.trePuttPer18 != null ? komma(data.kpi.trePuttPer18) : "—"} instant />
          </div>
          <HvorforDetaljer tittel="Hvordan er nøkkeltallene regnet ut?">
            SG putt er snittet av Strokes Gained putting over de {data.kpi.runderMedSg} rundene siste 90
            dager som har SG-tall. Putter og 3-putter per runde regnes kun fra runder der alle hull har
            putt-tall ({data.kpi.runderMedPutter} runder), og normaliseres til 18 hull så 9-hulls runder
            teller likt. Mangler et tall («—») finnes ikke datagrunnlaget — det gjettes aldri.
          </HvorforDetaljer>

          <PillTabs
            tabs={[
              { id: "treff", l: "Treff %" },
              { id: "distanse", l: "Distansekontroll" },
              { id: "okter", l: "Økter" },
            ]}
            value={fane}
            onChange={setFane}
          />

          {fane === "treff" && <TreffFane treff={data.treff} sgPerAvstand={data.sgPerAvstand} fokusLinje={data.fokusLinje} />}
          {fane === "distanse" && <DistanseFane distanse={data.distanse} />}
          {fane === "okter" && <OkterFane okter={data.okter} />}
        </>
      )}
    </div>
  );
}
