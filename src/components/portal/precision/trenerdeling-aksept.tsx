"use client";
/** Precision iup-komplett/deling-navngitt · akseptreisen, eksport 81. */
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Knapp, KnappLenke } from "@/components/precision/pa";
import { aksepterNavngittDelingAction } from "@/app/auth/trenerdeling/actions";
import "@/styles/precision-athletics.css";
import "@/styles/navngitt-deling.css";

export function TrenerdelingAksept({ innlogget, erTrener }: { innlogget: boolean; erTrener: boolean }) {
  const [token, setToken] = useState<string | null>(null);
  const [melding, setMelding] = useState("");
  const [innsyn, setInnsyn] = useState<string | null>(null);
  const [pending, start] = useTransition();
  useEffect(() => {
    const lesFragment = () => {
      const lest = window.location.hash.slice(1);
      setToken(/^[0-9a-f]{64}$/.test(lest) ? lest : "");
      setInnsyn(null); setMelding("");
      // Fragmentet sendes aldri til serveren. Bevar Nexts historikkmetadata.
      window.history.replaceState(window.history.state, "", window.location.pathname);
    };
    const ramme = window.requestAnimationFrame(lesFragment);
    window.addEventListener("hashchange", lesFragment);
    return () => { window.cancelAnimationFrame(ramme); window.removeEventListener("hashchange", lesFragment); };
  }, []);
  return <div className="pa-root" data-design="precision-athletics"><main className="deling-side">
    <span className="kicker">Navngitt trenerdeling</span><h1>Godta deling</h1>
    <section className="deling-panel"><p>Delingen gjelder bare treneren spilleren eller foresatte har valgt. Bekreftet e-post og aktiv tilknytning til riktig WANG- eller Team Norway-miljø kontrolleres når du godtar.</p>
      {!innlogget ? <><p>Logg inn med treneradressen din. Åpne deretter den opprinnelige delingslenken på nytt.</p><KnappLenke href="/auth/login?next=%2Fauth%2Ftrenerdeling">Logg inn</KnappLenke></> : !erTrener ? <p role="alert">Du må være innlogget med riktig trenerkonto.</p> : token === null ? <p role="status">Leser lenken …</p> : !token ? <p role="alert">Åpne den opprinnelige delingslenken. Denne adressen inneholder ingen gyldig lenke.</p> : innsyn ? <><p role="status">Delingen er godtatt.</p><KnappLenke href={innsyn}>Åpne leverte besvarelser</KnappLenke></> : <Knapp loading={pending} disabled={pending} onClick={() => start(async () => {
        setMelding("");
        try {
          const r = await aksepterNavngittDelingAction({ token });
          if (!r.ok) { setMelding("Delingen kunne ikke godtas. Kontroller at du bruker riktig, bekreftet treneradresse og at lenken fortsatt gjelder."); return; }
          setInnsyn(`/portal/meg/deling/innsyn?spiller=${encodeURIComponent(r.spillerId)}&gruppe=${encodeURIComponent(r.gruppeId)}`);
        } catch { setMelding("Aksepten kunne ikke bekreftes. Kontroller innloggingen og prøv igjen."); }
      })}>Godta deling</Knapp>}
      {melding && <p role="alert" className="deling-feil">{melding}</p>}
    </section><Link className="deling-tilbake" href="/">AK Golf HQ</Link>
  </main></div>;
}
