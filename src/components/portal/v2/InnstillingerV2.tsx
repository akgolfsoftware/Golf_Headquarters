"use client";

import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import type { UserPreferences } from "@/lib/preferences";
import { oppdaterPreferences } from "@/app/portal/meg/actions";
import { StatusPille } from "@/components/precision/pa";

export type InnstillingerData = {
  epost: string;
  notif: UserPreferences["notif"];
  venneOktSynlig: boolean;
  samtykke: { kreves: boolean; godkjentDato: string | null; godkjentAv: string | null };
  abonnement: { gratis: boolean; pakkeNavn: string | null; betaler: boolean; nesteTrekk: string | null };
};

function Bryter({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={on ? "ph25i-bryter er-paa" : "ph25i-bryter"} onClick={onToggle} />
  );
}

function Rad({ href, title, sub, meta }: { href?: string; title: string; sub: string; meta?: ReactNode }) {
  const kropp = (<><span><strong>{title}</strong><small>{sub}</small></span>{meta}</>);
  return href ? <Link href={href}>{kropp}</Link> : <div>{kropp}</div>;
}

export function InnstillingerV2({ data }: { data: InnstillingerData }) {
  const { epost, samtykke, abonnement } = data;
  const [notif, setNotif] = useState(data.notif);
  const [venneOktSynlig, setVenneOktSynlig] = useState(data.venneOktSynlig);
  const [, startLagre] = useTransition();

  function veksle(nokkel: keyof UserPreferences["notif"]) {
    const neste = { ...notif, [nokkel]: !notif[nokkel] };
    setNotif(neste);
    startLagre(() => { void oppdaterPreferences({ notif: neste }); });
  }
  function vekslVenneSynlig() {
    const neste = !venneOktSynlig;
    setVenneOktSynlig(neste);
    startLagre(() => { void oppdaterPreferences({ venneOktSynlig: neste }); });
  }

  const aboSub = abonnement.gratis
    ? abonnement.pakkeNavn
      ? `Gratis — inkludert i coaching-pakken din (${abonnement.pakkeNavn})`
      : "Gratis — hele PlayerHQ, uten kostnad"
    : abonnement.nesteTrekk
      ? `299 kr/mnd — fornyes ${abonnement.nesteTrekk}`
      : "299 kr/mnd";
  const samtykkeSub = samtykke.godkjentDato
    ? `${samtykke.godkjentAv ? `Godkjent av ${samtykke.godkjentAv}` : "Godkjent"} · ${samtykke.godkjentDato}`
    : "Venter på godkjenning fra en forelder";

  return (
    <div className="ph25i" data-od-id="playerhq-innstillinger">
      <header>
        <Link href="/portal/meg" className="ph-tilbake">Meg</Link>
        <h1>Innstillinger</h1>
        <p>Meg · konto, varsler og personvern</p>
      </header>
      <div className="ph25i-rutenett">
        <section className="pa-card ph25i-kort">
          <p>Kontoen din</p>
          <div className="ph25i-epost"><span>E-post</span><strong>{epost}</strong><small>E-posten er innloggingen din. Vil du endre den, gjør du det fra profilen din.</small></div>
          {samtykke.kreves && (
            <Rad title="Foreldresamtykke" sub={samtykkeSub} meta={<StatusPille tone={samtykke.godkjentDato ? "ok" : "warn"}>{samtykke.godkjentDato ? "Godkjent" : "Venter"}</StatusPille>} />
          )}
          <Rad href="/portal/meg/abonnement" title="Abonnement" sub={aboSub} />
          <Rad href="/portal/meg/profil" title="Rediger profil" sub="Endre e-post, navn og bilde" />
          <Rad href="/portal/meg/innstillinger/sikkerhet" title="Passord og tofaktor" sub="Endre passord, se pålogginger" />
        </section>
        <section className="pa-card ph25i-kort">
          <p>Varsler</p>
          <Rad title="Økt-påminnelse" sub="Få påminnelse rett før en planlagt økt starter" meta={<Bryter on={notif.paaminnelse} onToggle={() => veksle("paaminnelse")} label="Økt-påminnelse" />} />
          <Rad title="Melding fra coach" sub="Varsles når coachen din sender deg en melding" meta={<Bryter on={notif.nyMeldingFraCoach} onToggle={() => veksle("nyMeldingFraCoach")} label="Melding fra coach" />} />
          <Rad title="Ukesoppsummering" sub="Oppsummering av uken — trening, mål og fremgang" meta={<Bryter on={notif.ukentligRapport} onToggle={() => veksle("ukentligRapport")} label="Ukesoppsummering" />} />
        </section>
        <section className="pa-card ph25i-kort">
          <p>Synlighet</p>
          <Rad title="La venner se øktene mine" sub="Venner ser at du har trent, ikke tallene dine" meta={<Bryter on={venneOktSynlig} onToggle={vekslVenneSynlig} label="La venner se øktene mine" />} />
        </section>
        <section className="pa-card ph25i-kort">
          <p>Mer</p>
          <Rad href="/portal/meg/innstillinger/anlegg" title="Anlegg" sub="Utstyr og fasiliteter du har tilgang til" />
          <Rad href="/portal/meg/innstillinger/ai-coach" title="Caddie" sub="Tone og hvor mye den skal foreslå" />
          <Rad href="/portal/meg/innstillinger/integrasjoner" title="Integrasjoner" sub="TrackMan, Google Kalender og flere" />
          <Rad href="/portal/meg/innstillinger/personvern" title="Personvern og data" sub="Samtykker, eksport og sletting" />
          <Rad href="/portal/meg/innstillinger/sprak" title="Språk" sub="Norsk bokmål" />
        </section>
      </div>
      <p className="ph25i-info">Endringer lagres med én gang. Du får aldri en «Lagre»-knapp du kan gå fra uten å trykke.</p>
    </div>
  );
}
