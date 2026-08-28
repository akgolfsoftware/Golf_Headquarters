"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * Første-besøk push-opt-in for PlayerHQ.
 * Vises én gang på hjem til brukeren aktiverer, avslår, eller browser ikke støtter.
 * Motoren (aktiverPush) er uendret — dette er bare triggeren som manglet.
 */

import { useEffect, useState } from "react";
import { aktiverPush, detectPushStatus, type PushStatus } from "@/components/portal/push-toggle";
import { Caps, CTAPill, Icon, Kort } from "@/components/v2";

const STORAGE_KEY = "akgolf-push-optin-dismissed";

function lesLagret(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function skrivLagret(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // privat modus / sperret storage — visning i denne sesjonen er nok
  }
}

export function PushOptInBanner() {
  const [status, setStatus] = useState<PushStatus>("loading");
  const [synlig, setSynlig] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (typeof window === "undefined") return;
      try {
        if (lesLagret(STORAGE_KEY) === "1") return;
        const s = await detectPushStatus();
        if (cancelled) return;
        setStatus(s);
        if (s === "off") setSynlig(true);
      } catch {
        // Banner vises ikke — bedre enn krasj på hjem.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onAktiver() {
    if (busy) return;
    setBusy(true);
    setFeil(null);
    try {
      const neste = await aktiverPush();
      setStatus(neste);
      if (neste === "on") {
        skrivLagret(STORAGE_KEY, "1");
        setSynlig(false);
      } else if (neste === "blocked") {
        setFeil("Varsler er blokkert i nettleseren. Åpne nettleser-innstillingene for å tillate dem.");
      } else if (neste === "unsupported") {
        setFeil("Nettleseren støtter ikke push-varsler.");
        setSynlig(false);
      }
    } catch (e) {
      setFeil(e instanceof Error ? e.message : "Kunne ikke aktivere varsler");
    } finally {
      setBusy(false);
    }
  }

  function onSenere() {
    if (busy) return;
    skrivLagret(STORAGE_KEY, "1");
    setSynlig(false);
  }

  if (!synlig || status !== "off") return null;

  return (
    <Kort eyebrow={<Caps>Varsler</Caps>} pad="16px 18px">
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Icon name="bell" size={18} style={{ color: TL.fill, flex: "none", marginTop: 2 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600, color: TL.text, marginBottom: 4 }}>
            Få beskjed når planen er klar
          </div>
          <p style={{ margin: "0 0 12px", fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
            Slå på push-varsler for nye økter, godkjenninger og påminnelser. Du kan endre dette når som helst under Meg → Innstillinger.
          </p>
          {feil ? (
            <p style={{ margin: "0 0 10px", fontFamily: TL.font.sans, fontSize: 12, color: TL.danger }}>{feil}</p>
          ) : null}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              pointerEvents: busy ? "none" : undefined,
              opacity: busy ? 0.7 : undefined,
            }}
          >
            <CTAPill icon="bell" onClick={() => void onAktiver()}>
              {busy ? "Aktiverer…" : "Slå på varsler"}
            </CTAPill>
            <CTAPill ghost onClick={onSenere}>
              Ikke nå
            </CTAPill>
          </div>
        </div>
      </div>
    </Kort>
  );
}
