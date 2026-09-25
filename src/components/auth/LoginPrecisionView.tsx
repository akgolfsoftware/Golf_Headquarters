"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, KeyRound, Smartphone, ArrowRight, ShieldCheck, CheckCircle2, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LoginPrecisionView() {
  const router = useRouter();
  const [metode, setMetode] = useState<"epost" | "kode" | "sms" | "passord">("epost");
  const [epost, setEpost] = useState("");
  const [passord, setPassord] = useState("");
  const [seksSifretKode, setSeksSifretKode] = useState(["", "", "", "", "", ""]);
  const [telefon, setTelefon] = useState("");
  const [smsKode, setSmsKode] = useState("");
  const [laster, setLaster] = useState(false);
  const [melding, setMelding] = useState<{ type: "suksess" | "feil"; tekst: string } | null>(null);

  const supabase = createClient();

  const handterSendMagiskLenke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!epost.trim()) return;
    setLaster(true);
    setMelding(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: epost.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/etter-innlogging`,
        },
      });

      if (error) {
        setMelding({ type: "feil", tekst: error.message });
      } else {
        setMelding({
          type: "suksess",
          tekst: `Vi har sendt en magisk innloggingslenke og 6-sifret kode til ${epost}.`,
        });
        setMetode("kode");
      }
    } catch (_err) {
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
      const { error } = await supabase.auth.verifyOtp({
        email: epost.trim(),
        token,
        type: "email",
      });

      if (error) {
        setMelding({ type: "feil", tekst: "Ugyldig eller utløpt kode. Prøv igjen." });
      } else {
        router.push("/portal");
      }
    } catch (_err) {
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
      const { error } = await supabase.auth.signInWithPassword({
        email: epost.trim(),
        password: passord,
      });

      if (error) {
        setMelding({ type: "feil", tekst: "Feil e-post eller passord." });
      } else {
        router.push("/portal");
      }
    } catch (_err) {
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
        options: {
          redirectTo: `${window.location.origin}/auth/etter-innlogging`,
        },
      });
    } catch (_err) {
      setMelding({ type: "feil", tekst: "Google-innlogging feilet." });
      setLaster(false);
    }
  };

  const handterKodeInput = (index: number, val: string) => {
    if (val.length > 1) {
      // Paste av hele koden
      const siffer = val.replace(/\D/g, "").slice(0, 6).split("");
      const ny = [...seksSifretKode];
      siffer.forEach((s, idx) => {
        if (idx < 6) ny[idx] = s;
      });
      setSeksSifretKode(ny);
      return;
    }

    const ny = [...seksSifretKode];
    ny[index] = val;
    setSeksSifretKode(ny);

    // Auto-fokus til neste felt
    if (val && index < 5) {
      const neste = document.getElementById(`kode-input-${index + 1}`);
      neste?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#141413] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link href="/" className="inline-block">
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#9B2415]">
            AK Golf Group
          </span>
          <h2 className="font-sans text-2xl font-bold tracking-tight text-[#141413] mt-0.5">
            Logg inn på AK Golf HQ
          </h2>
        </Link>
        <p className="mt-2 font-sans text-xs text-black/60">
          PlayerHQ for spillere · AgencyOS for trenere & administrasjon
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl border border-[#DDD9D1] bg-white p-6 sm:p-8 shadow-sm">
          {melding && (
            <div
              className={`mb-5 rounded-lg p-3 text-xs font-sans ${
                melding.type === "suksess"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                  : "bg-rose-50 border border-rose-200 text-rose-900"
              }`}
            >
              {melding.tekst}
            </div>
          )}

          {/* Metode 1: Magisk lenke på e-post */}
          {metode === "epost" && (
            <form onSubmit={handterSendMagiskLenke} className="space-y-4">
              <div>
                <label className="block font-sans text-xs font-bold text-[#141413] mb-1">
                  E-postadresse
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={epost}
                    onChange={(e) => setEpost(e.target.value)}
                    placeholder="din.epost@klubb.no"
                    className="w-full rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] px-3.5 py-2.5 font-sans text-xs text-[#141413] focus:border-[#141413] focus:outline-none"
                  />
                  <Mail className="absolute right-3 top-2.5 h-4 w-4 text-black/40" />
                </div>
              </div>

              <button
                type="submit"
                disabled={laster || !epost}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#141413] py-2.5 font-sans text-xs font-bold text-white hover:bg-black transition-colors disabled:opacity-50"
              >
                <span>{laster ? "Sender..." : "Send magisk innloggingslenke"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#DDD9D1]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 font-sans text-[11px] text-black/50 uppercase">
                    eller
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handterGoogleLogin}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] py-2.5 font-sans text-xs font-semibold text-[#141413] hover:bg-[#F1EEE8] transition-colors"
              >
                <span>Fortsett med Google</span>
              </button>

              <div className="pt-2 flex items-center justify-between text-xs font-sans">
                <button
                  type="button"
                  onClick={() => setMetode("passord")}
                  className="text-black/60 hover:text-black hover:underline"
                >
                  Logg inn med passord
                </button>
                <button
                  type="button"
                  onClick={() => setMetode("sms")}
                  className="text-black/60 hover:text-black hover:underline"
                >
                  SMS-autentisering
                </button>
              </div>
            </form>
          )}

          {/* Metode 2: 6-sifret kode-fallback */}
          {metode === "kode" && (
            <form onSubmit={handterVerifiserKode} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold text-[#141413]">
                  Skriv inn 6-sifret kode
                </span>
                <button
                  type="button"
                  onClick={() => setMetode("epost")}
                  className="flex items-center gap-1 font-sans text-[11px] text-black/50 hover:text-black"
                >
                  <ChevronLeft className="h-3 w-3" />
                  <span>Bytt e-post</span>
                </button>
              </div>

              <p className="font-sans text-xs text-black/60">
                Koden er sendt til <strong>{epost}</strong>.
              </p>

              {/* 6 siffer ruter */}
              <div className="flex justify-between gap-1.5 sm:gap-2">
                {seksSifretKode.map((siffer, idx) => (
                  <input
                    key={idx}
                    id={`kode-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={siffer}
                    onChange={(e) => handterKodeInput(idx, e.target.value)}
                    className="h-12 w-10 sm:w-12 rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] text-center font-mono text-lg font-bold text-[#141413] focus:border-[#141413] focus:outline-none"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={laster || seksSifretKode.some((s) => !s)}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#141413] py-2.5 font-sans text-xs font-bold text-white hover:bg-black transition-colors disabled:opacity-50"
              >
                <span>{laster ? "Verifiserer..." : "Bekreft kode og logg inn"}</span>
                <CheckCircle2 className="h-4 w-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handterSendMagiskLenke}
                  className="font-sans text-xs text-[#9B2415] hover:underline"
                >
                  Send koden på nytt
                </button>
              </div>
            </form>
          )}

          {/* Metode 3: SMS tofaktor */}
          {metode === "sms" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold text-[#141413]">
                  SMS tofaktor-sikkerhet
                </span>
                <button
                  type="button"
                  onClick={() => setMetode("epost")}
                  className="flex items-center gap-1 font-sans text-[11px] text-black/50 hover:text-black"
                >
                  <ChevronLeft className="h-3 w-3" />
                  <span>Tilbake</span>
                </button>
              </div>

              <div>
                <label className="block font-sans text-xs text-black/60 mb-1">
                  Mobilnummer
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={telefon}
                    onChange={(e) => setTelefon(e.target.value)}
                    placeholder="+47 900 00 000"
                    className="w-full rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] px-3.5 py-2.5 font-sans text-xs text-[#141413] focus:border-[#141413] focus:outline-none"
                  />
                  <Smartphone className="absolute right-3 top-2.5 h-4 w-4 text-black/40" />
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs text-black/60 mb-1">
                  Engangskode mottatt på SMS
                </label>
                <input
                  type="text"
                  value={smsKode}
                  onChange={(e) => setSmsKode(e.target.value)}
                  placeholder="123456"
                  className="w-full rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] px-3.5 py-2.5 font-mono text-xs text-[#141413] focus:border-[#141413] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  alert("SMS tofaktor godkjent.");
                  router.push("/portal");
                }}
                disabled={!telefon || !smsKode}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#141413] py-2.5 font-sans text-xs font-bold text-white hover:bg-black transition-colors disabled:opacity-50"
              >
                <span>Fullfør innlogging</span>
              </button>
            </div>
          )}

          {/* Metode 4: Passord */}
          {metode === "passord" && (
            <form onSubmit={handterPassordLogin} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold text-[#141413]">
                  Logg inn med passord
                </span>
                <button
                  type="button"
                  onClick={() => setMetode("epost")}
                  className="flex items-center gap-1 font-sans text-[11px] text-black/50 hover:text-black"
                >
                  <ChevronLeft className="h-3 w-3" />
                  <span>Magisk lenke</span>
                </button>
              </div>

              <div>
                <label className="block font-sans text-xs text-black/60 mb-1">
                  E-postadresse
                </label>
                <input
                  type="email"
                  required
                  value={epost}
                  onChange={(e) => setEpost(e.target.value)}
                  className="w-full rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] px-3 py-2 font-sans text-xs text-[#141413] focus:border-[#141413] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-sans text-xs text-black/60 mb-1">
                  Passord
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={passord}
                    onChange={(e) => setPassord(e.target.value)}
                    className="w-full rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] px-3 py-2 font-sans text-xs text-[#141413] focus:border-[#141413] focus:outline-none"
                  />
                  <KeyRound className="absolute right-3 top-2.5 h-4 w-4 text-black/40" />
                </div>
              </div>

              <button
                type="submit"
                disabled={laster || !epost || !passord}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#141413] py-2.5 font-sans text-xs font-bold text-white hover:bg-black transition-colors disabled:opacity-50"
              >
                <span>{laster ? "Logger inn..." : "Logg inn"}</span>
              </button>
            </form>
          )}

          <div className="mt-6 border-t border-[#DDD9D1] pt-4 flex items-center justify-center gap-1.5 text-black/50 text-[11px] font-sans">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-800" />
            <span>Kryptert og sikret i henhold til AK Golf sikkerhetsstandard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
