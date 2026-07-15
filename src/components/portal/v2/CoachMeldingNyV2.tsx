"use client";

/**
 * PlayerHQ Coach · Ny melding — v2 (retning C «Presis»). Komponert fra
 * ui_kits/playerhq/phq-wizards.jsx → MeldingNyView (Batch B1, delt
 * Veiviser-skall), men med EKTE hovedcoach fra CoachMeldingerV2 sin
 * datakilde (aktiv PlayerEnrollment → fallback første COACH-bruker).
 *
 * Erstatter legacy /portal/(legacy)/coach/melding/ny. Samme Pro-gate og
 * CoachingSession(kind DIRECT)-modell som hub-siden
 * (src/app/portal/coach/melding/page.tsx → CoachMeldingerV2).
 *
 * Kun v2-komponenter fra "@/components/v2"; ingen ad-hoc UI, ingen rå hex
 * (kun T.*). Norsk bokmål, ordbok låst.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  CTAPill,
  AvatarInit,
  TomTilstand,
  TekstOmraade,
  Veiviser,
} from "@/components/v2";

export type CoachMeldingNyData = {
  /** true = tier GRATIS (Pro-gate på direkte coach-meldinger, uendret regel). */
  gratis: boolean;
  coach: { id: string; name: string } | null;
};

export type SendMeldingNyInput = { coachId: string; body: string };

const HURTIGVALG = ["Kan vi bytte tid?", "Sett meg opp på range", "Se siste TrackMan-økt"];

export function CoachMeldingNyV2({
  data,
  sendAction,
}: {
  data: CoachMeldingNyData;
  sendAction: (input: SendMeldingNyInput) => Promise<void>;
}) {
  const { gratis, coach } = data;
  const [tekst, setTekst] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (gratis) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div>
          <Caps>Coach · Ny melding</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="Pro">Krever</Tittel>
          </div>
        </div>
        <Kort tint>
          <TomTilstand
            icon="lock"
            title="Direkte coach-meldinger er en Pro-funksjon"
            sub="Meldinger til coachen din er en del av PlayerHQ Pro (299 kr/mnd)."
          />
          <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
            <Link href="/portal/meg/abonnement" style={{ textDecoration: "none" }}>
              <CTAPill icon="arrow-right">Oppgrader til Pro</CTAPill>
            </Link>
          </div>
        </Kort>
      </div>
    );
  }

  if (!coach) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div>
          <Caps>Coach · Ny melding</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel>Ny melding</Tittel>
          </div>
        </div>
        <Kort>
          <TomTilstand icon="user" title="Ingen coach koblet" sub="Coachen din vises her når dere er koblet." />
        </Kort>
      </div>
    );
  }

  function handleSend() {
    if (tekst.trim().length < 3) {
      setFeil("Skriv en melding før du sender.");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      try {
        await sendAction({ coachId: coach!.id, body: tekst });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("NEXT_REDIRECT")) throw err;
        setFeil(msg === "upgrade-required" ? "Krever Pro-abonnement." : "Kunne ikke sende meldingen. Prøv igjen.");
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>Coach · Ny melding</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel>Ny melding</Tittel>
        </div>
      </div>

      <Kort>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AvatarInit navn={coach.name} size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.ui, fontSize: 14, fontWeight: 700, color: T.fg }}>{coach.name}</div>
            <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 1 }}>Svarer vanligvis innen 3 t</div>
          </div>
        </div>
      </Kort>

      <Kort eyebrow="Hurtigvalg">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {HURTIGVALG.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setTekst(h)}
              className="v2-press v2-focus"
              style={{
                appearance: "none", cursor: "pointer", minHeight: 38, padding: "0 15px", borderRadius: 9999,
                fontFamily: T.ui, fontSize: 13, fontWeight: 600,
                border: `1px solid ${T.borderS}`, background: T.panel2, color: T.fg,
              }}
            >
              {h}
            </button>
          ))}
        </div>
      </Kort>

      <Kort>
        <TekstOmraade
          label="Melding"
          value={tekst}
          onChange={setTekst}
          rows={6}
          placeholder={`Skriv en melding til ${coach.name.split(" ")[0]} …`}
        />
        {feil && <div style={{ fontFamily: T.ui, fontSize: 12, color: T.down, marginTop: 8 }}>{feil}</div>}
      </Kort>

      <Veiviser steg={["Skriv til coachen"]} aktiv={0} sisteTekst={pending ? "Sender …" : "Send melding"} onNeste={pending ? undefined : handleSend} />
    </div>
  );
}
