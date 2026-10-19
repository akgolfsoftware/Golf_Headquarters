"use client";

/**
 * FO-03 Booking for barnet (/forelder/bookinger/ny/[barnId]) — Precision Athletics.
 * Fasit: docs/design-system/utkast-flater/forelder.html, mal «booking».
 * Stil: src/styles/flater-ny-forelder-booking.css.
 *
 * Samme lenkekontrakt som BookingNyV2: ?service=&dato=(&betaling=1) styrer stegene, og en tid
 * lenker til <wizardBase>/bekreft?service=&start=&coach=. Siden eier spørringene (byggBookingNyData).
 *
 * Avvik:
 *   - Barnet er valgt før skjermen åpnes (ruten har barnId). «Bytt» går til barnevalget.
 *   - Utkastet har fire steg på én flate. Her er det tre (tjeneste, tid, bekreft), fordi bekreft er
 *     egen side som sjekker at tiden fortsatt er ledig.
 *   - Dagene brytes over flere linjer i stedet for å rulle sidelengs.
 */
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { NyWizardResult } from "@/lib/portal-booking/ny-wizard-data";
import "@/styles/flater-ny-forelder-booking.css";

type Data = Extract<NyWizardResult, { ingenTjenester: false }>["data"];

const UKEDAG = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];

function initialer(navn: string) {
  return navn.split(" ").filter(Boolean).slice(0, 2).map((d) => d[0]?.toUpperCase()).join("") || "?";
}

function kr(ore: number) {
  return `${(ore / 100).toLocaleString("nb-NO")} kr`;
}

export function FO03BookingNy({ data, barnNavn, flereBarn }: { data: Data; barnNavn: string; flereBarn: boolean }) {
  const {
    wizardBase, modus, betalingGrunn, tjenester, valgtServiceId, valgtServiceNavn, valgtServiceVarighetMin,
    datoParam, valgtDatoIso, valgtDatoLang, aktivtSteg, isFree, slots, creditsRemaining, monthlyCredits,
  } = data;
  const erBetaling = modus === "betaling";
  const betalingQ = erBetaling ? "&betaling=1" : "";
  const valgtSlug = tjenester.find((t) => t.id === valgtServiceId)?.slug ?? "";
  const fornavn = barnNavn.split(" ")[0] ?? barnNavn;

  // Samme datologikk som BookingNyV2 (lenkene må være like).
  const valgtDato = new Date(valgtDatoIso);
  const idag = new Date();
  idag.setHours(0, 0, 0, 0);
  const datoer: Date[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(idag);
    d.setDate(idag.getDate() + i);
    datoer.push(d);
  }

  const perCoach = new Map<string, { coachNavn: string; tider: string[] }>();
  for (const s of slots) {
    const g = perCoach.get(s.coachId);
    if (g) g.tider.push(s.startIso);
    else perCoach.set(s.coachId, { coachNavn: s.coachNavn, tider: [s.startIso] });
  }

  const ingress = erBetaling
    ? betalingGrunn === "BRUKT_OPP"
      ? "Månedens klipp er brukt opp. Timen betales med kort eller Apple Pay."
      : "Timen betales med kort eller Apple Pay. Klippene røres ikke."
    : `${creditsRemaining} av ${monthlyCredits} klipp igjen denne måneden.`;

  return (
    <div className="fob">
      <Link href="/forelder/bookinger" className="fob-tilbake"><ChevronLeft aria-hidden />Bookinger</Link>
      <header className="fob-hode">
        <p className="fob-kicker">Forelder · booking</p>
        <h1>Book time</h1>
        <p>{ingress}</p>
        <div className="fob-steglinje" aria-label={`Steg ${aktivtSteg} av 3`}>
          {[1, 2, 3].map((n) => <i key={n} data-ja={n <= aktivtSteg ? "true" : undefined} />)}
        </div>
      </header>

      <section className="fob-seksjon">
        <span className="fob-steg"><b>1</b>Hvem gjelder timen?</span>
        <div className="fob-kort">
          <div className="fob-barn">
            <span className="fob-avatar" aria-hidden>{initialer(barnNavn)}</span>
            <div><strong>{barnNavn}</strong><small>Timen legges inn på {fornavn}</small></div>
            {flereBarn && <Link href="/forelder/bookinger/ny" className="fob-lenke">Bytt</Link>}
          </div>
        </div>
      </section>

      {isFree && !erBetaling && (
        <div className="fob-tom">
          <strong>{fornavn} har ingen klipp å bruke</strong>
          <p>Klipp følger med coaching-pakkene Performance og Performance Pro. Du kan likevel booke og betale timen med kort eller Apple Pay.</p>
          <Link href={`${wizardBase}?betaling=1`} className="fob-lenke">Betal for timen</Link>
        </div>
      )}

      <section className="fob-seksjon">
        <span className="fob-steg"><b>2</b>Tjeneste</span>
        {aktivtSteg === 1 ? (
          <div className="fob-valg">
            {tjenester.map((t) => (
              <Link
                key={t.id}
                href={`${wizardBase}?service=${t.slug}${datoParam ? `&dato=${datoParam}` : ""}${betalingQ}`}
                scroll={false}
                aria-current={t.id === valgtServiceId ? "true" : undefined}
                className="fob-valgkort"
              >
                <b>{t.navn}</b>
                <span className="fob-tall">
                  {t.varighetMin} min · {erBetaling || t.prisOre > 0 ? kr(t.prisOre) : "1 klipp"}
                </span>
                {t.stedNavn && <span>{t.stedNavn}</span>}
              </Link>
            ))}
          </div>
        ) : (
          <div className="fob-kort fob-valgt">
            <b>{valgtServiceNavn}</b>
            <span>{valgtServiceVarighetMin} min</span>
            <Link href={`${wizardBase}${erBetaling ? "?betaling=1" : ""}`} scroll={false} className="fob-lenke">Endre</Link>
          </div>
        )}
      </section>

      {aktivtSteg >= 2 && (
        <section className="fob-seksjon">
          <span className="fob-steg"><b>3</b>Tid</span>
          <div className="fob-dager" role="group" aria-label="Velg dag, neste 14 dager">
            {datoer.map((d) => {
              const aktiv = d.getFullYear() === valgtDato.getFullYear() && d.getMonth() === valgtDato.getMonth() && d.getDate() === valgtDato.getDate();
              const iso = d.toISOString().split("T")[0];
              return (
                <Link key={iso} href={`${wizardBase}?service=${valgtSlug}&dato=${iso}${betalingQ}`} scroll={false} aria-current={aktiv ? "true" : undefined}>
                  <span>{UKEDAG[d.getDay()]}</span><b>{d.getDate()}</b>
                </Link>
              );
            })}
          </div>
          <p className="fob-note">{valgtDatoLang.charAt(0).toUpperCase() + valgtDatoLang.slice(1)}</p>
          {slots.length === 0 ? (
            <div className="fob-tom"><strong>Ingen ledige tider denne dagen</strong><p>Velg en annen dag over.</p></div>
          ) : (
            Array.from(perCoach.entries()).map(([coachId, g]) => (
              <div key={coachId} className="fob-seksjon">
                <p className="fob-coach">Hos {g.coachNavn}</p>
                <div className="fob-tider">
                  {g.tider.map((startIso) => (
                    <Link
                      key={startIso}
                      href={`${wizardBase}/bekreft?service=${valgtSlug}&start=${encodeURIComponent(startIso)}&coach=${coachId}${betalingQ}`}
                    >
                      {new Date(startIso).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
          <p className="fob-note">Bare ledige tider innenfor coachens tilgjengelighet. Du bekrefter i neste steg.</p>
        </section>
      )}
    </div>
  );
}
