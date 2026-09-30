import Link from "next/link";

import { ddmm, ddmmaaaa, osloIso } from "@/app/team-wang/_data/wang-trening-beregning";
import { WangRad, WangStatus, WangTom, type WangStatusTone } from "@/components/wang/trener/wang-ui";
import type { ForslagRad, SamtaleRad, SjekkRad } from "@/lib/oppfolging/data";
import { FORSLAG_STATUS_NAVN, FORSLAG_TYPE_NAVN, SAMTALE_TYPE_NAVN } from "@/lib/oppfolging/regler";
import { elevprofilHref } from "@/lib/wang/wang-ruter";

/**
 * Listene i WANG-43/44/45/46: fireukerssjekk, forslag og samtaler. Alle tall og
 * tekster kommer fra basen; manglende verdi vises som «—», aldri en gjetning.
 * Bare trenerflaten (krevWangTrener) rendrer disse.
 */

const dag = (d: Date) => ddmmaaaa(osloIso(d));

function ElevLenke({ id, navn }: { id: string; navn: string }) {
  return <Link href={elevprofilHref(id)} style={{ color: "inherit" }}>{navn}</Link>;
}

const SJEKK_TONE: Record<SjekkRad["status"], { tone: WangStatusTone; tekst: (s: SjekkRad) => string }> = {
  LEVERT: { tone: "ferdig", tekst: (s) => `Levert ${s.levertAt ? dag(s.levertAt) : "—"}` },
  FORFALT: { tone: "varsel", tekst: () => "Ikke levert" },
  PAAGAAR: { tone: "planlagt", tekst: () => "Pågår" },
};

export function SjekkListe({ sjekker }: { sjekker: SjekkRad[] }) {
  if (sjekker.length === 0) {
    return <WangTom tittel="Ingen fireukerssjekk levert ennå." tekst="Eleven leverer fireukerssjekken i PlayerHQ hver fjerde uke. Innleveringene vises her når de kommer." />;
  }
  return (
    <>
      {sjekker.map((s) => {
        const besvart = s.utviklingssjekk ? Object.values(s.utviklingssjekk.svar) : [];
        return (
          <WangRad
            key={s.id}
            tittel={<ElevLenke id={s.elevId} navn={s.elevNavn} />}
            under={
              <>
                Periode {ddmm(osloIso(s.periodeStart))}–{ddmm(osloIso(s.periodeSlutt))} · frist {dag(s.frist)}
                {s.prosessmaal ? <><br />Prosessmål: {s.prosessmaal}</> : null}
                {s.utviklingssjekk ? <><br />Utviklingssjekk ({s.utviklingssjekk.niva.toLowerCase()}): {besvart.length} av 8 besvart</> : null}
              </>
            }
            hoyre={<WangStatus tone={SJEKK_TONE[s.status].tone}>{SJEKK_TONE[s.status].tekst(s)}</WangStatus>}
          />
        );
      })}
    </>
  );
}

const FORSLAG_TONE: Record<ForslagRad["status"], WangStatusTone> = { VENTER: "pagar", GODTATT: "ferdig", AVVIST: "fravaer" };

export function ForslagListe({ forslag, visElev = true }: { forslag: ForslagRad[]; visElev?: boolean }) {
  if (forslag.length === 0) return <WangTom tittel="Ingen forslag sendt." tekst="Forslag du sender til eleven, står her som Venter til eleven godtar eller avviser." />;
  return (
    <>
      {forslag.map((f) => (
        <WangRad
          key={f.id}
          tittel={visElev ? <><ElevLenke id={f.elevId} navn={f.elevNavn} /> · {FORSLAG_TYPE_NAVN[f.type]}</> : FORSLAG_TYPE_NAVN[f.type]}
          under={
            <>
              {f.tekst}
              <br />Sendt {dag(f.createdAt)}
              {f.svar ? <> · Svar: {f.svar}</> : null}
            </>
          }
          hoyre={<WangStatus tone={FORSLAG_TONE[f.status]}>{FORSLAG_STATUS_NAVN[f.status]}</WangStatus>}
        />
      ))}
    </>
  );
}

export function SamtaleListe({ samtaler, visElev = true }: { samtaler: SamtaleRad[]; visElev?: boolean }) {
  if (samtaler.length === 0) return <WangTom tittel="Ingen samtaler logget." tekst="Samtaler og det dere avtalte vises her med dato og type." />;
  return (
    <>
      {samtaler.map((s) => (
        <WangRad
          key={s.id}
          tittel={visElev ? <>{dag(s.dato)} · <ElevLenke id={s.elevId} navn={s.elevNavn} /></> : dag(s.dato)}
          under={s.avtalt}
          hoyre={<WangStatus tone="planlagt">{SAMTALE_TYPE_NAVN[s.type]}</WangStatus>}
        />
      ))}
    </>
  );
}
