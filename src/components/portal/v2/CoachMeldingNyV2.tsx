"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ Coach · Ny melding — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { Caps, Tittel, Kort, AvatarInit, TomTilstand, TekstOmraade, Veiviser } from "@/components/v2";
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
      <div data-paper-wave-g="coachmeldingny" data-paper-pattern  data-paper-portal-coach-melding-ny style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
        <div>
          <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Ny melding</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>Coach</span>
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
              <span style={{
              display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, padding: "10px 16px",
              borderRadius: 10, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600,
            }}>Oppgrader til Pro</span>
            </Link>
          </div>
        </Kort>
      </div>
    );
  }

  if (!coach) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
            <div style={{ fontFamily: TL.font.sans, fontSize: 14, fontWeight: 700, color: TL.text }}>{coach.name}</div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, marginTop: 1 }}>Svarer vanligvis innen 3 t</div>
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
                fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600,
                border: `1px solid ${TL.hair}`, background: TL.dock, color: TL.text,
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
        {feil && <div style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.danger, marginTop: 8 }}>{feil}</div>}
      </Kort>

      <Veiviser steg={["Skriv til coachen"]} aktiv={0} sisteTekst={pending ? "Sender …" : "Send melding"} onNeste={pending ? undefined : handleSend} />
    </div>
  );
}
