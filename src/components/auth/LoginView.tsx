"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "@/styles/precision-athletics.css";

export function LoginView() {
  const router = useRouter();
  const [metode, setMetode] = useState<"epost" | "kode" | "sms" | "passord">("epost");
  const [epost, setEpost] = useState("");
  const [passord, setPassord] = useState("");
  const [seksSifretKode, setSeksSifretKode] = useState(["", "", "", "", "", ""]);
  const [laster, setLaster] = useState(false);
  const [melding, setMelding] = useState<{ type: "suksess" | "feil"; tekst: string } | null>(null);

  const supabase = createClient();

  const handterSendMagiskLenke = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!epost.trim()) return;
    setLaster(true);
    setMelding(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: epost.trim(),
        options: { emailRedirectTo: `${window.location.origin}/api/auth/oauth-callback` },
      });
      if (error) setMelding({ type: "feil", tekst: error.message });
      else {
        setMelding({ type: "suksess", tekst: `Vi har sendt en magisk innloggingslenke og 6-sifret kode til ${epost}.` });
        setMetode("kode");
      }
    } catch {
      setMelding({ type: "feil", tekst: "Kunne ikke sende innloggingslenke. Prøv igjen." });
    } finally {
      setLaster(false);
    }
  };

  const handterVerifiserKode = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = seksSifretKode.join("");
    if (token.length !== 6) return;
    setLaster(true);
    setMelding(null);
    try {
      const { error } = await supabase.auth.verifyOtp({ email: epost.trim(), token, type: "email" });
      if (error) setMelding({ type: "feil", tekst: "Ugyldig eller utløpt kode. Prøv igjen." });
      else router.replace("/auth/etter-innlogging");
    } catch {
      setMelding({ type: "feil", tekst: "Kunne ikke verifisere koden." });
    } finally {
      setLaster(false);
    }
  };

  const handterPassordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!epost.trim() || !passord) return;
    setLaster(true);
    setMelding(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: epost.trim(), password: passord });
      if (error) setMelding({ type: "feil", tekst: "Feil e-post eller passord." });
      else window.location.replace("/auth/etter-innlogging");
    } catch {
      setMelding({ type: "feil", tekst: "Innlogging feilet. Prøv igjen." });
    } finally {
      setLaster(false);
    }
  };

  const handterGoogleLogin = async () => {
    setLaster(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/api/auth/oauth-callback` },
      });
    } catch {
      setMelding({ type: "feil", tekst: "Google-innlogging feilet." });
      setLaster(false);
    }
  };

  const handterKodeInput = (index: number, val: string) => {
    if (val.length > 1) {
      const siffer = val.replace(/\D/g, "").slice(0, 6).split("");
      const ny = [...seksSifretKode];
      siffer.forEach((s, idx) => { if (idx < 6) ny[idx] = s; });
      setSeksSifretKode(ny);
      return;
    }
    const ny = [...seksSifretKode];
    ny[index] = val;
    setSeksSifretKode(ny);
    if (val && index < 5) document.getElementById(`kode-input-${index + 1}`)?.focus();
  };

  return (
    <div className="pa-root au-ramme" data-design="precision-athletics">
      <div className="au-boks">
        <Link href="/" className="au-logo">AK Golf HQ</Link>
        <header>
          <h1>Logg inn</h1>
          <p>Spiller, forelder og coach bruker samme innlogging.</p>
        </header>
        {melding && <p className="au-melding" data-tone={melding.type === "feil" ? "feil" : "ok"} role={melding.type === "feil" ? "alert" : "status"}>{melding.tekst}</p>}

        {metode === "epost" && (
          <form className="au-skjema" onSubmit={handterSendMagiskLenke}>
            <label>E-post
              <input type="email" required autoComplete="email" value={epost} placeholder="din.epost@klubb.no" onChange={(e) => setEpost(e.target.value)} />
            </label>
            <button type="submit" className="pa-btn pa-btn--primary pa-btn--full" disabled={laster || !epost}>{laster ? "Sender …" : "Send magisk innloggingslenke"}</button>
            <button type="button" className="pa-btn pa-btn--secondary pa-btn--full" disabled={laster} onClick={handterGoogleLogin}>Fortsett med Google</button>
            <div className="au-lenker">
              <button type="button" onClick={() => setMetode("passord")}>Logg inn med passord</button>
              <button type="button" onClick={() => setMetode("sms")}>SMS</button>
              <Link href="/auth/forgot-password">Glemt passord?</Link>
              <Link href="/auth/signup">Ny bruker</Link>
            </div>
          </form>
        )}

        {metode === "kode" && (
          <form className="au-skjema" onSubmit={handterVerifiserKode}>
            <p>Skriv inn 6-sifret kode sendt til {epost}.</p>
            <div className="au-kode">
              {seksSifretKode.map((siffer, idx) => (
                <input key={idx} id={`kode-input-${idx}`} inputMode="numeric" maxLength={1} value={siffer} aria-label={`Siffer ${idx + 1}`} onChange={(e) => handterKodeInput(idx, e.target.value)} />
              ))}
            </div>
            <button type="submit" className="pa-btn pa-btn--primary pa-btn--full" disabled={laster || seksSifretKode.some((s) => !s)}>{laster ? "Verifiserer …" : "Bekreft kode og logg inn"}</button>
            <div className="au-lenker">
              <button type="button" onClick={handterSendMagiskLenke}>Send koden på nytt</button>
              <button type="button" onClick={() => setMetode("epost")}>Bytt e-post</button>
            </div>
          </form>
        )}

        {metode === "sms" && (
          <div className="au-skjema">
            <p role="status">SMS-innlogging er ikke tilgjengelig ennå. Bruk e-post eller passord.</p>
            <button type="button" className="pa-btn pa-btn--secondary pa-btn--full" onClick={() => setMetode("epost")}>Tilbake</button>
          </div>
        )}

        {metode === "passord" && (
          <form className="au-skjema" onSubmit={handterPassordLogin}>
            <label>E-post
              <input type="email" required autoComplete="email" value={epost} onChange={(e) => setEpost(e.target.value)} />
            </label>
            <label>Passord
              <input type="password" required autoComplete="current-password" value={passord} onChange={(e) => setPassord(e.target.value)} />
            </label>
            <button type="submit" className="pa-btn pa-btn--primary pa-btn--full" disabled={laster || !epost || !passord}>{laster ? "Logger inn …" : "Logg inn"}</button>
            <div className="au-lenker">
              <Link href="/auth/forgot-password">Glemt passord?</Link>
              <button type="button" onClick={() => setMetode("epost")}>Magisk lenke</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
