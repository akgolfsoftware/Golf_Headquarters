"use client";

/**
 * AU-03 sett nytt passord. Kilde: ui_kits/konto/screens/AU-01-03.jsx, funksjonen AU03.
 * updateUser, minst 8 tegn og likhetssjekk er beholdt. Tegningen ber om 10 tegn og ett tall.
 * Den regelen er ikke innført, så eksisterende kontoer ikke møter en ny sperre.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "@/styles/precision-athletics.css";

function oversettPassordFeil(msg: string): string {
  if (msg.includes("should be different from the old password"))
    return "Velg et annet passord enn det du hadde fra før.";
  if (msg.includes("Auth session missing"))
    return "Lenken er brukt eller utløpt. Be om en ny tilbakestillingslenke fra «Glemt passordet?».";
  return msg;
}

export function ResetPasswordV2() {
  const router = useRouter();
  const supabase = createClient();
  const [passord, setPassord] = useState("");
  const [bekreft, setBekreft] = useState("");
  const [visPassord, setVisPassord] = useState(false);
  const [visBekreft, setVisBekreft] = useState(false);
  const [pending, setPending] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  async function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (passord.length < 8) {
      setFeil("Passordet må være minst 8 tegn.");
      return;
    }
    if (passord !== bekreft) {
      setFeil("Passordene er ikke like.");
      return;
    }
    setFeil(null);
    setPending(true);
    const { error: err } = await supabase.auth.updateUser({ password: passord });
    setPending(false);
    if (err) {
      setFeil(oversettPassordFeil(err.message));
      return;
    }
    router.push("/portal");
    router.refresh();
  }

  return (
    <div className="pa-root au-ramme" data-design="precision-athletics">
      <div className="au-boks">
        <Link href="/" className="au-logo">AK Golf HQ</Link>
        <header>
          <p className="au-kicker">Passord</p>
          <h1>Sett nytt passord</h1>
          <p>Velg et passord på minst 8 tegn.</p>
        </header>
        <form className="au-skjema" onSubmit={lagre}>
          <label>
            Nytt passord
            <span className="au-passord">
              <input
                type={visPassord ? "text" : "password"}
                required
                autoComplete="new-password"
                value={passord}
                placeholder="Minst 8 tegn"
                onChange={(ev) => setPassord(ev.target.value)}
              />
              <button type="button" onClick={() => setVisPassord((v) => !v)}>
                {visPassord ? "Skjul" : "Vis"}
              </button>
            </span>
          </label>
          <label>
            Bekreft passord
            <span className="au-passord">
              <input
                type={visBekreft ? "text" : "password"}
                required
                autoComplete="new-password"
                value={bekreft}
                placeholder="Gjenta passordet"
                onChange={(ev) => setBekreft(ev.target.value)}
              />
              <button type="button" onClick={() => setVisBekreft((v) => !v)}>
                {visBekreft ? "Skjul" : "Vis"}
              </button>
            </span>
          </label>
          {feil && (
            <p className="au-melding" data-tone="feil" role="alert">{feil}</p>
          )}
          <button type="submit" className="pa-btn pa-btn--primary pa-btn--full" disabled={pending || !passord || !bekreft}>
            {pending ? "Lagrer …" : "Lagre nytt passord"}
          </button>
        </form>
        <div className="au-lenker">
          <Link href="/auth/forgot-password">Be om ny lenke</Link>
          <Link href="/auth/login">Tilbake til innlogging</Link>
        </div>
      </div>
    </div>
  );
}
