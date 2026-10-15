/** Prøvefil for PH-21 Meldinger i nytt design (pakke 7). Syntetiske data: mandag 5. oktober 2026. */
import { useEffect, type ReactNode } from "react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH21Innboks } from "@/components/portal/precision/PH21Innboks";
import type { PH21Data } from "@/lib/portal-coach/ph21-data";

export const sti = "/portal/coach";

const DATA: PH21Data = {
  coach: { id: "c1", name: "Anders Kristiansen", initials: "AK", avatarUrl: null },
  meFornavn: "Øyvind",
  isCoached: true,
  messages: [
    { id: "m1", role: "me", text: "Filmet svingen på rangen i dag. Kjennes som jeg kommer for mye utenfra.", t: "04.10 · 17:48" },
    { id: "m2", role: "coach", text: "Så videoen fra i går. Ballstarten går til høyre, og face er åpen i P7.0. Vi tar det på fredag.", t: "05.10 · 12:04" },
    { id: "m3", role: "coach", text: "Jeg har lagt P7.0 inn i den tekniske planen din. Gjør Face to Path med Lav hastighet 50 % til da.", t: "05.10 · 12:05", attach: "Teknikk P7.0" },
  ],
  questions: [
    { id: "q1", t: "Hvordan varmer jeg opp før tidlig start?", date: "02.10.2026", status: "Besvart", answer: "Ti minutter mobilitet, så korte slag med økende fart." },
    { id: "q2", t: "Skal jeg trene putting dagen før turnering?", date: "04.10.2026", status: "Venter på svar", answer: null },
  ],
  feedback: [{ id: "f1", session: "Innspill 100–150 m · 01.10", from: "me", rating: 4, text: "Lengdekontrollen satt bedre enn sist.", t: "01.10.2026" }],
  videos: [{ id: "v1", title: "P7.0 Treffpunktet, før og etter", len: "0:42", img: "", date: "24.09.2026", seen: false }],
  plans: [{ id: "p1", title: "Uke 42 innspill", sessions: 6, hours: "9 t 30 min", sent: "02.10.2026", status: "Venter på spiller" }],
  recentSessions: [{ value: "s1", label: "Innspill 100–150 m · 01.10" }],
};

function Klikk({ velgere, children }: { velgere: string[]; children: ReactNode }) {
  useEffect(() => {
    let i = 0;
    const steg = () => {
      const [sel, tekst] = velgere[i].split("::");
      [...document.querySelectorAll<HTMLElement>(sel)].find((e) => !tekst || e.textContent?.includes(tekst))?.click();
      i += 1;
      if (i < velgere.length) setTimeout(steg, 15);
    };
    setTimeout(steg, 0);
  }, [velgere]);
  return <>{children}</>;
}

const Vis = ({ data = DATA, tab = "msg" as const, tilstand = "data" as const, ny = false }: {
  data?: PH21Data; tab?: "msg" | "q" | "fb" | "vid" | "plan" | "ønske"; tilstand?: "data" | "tom" | "laster" | "feil"; ny?: boolean;
}) => (
  <PlayerHQSkall innboksHref="/portal/varsler" uleste={1}><PH21Innboks data={data} initialTab={tab} tilstand={tilstand} apneNy={ny} /></PlayerHQSkall>
);

export const tilstander = {
  meldinger: <Vis />,
  nyMelding: <Vis ny />,
  sporsmal: <Vis tab="q" />,
  tilbakemelding: <Vis tab="fb" />,
  videoer: <Vis tab="vid" />,
  planer: <Vis tab="plan" />,
  onske: <Klikk velgere={["button::Banespill"]}><Vis tab="ønske" /></Klikk>,
  tom: <Vis data={{ ...DATA, messages: [], questions: [], feedback: [], videos: [], plans: [], recentSessions: [] }} tilstand="tom" />,
  utenCoach: <Vis data={{ ...DATA, coach: null, isCoached: false, messages: [] }} />,
  laster: <Vis tilstand="laster" />,
  feil: <Vis tilstand="feil" />,
};
