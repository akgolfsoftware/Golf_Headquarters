"use client";

/**
 * PlayerHQ Coach · Spørsmål-tråd — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import { useEffect, useState, useTransition } from "react";
import {
  T,
  Caps,
  Tittel,
  Kort,
  StatusPill,
  AvatarInit,
  TekstOmraade,
  Knapp,
  Rad,
  Icon,
} from "@/components/v2";
import { useToast } from "@/components/shared/toast-provider";

/* ── Datakontrakt (serialiserbar — formatert på server) ────────────── */

export type CoachSporsmalTraad = {
  id: string;
  /** Navnet på spilleren som spurte (oppslått fra User). */
  askerNavn: string;
  tittel: string;
  body: string;
  /** status === "ANSWERED" && answer finnes. */
  besvart: boolean;
  /** Coachens svar (null når ubesvart). */
  svar: string | null;
  /** Forhåndsformatert «dd.mm hh:mm» (nb-NO, Europe/Oslo) fra createdAt. */
  stiltTid: string;
  /** Forhåndsformatert tid fra answeredAt (null når ubesvart). */
  besvartTid: string | null;
};

/* ── Ren hjelper ───────────────────────────────────────────────────── */

/** true på klient etter mount når viewport < 768px (styrer kun titteltørrelse). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/* Liten mono-meta med ikon (stilt/besvart-tidspunkt). */
function TidMeta({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontFamily: T.mono,
        fontSize: 10.5,
        color: T.mut,
      }}
    >
      <Icon name={icon} size={11} style={{ color: T.mut }} />
      {children}
    </span>
  );
}

/* Statiske forslag til liknende spørsmål (placeholder som i legacy — søk kommer). */
const RELATERTE = [
  "Hvor mye skal venstre håndledd flektes ved topp?",
  "Hvordan beholde balanse gjennom finish?",
  "Bør tempo være likt på jern og driver?",
] as const;

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function CoachSporsmalTraadV2({
  data,
  svarAction,
}: {
  data: CoachSporsmalTraad;
  svarAction: (questionId: string, answer: string) => Promise<void>;
}) {
  const mobile = useMobile();
  const toast = useToast();

  return (
    <div
      style={{
        maxWidth: 760,
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: T.gap,
      }}
    >
      {/* Hode */}
      <div>
        <Caps>Coach · Spørsmål</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile={mobile} em="coach">
            Spørsmål til
          </Tittel>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
            marginTop: 12,
          }}
        >
          {data.besvart ? (
            <StatusPill tone="up">Besvart</StatusPill>
          ) : (
            <StatusPill tone="info">Venter på svar</StatusPill>
          )}
          <TidMeta icon="clock">Stilt {data.stiltTid}</TidMeta>
          {data.besvart && data.besvartTid && (
            <TidMeta icon="message-square">Besvart {data.besvartTid}</TidMeta>
          )}
        </div>
      </div>

      {/* Spørsmålskort */}
      <Kort>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <AvatarInit navn={data.askerNavn} size={44} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "baseline",
                gap: 8,
              }}
            >
              <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.fg }}>
                {data.askerNavn}
              </span>
              <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>
                {data.stiltTid}
              </span>
            </div>
            <div
              style={{
                fontFamily: T.disp,
                fontWeight: 700,
                fontSize: 19,
                letterSpacing: "-0.01em",
                lineHeight: 1.25,
                color: T.fg,
                margin: "6px 0 8px",
              }}
            >
              {data.tittel}
            </div>
            <p
              style={{
                fontFamily: T.ui,
                fontSize: 14.5,
                lineHeight: 1.6,
                color: T.fg,
                whiteSpace: "pre-line",
                margin: 0,
              }}
            >
              {data.body}
            </p>
          </div>
        </div>
      </Kort>

      {data.besvart && data.svar ? (
        <>
          {/* Svarkort */}
          <Kort
            tint
            eyebrow="Svar fra coach"
            action={<StatusPill tone="up">Besvart</StatusPill>}
          >
            <p
              style={{
                fontFamily: T.ui,
                fontSize: 14.5,
                lineHeight: 1.6,
                color: T.fg,
                whiteSpace: "pre-line",
                margin: 0,
              }}
            >
              {data.svar}
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                marginTop: 16,
                paddingTop: 14,
                borderTop: `1px solid ${T.border}`,
              }}
            >
              <TidMeta icon="clock">Stilt {data.stiltTid}</TidMeta>
              {data.besvartTid && (
                <TidMeta icon="message-square">Besvart {data.besvartTid}</TidMeta>
              )}
            </div>
          </Kort>

          {/* Reaksjon */}
          <Reaksjon />
        </>
      ) : (
        /* Svarskjema — vises når spørsmålet ikke er besvart */
        <SvarSkjema questionId={data.id} svarAction={svarAction} />
      )}

      {/* Liknende spørsmål */}
      <Kort
        eyebrow="Liknende spørsmål andre har stilt"
        action={
          <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>
            {RELATERTE.length} relaterte
          </span>
        }
      >
        <div>
          {RELATERTE.map((q, i) => (
            <Rad
              key={q}
              leading={<Icon name="message-circle" size={16} style={{ color: T.mut }} />}
              title={q}
              meta={<StatusPill tone="up">Besvart</StatusPill>}
              last={i === RELATERTE.length - 1}
              onClick={() => toast.info("Spørsmål-søk kommer snart")}
            />
          ))}
        </div>
      </Kort>
    </div>
  );
}

/* ── Svarskjema ────────────────────────────────────────────────────── */

function SvarSkjema({
  questionId,
  svarAction,
}: {
  questionId: string;
  svarAction: (questionId: string, answer: string) => Promise<void>;
}) {
  const toast = useToast();
  const [svar, setSvar] = useState("");
  const [pending, startTransition] = useTransition();

  function send() {
    const trimmet = svar.trim();
    if (!trimmet) {
      toast.info("Skriv et svar før du sender.");
      return;
    }
    startTransition(async () => {
      try {
        await svarAction(questionId, trimmet);
        toast.info("Svaret er sendt til spilleren.");
      } catch {
        toast.info("Kunne ikke sende svaret. Prøv igjen.");
      }
    });
  }

  return (
    <Kort tint eyebrow="Skriv svar til spilleren">
      <TekstOmraade
        label="Svar"
        value={svar}
        onChange={setSvar}
        rows={6}
        placeholder="Svar konkret — gjerne med sjekkpunkter spilleren kan teste på neste økt."
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
        <Knapp icon="send" onClick={pending ? undefined : send} disabled={pending}>
          {pending ? "Sender …" : "Send svar"}
        </Knapp>
      </div>
    </Kort>
  );
}

/* ── Reaksjon ──────────────────────────────────────────────────────── */

function Reaksjon() {
  const toast = useToast();
  const [markert, setMarkert] = useState<"opp" | "ned" | null>("opp");

  return (
    <Kort>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: T.ui, fontSize: 14, fontWeight: 700, color: T.fg }}>
            Hjalp dette deg?
          </div>
          <div style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, marginTop: 2 }}>
            Reaksjonen din hjelper coachen din med å forstå hva som funker.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }} role="group" aria-label="Reaksjon">
          <Knapp
            icon="thumbs-up"
            ghost={markert !== "opp"}
            onClick={() => {
              setMarkert("opp");
              toast.info("Tilbakemelding registrert — takk!");
            }}
          >
            Hjalp
          </Knapp>
          <Knapp
            icon="thumbs-down"
            ghost={markert !== "ned"}
            onClick={() => {
              setMarkert("ned");
              toast.info("Tilbakemelding registrert — takk!");
            }}
          >
            Trenger mer
          </Knapp>
        </div>
      </div>
    </Kort>
  );
}
