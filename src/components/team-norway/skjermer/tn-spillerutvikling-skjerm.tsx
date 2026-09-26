import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnSpillere, type TnSpillerRad } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnEtikett, TnFilterknapper, TnFlate, TnFotnote, TnInitialer, TnMangler, TnSkjermhode } from "../tn-flate";
import { SkjermRamme, datoLang, hentSkjermbruker, osloDag } from "./felles";

/**
 * TN-12 Spillerutvikling.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-12.
 *
 * Avvik:
 *   - Filtrene Herrer og Damer finnes ikke: spillerprofilen har ikke kjønn.
 *     Alle og U18 (fra fødselsdato) står igjen.
 *   - Gruppekolonnen er tatt bort av samme grunn — det finnes ingen
 *     undergruppe i Team Norway-gruppen å vise.
 *   - Testfrister («Frist 04.10 · mangler») har ingen datamodell og vises ikke.
 *   - Søk og filter ligger i adressen (?q=&filter=) og virker uten JavaScript.
 */

const DAG_MS = 86_400_000;
const hcpTall = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function hcp(verdi: number | null) {
  if (verdi === null) return "—";
  return verdi < 0 ? `+${hcpTall.format(-verdi)}` : hcpTall.format(verdi);
}

function alder(fodt: Date | null) {
  if (!fodt) return null;
  const f = osloDag(fodt);
  const i = osloDag(new Date());
  return i.aar - f.aar - (i.maned < f.maned || (i.maned === f.maned && i.dag < f.dag) ? 1 : 0);
}

/** «uke 3 av 10» når planen har både start og slutt, ellers null. */
function planUke(s: TnSpillerRad) {
  if (!s.planStart || !s.planSlutt) return null;
  const antall = Math.max(1, Math.ceil((s.planSlutt.getTime() - s.planStart.getTime() + 1) / (7 * DAG_MS)));
  const denne = Math.min(antall, Math.max(1, Math.floor((Date.now() - s.planStart.getTime()) / (7 * DAG_MS)) + 1));
  return { denne, antall };
}

function Framdrift({ s }: { s: TnSpillerRad }) {
  if (!s.aktivPlan) return <span style={{ color: TN.textSecondary }}>Ingen aktiv plan</span>;
  const uke = planUke(s);
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 700, overflowWrap: "anywhere" }}>{s.aktivPlan}</div>
      {uke ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
          <span aria-hidden="true" style={{ flex: "1 1 60px", maxWidth: 120, height: 3, background: TN.navy100 }}>
            <span style={{ display: "block", height: 3, width: `${(uke.denne / uke.antall) * 100}%`, background: TN.navy900 }} />
          </span>
          <span style={{ fontFamily: TN.font.mono, fontSize: 12, color: TN.textSecondary, whiteSpace: "nowrap" }}>uke {uke.denne} av {uke.antall}</span>
        </div>
      ) : null}
    </div>
  );
}

function SisteTest({ s }: { s: TnSpillerRad }) {
  if (!s.sisteTest) return <span style={{ color: TN.textSecondary }}>Ingen tester</span>;
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontFamily: TN.font.mono, fontSize: 13 }}>{datoLang(s.sisteTest)}</div>
      <div style={{ fontSize: 13, color: TN.textSecondary, overflowWrap: "anywhere" }}>{s.sisteTestNavn}</div>
    </div>
  );
}

function Navnecelle({ s }: { s: TnSpillerRad }) {
  const aar = alder(s.fodselsdato);
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
      <TnInitialer navn={s.navn} storrelse={40} />
      <div style={{ minWidth: 0 }}>
        <Link href={`/team-norway/spiller/${s.id}`} style={{ fontSize: 15, fontWeight: 700, color: TN.textPrimary, overflowWrap: "anywhere" }}>{s.navn}</Link>
        <div style={{ fontSize: 13, color: TN.textSecondary, overflowWrap: "anywhere" }}>{[s.klubb ?? "Klubb ikke registrert", aar === null ? null : `${aar} år`].filter(Boolean).join(" · ")}</div>
      </div>
    </div>
  );
}

const KOLONNER = "minmax(0, 2.2fr) 72px minmax(0, 2fr) 64px minmax(0, 1.4fr)";

export async function TnSpillerutviklingSkjerm({ sokeparametre }: { sokeparametre: Record<string, string | string[] | undefined> }) {
  const bruker = await hentSkjermbruker();
  const data = await hentTnSpillere(bruker);
  if (!data || data.kontekst.erSpiller) notFound();

  const q = (Array.isArray(sokeparametre.q) ? sokeparametre.q[0] : sokeparametre.q)?.trim() ?? "";
  const filter = sokeparametre.filter === "u18" ? "u18" : "alle";
  const erU18 = (s: TnSpillerRad) => {
    const a = alder(s.fodselsdato);
    return a !== null && a < 18;
  };

  const sortert = [...data.rader].sort((a, b) => (a.hcp ?? Infinity) - (b.hcp ?? Infinity) || a.navn.localeCompare(b.navn, "nb"));
  const rader = sortert.filter((s) => (filter === "alle" || erU18(s)) && (!q || s.navn.toLowerCase().includes(q.toLowerCase())));
  const adresse = (f: string) => `/team-norway/spillere?${new URLSearchParams({ filter: f, ...(q ? { q } : {}) }).toString()}`;

  return (
    <SkjermRamme aktiv="spillere" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode rute="/team-norway/spillere" tittel="Spillerutvikling" ingress="Alle landslagsspillere med HCP, aktiv treningsplan og testhistorikk." />

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <TnFilterknapper
          etikett="Filtrer spillere"
          valg={[
            { href: adresse("alle"), label: "Alle", aktiv: filter === "alle", antall: data.rader.length },
            { href: adresse("u18"), label: "U18", aktiv: filter === "u18", antall: data.rader.filter(erU18).length },
          ]}
        />
        <form action="/team-norway/spillere" style={{ flex: "0 1 320px", minWidth: 0, display: "flex" }}>
          <input type="hidden" name="filter" value={filter} />
          <label style={{ flex: 1, minWidth: 0 }}>
            <span className="sr-only">Søk etter spiller</span>
            <input type="search" name="q" defaultValue={q} placeholder="Søk etter spiller" style={{ width: "100%", minHeight: 44, padding: "0 14px", border: `1px solid ${TN.navy300}`, borderRadius: TN.radius.sm, background: TN.white, fontFamily: TN.font.body, fontSize: 15, color: TN.textPrimary }} />
          </label>
        </form>
      </div>

      <TnFlate style={{ padding: 0 }}>
        {rader.length > 0 ? (
          <>
            <div className="hidden lg:block">
              <div role="table" aria-label="Spillerutvikling">
                <div role="row" style={{ display: "grid", gridTemplateColumns: KOLONNER, gap: 16, padding: "12px 20px", borderBottom: `2px solid ${TN.navy900}` }}>
                  {["Spiller", "HCP", "Aktiv treningsplan", "Tester", "Siste test"].map((k) => <TnEtikett key={k}><span role="columnheader">{k}</span></TnEtikett>)}
                </div>
                {rader.map((s) => (
                  <div role="row" key={s.id} style={{ display: "grid", gridTemplateColumns: KOLONNER, gap: 16, padding: "14px 20px", borderBottom: `1px solid ${TN.navy100}`, alignItems: "center" }}>
                    <div role="cell" style={{ minWidth: 0 }}><Navnecelle s={s} /></div>
                    <div role="cell" style={{ fontFamily: TN.font.mono, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>{hcp(s.hcp)}</div>
                    <div role="cell" style={{ minWidth: 0 }}><Framdrift s={s} /></div>
                    <div role="cell" style={{ fontFamily: TN.font.mono, fontSize: 15 }}>{s.tester}</div>
                    <div role="cell" style={{ minWidth: 0 }}><SisteTest s={s} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:hidden">
              {rader.map((s) => (
                <div key={s.id} style={{ padding: 16, borderBottom: `1px solid ${TN.navy100}`, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                    <Navnecelle s={s} />
                    <div style={{ textAlign: "right", flex: "none" }}>
                      <div style={{ fontFamily: TN.font.mono, fontSize: 16 }}>{hcp(s.hcp)}</div>
                      <TnEtikett style={{ fontSize: 10 }}>HCP</TnEtikett>
                    </div>
                  </div>
                  <Framdrift s={s} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: 13, color: TN.textSecondary }}>
                    <span><span style={{ fontFamily: TN.font.mono, color: TN.textPrimary }}>{s.tester}</span> tester</span>
                    <span>Siste {s.sisteTest ? <><span style={{ fontFamily: TN.font.mono }}>{datoLang(s.sisteTest)}</span>{s.sisteTestNavn ? ` · ${s.sisteTestNavn}` : ""}</> : "ingen"}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : data.rader.length === 0 ? (
          <div style={{ padding: 20 }}>
            <TnMangler>Ingen spillere i gruppen ennå. Spillerne vises her når de er lagt inn i Team Norway-gruppen. <Link href="/team-norway/uttak" style={{ color: TN.navy700 }}>Se uttakskriterier</Link></TnMangler>
          </div>
        ) : (
          <div style={{ padding: 20 }}>
            <TnMangler>Ingen spillere passer søket i denne gruppen. <Link href="/team-norway/spillere" style={{ color: TN.navy700 }}>Nullstill filter</Link></TnMangler>
          </div>
        )}
      </TnFlate>

      <TnFotnote>{rader.length} {rader.length === 1 ? "spiller" : "spillere"} · sortert etter HCP, pluss-HCP øverst. Tester teller alle registrerte testresultater. Kjønn står ikke i spillerprofilen, derfor finnes ikke filtrene Herrer og Damer.</TnFotnote>
    </SkjermRamme>
  );
}
