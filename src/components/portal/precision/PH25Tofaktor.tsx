"use client";

/**
 * PH-25 Tofaktor (/portal/meg/sikkerhet/2fa) — nytt design, pakke 14 (utkast 1, 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/meg-resten.html, skjermen «Tofaktor».
 * Tre steg mot Supabase MFA (TOTP): skann koden, skriv sekssifret kode, ferdig. Slå av krever en
 * rust bekreftelse og ny innlogging (ReauthModal) før faktoren fjernes.
 *
 * Avvik:
 *   - Reservekodene er fjernet (beslutninger.md §PRØVEUKE …, 16.10.2026). De ble laget i nettleseren
 *     og lagret ingen steder, så de virket aldri. «Mister du telefonen, skriv til oss» står i stedet.
 *   - Innloggingen i appen ber ennå ikke om koden (ingen side krever nivå aal2 etter passord). Skjermen
 *     lover derfor ikke det; den sier at tofaktor er registrert på kontoen. Egen oppfølging.
 *   - QR-koden og nøkkelen kommer fra Supabase når skjermen åpnes; en uferdig registrering ryddes først.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Check, ChevronLeft } from "lucide-react";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import "@/styles/playerhq-ny-meg-resten.css";

// Lastes først når de trengs: Supabase-klienten leser miljøet ved import.
const ReauthModal = dynamic(() => import("@/components/auth/reauth-modal").then((m) => m.ReauthModal), { ssr: false });
const supabaseKlient = async () => (await import("@/lib/supabase/client")).createClient();

type Steg = 1 | 2 | 3;
type Registrering = { factorId: string; qr: string; nokkel: string };
type Tilstand = "laster" | "feil" | "paa" | "oppsett";

const TITTEL: Record<Steg, string> = { 1: "Skann koden", 2: "Skriv koden", 3: "Tofaktor er på" };

function oversett(msg: string): string {
  if (/invalid (totp )?code/i.test(msg)) return "Feil kode. Prøv igjen, og sjekk at klokka på telefonen går riktig.";
  if (msg.includes("AAL")) return "Du må logge inn på nytt først.";
  if (/rate limit|too many/i.test(msg)) return "For mange forsøk. Vent litt og prøv igjen.";
  return "Det gikk ikke. Ingenting er endret.";
}

export function PH25Tofaktor() {
  const [tilstand, setTilstand] = useState<Tilstand>("laster");
  const [aktivId, setAktivId] = useState<string | null>(null);
  const [steg, setSteg] = useState<Steg>(1);
  const [reg, setReg] = useState<Registrering | null>(null);
  const [kode, setKode] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [jobber, setJobber] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [reauth, setReauth] = useState(false);

  const startEn = useCallback(async () => {
    setTilstand("laster");
    setFeil(null);
    try {
      const supabase = await supabaseKlient();
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) { setTilstand("feil"); return; }
      const aktiv = data?.totp.find((f) => f.status === "verified");
      if (aktiv) { setAktivId(aktiv.id); setTilstand("paa"); return; }
      for (const f of data?.all ?? []) {
        if (f.factor_type === "totp" && f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const ny = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `AK Golf (${new Date().toLocaleDateString("nb-NO")})` });
      if (ny.error || !ny.data) { setTilstand("feil"); return; }
      setReg({ factorId: ny.data.id, qr: ny.data.totp.qr_code, nokkel: ny.data.totp.secret });
      setSteg(1);
      setKode("");
      setTilstand("oppsett");
    } catch {
      setTilstand("feil");
    }
  }, []);

  // Én oppstart om gangen. To samtidige kjøringer (React kjører effekten to ganger i utvikling, og
  // «Prøv igjen» kan trykkes mens den første går) slettet samme faktor to ganger og ba om to nye med
  // samme navn, som Supabase svarte 404 og 500 på.
  const iGang = useRef<Promise<void> | null>(null);
  const start = useCallback(() => {
    if (!iGang.current) iGang.current = startEn().finally(() => { iGang.current = null; });
    return iGang.current;
  }, [startEn]);

  useEffect(() => {
    void start();
  }, [start]);

  async function bekreft() {
    if (!reg) return;
    setFeil(null);
    if (!/^\d{6}$/.test(kode)) { setFeil("Skriv alle seks sifrene."); return; }
    setJobber(true);
    const supabase = await supabaseKlient();
    const ch = await supabase.auth.mfa.challenge({ factorId: reg.factorId });
    const svar = ch.error ? ch : await supabase.auth.mfa.verify({ factorId: reg.factorId, challengeId: ch.data.id, code: kode });
    setJobber(false);
    if (svar.error) { setFeil(oversett(svar.error.message)); return; }
    setAktivId(reg.factorId);
    setSteg(3);
  }

  async function slaAv() {
    if (!aktivId) return;
    setJobber(true);
    setFeil(null);
    const { error } = await (await supabaseKlient()).auth.mfa.unenroll({ factorId: aktivId });
    setJobber(false);
    if (error) { setFeil(oversett(error.message)); return; }
    setAktivId(null);
    void start();
  }

  const visSteg: Steg = tilstand === "paa" ? 3 : steg;

  return <div className="phn phn-meg"><div className="side smal">
    <div className="topp">
      <Link className="tilbake" href="/portal/meg/innstillinger/sikkerhet"><ChevronLeft size={18} aria-hidden />Sikkerhet</Link>
      <div>
        <div className="phn-dato">{tilstand === "paa" ? "Tofaktor" : `Tofaktor · steg ${visSteg} av 3`}</div>
        <h1 className="phn-tittel">{TITTEL[visSteg]}</h1>
      </div>
      <div className="mr-stegrad" aria-hidden>{[1, 2, 3].map((n) => <i key={n} className={n <= visSteg ? "paa" : ""} />)}</div>
    </div>

    {tilstand === "laster" && <div className="phn-kort" role="status"><p className="phn-forklar">Lager koden …</p><div className="phn-skjelett" style={{ width: 180, height: 180 }} /></div>}
    {tilstand === "feil" && <div className="phn-kort" role="alert">
      <b className="phn-undertittel">Koden kunne ikke lages</b>
      <p className="phn-forklar">Ingenting er endret. Prøv igjen, eller logg ut og inn hvis det fortsetter.</p>
      <div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={() => void start()}>Prøv igjen</button></div>
    </div>}

    {tilstand === "oppsett" && reg && steg === 1 && <section className="phn-seksjon">
      <p className="phn-forklar">Åpne en kodeapp på telefonen, for eksempel Google Authenticator eller 1Password, og skann koden.</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="mr-qr" src={reg.qr} alt="QR-kode for tofaktor" width={180} height={180} />
      <div className="phn-felt"><span>Kan du ikke skanne? Skriv inn nøkkelen</span><div className="mr-hemmelig">{reg.nokkel.replace(/(.{4})/g, "$1 ").trim()}</div></div>
      <button type="button" className="phn-knapp pri stor" onClick={() => setSteg(2)}>Jeg har skannet koden</button>
    </section>}

    {tilstand === "oppsett" && reg && steg === 2 && <section className="phn-seksjon">
      <p className="phn-forklar">Skriv de seks sifrene appen viser nå. Koden byttes hvert 30. sekund.</p>
      <label className="phn-felt mr-kode">Sekssifret kode
        <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={kode}
          onChange={(e) => setKode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onKeyDown={(e) => { if (e.key === "Enter") void bekreft(); }} />
      </label>
      {feil && <div className="mr-melding feil" role="alert">{feil}</div>}
      <button type="button" className="phn-knapp pri stor" onClick={bekreft} disabled={jobber}>{jobber ? "Sjekker …" : "Bekreft"}</button>
      <div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={() => { setFeil(null); setSteg(1); }}>Tilbake</button></div>
    </section>}

    {(tilstand === "paa" || (tilstand === "oppsett" && steg === 3)) && <section className="phn-seksjon">
      <span className="mr-hake" aria-hidden><Check size={32} strokeWidth={2.5} /></span>
      <p className="phn-forklar">Tofaktor er registrert på kontoen din med en kodeapp.</p>
      <div className="mr-vilkaar"><b>Mister du telefonen?</b><span>Skriv til oss fra e-posten kontoen er registrert på, så hjelper vi deg inn igjen.</span></div>
      {feil && <div className="mr-melding feil" role="alert">{feil}</div>}
      <div className="phn-knapper">
        <Link className="phn-knapp pri" href="/portal/meg/innstillinger/sikkerhet">Til Sikkerhet</Link>
        <button type="button" className="phn-knapp sek" onClick={() => setDialog(true)} disabled={jobber}>Slå av tofaktor</button>
      </div>
    </section>}

    {dialog && <div className="phn-kort mr-dialogkort" role="alertdialog" aria-labelledby="av-t">
      <h2 id="av-t" className="phn-undertittel" style={{ margin: 0 }}>Slå av tofaktor?</h2>
      <p className="phn-forklar">Da holder passordet alene for å logge inn. Du må logge inn på nytt for å bekrefte.</p>
      <div style={{ display: "grid", gap: 8 }}>
        <button type="button" className="phn-knapp rust stor" onClick={() => { setDialog(false); setReauth(true); }}>Slå av tofaktor</button>
        <button type="button" className="phn-knapp sek stor" onClick={() => setDialog(false)}>Behold</button>
      </div>
    </div>}

    {reauth && <ReauthModal
      open={reauth}
      onClose={() => setReauth(false)}
      onSuccess={() => { setReauth(false); void slaAv(); }}
      reason="Du er i ferd med å slå av tofaktor. Kontoen blir mindre beskyttet."
      bekreftTekst="Bekreft og slå av"
    />}
  </div></div>;
}
