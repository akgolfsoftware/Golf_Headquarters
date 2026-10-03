"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { UserPreferences } from "@/lib/preferences";
import { oppdaterPreferences } from "@/app/portal/meg/actions";
import { VAPID_PUBLIC_KEY } from "@/lib/push/vapid";
import { detectPushStatus, aktiverPush, deaktiverPush, type PushStatus } from "@/components/portal/push-toggle";
import { StatusPille } from "@/components/precision/pa";

export type InnstillingerVarslerData = { notif: UserPreferences["notif"]; spraak: "nb" | "en" };

function Sjekk({ checked, onChange, label, sub, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub: string; disabled?: boolean }) {
  return (
    <label className="ph25v-sjekk">
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span><strong>{label}</strong><small>{sub}</small></span>
    </label>
  );
}

export function InnstillingerVarslerV2({ data }: { data: InnstillingerVarslerData }) {
  const router = useRouter();
  const [prefs, setPrefs] = useState(data);
  const [pending, startTransition] = useTransition();
  const [lagret, setLagret] = useState(false);
  const [pushStatus, setPushStatus] = useState<PushStatus>("loading");
  const [pushFeil, setPushFeil] = useState<string | null>(null);
  const [pushPending, startPush] = useTransition();

  useEffect(() => { void detectPushStatus().then(setPushStatus); }, []);

  function setNotif(felt: keyof UserPreferences["notif"], value: boolean) {
    const oppdatert = { ...prefs, notif: { ...prefs.notif, [felt]: value } };
    setPrefs(oppdatert);
    startTransition(async () => {
      await oppdaterPreferences({ notif: oppdatert.notif });
      setLagret(true);
      router.refresh();
      setTimeout(() => setLagret(false), 1500);
    });
  }

  function setSpraak(s: "nb" | "en") {
    setPrefs({ ...prefs, spraak: s });
    startTransition(async () => {
      await oppdaterPreferences({ spraak: s });
      setLagret(true);
      router.refresh();
      setTimeout(() => setLagret(false), 1500);
    });
  }

  function vekslePush() {
    if (pushPending) return;
    setPushFeil(null);
    const skruPaa = pushStatus !== "on";
    startPush(async () => {
      try {
        setPushStatus(skruPaa ? await aktiverPush() : await deaktiverPush());
      } catch (err) {
        setPushFeil(err instanceof Error ? err.message : skruPaa ? "Kunne ikke aktivere" : "Kunne ikke deaktivere");
        if (skruPaa) setPushStatus(await detectPushStatus());
      }
    });
  }

  const antallPaa = Object.values(prefs.notif).filter(Boolean).length;

  return (
    <div className="ph25v">
      <header>
        <Link href="/portal/meg/innstillinger" className="ph-tilbake">Innstillinger</Link>
        <div><h1>Varsler</h1><p>Innstillinger</p></div>
        {lagret && <StatusPille tone="ok">Lagret</StatusPille>}
      </header>
      <div className="ph25v-kpi">
        <p className="pa-card"><span>På</span><strong>{antallPaa}</strong></p>
        <p className="pa-card"><span>Push</span><strong>{pushStatus === "on" ? "Aktiv" : pushStatus === "loading" ? "…" : "Av"}</strong></p>
      </div>
      <section className="pa-card ph25v-kort">
        <p>Denne enheten</p>
        {pushStatus === "loading" && <span>Sjekker push-status …</span>}
        {pushStatus === "unsupported" && <span>Push-varsler støttes ikke i denne browseren. Prøv en moderne versjon av Safari, Chrome eller Firefox.</span>}
        {pushStatus !== "loading" && pushStatus !== "unsupported" && !VAPID_PUBLIC_KEY && <span>Push-varsler er midlertidig deaktivert. (VAPID-keys ikke konfigurert.)</span>}
        {pushStatus === "blocked" && <span role="alert">Du har blokkert varsler for dette nettstedet. Tillat varsler i browser-innstillingene for å aktivere push.</span>}
        {pushStatus !== "loading" && pushStatus !== "unsupported" && pushStatus !== "blocked" && VAPID_PUBLIC_KEY && (
          <Sjekk checked={pushStatus === "on"} disabled={pushPending} onChange={vekslePush} label="Push-varsler på denne enheten" sub="Få varsler direkte i browser eller på telefonen — selv når portalen er lukket" />
        )}
        {pushFeil && <span role="alert">{pushFeil}</span>}
      </section>
      <div className="ph25v-kol">
        <section className="pa-card ph25v-kort">
          <p>Hva du varsles om</p>
          <Sjekk checked={prefs.notif.nyMeldingFraCoach} disabled={pending} onChange={(v) => setNotif("nyMeldingFraCoach", v)} label="Nye meldinger fra coach" sub="Varsles når coachen din sender deg en melding" />
          <Sjekk checked={prefs.notif.treningsplanOppdatert} disabled={pending} onChange={(v) => setNotif("treningsplanOppdatert", v)} label="Treningsplan oppdatert" sub="Varsles når coachen endrer treningsplanen din" />
          <Sjekk checked={prefs.notif.bookingbekreftelse} disabled={pending} onChange={(v) => setNotif("bookingbekreftelse", v)} label="Bookingbekreftelse" sub="Bekreftelse og påminnelse for bookede tider" />
          <Sjekk checked={prefs.notif.ukentligRapport} disabled={pending} onChange={(v) => setNotif("ukentligRapport", v)} label="Ukentlig fremdrifts-rapport" sub="Oppsummering av uken — trening, mål og fremgang" />
          <Sjekk checked={prefs.notif.turneringsresultater} disabled={pending} onChange={(v) => setNotif("turneringsresultater", v)} label="Turneringsresultater" sub="Varsles når turneringsresultater er registrert" />
        </section>
        <div>
          <section className="pa-card ph25v-kort">
            <p>Hvordan du mottar dem</p>
            <Sjekk checked={prefs.notif.epost} disabled={pending} onChange={(v) => setNotif("epost", v)} label="E-post" sub="Sammendrag av planen og påminnelser på e-post" />
            <Sjekk checked={prefs.notif.push} disabled={pending} onChange={(v) => setNotif("push", v)} label="Push-varsler" sub="Sanntidsvarsler i nettleser og mobil" />
            <Sjekk checked={prefs.notif.paaminnelse} disabled={pending} onChange={(v) => setNotif("paaminnelse", v)} label="Påminnelse 1 time før økt" sub="Få påminnelse rett før en planlagt økt starter" />
          </section>
          <section className="pa-card ph25v-kort">
            <p>Språk</p>
            <div className="ph25v-spraak">
              <button type="button" aria-pressed={prefs.spraak === "nb"} disabled={pending} onClick={() => setSpraak("nb")}>Norsk bokmål</button>
              <button type="button" aria-pressed={prefs.spraak === "en"} disabled={pending} onClick={() => setSpraak("en")}>English</button>
            </div>
            <span>Engelsk-støtte kommer i en senere fase.</span>
          </section>
        </div>
      </div>
    </div>
  );
}
