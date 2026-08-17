"use client";

/**
 * MegApp — /meg-skallet. Fasit: jarvis/meg-hjem.html + jarvis-base.js.
 * Toppbar · tråd (Én ting nå-kortet) · composer (delt, ikke koblet til chat
 * ennå) · artefaktpanel (delt ArtefaktPanel — sidepanel ≥1121px, bunnark
 * under, samme brytepunkt som PortalChatHjem/KonsollChat) · ⌘K-palett.
 *
 * Alle ti artefaktene (saker, sak, vakt, dagen, brief, journal, review,
 * maskinrom, historikk, innstillinger) + fangst styres av activeArtifact,
 * IKKE egne ruter (nattsesjon-prompt Fase 2 punkt 1). «saker», «sak»,
 * «maskinrom», «vakt» og «dagen» har ekte innhold — resten viser en ærlig
 * «kommer snart»-tilstand, se natt-rapport.md for hva som gjenstår.
 */
import { useCallback, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { TemaHeaderKnapp } from "@/components/v2/tema";
import { Composer } from "@/components/v2/composer";
import { InspektorTom } from "@/components/v2/inspektorpanel";
import { ArtefaktPanel, useErMobil } from "@/components/portal/v2/chat/ArtefaktPanel";
import { ARTEFAKT_TITTEL, erArtefaktType, type ArtefaktType } from "@/lib/jarvis/artefakt";
import { enTingNa } from "@/lib/jarvis/en-ting-na";
import { EnTingNaKort } from "@/components/meg/EnTingNaKort";
import { MegPalett } from "@/components/meg/MegPalett";
import { SakerArtefakt } from "@/components/meg/artefakter/SakerArtefakt";
import { SakArtefakt } from "@/components/meg/artefakter/SakArtefakt";
import { MaskinromArtefakt } from "@/components/meg/artefakter/MaskinromArtefakt";
import { KalendervaktArtefakt } from "@/components/meg/artefakter/KalendervaktArtefakt";
import { DagenArtefakt } from "@/components/meg/artefakter/DagenArtefakt";
import type { Sak } from "@/generated/prisma/client";
import { SakStatus } from "@/generated/prisma/enums";
import type { Avvik, DagenData, SystemHelse } from "@/lib/jarvis/types";

type MutasjonSvar = { ok: true } | { ok: false; feil: string };

export function MegApp({
  brukernavn,
  saker,
  systemHelse,
  avvik,
  dagen,
  naServertid,
  godkjennSak,
  avvisSak,
}: {
  brukernavn: string;
  saker: Sak[];
  systemHelse: SystemHelse;
  avvik: Avvik[];
  dagen: DagenData;
  /** ISO-streng fra serveren — unngår klient/server-hydreringsavvik (Oslo vs UTC, samme mønster som KonsollChat sin `klokke`-prop). */
  naServertid: string;
  godkjennSak: (id: string) => Promise<MutasjonSvar>;
  avvisSak: (id: string) => Promise<MutasjonSvar>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mobil = useErMobil();

  const na = new Date(naServertid);
  const artefaktFraUrl = searchParams.get("artefakt");
  const [activeArtifact, setActiveArtifact] = useState<ArtefaktType>(
    erArtefaktType(artefaktFraUrl) ? artefaktFraUrl : "saker",
  );
  const [selectedSakId, setSelectedSakId] = useState<string | null>(searchParams.get("sak"));
  const [panelApen, setPanelApen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const paletteKnappRef = useRef<HTMLButtonElement>(null);

  const oppdaterUrl = useCallback(
    (artefakt: ArtefaktType, sakId: string | null) => {
      const params = new URLSearchParams();
      params.set("artefakt", artefakt);
      if (sakId) params.set("sak", sakId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router],
  );

  function apneArtefakt(type: ArtefaktType, sakId: string | null = null) {
    setActiveArtifact(type);
    setSelectedSakId(sakId);
    setPanelApen(true);
    oppdaterUrl(type, sakId);
  }

  function velgSak(id: string) {
    apneArtefakt("sak", id);
  }

  const valgtSak = saker.find((s) => s.id === selectedSakId) ?? null;
  const naaSak = enTingNa(saker, na);
  const ventendeAntall = saker.filter((s) => s.status === SakStatus.VENTER).length;

  let artefaktInnhold: React.ReactNode;
  if (activeArtifact === "saker") {
    artefaktInnhold = <SakerArtefakt saker={saker} na={na} onVelgSak={velgSak} />;
  } else if (activeArtifact === "sak") {
    artefaktInnhold = (
      <SakArtefakt key={valgtSak?.id ?? "none"} sak={valgtSak} onGodkjenn={godkjennSak} onAvvis={avvisSak} />
    );
  } else if (activeArtifact === "maskinrom") {
    artefaktInnhold = <MaskinromArtefakt data={systemHelse} na={na} />;
  } else if (activeArtifact === "vakt") {
    artefaktInnhold = <KalendervaktArtefakt avvik={avvik} />;
  } else if (activeArtifact === "dagen") {
    artefaktInnhold = <DagenArtefakt data={dagen} na={na} onApneSaker={() => apneArtefakt("saker")} />;
  } else {
    artefaktInnhold = (
      <InspektorTom
        tittel={`${ARTEFAKT_TITTEL[activeArtifact]} kommer snart`}
        tekst="Denne flaten er ikke portet ennå — se natt-rapport.md for status og prioritert rekkefølge."
      />
    );
  }

  return (
    <div
      data-od-id="skjerm-meg"
      style={{
        display: "grid",
        gridTemplateColumns: mobil ? "1fr" : "minmax(0,1fr) 380px",
        alignItems: "start",
        gap: mobil ? 0 : 16,
        minHeight: "100dvh",
        background: T.bg,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", minHeight: mobil ? 0 : "100dvh", minWidth: 0 }}>
        <header
          data-od-id="panel-top"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderBottom: `1px solid ${T.border}`,
            position: "sticky",
            top: 0,
            zIndex: 5,
            background: T.bg,
            flex: "none",
          }}
        >
          <div style={{ minWidth: 0, flex: "1 1 160px" }}>
            <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>Meg</h1>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, marginTop: 2 }}>
              Hei, {brukernavn.split(" ")[0]}
            </div>
          </div>

          {ventendeAntall > 0 && (
            <button
              type="button"
              onClick={() => apneArtefakt("saker")}
              data-od-id="ko-indikator"
              className="v2-press v2-focus"
              aria-label={`${ventendeAntall} venter på deg`}
              style={{
                minHeight: 32,
                padding: "0 10px",
                borderRadius: T.rPill,
                border: `1px solid ${T.border}`,
                background: T.panel2,
                color: T.fg,
                fontFamily: T.mono,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                flex: "none",
              }}
            >
              {ventendeAntall} venter
            </button>
          )}

          <button
            ref={paletteKnappRef}
            type="button"
            onClick={() => setPaletteOpen(true)}
            data-od-id="open-palette"
            aria-label="Hopp til"
            className="v2-press v2-focus"
            style={{
              minHeight: 32,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "0 10px",
              borderRadius: T.rTag,
              border: `1px solid ${T.border}`,
              background: "transparent",
              color: T.mut,
              fontFamily: T.ui,
              fontSize: 12,
              cursor: "pointer",
              flex: "none",
            }}
          >
            <Icon name="search" size={14} strokeWidth={1.7} />
            {!mobil && <kbd style={{ fontFamily: T.mono, fontSize: 10 }}>⌘K</kbd>}
          </button>

          {mobil && (
            <button
              type="button"
              onClick={() => setPanelApen(true)}
              data-od-id="artifact-open-sheet"
              className="v2-press v2-focus"
              style={{
                minHeight: 32,
                padding: "0 10px",
                borderRadius: T.rTag,
                border: `1px solid ${T.border}`,
                background: T.panel2,
                color: T.fg,
                fontFamily: T.ui,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                flex: "none",
              }}
            >
              {ARTEFAKT_TITTEL[activeArtifact]}
            </button>
          )}

          <TemaHeaderKnapp />
        </header>

        <div
          role="log"
          aria-live="polite"
          aria-label="Samtale"
          style={{ flex: 1, minHeight: 0, padding: mobil ? "16px 16px 140px" : "16px 16px 24px", overflowY: "auto" }}
        >
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <EnTingNaKort sak={naaSak} na={na} onApne={velgSak} />
          </div>
        </div>

        <Composer
          label="Skriv til Meg"
          placeholder="Chat med Meg er ikke koblet til ennå"
          onSend={() => undefined}
          disabled
          mobil={mobil}
          kontekst={<>Chat er ikke koblet til ennå — bruk køen til høyre</>}
          snarveier={false}
          maksBredde={720}
        />
      </div>

      {mobil ? (
        <ArtefaktPanel mobil open={panelApen} onClose={() => setPanelApen(false)} tittel={ARTEFAKT_TITTEL[activeArtifact]}>
          {artefaktInnhold}
        </ArtefaktPanel>
      ) : (
        <div
          style={{
            position: "sticky",
            top: 16,
            maxHeight: "calc(100dvh - 32px)",
            minWidth: 0,
            display: "flex",
            borderRadius: T.rCard,
            overflow: "hidden",
            border: `1px solid ${T.border}`,
          }}
        >
          <ArtefaktPanel mobil={false} open onClose={() => undefined} tittel={ARTEFAKT_TITTEL[activeArtifact]}>
            {artefaktInnhold}
          </ArtefaktPanel>
        </div>
      )}

      <MegPalett
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onVelg={(type) => apneArtefakt(type)}
        triggerRef={paletteKnappRef}
      />
    </div>
  );
}
