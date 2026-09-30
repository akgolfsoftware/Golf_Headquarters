"use client";

/**
 * AU-03 Passord: glemt passord og sett nytt passord.
 * Fasit: Claude Design 7d7c2994, ui_kits/konto/screens/AU-01-03.jsx (AU03).
 * Ekte auth er uendret fra ForgotPasswordV2 og ResetPasswordV2:
 * `resetPasswordForEmail` (redirectTo /auth/reset-password) og `updateUser`, deretter /portal.
 *
 * Avvik fra tegningen (se PR-beskrivelsen):
 *  - «Jeg har en lenke» finnes ikke i koden: reset-siden krever en innlogget gjenopprettingsøkt
 *    fra e-postlenken, så knappen er byttet mot «Tilbake til innlogging».
 *  - Passordregel og lenketid følger tegningen (minst 10 tegn og ett tall, én time). Tidligere kode sa 8 tegn og 30 minutter.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Knapp, KnappLenke, LasterTilstand } from "@/components/precision/pa";
import { Skjemafelt } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { createClient } from "@/lib/supabase/client";
import "@/styles/precision-athletics.css";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-a4.css";
import "@/styles/precision-au03.css";

const okMail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

/** Samme feiloversettelse som før: én kilde til auth-tekst. */
function oversettResetFeil(msg: string): string {
  if (msg.includes("you can only request this after")) return "Vent et lite øyeblikk før du ber om en ny lenke.";
  if (msg.includes("Unable to validate email address")) return "Sjekk at e-postadressen er riktig skrevet.";
  return msg;
}
function oversettPassordFeil(msg: string): string {
  if (msg.includes("should be different from the old password")) return "Velg et annet passord enn det du hadde fra før.";
  return msg;
}
const erUtlopt = (msg: string) => msg.includes("Auth session missing");

function Ramme({ children }: { children: React.ReactNode }) {
  return <div className="pa-root au03" data-design="precision-athletics">
    <div className="au03__boks">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="au03__logo au03__logo--lys" src="/logos/logo-ak-golf-hq.svg" alt="AK Golf HQ" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="au03__logo au03__logo--natt" src="/logos/logo-ak-golf-hq-negative.svg" alt="" aria-hidden="true" />
      {children}
    </div>
  </div>;
}

function Hode({ tittel, sub }: { tittel: string; sub?: string }) {
  return <div className="au03__hode"><h1 className="au03__h1">{tittel}</h1>{sub && <p className="au03__sub">{sub}</p>}</div>;
}

function Utlopt() {
  return <Ramme>
    <Hode tittel="Lenken er utløpt" sub="Lenker for nytt passord er gyldige i én time. Be om en ny lenke." />
    <div className="au03__knapper"><KnappLenke href="/auth/forgot-password">Be om ny lenke</KnappLenke></div>
  </Ramme>;
}

export interface AU03Props {
  /** Kun for skjermprøven: fast tilstand uten nettverkskall. Ikke brukt i appen. */
  forhandsvis?: { tilstand?: "laster" | "feil"; sendt?: boolean; epost?: string; feil?: Record<string, string>; serverfeil?: string };
}

export function AU03Glemt({ forhandsvis: f }: AU03Props) {
  const [e, setE] = useState(f?.epost ?? "");
  const [err, setErr] = useState<Record<string, string>>(f?.feil ?? {});
  const [sendt, setSendt] = useState(f?.sendt ?? false);
  const [laster, setLaster] = useState(f?.tilstand === "laster");
  const [serverfeil, setServerfeil] = useState<string | null>(f?.serverfeil ?? null);

  if (laster) return <Ramme><LasterTilstand text="Sender lenke …" /></Ramme>;

  async function send(ev: React.FormEvent) {
    ev.preventDefault();
    if (!okMail(e.trim())) { setErr({ e: "Skriv e-postadressen du bruker til å logge inn." }); return; }
    setErr({}); setServerfeil(null); setLaster(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await createClient().auth.resetPasswordForEmail(e.trim(), { redirectTo: `${origin}/auth/reset-password` });
    setLaster(false);
    if (error) { setServerfeil(oversettResetFeil(error.message)); return; }
    setSendt(true);
  }

  return <Ramme>
    <Hode tittel="Glemt passord" sub="Skriv e-posten din. Vi sender en lenke for å sette nytt passord." />
    {sendt
      ? <InlineVarsel tone="ok" tittel="Lenken er sendt">Hvis {e.trim() || "e-postadressen din"} har en konto, får du en e-post innen fem minutter. Lenken er gyldig i én time.</InlineVarsel>
      : <form className="au03__skjema" onSubmit={send} noValidate>
        {serverfeil && <InlineVarsel tone="warn">{serverfeil}</InlineVarsel>}
        <Skjemafelt label="E-post" required error={err.e}>
          <input className="a4-input au03__input" aria-label="E-post" type="email" autoComplete="email" value={e} onChange={(x) => setE(x.target.value)} />
        </Skjemafelt>
        <div className="au03__knapper"><Knapp type="submit">Send lenke</Knapp><KnappLenke href="/auth/login" variant="ghost">Tilbake til innlogging</KnappLenke></div>
      </form>}
    {sendt && <div className="au03__knapper"><KnappLenke href="/auth/login" variant="ghost">Tilbake til innlogging</KnappLenke></div>}
  </Ramme>;
}

export function AU03Nytt({ forhandsvis: f }: AU03Props) {
  const router = useRouter();
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [err, setErr] = useState<Record<string, string>>(f?.feil ?? {});
  const [laster, setLaster] = useState(f?.tilstand === "laster");
  const [utlopt, setUtlopt] = useState(f?.tilstand === "feil");
  const [serverfeil, setServerfeil] = useState<string | null>(f?.serverfeil ?? null);

  if (laster) return <Ramme><LasterTilstand text="Lagrer passord …" /></Ramme>;
  if (utlopt) return <Utlopt />;

  async function lagre(ev: React.FormEvent) {
    ev.preventDefault();
    const x: Record<string, string> = {};
    if (p1.length < 10) x.p1 = "Passordet må ha minst 10 tegn.";
    else if (!/\d/.test(p1)) x.p1 = "Passordet må inneholde minst ett tall.";
    if (p2 !== p1) x.p2 = "Passordene er ikke like. Skriv det samme passordet to ganger.";
    setErr(x); setServerfeil(null);
    if (Object.keys(x).length) return;
    setLaster(true);
    const { error } = await createClient().auth.updateUser({ password: p1 });
    setLaster(false);
    if (error) {
      if (erUtlopt(error.message)) { setUtlopt(true); return; }
      setServerfeil(oversettPassordFeil(error.message));
      return;
    }
    router.push("/portal");
    router.refresh();
  }

  return <Ramme>
    <Hode tittel="Sett nytt passord" sub="Minst 10 tegn og minst ett tall." />
    <form className="au03__skjema" onSubmit={lagre} noValidate>
      {serverfeil && <InlineVarsel tone="warn">{serverfeil}</InlineVarsel>}
      <Skjemafelt label="Nytt passord" required error={err.p1}>
        <input className="a4-input au03__input" aria-label="Nytt passord" type="password" autoComplete="new-password" value={p1} onChange={(x) => setP1(x.target.value)} />
      </Skjemafelt>
      <Skjemafelt label="Gjenta passord" required error={err.p2}>
        <input className="a4-input au03__input" aria-label="Gjenta passord" type="password" autoComplete="new-password" value={p2} onChange={(x) => setP2(x.target.value)} />
      </Skjemafelt>
      <Knapp type="submit" fullWidth>Lagre nytt passord</Knapp>
    </form>
  </Ramme>;
}
