"use client";

/**
 * PH-25 Sikkerhet (/portal/meg/innstillinger/sikkerhet) — nytt design, pakke 14 (utkast 1, 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/meg-resten.html, skjermen «Sikkerhet».
 * Viser bare valgene som gjelder brukeren: e-post og passord, eller Google-konto. Ingen sikkerhetsscore
 * og ingen «kommer snart».
 *
 * Avvik:
 *   - Arket ber ikke om nåværende passord: Supabase bytter passord og e-post på den innloggede økta.
 *     Krever Supabase en fersk innlogging, åpnes ReauthModal (uendret fra forrige versjon).
 *   - «Passord endret …» vises ikke: datoen lagres ikke hos oss.
 *   - «Innlogget nå» viser siste innlogging fra User.lastLoginAt. Andre enheter listes ikke.
 *   - «Logg ut» logger ut av alle enheter (logout bruker scope «global»), og teksten sier det.
 *   - Byttes e-posten, sender Supabase en bekreftelseslenke til den nye adressen.
 */
import { useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, Lock, Mail, Smartphone, X } from "lucide-react";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import "@/styles/playerhq-ny-meg-resten.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke5-skra.css";

// Lastes først når de trengs: Supabase-klienten leser miljøet ved import.
const ReauthModal = dynamic(() => import("@/components/auth/reauth-modal").then((m) => m.ReauthModal), { ssr: false });

export type PH25SikkerhetData = {
  epost: string;
  /** Kontoen logger inn med Google. */
  google: boolean;
  /** Kontoen har e-post og passord. */
  passord: boolean;
  tofaktorPaa: boolean;
  /** «i dag 07:42», «14. oktober 09:10» eller null. */
  sisteInnlogging: string | null;
};

type Ark = "epost" | "passord" | null;

function oversettAuthFeil(msg: string): string {
  if (msg.includes("should be different from the old password")) return "Velg et annet passord enn det du hadde fra før.";
  if (msg.includes("Password should be at least")) return "Passordet må være minst 8 tegn.";
  if (msg.includes("Auth session missing")) return "Økten din er utløpt. Logg ut og inn igjen.";
  if (msg.includes("already been registered")) return "Denne e-postadressen er allerede i bruk.";
  return "Det gikk ikke å lagre. Prøv igjen.";
}
const krevesReauth = (msg: string) => msg.includes("AAL") || msg.includes("reauthenticat");

export function PH25Sikkerhet({ data, loggUt }: { data: PH25SikkerhetData; loggUt: () => Promise<void> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [ark, setArk] = useState<Ark>(null);
  const [nytt, setNytt] = useState("");
  const [bekreft, setBekreft] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [lagrer, setLagrer] = useState(false);
  const [kvittering, setKvittering] = useState<string | null>(null);
  const [visReauth, setVisReauth] = useState(false);
  const igjen = useRef<(() => void) | null>(null);

  function aapne(a: Exclude<Ark, null>) {
    setArk(a); setNytt(""); setBekreft(""); setFeil(null);
    dialog.current?.showModal();
  }
  function lukk() { dialog.current?.close(); setArk(null); }

  async function lagre() {
    setFeil(null);
    if (ark === "passord") {
      if (nytt.length < 8) return setFeil("Passordet må være minst 8 tegn.");
      if (nytt !== bekreft) return setFeil("Passordene er ikke like.");
    } else if (!/^\S+@\S+\.\S+$/.test(nytt.trim())) {
      return setFeil("Skriv en gyldig e-postadresse.");
    }
    setLagrer(true);
    const { createClient } = await import("@/lib/supabase/client");
    const { error } = await createClient().auth.updateUser(ark === "passord" ? { password: nytt } : { email: nytt.trim() });
    setLagrer(false);
    if (error) {
      if (krevesReauth(error.message)) {
        igjen.current = () => { void lagre(); };
        setVisReauth(true);
        return;
      }
      return setFeil(oversettAuthFeil(error.message));
    }
    setKvittering(ark === "passord" ? "Passordet er byttet." : "Vi har sendt en lenke til den nye adressen. E-posten byttes når du har trykket på den.");
    lukk();
  }

  return <div className="phn phn-meg phn-skra">
    <SkraTopp
      lav
      etikett="Meg"
      bilde="/images/playerhq/stats-topp.jpg" bildePosisjon="50% 50%"
      overlinje={<>Meg · innstillinger</>}
      tittel={<>Sikkerhet</>}
      handling={<span className="skra-tilbake"><Link className="tilbake" href="/portal/meg/innstillinger"><ChevronLeft size={18} aria-hidden />Innstillinger</Link></span>}
    />
    <SkraFlyt lav><div className="side">
    {kvittering && <div className="mr-melding ok" role="status">{kvittering}</div>}
    <div className="to-del">
      <div>
        <section className="phn-seksjon" aria-labelledby="sik-inn">
          <div className="phn-sek-topp"><h2 id="sik-inn">Slik logger du inn</h2></div>
          <div className="mr-boks">
            {data.google && <div className="mr-rad"><span className="mr-google" aria-hidden>G</span><span><b>Google-konto</b><span className="phn-kilde">{data.epost} · passordet styres hos Google</span></span><span className="phn-pille ok"><i />Koblet</span></div>}
            {data.passord && <>
              <button type="button" className="mr-rad" onClick={() => aapne("epost")}><span className="ikonboks" aria-hidden><Mail size={18} /></span><span><b>E-post</b><span className="phn-kilde">{data.epost}</span></span><span className="hoyre">Endre<ChevronRight size={18} aria-hidden /></span></button>
              <button type="button" className="mr-rad" onClick={() => aapne("passord")}><span className="ikonboks" aria-hidden><Lock size={18} /></span><span><b>Passord</b><span className="phn-kilde">Minst 8 tegn</span></span><span className="hoyre">Endre<ChevronRight size={18} aria-hidden /></span></button>
            </>}
          </div>
          {data.passord && <Link className="lenke" href="/auth/forgot-password">Glemt passordet?</Link>}
        </section>
        <section className="phn-seksjon" aria-labelledby="sik-2fa">
          <div className="phn-sek-topp"><h2 id="sik-2fa">Tofaktor</h2></div>
          <div className="mr-boks">
            <Link className="mr-rad" href="/portal/meg/sikkerhet/2fa"><span className="ikonboks" aria-hidden><Smartphone size={18} /></span><span><b>Kode fra app</b><span className="phn-kilde">Sekssifret kode fra en kodeapp på telefonen</span></span><span className="hoyre"><span className={`phn-pille ${data.tofaktorPaa ? "ok" : "noy"}`}>{data.tofaktorPaa && <i />}{data.tofaktorPaa ? "På" : "Av"}</span><ChevronRight size={18} aria-hidden /></span></Link>
          </div>
        </section>
      </div>
      <div>
        <section className="phn-seksjon" aria-labelledby="sik-naa">
          <div className="phn-sek-topp"><h2 id="sik-naa">Innlogget nå</h2></div>
          <div className="mr-boks">
            <div className="mr-rad"><span className="ikonboks" aria-hidden><Smartphone size={18} /></span><span><b>Denne enheten</b><span className="phn-kilde">{data.sisteInnlogging ? `Sist innlogget ${data.sisteInnlogging}` : "Siste innlogging: —"}</span></span><span className="phn-pille ok"><i />Aktiv</span></div>
          </div>
          <form action={loggUt}><button type="submit" className="phn-knapp sek">Logg ut av alle enheter</button></form>
        </section>
        <div className="phn-kort dempet">
          <b className="phn-undertittel">Mistenker du at noen andre har logget inn?</b>
          <p className="phn-forklar">Bytt passord, slå på tofaktor, og skriv til oss.</p>
          <div className="phn-knapper"><Link className="phn-knapp sek" href="/portal/meg/help/kontakt">Skriv til oss</Link></div>
        </div>
      </div>
    </div>

    <dialog ref={dialog} className="phn-ark" aria-labelledby="sik-ark-tittel" onClose={() => setArk(null)}>
      <div className="phn-ark-kropp">
        <div className="phn-ark-topp"><h2 id="sik-ark-tittel">{ark === "epost" ? "Endre e-post" : "Endre passord"}</h2><button type="button" className="phn-lukk" aria-label="Lukk" onClick={lukk}><X size={20} aria-hidden /></button></div>
        <label className="phn-felt">{ark === "epost" ? "Ny e-post" : "Nytt passord"}
          <input type={ark === "epost" ? "email" : "password"} value={nytt} onChange={(e) => setNytt(e.target.value)} autoComplete={ark === "epost" ? "email" : "new-password"} />
          <span className="hjelp">{ark === "epost" ? "Vi sender en lenke for å bekrefte den nye adressen." : "Minst 8 tegn."}</span>
        </label>
        {ark === "passord" && <label className="phn-felt">Skriv det nye passordet en gang til
          <input type="password" value={bekreft} onChange={(e) => setBekreft(e.target.value)} autoComplete="new-password" />
        </label>}
        {feil && <div className="mr-melding feil" role="alert">{feil}</div>}
        <button type="button" className="phn-knapp pri stor" onClick={lagre} disabled={lagrer}>{lagrer ? "Lagrer …" : "Lagre"}</button>
      </div>
    </dialog>
    {visReauth && <ReauthModal
      open={visReauth}
      onClose={() => setVisReauth(false)}
      onSuccess={() => { setVisReauth(false); igjen.current?.(); }}
      reason="Du er i ferd med å endre innloggingen din. Bekreft at det er deg."
      bekreftTekst="Bekreft og fortsett"
    />}
  </div></SkraFlyt></div>;
}
