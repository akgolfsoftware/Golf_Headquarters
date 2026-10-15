import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnSpillere, type TnSpillerRad } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnFilterknapper, TnFlate, TnFotnote, TnInitialer, TnMangler, TnSkjermhode, TnTekstlenke } from "../tn-flate";
import { TnHandlingLenke, TnKnapperekke } from "../tn-handlinger";
import { SkjermRamme, datoLang, hentSkjermbruker, osloDag } from "./felles";
import st from "./tn-spillere.module.css";

/**
 * TN-12 Spillerutvikling.
 * Fasit: docs/design-system/utkast-tn/spillere.html, skjerm Spillerutvikling (pakke 3).
 *
 * Avvik:
 *   - Filtrene Herrer og Damer finnes ikke: spillerprofilen har ikke kjønn.
 *     Alle og U18 (fra fødselsdato) står igjen.
 *   - Kategori A–K og «Plan %» (etterlevelse) står ikke i lista; aktiv plan og
 *     uke i planen står i stedet. «Mangler test» og «Ikke delt» som filter har
 *     ingen datakilde i lista.
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
  const rader = sortert.filter((s) => (filter === "alle" || erU18(s)) && (!q || `${s.navn} ${s.klubb ?? ""}`.toLowerCase().includes(q.toLowerCase())));
  const adresse = (f: string) => `/team-norway/spillere?${new URLSearchParams({ filter: f, ...(q ? { q } : {}) }).toString()}`;

  return (
    <SkjermRamme aktiv="spillere" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode
        overlinje={`${data.kontekst.gruppe.name} · ${data.rader.length} ${data.rader.length === 1 ? "spiller" : "spillere"}`}
        tittel="Spillerutvikling"
        ingress="Alle landslagsspillere med HCP, aktiv treningsplan og testhistorikk. Trykk på en spiller for å åpne IUP-en."
      />

      <div className={st.sok}>
        <form action="/team-norway/spillere" className={st.sok} style={{ flex: "1 1 260px" }}>
          <input type="hidden" name="filter" value={filter} />
          <label>
            Søk etter spiller
            <input type="search" name="q" defaultValue={q} placeholder="Navn eller klubb" />
          </label>
        </form>
        <TnFilterknapper
          etikett="Filtrer spillere"
          valg={[
            { href: adresse("alle"), label: "Alle", aktiv: filter === "alle", antall: data.rader.length },
            { href: adresse("u18"), label: "U18", aktiv: filter === "u18", antall: data.rader.filter(erU18).length },
          ]}
        />
      </div>

      <TnFlate style={{ paddingBlock: 4 }}>
        {rader.map((s) => {
          const a = alder(s.fodselsdato);
          const uke = planUke(s);
          return (
            <Link key={s.id} href={`/team-norway/spiller/${s.id}/oversikt`} className={st.spillerrad}>
              <TnInitialer navn={s.navn} />
              <span>
                <span className={st.navn}>{s.navn}</span>
                <span className={st.kilde}>{[s.klubb ?? "Klubb ikke registrert", a === null ? null : `${a} år`].filter(Boolean).join(" · ")}</span>
              </span>
              <span className={st.info}>
                <span>HCP {hcp(s.hcp)}</span>
                <span>{s.aktivPlan ? `${s.aktivPlan}${uke ? ` · uke ${uke.denne} av ${uke.antall}` : ""}` : "Ingen aktiv plan"}</span>
                <span>{s.sisteTest ? `Test ${datoLang(s.sisteTest)}` : "Ingen test"}</span>
              </span>
              <span className={st.hoyre}><TnPille tone={s.tester > 0 ? "info" : "amber"}>{s.tester} {s.tester === 1 ? "test" : "tester"}</TnPille></span>
            </Link>
          );
        })}
        {rader.length === 0 && data.rader.length === 0 ? (
          <TnMangler>Ingen spillere i gruppen ennå. Spillerne vises her når de er lagt inn i Team Norway-gruppen.</TnMangler>
        ) : rader.length === 0 ? (
          <TnMangler>Ingen spillere passer søket. <Link href="/team-norway/spillere" style={{ color: TN.navy600, fontWeight: 700 }}>Nullstill filter</Link></TnMangler>
        ) : null}
      </TnFlate>

      <TnFotnote>Sortert etter HCP, pluss-HCP øverst. Tester teller alle registrerte testresultater. Kjønn står ikke i spillerprofilen, derfor finnes ikke filtrene Herrer og Damer.</TnFotnote>
      <TnKnapperekke>
        {data.kontekst.kanAdministrere ? <TnHandlingLenke href="/team-norway/inviter" variant="sekundar">Inviter spiller</TnHandlingLenke> : null}
        <TnTekstlenke href="/team-norway/uttak">Se uttakskriterier</TnTekstlenke>
      </TnKnapperekke>
    </SkjermRamme>
  );
}
