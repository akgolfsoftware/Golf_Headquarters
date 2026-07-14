"use client";

/**
 * Vises kun når en turnering er slått sammen (mergedIntoId satt) — v2.
 * Logikk bevart 1:1 fra legacy unmerge-banner.tsx. Flytter IKKE
 * påmeldinger/resultater tilbake — det gjør server-actionen klart i teksten.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { unmergeTurnering } from "@/app/admin/tournaments/actions";

type Props = {
  sourceId: string;
  targetName: string | null;
};

export function UnmergeBanner({ sourceId, targetName }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  function opphev() {
    if (
      !confirm(
        "Oppheve sammenslåingen? Turneringen blir synlig igjen i lista. Påmeldinger og resultater som ble flyttet, flyttes IKKE tilbake automatisk.",
      )
    ) {
      return;
    }
    setFeil(null);
    startTransition(async () => {
      const res = await unmergeTurnering(sourceId);
      if (!res.ok) {
        setFeil(res.feil);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div style={{ borderRadius: 14, background: `color-mix(in srgb, ${T.warn} 8%, ${T.panel})`, border: `1px solid color-mix(in srgb, ${T.warn} 35%, transparent)`, padding: 18 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", color: T.fg, margin: 0 }}>
            Slått sammen{targetName ? ` inn i «${targetName}»` : ""}
          </h2>
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "5px 0 0" }}>
            Denne turneringen er markert som dublett og skjules fra hovedlista. Opphev for å vise den som egen turnering igjen.
          </p>
        </div>
        <button
          type="button"
          onClick={opphev}
          disabled={pending}
          className="v2-press v2-focus"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, flex: "none", appearance: "none", cursor: pending ? "default" : "pointer", borderRadius: 9999, padding: "9px 16px", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, background: T.panel3, border: `1px solid ${T.borderS}`, opacity: pending ? 0.6 : 1 }}
        >
          <Icon name={pending ? "loader" : "corner-up-left"} size={14} />
          Opphev sammenslåing
        </button>
      </div>
      {feil && (
        <div role="alert" style={{ marginTop: 12, borderRadius: 11, background: `color-mix(in srgb, ${T.down} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`, padding: "10px 13px", fontFamily: T.ui, fontSize: 12.5, color: T.down }}>
          {feil}
        </div>
      )}
    </div>
  );
}
