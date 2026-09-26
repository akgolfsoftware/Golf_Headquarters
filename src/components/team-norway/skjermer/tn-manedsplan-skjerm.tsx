import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnManedsplan, hentTnSamlinger, hentTnTurneringer } from "@/lib/domain/tn-arbeidsflate";
import { byggManedsplan, dagnokkel, manedsvindu, type TnHendelse, type TnPlanDag } from "@/lib/domain/tn-manedsplan";
import { TN } from "@/lib/v2/team-norway";
import { TnEtikett, TnFilterknapper, type TnFilterValg, TnFlate, TnFotnote, TnMangler, TnSkjermhode } from "../tn-flate";
import { MANEDER_LANG, SkjermRamme, heltallParam, hentSkjermbruker, osloDag } from "./felles";

/**
 * TN-11 Månedsplan.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-11.
 *
 * Avvik:
 *   - Frister har ingen datamodell. Tallet og forklaringen sier det, i stedet
 *     for å vise 0 som om ingen frister fantes.
 *   - Månedsvalget viser inneværende og neste måned, som i fasiten, men
 *     leses fra adressen (?ar=&maned=) og ikke fra klientstate.
 *   - Kalender vises fra 1024 px. Under det er lista eneste visning, som i
 *     fasitens mobilversjon.
 */

const DAGER = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"] as const;
const DAGER_LANG = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"] as const;

const hendelseStil: Record<TnHendelse["type"], { bg: string; fg: string; bd: string }> = {
  okt: { bg: TN.navy50, fg: TN.navy900, bd: TN.navy100 },
  turnering: { bg: TN.navy100, fg: TN.navy900, bd: TN.navy300 },
  samling: { bg: TN.navy900, fg: TN.white, bd: TN.navy900 },
};
const TYPENAVN: Record<TnHendelse["type"], string> = { okt: "Økt", turnering: "Turnering", samling: "Samling" };

function dm(nokkel: string) {
  return `${nokkel.slice(8, 10)}.${nokkel.slice(5, 7)}`;
}

function ukedag(nokkel: string) {
  const [a, m, d] = nokkel.split("-").map(Number);
  return (new Date(Date.UTC(a!, m! - 1, d!)).getUTCDay() + 6) % 7;
}

function Tegnforklaring() {
  const rute = (bg: string, bd: string) => <span aria-hidden="true" style={{ width: 12, height: 10, background: bg, border: `1px solid ${bd}`, flex: "none" }} />;
  const punkt = (tekst: string, bg: string, bd: string) => <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{rute(bg, bd)}{tekst}</span>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 28px", fontSize: 13, color: TN.textSecondary }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", alignItems: "center" }}>
        <TnEtikett>Perioder</TnEtikett>
        {punkt("Grunn", TN.navy50, TN.navy100)}
        {punkt("Spesialisering", TN.navy300, TN.navy300)}
        {punkt("Turnering", TN.navy900, TN.navy900)}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", alignItems: "center" }}>
        <TnEtikett>Aktivitet</TnEtikett>
        {punkt("Økt", hendelseStil.okt.bg, hendelseStil.okt.bd)}
        {punkt("Turnering", hendelseStil.turnering.bg, hendelseStil.turnering.bd)}
        {punkt("Samling", hendelseStil.samling.bg, hendelseStil.samling.bd)}
      </div>
    </div>
  );
}

function periodeFarge(navn: string | undefined) {
  if (navn === "Turnering") return { bg: TN.navy900, fg: TN.white };
  if (navn === "Spesialisering") return { bg: TN.navy300, fg: TN.navy900 };
  if (navn) return { bg: TN.navy50, fg: TN.navy900 };
  return { bg: TN.white, fg: TN.textSecondary };
}

function Periodebaand({ navn, hoyre }: { navn?: string; hoyre: string }) {
  const farge = periodeFarge(navn);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "4px 12px", padding: "7px 10px", background: farge.bg, color: farge.fg, border: navn ? "none" : `1px dashed ${TN.navy100}`, fontFamily: TN.font.display, fontSize: 11.5, letterSpacing: "0.16em", textTransform: "uppercase" }}>
      <span>{navn ?? "Periode ikke satt"}</span>
      <span style={{ fontFamily: TN.font.mono, letterSpacing: "0.04em" }}>{hoyre}</span>
    </div>
  );
}

function Hendelsesrad({ h }: { h: TnHendelse }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "56px minmax(0, 1fr)", gap: 12, padding: "10px 0", borderTop: `1px solid ${TN.navy100}` }}>
      <span style={{ fontFamily: TN.font.mono, fontSize: 13, color: TN.navy900, fontVariantNumeric: "tabular-nums" }}>{h.tid ?? "Hele"}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, overflowWrap: "anywhere" }}>{h.tittel}</div>
        <div style={{ fontSize: 13, color: TN.textSecondary, marginTop: 2, overflowWrap: "anywhere" }}>{[TYPENAVN[h.type], h.undertekst].filter(Boolean).join(" · ")}</div>
      </div>
    </div>
  );
}

export async function TnManedsplanSkjerm({ sokeparametre }: { sokeparametre: Record<string, string | string[] | undefined> }) {
  const bruker = await hentSkjermbruker();
  const idag = osloDag(new Date());
  const neste = idag.maned === 12 ? { aar: idag.aar + 1, maned: 1 } : { aar: idag.aar, maned: idag.maned + 1 };
  const aar = heltallParam(sokeparametre.ar, 2000, 2100, idag.aar);
  const maned = heltallParam(sokeparametre.maned, 1, 12, idag.maned);
  const visning = sokeparametre.visning === "liste" ? "liste" : "kalender";

  const { fra, til } = manedsvindu(aar, maned);
  const [data, turneringsdata, samlingsdata] = await Promise.all([hentTnManedsplan(bruker, fra, til), hentTnTurneringer(bruker), hentTnSamlinger(bruker)]);
  if (!data) notFound();

  const { uker, tall } = byggManedsplan({
    aar,
    maned,
    okter: data.okter,
    perioder: data.perioder,
    turneringer: turneringsdata?.turneringer ?? [],
    samlinger: samlingsdata?.samlinger ?? [],
  });

  const alleDager = uker.flatMap((u) => u.dager);
  const idagNokkel = dagnokkel(new Date());
  const dagParam = Array.isArray(sokeparametre.dag) ? sokeparametre.dag[0] : sokeparametre.dag;
  const valgtNokkel = alleDager.find((d) => d.nokkel === dagParam && d.iManed)?.nokkel ?? alleDager.find((d) => d.nokkel === idagNokkel && d.iManed)?.nokkel ?? alleDager.find((d) => d.iManed)!.nokkel;
  const valgtDag = alleDager.find((d) => d.nokkel === valgtNokkel)!;
  const valgtUke = uker.find((u) => u.dager.includes(valgtDag))!;

  const adresse = (endring: Record<string, string | number>) => {
    const p = new URLSearchParams({ ar: String(aar), maned: String(maned), visning, ...Object.fromEntries(Object.entries(endring).map(([k, v]) => [k, String(v)])) });
    return `/team-norway/manedsplan?${p.toString()}`;
  };
  const manedsvalg: TnFilterValg[] = [idag, neste].map((m) => ({ href: adresse({ ar: m.aar, maned: m.maned }), label: MANEDER_LANG[m.maned - 1]!, aktiv: m.aar === aar && m.maned === maned }));
  if (!manedsvalg.some((m) => m.aktiv)) manedsvalg.push({ href: adresse({}), label: `${MANEDER_LANG[maned - 1]} ${aar}`, aktiv: true });

  const tomMaaned = tall.okter + tall.turneringsdager + tall.samlingsdager === 0;

  const Dagcelle = ({ d }: { d: TnPlanDag }) => {
    const valgt = d.nokkel === valgtNokkel;
    return (
      <Link
        href={adresse({ dag: d.nokkel })}
        scroll={false}
        aria-current={valgt ? "date" : undefined}
        aria-label={`${DAGER_LANG[ukedag(d.nokkel)]} ${dm(d.nokkel)}, ${d.hendelser.length} aktiviteter`}
        style={{ minWidth: 0, minHeight: 96, padding: "8px 8px 10px", background: valgt ? TN.navy50 : TN.white, borderRight: `1px solid ${TN.navy100}`, borderTop: valgt ? `2px solid ${TN.navy900}` : "2px solid transparent", textDecoration: "none", color: TN.textPrimary, display: "flex", flexDirection: "column", gap: 4 }}
      >
        <span style={{ fontFamily: TN.font.mono, fontSize: 13, color: d.iManed ? TN.navy900 : TN.textSecondary }}>{d.dag}</span>
        {d.hendelser.slice(0, 2).map((h, i) => (
          <span key={`${h.id}-${i}`} style={{ display: "block", minWidth: 0, fontSize: 11.5, lineHeight: 1.3, padding: "2px 5px", borderRadius: TN.radius.sm, background: hendelseStil[h.type].bg, color: hendelseStil[h.type].fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: d.iManed ? 1 : 0.6 }}>
            {h.tid ? <span style={{ fontFamily: TN.font.mono }}>{h.tid} </span> : null}
            {h.tittel}
          </span>
        ))}
        {d.hendelser.length > 2 ? <span style={{ fontFamily: TN.font.mono, fontSize: 11, color: TN.textSecondary }}>+{d.hendelser.length - 2} til</span> : null}
      </Link>
    );
  };

  const Kalender = (
    <div className={visning === "kalender" ? "hidden lg:grid" : "hidden"} style={{ gridTemplateColumns: "minmax(0, 1fr) 300px", gap: 20, alignItems: "start" }}>
      <div style={{ border: `1px solid ${TN.navy100}`, background: TN.white, minWidth: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "48px repeat(7, minmax(0, 1fr))", borderBottom: `1px solid ${TN.navy100}` }}>
          {["Uke", ...DAGER].map((d) => <TnEtikett key={d} style={{ padding: "10px 8px" }}>{d}</TnEtikett>)}
        </div>
        {uker.map((u) => (
          <div key={u.fra} style={{ display: "grid", gridTemplateColumns: "48px minmax(0, 1fr)", borderBottom: `1px solid ${TN.navy100}` }}>
            <span style={{ fontFamily: TN.font.mono, fontSize: 15, color: TN.navy900, padding: "10px 8px", borderRight: `1px solid ${TN.navy100}` }}>{u.nr}</span>
            <div style={{ minWidth: 0 }}>
              <Periodebaand navn={u.periode?.navn} hoyre={u.periode ? `Uke ${u.periode.indeks} av ${u.periode.antall}` : ""} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>{u.dager.map((d) => <Dagcelle key={d.nokkel} d={d} />)}</div>
            </div>
          </div>
        ))}
      </div>
      <aside style={{ background: TN.white, border: `1px solid ${TN.navy100}`, padding: 20, minWidth: 0 }}>
        <TnEtikett>{`Uke ${valgtUke.nr} · ${valgtUke.periode?.navn ?? "Periode ikke satt"}`}</TnEtikett>
        <div style={{ fontFamily: TN.font.display, fontWeight: 300, fontSize: 24, letterSpacing: "0.1em", textTransform: "uppercase", color: TN.navy900, marginTop: 8 }}>{DAGER_LANG[ukedag(valgtNokkel)]}</div>
        <div style={{ fontFamily: TN.font.mono, fontSize: 13, color: TN.textSecondary, marginTop: 4 }}>{`${dm(valgtNokkel)}.${valgtNokkel.slice(0, 4)}`}</div>
        <div style={{ marginTop: 14 }}>
          {valgtDag.hendelser.map((h, i) => <Hendelsesrad key={`${h.id}-${i}`} h={h} />)}
          {valgtDag.hendelser.length === 0 ? <p style={{ fontSize: 14, color: TN.textSecondary, margin: "10px 0 0" }}>Ingen økter. Hviledag for gruppen.</p> : null}
        </div>
      </aside>
    </div>
  );

  const Liste = (
    <div className={visning === "kalender" ? "lg:hidden" : undefined}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {uker.map((u) => {
          const dager = u.dager.filter((d) => d.iManed && d.hendelser.length > 0);
          return (
            <div key={u.fra} style={{ background: TN.white, border: `1px solid ${TN.navy100}`, minWidth: 0 }}>
              <Periodebaand navn={u.periode?.navn} hoyre={`${dm(u.fra)}–${dm(u.til)}`} />
              <div style={{ fontFamily: TN.font.display, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: TN.navy900, padding: "10px 14px 0" }}>Uke {u.nr}</div>
              <div style={{ padding: "0 14px 6px" }}>
                {dager.map((d) => (
                  <div key={d.nokkel} style={{ display: "grid", gridTemplateColumns: "52px minmax(0, 1fr)", gap: 10, alignItems: "start" }}>
                    <div style={{ padding: "10px 0" }}>
                      <TnEtikett>{DAGER[ukedag(d.nokkel)]}</TnEtikett>
                      <div style={{ fontFamily: TN.font.mono, fontSize: 14, color: TN.navy900 }}>{dm(d.nokkel)}</div>
                    </div>
                    <div style={{ minWidth: 0 }}>{d.hendelser.map((h, i) => <Hendelsesrad key={`${h.id}-${i}`} h={h} />)}</div>
                  </div>
                ))}
                {dager.length === 0 ? <p style={{ fontSize: 14, color: TN.textSecondary, margin: "10px 0" }}>Ingen økter denne uken.</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <SkjermRamme aktiv="manedsplan" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode rute="/team-norway/manedsplan" tittel="Månedsplan" ingress={`Gruppens økter for ${MANEDER_LANG[idag.maned - 1]!.toLowerCase()} og ${MANEDER_LANG[neste.maned - 1]!.toLowerCase()}. Båndene viser hvilken periode hver uke tilhører.`} />

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
        <TnFilterknapper etikett="Velg måned" valg={manedsvalg} />
        <div className="hidden lg:block">
          <TnFilterknapper etikett="Velg visning" valg={[{ href: adresse({ visning: "kalender" }), label: "Kalender", aktiv: visning === "kalender" }, { href: adresse({ visning: "liste" }), label: "Liste", aktiv: visning === "liste" }]} />
        </div>
      </div>

      <Tegnforklaring />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 1, background: TN.navy100, border: `1px solid ${TN.navy100}` }}>
        {[
          ["Økter", String(tall.okter)],
          ["Turneringsdager", String(tall.turneringsdager)],
          ["Samlingsdager", String(tall.samlingsdager)],
          ["Frister", "—"],
        ].map(([etikett, verdi]) => (
          <div key={etikett} style={{ background: TN.white, padding: "14px 16px", minWidth: 0 }}>
            <div style={{ fontFamily: TN.font.mono, fontSize: 26, color: TN.navy900, fontVariantNumeric: "tabular-nums" }}>{verdi}</div>
            <TnEtikett style={{ marginTop: 4 }}>{etikett}</TnEtikett>
          </div>
        ))}
      </div>

      {tomMaaned ? (
        <TnFlate>
          <TnMangler>
            Ingen økter lagt inn for {MANEDER_LANG[maned - 1]!.toLowerCase()} {aar}. Planen vises her så snart trenerteamet har lagt inn første økt.{" "}
            <Link href="/team-norway/samlinger" style={{ color: TN.navy700 }}>Se samlinger</Link>
          </TnMangler>
        </TnFlate>
      ) : (
        <>
          {Kalender}
          {Liste}
        </>
      )}

      <TnFotnote>Økter er gruppens planlagte økter. Turneringer og samlinger hentes fra spillernes planer og resultater. Frister kan ikke registreres i AK Golf HQ ennå, og telles derfor ikke.</TnFotnote>
    </SkjermRamme>
  );
}
