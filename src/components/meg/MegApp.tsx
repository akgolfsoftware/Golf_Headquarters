"use client";

/**
 * MegApp — /meg-skallet. Fasit: jarvis/meg-hjem.html + jarvis-base.js.
 * Toppbar · tråd (Én ting nå-kortet) · composer (delt, ikke koblet til chat
 * ennå) · artefaktpanel (delt ArtefaktPanel — sidepanel ≥1121px, bunnark
 * under, samme brytepunkt som PortalChatHjem/KonsollChat) · ⌘K-palett.
 *
 * Alle ti artefaktene (saker, sak, vakt, dagen, brief, journal, review,
 * maskinrom, historikk, innstillinger) + fangst styres av activeArtifact,
 * IKKE egne ruter (nattsesjon-prompt Fase 2 punkt 1). Alle elleve har nå
 * ekte innhold — se natt-rapport.md for historikken.
 */
import { useCallback, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TL } from "@/lib/v2/train-lock";

import { Icon } from "@/components/v2/icon";
import { TemaHeaderKnapp } from "@/components/v2/tema";
import { Composer } from "@/components/v2/composer";
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
import { HistorikkArtefakt } from "@/components/meg/artefakter/HistorikkArtefakt";
import { FangstArtefakt } from "@/components/meg/artefakter/FangstArtefakt";
import { MorgenbriefArtefakt } from "@/components/meg/artefakter/MorgenbriefArtefakt";
import { KveldsjournalArtefakt } from "@/components/meg/artefakter/KveldsjournalArtefakt";
import { UkesreviewArtefakt } from "@/components/meg/artefakter/UkesreviewArtefakt";
import { InnstillingerArtefakt } from "@/components/meg/artefakter/InnstillingerArtefakt";
import { useAgenticosBro } from "@/components/meg/use-agenticos-bro";
import type { Sak } from "@/generated/prisma/client";
import { SakStatus } from "@/generated/prisma/enums";
import type {
  Avvik,
  BriefSnapshot,
  DagenData,
  FangstType,
  Innstillinger,
  InnstillingEndring,
  LoggRad,
  SystemHelse,
  UkesreviewData,
} from "@/lib/jarvis/types";

type MutasjonSvar = { ok: true } | { ok: false; feil: string };

export function MegApp({
  brukernavn,
  saker,
  systemHelse,
  avvik,
  dagen,
  logg,
  morgenbrief,
  kveldsjournal,
  ukesreview,
  innstillinger,
  naServertid,
  godkjennSak,
  avvisSak,
  oppdaterForeslattSvar,
  opprettFangst,
  oppdaterInnstilling,
}: {
  brukernavn: string;
  saker: Sak[];
  systemHelse: SystemHelse;
  avvik: Avvik[];
  dagen: DagenData;
  logg: LoggRad[];
  morgenbrief: BriefSnapshot;
  kveldsjournal: BriefSnapshot;
  ukesreview: UkesreviewData;
  innstillinger: Innstillinger;
  /** ISO-streng fra serveren — unngår klient/server-hydreringsavvik (Oslo vs UTC, samme mønster som KonsollChat sin `klokke`-prop). */
  naServertid: string;
  godkjennSak: (id: string) => Promise<MutasjonSvar>;
  avvisSak: (id: string) => Promise<MutasjonSvar>;
  oppdaterForeslattSvar: (id: string, tekst: string) => Promise<MutasjonSvar>;
  opprettFangst: (type: FangstType, tekst: string) => Promise<MutasjonSvar>;
  oppdaterInnstilling: (endring: InnstillingEndring) => Promise<MutasjonSvar>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mobil = useErMobil();

  const na = new Date(naServertid);
  const agenticos = useAgenticosBro(systemHelse.agenticos);
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
      <SakArtefakt
        key={valgtSak?.id ?? "none"}
        sak={valgtSak}
        onGodkjenn={godkjennSak}
        onAvvis={avvisSak}
        onOppdaterSvar={oppdaterForeslattSvar}
      />
    );
  } else if (activeArtifact === "maskinrom") {
    artefaktInnhold = <MaskinromArtefakt data={{ ...systemHelse, agenticos }} na={na} />;
  } else if (activeArtifact === "vakt") {
    artefaktInnhold = <KalendervaktArtefakt avvik={avvik} />;
  } else if (activeArtifact === "dagen") {
    artefaktInnhold = <DagenArtefakt data={dagen} na={na} onApneSaker={() => apneArtefakt("saker")} />;
  } else if (activeArtifact === "historikk") {
    artefaktInnhold = <HistorikkArtefakt logg={logg} na={na} onVelgSak={velgSak} />;
  } else if (activeArtifact === "fangst") {
    artefaktInnhold = <FangstArtefakt onFang={opprettFangst} />;
  } else if (activeArtifact === "brief") {
    artefaktInnhold = (
      <MorgenbriefArtefakt saker={saker} dagen={dagen} brief={morgenbrief} na={na} onVelgSak={velgSak} onApneDagen={() => apneArtefakt("dagen")} />
    );
  } else if (activeArtifact === "journal") {
    artefaktInnhold = <KveldsjournalArtefakt saker={saker} logg={logg} brief={kveldsjournal} na={na} onVelgSak={velgSak} />;
  } else if (activeArtifact === "review") {
    artefaktInnhold = <UkesreviewArtefakt data={ukesreview} />;
  } else {
    artefaktInnhold = <InnstillingerArtefakt innstillinger={innstillinger} onEndre={oppdaterInnstilling} />;
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
        background: TL.scene,
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
            borderBottom: `1px solid ${TL.hair}`,
            position: "sticky",
            top: 0,
            zIndex: 5,
            background: TL.scene,
            flex: "none",
          }}
        >
          <div style={{ minWidth: 0, flex: "1 1 160px" }}>
            <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>Meg</h1>
            <div style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute, marginTop: 2 }}>
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
                borderRadius: TL.radius.pill,
                border: `1px solid ${TL.hair}`,
                background: TL.dock,
                color: TL.text,
                fontFamily: TL.font.mono,
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
              borderRadius: TL.radius.row,
              border: `1px solid ${TL.hair}`,
              background: "transparent",
              color: TL.mute,
              fontFamily: TL.font.sans,
              fontSize: 12,
              cursor: "pointer",
              flex: "none",
            }}
          >
            <Icon name="search" size={14} strokeWidth={1.7} />
            {!mobil && <kbd style={{ fontFamily: TL.font.mono, fontSize: 10 }}>⌘K</kbd>}
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
                borderRadius: TL.radius.row,
                border: `1px solid ${TL.hair}`,
                background: TL.dock,
                color: TL.text,
                fontFamily: TL.font.sans,
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
            borderRadius: TL.radius.card,
            overflow: "hidden",
            border: `1px solid ${TL.hair}`,
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
