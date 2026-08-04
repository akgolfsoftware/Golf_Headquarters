"use client";

/**
 * ArtefaktPanel — «dagens økt» som sidepanel (desktop) → bunnark (mobil),
 * matcher Paper-fasitens .artifact-mønster (playerhq-chat-desktop.html).
 *
 * Mobil-varianten gjenbruker den delte BunnArk-primitiven (src/components/v2/
 * bunn-ark.tsx) as-is — den dekker allerede backdrop, fokus-felle, Escape,
 * scroll-lås. Desktop-varianten er ny (kopierer responsiv-idéen fra MerPanel
 * i src/components/v2/shell.tsx, men som egen, generisk komponent — MerPanel
 * er navigasjons-spesifikk og ikke gjenbrukbar direkte, se steg 7-kartlegging).
 */

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { BunnArk } from "@/components/v2/bunn-ark";

function useErMobil(): boolean {
  const [mobil, setMobil] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1120px)");
    const oppdater = () => setMobil(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return mobil;
}

export function ArtefaktPanel({
  open,
  onClose,
  tittel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  tittel: string;
  children: ReactNode;
}) {
  const mobil = useErMobil();

  if (mobil) {
    return (
      <BunnArk open={open} onClose={onClose} tittel={tittel}>
        {children}
      </BunnArk>
    );
  }

  if (!open) return null;

  return createPortal(
    <>
      <div
        onClick={onClose}
        aria-hidden
        style={{ position: "fixed", inset: 0, zIndex: 90, background: T.farge.svartA55 }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={tittel}
        style={{
          position: "fixed",
          right: 12,
          top: 12,
          bottom: 12,
          zIndex: 91,
          width: 360,
          maxWidth: "calc(100vw - 24px)",
          overflowY: "auto",
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderRadius: T.rCard,
          boxShadow: `0 24px 64px ${T.farge.svartA35}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <span style={{ fontFamily: T.disp, fontSize: 13, fontWeight: 600, color: T.fg }}>{tittel}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            className="v2-press v2-focus"
            style={{ marginLeft: "auto", background: "transparent", border: 0, color: T.mut, cursor: "pointer", padding: 4 }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>{children}</div>
      </div>
    </>,
    document.body,
  );
}
