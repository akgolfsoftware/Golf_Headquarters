import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import { LeverteIupProfil } from "@/components/iup/LeverteIupProfil";
import { TN_INNSYN_FANER, type TnInnsynFane } from "@/lib/deling/tn-innsyn-faner";
import type { TnInnsyn } from "@/lib/deling/tn-innsyn-data";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import "@/styles/playerhq-ny-pakke5-skra.css";
import "@/styles/playerhq-ny-tn-innsyn.css";

export type TnInnsynTrener = { epost: string; gruppeNavn: string; invitert: string };

export type TnInnsynData = {
  grupper: { id: string; navn: string }[];
  /** Team Norway-trenere med aktiv navngitt deling. */
  trenere: TnInnsynTrener[];
  fane: TnInnsynFane;
  /** Null når spilleren ikke deler: da ser trenerne bare det åpne, og fanene vises ikke. */
  iup: TnInnsyn | null;
  apent: { navn: string; klubb: string | null; fodselsaar: number | null; wagrPlass: number | null };
};

const heltall = new Intl.NumberFormat("nb-NO");
const toDes = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const enDes = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 });
const kort = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" });
const lang = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Oslo" });
const dato = (d: Date | string | null) => (d ? kort.format(typeof d === "string" ? new Date(d) : d) : "—");
const timer = (min: number) => `${enDes.format(Math.round((min / 60) * 10) / 10)} t`;

function Kort({ tittel, bred, children }: { tittel?: string; bred?: boolean; children: ReactNode }) {
  return (
    <section className={`phn-kort${bred ? " tni-bred" : ""}`}>
      {tittel ? <b className="phn-undertittel">{tittel}</b> : null}
      {children}
    </section>
  );
}

function Rad({ tittel, tekst, hoyre }: { tittel: ReactNode; tekst?: ReactNode; hoyre?: ReactNode }) {
  return (
    <div className="tni-rad">
      <span className="tni-rad-tekst"><b>{tittel}</b>{tekst ? <span className="phn-kilde">{tekst}</span> : null}</span>
      {hoyre != null ? <span className="tni-tall">{hoyre}</span> : null}
    </div>
  );
}

const Tom = ({ children }: { children: ReactNode }) => <p className="phn-forklar">{children}</p>;

function Stripe({ tall }: { tall: { verdi: string; tekst: string }[] }) {
  return (
    <dl className="tni-stripe">
      {tall.map((t) => <div key={t.tekst}><dt>{t.tekst}</dt><dd>{t.verdi}</dd></div>)}
    </dl>
  );
}

function Fane({ iup }: { iup: TnInnsyn }) {
  switch (iup.fane) {
    case "oversikt": {
      const { profil, delt, tester, poster, aar } = iup;
      const snitt = profil.aaret && profil.aaret.runder > 0 && profil.aaret.bruttoSnitt != null ? toDes.format(profil.aaret.bruttoSnitt) : "—";
      return (
        <>
          <Kort bred>
            <Stripe tall={[
              { verdi: delt?.wagr?.plass != null ? heltall.format(delt.wagr.plass) : "—", tekst: "WAGR-plass" },
              { verdi: "—", tekst: "NGF juniorranking" },
              { verdi: snitt, tekst: `brutto snitt ${aar}` },
              { verdi: "—", tekst: "kategori" },
            ]} />
            <p className="phn-kilde">{delt?.wagr ? `WAGR ${lang.format(delt.wagr.dato)}. ` : ""}Brutto snitt: turneringsrunder {aar}, bare brutto.</p>
          </Kort>
          <Kort tittel="Siste tester">
            {tester.length === 0 ? <Tom>Ingen registrerte tester ennå.</Tom> : tester.slice(0, 3).map((t) => <Rad key={t.testId} tittel={t.protokollNavn} hoyre={`${t.sisteFormatert ?? "—"} · ${dato(t.sisteDato)}`} />)}
          </Kort>
          <Kort tittel="Neste turneringer">
            {!delt || delt.nesteTurneringer.length === 0 ? <Tom>Ingen turneringer i planen.</Tom> : delt.nesteTurneringer.map((t) => <Rad key={`${t.navn}-${t.dato.toISOString()}`} tittel={t.navn} tekst={t.merke} hoyre={dato(t.dato)} />)}
          </Kort>
          <Kort tittel="Poster fra Team Norway">
            {poster.length === 0 ? <Tom>Ingen poster ennå.</Tom> : poster.slice(0, 3).map((p) => <Rad key={p.id} tittel={p.tekst.split("\n")[0]} tekst={p.authorNavn} hoyre={dato(p.createdAt)} />)}
          </Kort>
        </>
      );
    }
    case "turneringsplan": {
      const { plan } = iup;
      return (
        <Kort tittel="Turneringer i planen" bred>
          {!plan || plan.plan.length === 0 ? <Tom>Ingen turneringer i planen ennå.</Tom> : plan.plan.map((r) => <Rad key={r.entryId} tittel={r.navn} tekst={`${r.tier}-turnering · ${r.statusTekst}`} hoyre={dato(r.d)} />)}
          <p className="phn-kilde">Du endrer planen selv i Plan › Turneringer. Forslag fra treneren kommer i Innboks.</p>
        </Kort>
      );
    }
    case "ranking": {
      const { wagr, historikk } = iup.ranking;
      return (
        <>
          <Kort bred>
            <Stripe tall={[
              { verdi: wagr?.plass != null ? heltall.format(wagr.plass) : "—", tekst: "WAGR-plass" },
              { verdi: wagr?.bestePlass != null ? heltall.format(wagr.bestePlass) : "—", tekst: "beste plass" },
              { verdi: wagr?.snittPoeng != null ? toDes.format(wagr.snittPoeng) : "—", tekst: "snittpoeng" },
              { verdi: "—", tekst: "NGF juniorranking" },
            ]} />
            <p className="phn-kilde">World Amateur Golf Ranking (WAGR), The R&amp;A{wagr ? `, ${lang.format(wagr.dato)}` : ""}.</p>
          </Kort>
          <Kort tittel="WAGR-turneringer" bred>
            {historikk.length === 0 ? <Tom>Ingen WAGR-turneringer ennå.</Tom> : [...historikk].reverse().slice(0, 12).map((p, i) => (
              <Rad key={`${p.navn}-${i}`} tittel={p.navn} tekst={p.plassering ? `Plass ${p.plassering}` : undefined} hoyre={p.plassFoer != null && p.plassEtter != null ? `${heltall.format(p.plassFoer)} → ${heltall.format(p.plassEtter)}` : "—"} />
            ))}
          </Kort>
        </>
      );
    }
    case "turneringer": {
      const { aar, iAar, iFjor } = iup;
      const snitt = (p: typeof iAar | null) => (p?.aaret && p.aaret.runder > 0 && p.aaret.bruttoSnitt != null ? toDes.format(p.aaret.bruttoSnitt) : "—");
      return (
        <>
          <Kort bred>
            <Stripe tall={[
              { verdi: snitt(iAar), tekst: `brutto snitt ${aar}` },
              { verdi: iAar.aaret ? heltall.format(iAar.aaret.runder) : "—", tekst: `runder ${aar}` },
              { verdi: snitt(iFjor), tekst: `brutto snitt ${aar - 1}` },
              { verdi: iAar.turneringer ? heltall.format(iAar.turneringer.length) : "—", tekst: `turneringer ${aar}` },
            ]} />
            <p className="phn-kilde">Turneringsrunder i kalenderåret, bare brutto. Treningsrunder teller ikke.</p>
          </Kort>
          <Kort tittel={`Turneringer ${aar}`} bred>
            {!iAar.turneringer || iAar.turneringer.length === 0 ? <Tom>Ingen turneringer i år.</Tom> : iAar.turneringer.map((t, i) => (
              <Rad key={`${t.navn}-${i}`} tittel={t.navn} tekst={`${dato(t.start)} · ${t.runder} ${t.runder === 1 ? "runde" : "runder"}`} hoyre={`${t.bruttoSnitt != null ? toDes.format(t.bruttoSnitt) : "—"} · ${t.status === "CUT" ? "MC" : t.plassering ? `plass ${t.plassering}` : "plass —"}`} />
            ))}
          </Kort>
        </>
      );
    }
    case "trening": {
      const { data, planer } = iup;
      const fire = data.trening.fireUker;
      const pct = fire.planlagtMin > 0 ? Math.round((fire.gjortMin / fire.planlagtMin) * 100) : null;
      const tek = fire.gjortMin > 0 ? Math.round((fire.akseMin.TEK / fire.gjortMin) * 100) : null;
      return (
        <>
          <Kort bred>
            <Stripe tall={[
              { verdi: fire.gjortMin > 0 ? timer(fire.gjortMin) : "—", tekst: "gjennomført siste fire uker" },
              { verdi: pct != null ? `${pct} %` : "—", tekst: "av planlagt tid" },
              { verdi: tek != null ? `${tek} %` : "—", tekst: "TEK av gjennomført" },
              { verdi: data.trening.underPlan ? "Ja" : "Nei", tekst: "under 70 % to uker på rad" },
            ]} />
            <p className="phn-kilde">Gjennomført tid mot planlagt tid de fire siste hele ukene. Kilde: PlayerHQ, {lang.format(iup.naa)}.</p>
          </Kort>
          <Kort tittel="Per akse siste fire uker">
            {(["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const).map((a) => <Rad key={a} tittel={a} hoyre={timer(fire.akseMin[a])} />)}
          </Kort>
          <Kort tittel="Denne og neste uke">
            {data.kommende.length === 0 ? <Tom>Ingen økter lagt inn de neste to ukene.</Tom> : data.kommende.slice(0, 10).map((o) => <Rad key={o.id} tittel={o.tittel} tekst={`${o.akse} · ${o.minutter} min`} hoyre={dato(o.dato)} />)}
          </Kort>
          <Kort tittel="Sist gjennomført">
            {data.sistGjort.length === 0 ? <Tom>Ingen gjennomførte økter de siste fire ukene.</Tom> : data.sistGjort.map((o) => <Rad key={o.id} tittel={o.tittel} tekst={`${o.akse} · ${o.minutter} min`} hoyre={dato(o.dato)} />)}
          </Kort>
          <Kort tittel="Aktive treningsplaner">
            {planer.length === 0 ? <Tom>Ingen aktive treningsplaner.</Tom> : planer.map((p) => <Rad key={p.id} tittel={p.navn} hoyre={p.sluttDato ? `${dato(p.startDato)}–${dato(p.sluttDato)}` : `fra ${dato(p.startDato)}`} />)}
          </Kort>
        </>
      );
    }
    case "tester":
      return (
        <Kort tittel="Tester" bred>
          {iup.rader.length === 0 ? <Tom>Ingen registrerte tester ennå.</Tom> : iup.rader.map((t) => (
            <Rad key={t.testId} tittel={t.protokollNavn} tekst={`${t.antall} ${t.antall === 1 ? "gang" : "ganger"} · siste ${dato(t.sisteDato)}`} hoyre={t.sisteFormatert ?? "—"} />
          ))}
        </Kort>
      );
    case "teknisk-plan":
      return (
        <Kort tittel="Teknisk plan" bred>
          {iup.planer.length === 0 ? <Tom>Ingen teknisk plan ennå.</Tom> : iup.planer.map((p) => (
            <Rad key={p.id} tittel={p.navn} tekst={p.sluttDato ? `${dato(p.startDato)}–${dato(p.sluttDato)}` : `fra ${dato(p.startDato)}`} hoyre={`${p.antallFullfort} av ${p.antallOppgaver}`} />
          ))}
        </Kort>
      );
    case "fireukerssjekk": {
      const { grunnlag, iup: levert } = iup;
      return (
        <>
          <Kort bred><LeverteIupProfil rader={levert} tittel="Levert fra PlayerHQ" /></Kort>
          <Kort tittel="Nyeste tester">
            {grunnlag.tester.length === 0 ? <Tom>Ingen registrerte testresultater ennå.</Tom> : grunnlag.tester.map((t) => <Rad key={t.id} tittel={t.name} tekst={t.latestDate ?? undefined} hoyre={t.latest ?? "—"} />)}
          </Kort>
          <Kort tittel="Teknisk plan-status">
            {grunnlag.aktivPlan ? <Rad tittel={grunnlag.aktivPlan.navn} tekst={`${grunnlag.aktivPlan.antallFullfort} av ${grunnlag.aktivPlan.antallOppgaver} oppgaver fullført`} /> : <Tom>Ingen teknisk plan opprettet ennå.</Tom>}
          </Kort>
          <Kort tittel="Neste tiltak">
            {grunnlag.nesteTiltak ? <Rad tittel={grunnlag.nesteTiltak.tittel} tekst={grunnlag.nesteTiltak.posisjon} /> : <Tom>Ingen åpne oppgaver i en aktiv plan.</Tom>}
          </Kort>
        </>
      );
    }
  }
}

/**
 * «Se hva Team Norway ser» (utkast 2, docs/design-system/utkast-tn/trenerflate, skjermen seHvaTn):
 * spillerens egen IUP med de samme åtte fanene og tallene som Team Norway-treneren ser, uten knapper.
 * PlayerHQ-skallet, ikke Team Norway-skallet. Bare for spillere i en Team Norway-gruppe; deling
 * endres i Meg › Deling, ikke her.
 */
export function TnInnsynSpiller({ data }: { data: TnInnsynData }) {
  const delt = data.trenere.length > 0;
  const apent: [string, string][] = [
    ["Navn", data.apent.navn],
    ["Klubb", data.apent.klubb ?? "—"],
    ["Fødselsår", data.apent.fodselsaar ? String(data.apent.fodselsaar) : "—"],
    ["WAGR-plass", data.apent.wagrPlass != null ? heltall.format(data.apent.wagrPlass) : "—"],
  ];
  return (
    <div className="phn phn-meg phn-skra phn-tni">
      <SkraTopp
        lav
        etikett="Team Norway"
        bilde="/images/playerhq/tek-video.jpg"
        bildePosisjon="50% 50%"
        overlinje="Meg › Deling › Team Norway"
        tittel="Slik ser Team Norway IUP-en din"
        ingress={delt ? `${data.trenere.length} ${data.trenere.length === 1 ? "trener har" : "trenere har"} tilgang` : "Ingen trener har tilgang til mer enn det åpne"}
        handling={<span className="skra-tilbake"><Link className="tilbake" href="/portal/meg/deling"><ChevronLeft size={18} aria-hidden />Deling</Link></span>}
      />
      <SkraFlyt lav>
        <div className="side tni-side">
          <Kort tittel="Hvem ser dette" bred>
            {delt ? data.trenere.map((t) => <Rad key={t.epost} tittel={t.epost} tekst={t.gruppeNavn} hoyre={`Invitert ${dato(t.invitert)}`} />) : (
              <dl className="tni-apent">
                {apent.map(([k, v]) => <div key={k}><dt className="phn-forklar">{k}</dt><dd>{v}</dd></div>)}
              </dl>
            )}
            <span className="phn-forklar">{delt ? `${data.trenere.length === 1 ? "Treneren ser" : "Alle ser"} alt under. Du ser det samme, uten knapper.` : "Trenerne i Team Norway ser bare navn, klubb, fødselsår og WAGR-plass til du deler."}</span>
            <Link className="phn-lenke" href="/portal/meg/deling">{delt ? "Endre deling i Meg › Deling" : "Del med en Team Norway-trener"}</Link>
          </Kort>
          {data.iup && delt ? (
            <>
              <nav className="tni-faner" aria-label="IUP-faner">
                {TN_INNSYN_FANER.map((f) => (
                  <Link key={f.id} href={f.id === "oversikt" ? "/portal/meg/deling/team-norway" : `/portal/meg/deling/team-norway?fane=${f.id}`} aria-current={f.id === data.fane ? "page" : undefined} scroll={false}>{f.navn}</Link>
                ))}
              </nav>
              <div className="tni-flate"><Fane iup={data.iup} /></div>
              <p className="phn-kilde">Visningen er bare til å lese. Forslag fra treneren kommer i Innboks, der du godtar eller avviser.</p>
            </>
          ) : null}
        </div>
      </SkraFlyt>
    </div>
  );
}
