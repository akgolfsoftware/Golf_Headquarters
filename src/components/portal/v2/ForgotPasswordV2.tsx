"use client";

/**
 * AU-03 glemt passord. Kilde: ui_kits/konto/screens/AU-01-03.jsx, funksjonen AU03.
 * resetPasswordForEmail og redirectTo /auth/reset-password er beholdt.
 * Lenke gyldig i 30 minutter er produktteksten, ikke tegningens én time.
 */

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import "@/styles/precision-athletics.css";

function oversettResetFeil(msg: string): string {
  if (msg.includes("you can only request this after"))
    return "Vent et lite øyeblikk før du ber om en ny lenke.";
  if (msg.includes("Unable to validate email address"))
    return "Sjekk at e-postadressen er riktig skrevet.";
  return msg;
}

export function ForgotPasswordV2() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    setPending(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/reset-password`,
    });
    setPending(false);
    if (err) {
      setFeil(oversettResetFeil(err.message));
      return;
    }
    setSent(true);
  }

  return (
    <div className="pa-root au-ramme" data-design="precision-athletics">
      <div className="au-boks">
        <Link href="/" className="au-logo">AK Golf HQ</Link>
        {sent ? (
          <>
            <header>
              <p className="au-kicker">Passord</p>
              <h1>Sjekk e-posten</h1>
              <p>
                Vi har sendt en lenke til <strong>{email || "e-postadressen din"}</strong>.
                Lenken er gyldig i 30 minutter.
              </p>
            </header>
            <div className="au-tips">
              <p className="au-kicker">Ikke fått e-posten?</p>
              <p>
                Sjekk søppelpost-mappen. Fremdeles ingenting? Kontakt{" "}
                <a href="mailto:anders@akgolf.no">anders@akgolf.no</a>
              </p>
            </div>
            <button type="button" className="pa-btn pa-btn--secondary pa-btn--full" onClick={() => setSent(false)}>
              Send på nytt
            </button>
            <div className="au-lenker">
              <Link href="/auth/login">Tilbake til innlogging</Link>
            </div>
          </>
        ) : (
          <>
            <header>
              <p className="au-kicker">Passord</p>
              <h1>Glemt passord</h1>
              <p>Skriv e-posten din. Vi sender en lenke for å sette nytt passord.</p>
            </header>
            <form className="au-skjema" onSubmit={send}>
              <label>
                E-post
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  placeholder="din.epost@klubb.no"
                  onChange={(ev) => setEmail(ev.target.value)}
                />
              </label>
              {feil && (
                <p className="au-melding" data-tone="feil" role="alert">{feil}</p>
              )}
              <button type="submit" className="pa-btn pa-btn--primary pa-btn--full" disabled={pending || !email}>
                {pending ? "Sender …" : "Send lenke"}
              </button>
            </form>
            <div className="au-lenker">
              <Link href="/auth/reset-password">Jeg har en lenke</Link>
              <Link href="/auth/login">Tilbake til innlogging</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
