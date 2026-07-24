"use client";

/**
 * Første-besøk push-opt-in for PlayerHQ.
 * Vises én gang på hjem til brukeren aktiverer, avslår, eller browser ikke støtter.
 * Motoren (aktiverPush) er uendret — dette er bare triggeren som manglet.
 */

import { useEffect, useState } from "react";
import {
  aktiverPush,
  detectPushStatus,
  type PushStatus,
} from "@/components/portal/push-toggle";
import { T, Caps, CTAPill, Icon, Kort } from "@/components/v2";

const STORAGE_KEY = "akgolf-push-optin-dismissed";

export function PushOptInBanner() {
  const [status, setStatus] = useState<PushStatus>("loading");
  const [synlig, setSynlig] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (typeof window === "undefined") return;
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
      const s = await detectPushStatus();
      if (cancelled) return;
      setStatus(s);
      if (s === "off") setSynlig(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!synlig || status !== "off") return null;

  async function onAktiver() {
    setBusy(true);
    setFeil(null);
    try {
      const neste = await aktiverPush();
      setStatus(neste);
      if (neste === "on") {
        window.localStorage.setItem(STORAGE_KEY, "1");
        setSynlig(false);
      } else if (neste === "blocked") {
        setFeil("Varsler er blokkert i nettleseren. Åpne nettleser-innstillingene for å tillate dem.");
      }
    } catch (e) {
      setFeil(e instanceof Error ? e.message : "Kunne ikke aktivere varsler");
    } finally {
      setBusy(false);
    }
  }

  function onSenere() {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setSynlig(false);
  }

  return (
    <Kort eyebrow={<Caps>Varsler</Caps>} pad="16px 18px">
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Icon name="bell" size={18} style={{ color: T.lime, flex: "none", marginTop: 2 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: T.ui, fontSize: 14, fontWeight: 600, color: T.fg, marginBottom: 4 }}>
            Få beskjed når planen er klar
          </div>
          <p style={{ margin: "0 0 12px", fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>
            Slå på push-varsler for nye økter, godkjenninger og påminnelser. Du kan endre dette når som helst under Meg → Innstillinger.
          </p>
          {feil ? (
            <p style={{ margin: "0 0 10px", fontFamily: T.ui, fontSize: 12, color: T.down }}>{feil}</p>
          ) : null}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
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
