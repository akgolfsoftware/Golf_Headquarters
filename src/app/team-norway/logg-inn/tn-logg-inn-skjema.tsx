"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { TnInput, TnKnapp, TnLogo } from "@/components/team-norway/core";
import { loggUtTeamNorway } from "@/lib/auth/logout";
import { createClient } from "@/lib/supabase/client";
import { TN } from "@/lib/v2/team-norway";

type Status = "klar" | "venter" | "feil" | "nettfeil" | "ferdig";

export function TnLoggInnSkjema({ avvisning, innloggetSom }: { avvisning: { tittel: string; tekst: string } | null; innloggetSom: string | null }) {
  const router = useRouter();
  const [epost, settEpost] = useState("");
  const [passord, settPassord] = useState("");
  const [status, settStatus] = useState<Status>("klar");
  const paagar = useRef(false);
  const travel = status === "venter" || status === "ferdig";

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (paagar.current || travel) return;
    paagar.current = true;
    settStatus("venter");
    try {
      const { error } = await createClient().auth.signInWithPassword({ email: epost.trim(), password: passord });
      if (error?.name === "AuthRetryableFetchError" || error?.status === 0) {
        settStatus("nettfeil");
        return;
      }
      if (error) {
        settStatus("feil");
        return;
      }
      settStatus("ferdig");
      // Serverporten avgjør tilgangen og sender tilbake hit med ?avvist= ved feil domene.
      router.replace("/team-norway");
      router.refresh();
    } catch {
      settStatus("nettfeil");
    } finally {
      paagar.current = false;
    }
  }

  return (
    <div style={{ minHeight: "100dvh", background: TN.surfacePage, color: TN.textPrimary, fontFamily: TN.font.body, display: "flex", flexDirection: "column" }}>
      <header style={{ background: TN.rail.bg, padding: "12px 16px", display: "flex", alignItems: "center" }}>
        <TnLogo hoyde={32} prioritet paaMork />
      </header>
      <main style={{ flex: 1, width: "100%", maxWidth: 480, margin: "0 auto", padding: "clamp(24px, 6vw, 56px) 16px", display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
        <div>
          <p style={{ margin: 0, fontFamily: TN.font.mono, fontSize: 11, letterSpacing: "0.08em", color: TN.textSecondary }}>/team-norway/logg-inn</p>
          <h1 style={{ fontFamily: TN.font.display, fontWeight: 300, fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.1, letterSpacing: "0.1em", textTransform: "uppercase", margin: "10px 0 0", color: TN.navy900 }}>Logg inn</h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: TN.textSecondary, margin: "10px 0 0" }}>For trenerteamet i Team Norway Golf. Bruk @golfforbundet.no-kontoen din.</p>
        </div>

        {avvisning ? (
          <section role="alert" style={{ background: TN.white, border: `1px solid ${TN.navy100}`, borderLeft: `3px solid ${TN.red600}`, borderRadius: TN.radius.lg, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <h2 style={{ margin: 0, fontFamily: TN.font.display, fontWeight: 400, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: TN.navy900 }}>{avvisning.tittel}</h2>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6 }}>{avvisning.tekst}</p>
            {innloggetSom ? <p style={{ margin: 0, fontFamily: TN.font.mono, fontSize: 12, color: TN.textSecondary, overflowWrap: "anywhere" }}>Innlogget som {innloggetSom}</p> : null}
            {innloggetSom ? (
              <form action={loggUtTeamNorway}>
                <TnKnapp type="submit" variant="sekundaer">Logg ut</TnKnapp>
              </form>
            ) : null}
          </section>
        ) : null}

        {!innloggetSom ? (
          <form onSubmit={send} aria-busy={travel} style={{ background: TN.white, border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.lg, padding: "clamp(16px, 2vw, 24px)", display: "flex", flexDirection: "column", gap: 16 }}>
            {status === "feil" || status === "nettfeil" ? (
              <p role="alert" style={{ margin: 0, fontSize: 14, color: TN.status.redText }}>
                {status === "nettfeil" ? "Fikk ikke forbindelse. Sjekk nettet og prøv igjen." : "Kunne ikke logge inn. Kontroller e-post og passord og prøv igjen."}
              </p>
            ) : null}
            <TnInput label="E-post" type="email" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} required disabled={travel} value={epost} onChange={settEpost} />
            <TnInput label="Passord" type="password" autoComplete="current-password" required disabled={travel} value={passord} onChange={settPassord} />
            <TnKnapp type="submit" variant="primaer" fullBredde disabled={travel}>
              {status === "ferdig" ? "Åpner Team Norway …" : status === "venter" ? "Logger inn …" : "Logg inn"}
            </TnKnapp>
            <a href="/auth/forgot-password" style={{ minHeight: 44, display: "inline-flex", alignItems: "center", color: TN.link, fontSize: 14 }}>Glemt passord</a>
          </form>
        ) : null}
      </main>
    </div>
  );
}
