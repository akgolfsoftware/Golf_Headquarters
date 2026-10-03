"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitSupportTicket } from "./actions";
import { Knapp } from "@/components/precision/pa";

type Kategori = "booking" | "coach-meldinger" | "app-feil" | "konto" | "data-synk" | "annet";

const KATEGORIER: { id: Kategori; navn: string; eksempel: string }[] = [
  { id: "booking", navn: "Booking og betaling", eksempel: "Faktura, refunderinger" },
  { id: "coach-meldinger", navn: "Coach-meldinger", eksempel: "Mangler svar, vedlegg" },
  { id: "app-feil", navn: "App-feil / bug", eksempel: "Krasj, frys, layout" },
  { id: "konto", navn: "Konto og login", eksempel: "Passord, 2FA" },
  { id: "data-synk", navn: "Data og synk", eksempel: "GolfBox, TrackMan" },
  { id: "annet", navn: "Annet", eksempel: "Generelle spørsmål" },
];

export function KontaktSupportForm({ bruker }: { bruker: { navn: string; epost: string } }) {
  const [kategori, setKategori] = useState<Kategori>("app-feil");
  const [emne, setEmne] = useState("");
  const [beskrivelse, setBeskrivelse] = useState("");
  const [tillatInnsyn, setTillatInnsyn] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const kanSende = emne.trim().length >= 5 && beskrivelse.trim().length >= 20;

  function send() {
    startTransition(async () => {
      await submitSupportTicket({ kategori, emne, beskrivelse, tillatInnsyn });
    });
  }

  return (
    <form className="ph25k-form" onSubmit={(e) => { e.preventDefault(); if (kanSende) send(); }}>
      <fieldset>
        <legend>01 · Hva gjelder det?</legend>
        <div>
          {KATEGORIER.map((k) => (
            <button key={k.id} type="button" aria-pressed={kategori === k.id} onClick={() => setKategori(k.id)}>
              <strong>{k.navn}</strong><small>{k.eksempel}</small>
            </button>
          ))}
        </div>
      </fieldset>
      <label>Emne
        <input maxLength={100} required value={emne} placeholder="Kort tittel på problemet" onChange={(e) => setEmne(e.target.value)} />
        <small>Kort tittel — enklere å sortere · {emne.length} / 100</small>
      </label>
      <label>Beskrivelse
        <textarea maxLength={1000} required rows={6} value={beskrivelse} placeholder="Hva skjedde, hvilke steg du tok, hvilken side, tid og dato." onChange={(e) => setBeskrivelse(e.target.value)} />
        <small>Minst 20 tegn · {beskrivelse.length} / 1000</small>
      </label>
      <label className="ph25k-innsikt">
        <input type="checkbox" checked={tillatInnsyn} onChange={(e) => setTillatInnsyn(e.target.checked)} />
        <span><strong>Tillat at support kan se profilen min</strong><small>Lar oss finne problemet raskere. Du kan trekke tilgangen i Personvern.</small></span>
      </label>
      <p>Sendes som: {bruker.navn || "—"} · {bruker.epost || "—"}</p>
      <div className="ph25k-handling">
        <a href="mailto:post@akgolf.no">Eller e-post post@akgolf.no</a>
        <Knapp type="button" variant="secondary" onClick={() => router.push("/portal/meg/help")}>Avbryt</Knapp>
        <Knapp type="submit" loading={pending} disabled={!kanSende || pending}>{pending ? "Sender …" : "Send melding"}</Knapp>
      </div>
    </form>
  );
}
