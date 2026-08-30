"use client";

/**
 * PlayerHQ · Coach-tilbakemelding etter økt (Paper W3, konsolidert flate).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-coach-tilbakemelding.html
 *
 * Dette er coachens ord til spilleren — prosa i Lora (TL.font.sans), ikke
 * datakort. «Tre ting å ta med» er den deterministiske delen og vises kun
 * når reelle punkter finnes. Video er en MODUL i flaten (ikke egen rute) og
 * viser kun ekte klipp fra økta — ellers ærlig plassholder (D10).
 *
 * Én ting nå: «Send svar» (eneste clay på flaten). Venter-tilstanden har
 * ingen clay — fasitens knapper der er vanlige ink-CTA-er.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";

import { TL } from "@/lib/v2/train-lock";

import { Icon, Knapp, TekstOmraade, TomTilstand } from "@/components/v2";
import { PaperPage, PaperTopp, PaperKropp } from "@/components/portal/v2/SideChrome";
import type { CoachTilbakemeldingData } from "@/lib/portal-okt/coach-tilbakemelding-data";
import { sendTilbakemeldingSvar, kvitterTilbakemelding } from "@/app/portal/coach/tilbakemelding/[oktId]/actions";
/* ── Lokale byggeklosser (kun T.* — fasitens .kort/.eyebrow/.hjelp) ───── */

function Kort({ eyebrow, children }: { eyebrow?: string; children: ReactNode }) {
  return (
    <section
      style={{
        background: TL.elev,
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.card,
        padding: 16,
      }}
    >
      {eyebrow && (
        <span
          style={{
            display: "block",
            fontFamily: TL.font.mono,
            fontSize: TL.storrelse.capsSm,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: TL.mute,
            marginBottom: 10,
          }}
        >
          {eyebrow}
        </span>
      )}
      {children}
    </section>
  );
}

/** Fasitens `.hjelp` — mono-hjelpetekst under en modul. */
function Hjelp({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: "12px 0 0",
        fontFamily: TL.font.mono,
        fontSize: 10,
        letterSpacing: "0.03em",
        color: TL.mute,
        lineHeight: 1.5,
      }}
    >
      {children}
    </p>
  );
}

/** Fasitens `.rad` — lenkerad med tittel, mono-undertekst og pil. */
function LenkeRad({
  href,
  tittel,
  sub,
  odId,
  forste,
}: {
  href: string;
  tittel: string;
  sub: string;
  odId: string;
  /** Første rad i et kort har ingen toppstrek. */
  forste?: boolean;
}) {
  return (
    <Link
      href={href}
      data-od-id={odId}
      className="v2-press v2-focus"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        minWidth: 0,
        padding: "10px 0",
        textDecoration: "none",
        borderTop: forste ? "none" : `1px solid ${TL.hair}`,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <span
          style={{
            display: "block",
            fontFamily: TL.font.sans,
            fontSize: TL.storrelse.kropp,
            fontWeight: 600,
            color: TL.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {tittel}
        </span>
        <span
          style={{
            display: "block",
            fontFamily: TL.font.mono,
            fontSize: 10,
            color: TL.mute,
            marginTop: 2,
          }}
        >
          {sub}
        </span>
      </div>
      <Icon name="chevron-right" size={15} style={{ color: TL.mute, flex: "none" }} />
    </Link>
  );
}

/* ── Flaten ───────────────────────────────────────────────────────────── */

export function CoachTilbakemeldingV2({ data }: { data: CoachTilbakemeldingData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [svar, setSvar] = useState(
    data.found && data.dittSvar ? data.dittSvar.tekst : "",
  );
  const [status, setStatus] = useState<{ ok: boolean; tekst: string } | null>(null);

  /* Tom tilstand — fant ikke økta (eller ingen tilgang). Én vei videre. */
  if (!data.found) {
    return (
      <div data-paper-slug="playerhq-coach-tilbakemelding" data-od-id="playerhq-coach-tilbakemelding" style={{ display: "contents" }}>
        <PaperPage>
          <PaperTopp tittel="Tilbakemelding" tilbakeHref="/portal/coach" tilbakeLabel="Til coach" />
          <PaperKropp>
            <Kort>
              <TomTilstand
                icon="search-x"
                title="Fant ikke økta"
                sub="Den kan være slettet fra planen, eller lenken er gammel. Alt fra coachen din ligger fortsatt på coach-siden."
              />
              <Link href="/portal/coach" data-od-id="tbm-tom-hub" style={{ textDecoration: "none", display: "block" }}>
                <Knapp full>Til coach-siden</Knapp>
              </Link>
            </Kort>
          </PaperKropp>
        </PaperPage>
      </div>
    );
  }

  const skrevet = data.tilstand === "skrevet";
  const coachFornavn = data.coach?.fornavn ?? "Coachen din";

  const sendSvar = () => {
    setStatus(null);
    startTransition(async () => {
      const res = await sendTilbakemeldingSvar({ oktId: data.oktId, tekst: svar });
      if (res.ok) {
        setStatus({ ok: true, tekst: "Svaret er sendt." });
        router.refresh();
      } else {
        setStatus({ ok: false, tekst: res.error });
      }
    });
  };

  const kvitter = () => {
    setStatus(null);
    startTransition(async () => {
      const res = await kvitterTilbakemelding({ oktId: data.oktId });
      if (res.ok) {
        setStatus({ ok: true, tekst: "Kvittert — coachen ser at du har lest den." });
        router.refresh();
      } else {
        setStatus({ ok: false, tekst: res.error });
      }
    });
  };

  return (
    <div data-paper-slug="playerhq-coach-tilbakemelding" data-od-id="playerhq-coach-tilbakemelding" style={{ display: "contents" }}>
      <PaperPage>
        <PaperTopp
          tittel="Tilbakemelding"
          sub={data.sub}
          tilbakeHref="/portal/coach"
          tilbakeLabel="Til coach"
        />
        <PaperKropp>
          {/* Kilde — hvem som skrev, når, og hvor lang økta var */}
          {data.coach && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: TL.elev,
                border: `1px solid ${TL.hair}`,
                borderRadius: TL.radius.card,
                padding: "12px 16px",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flex: "none",
                  width: 38,
                  height: 38,
                  borderRadius: TL.radius.pill,
                  background: TL.dim,
                  border: `1px solid ${TL.hair}`,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: TL.font.mono,
                  fontSize: 12,
                  fontWeight: 600,
                  color: TL.text,
                }}
              >
                {data.coach.initialer}
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: TL.storrelse.kropp, fontWeight: 600, color: TL.text }}>
                  {data.coach.navn}
                </span>
                <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, marginTop: 2 }}>
                  {data.kildeMeta}
                </span>
              </div>
            </div>
          )}

          {skrevet ? (
            <>
              {/* Oppsummert — coachens ord, prosa i Lora */}
              <Kort eyebrow="Oppsummert">
                <div style={{ maxWidth: "56ch" }}>
                  {data.prosa.map((avsnitt, i) => (
                    <p
                      key={i}
                      style={{
                        margin: i === data.prosa.length - 1 ? 0 : "0 0 12px",
                        fontFamily: TL.font.sans,
                        fontSize: 15,
                        lineHeight: 1.62,
                        color: TL.mute,
                      }}
                    >
                      {avsnitt}
                    </p>
                  ))}
                </div>
              </Kort>

              {/* Tre ting å ta med — den deterministiske delen; kun reelle punkter */}
              {data.punkter.length > 0 && (
                <Kort eyebrow="Tre ting å ta med">
                  <div>
                    {data.punkter.map((punkt, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 10,
                          padding: "10px 0",
                          borderBottom: i === data.punkter.length - 1 ? "none" : `1px solid ${TL.hair}`,
                        }}
                      >
                        <span
                          style={{
                            flex: "none",
                            width: 22,
                            height: 22,
                            borderRadius: TL.radius.pill,
                            background: TL.dim,
                            border: `1px solid ${TL.hair}`,
                            display: "grid",
                            placeItems: "center",
                            fontFamily: TL.font.mono,
                            fontSize: 10,
                            fontWeight: 700,
                            color: TL.text,
                            marginTop: 1,
                          }}
                        >
                          {i + 1}
                        </span>
                        <div
                          style={{
                            minWidth: 0,
                            flex: 1,
                            fontFamily: TL.font.sans,
                            fontSize: TL.storrelse.kropp,
                            lineHeight: 1.55,
                            color: TL.mute,
                          }}
                        >
                          {punkt}
                        </div>
                      </div>
                    ))}
                  </div>
                </Kort>
              )}

              {/* Videoklipp — modul i flaten; kun ekte klipp, ellers ærlig plassholder */}
              <Kort eyebrow="Videoklipp">
                {data.klipp.length > 0 ? (
                  <div>
                    {data.klipp.map((k, i) => (
                      <a
                        key={k.id}
                        href={k.url}
                        target="_blank"
                        rel="noreferrer"
                        data-od-id={`tbm-klipp-${i}`}
                        className="v2-press v2-focus"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          minWidth: 0,
                          padding: "10px 0",
                          textDecoration: "none",
                          borderTop: i === 0 ? "none" : `1px solid ${TL.hair}`,
                        }}
                      >
                        <Icon name="video" size={15} style={{ color: TL.mute, flex: "none" }} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <span
                            style={{
                              display: "block",
                              fontFamily: TL.font.sans,
                              fontSize: TL.storrelse.kropp,
                              fontWeight: 600,
                              color: TL.text,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {k.label}
                          </span>
                          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, marginTop: 2 }}>
                            {k.meta}
                          </span>
                        </div>
                        <Icon name="external-link" size={13} style={{ color: TL.mute, flex: "none" }} />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      aspectRatio: "16 / 9",
                      border: `1px dashed ${TL.hair}`,
                      borderRadius: TL.radius.card,
                      background: TL.dock,
                      display: "grid",
                      placeItems: "center",
                      textAlign: "center",
                      padding: 16,
                    }}
                  >
                    <span style={{ fontFamily: TL.font.mono, fontSize: 10.5, letterSpacing: "0.04em", color: TL.mute }}>
                      Ingen videoklipp fra denne økta
                    </span>
                  </div>
                )}
              </Kort>

              {/* Lagt i planen din — veien videre, ærlige lenker */}
              <Kort eyebrow="Lagt i planen din">
                <div style={{ marginTop: -4 }}>
                  <LenkeRad
                    href="/portal/planlegge"
                    tittel="Planen din"
                    sub="Se hva som ligger i ukene fremover"
                    odId="tbm-plan"
                    forste
                  />
                  <LenkeRad
                    href="/portal/drills"
                    tittel="Tildelte øvelser"
                    sub="Se drill-banken · kan være tom"
                    odId="tbm-drills"
                  />
                </div>
              </Kort>

              {/* Din side av det — svar + kvittering (kun spilleren selv) */}
              {data.kanSvare && (
                <Kort eyebrow="Din side av det">
                  {data.dittSvar && (
                    <p
                      style={{
                        margin: "0 0 10px",
                        fontFamily: TL.font.mono,
                        fontSize: 10,
                        letterSpacing: "0.03em",
                        color: TL.mute,
                      }}
                    >
                      {data.dittSvar.sendt} — du kan oppdatere svaret under.
                    </p>
                  )}
                  <TekstOmraade
                    label="Hvordan opplevde du økta?"
                    value={svar}
                    onChange={setSvar}
                    rows={4}
                    placeholder="Kjente at 80 % var uvant, men traff bedre."
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Knapp
                        full
                        icon={data.kvittert ? "check" : undefined}
                        disabled={pending || data.kvittert}
                        onClick={kvitter}
                      >
                        {data.kvittert ? "Kvittert" : "Forstått"}
                      </Knapp>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Knapp
                        full
                        disabled={pending || svar.trim().length === 0}
                        onClick={sendSvar}
                      >
                        Send svar
                      </Knapp>
                    </div>
                  </div>
                  {status && (
                    <p
                      role="status"
                      style={{
                        margin: "10px 0 0",
                        fontFamily: TL.font.sans,
                        fontSize: TL.storrelse.meta,
                        color: status.ok ? TL.ok : TL.danger,
                      }}
                    >
                      {status.tekst}
                    </p>
                  )}
                  <Hjelp>
                    {coachFornavn} ser svaret før neste time. Trenger du raskt svar, bruk chatten.
                  </Hjelp>
                </Kort>
              )}
            </>
          ) : (
            <>
              {/* Venter på coach — ærlig tom tilstand, ingen clay */}
              <Kort>
                <TomTilstand
                  icon="hourglass"
                  title="Tilbakemeldingen er ikke skrevet ennå"
                  sub={`${coachFornavn} skriver vanligvis innen ett døgn etter økta. Du får varsel når den ligger her — du trenger ikke sjekke selv.`}
                />
                <Link
                  href={`/portal/gjennomfore/${data.oktId}`}
                  data-od-id="tbm-venter-okt"
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <Knapp full>Se hva økta inneholdt</Knapp>
                </Link>
              </Kort>
              <Kort>
                <p
                  style={{
                    margin: "0 0 12px",
                    fontFamily: TL.font.sans,
                    fontSize: TL.storrelse.kropp,
                    lineHeight: 1.55,
                    color: TL.mute,
                  }}
                >
                  Husker du noe du vil spørre om før tilbakemeldingen kommer, skriv det i
                  chatten — det havner i samme tråd.
                </p>
                <Link
                  href="/portal/coach"
                  data-od-id="tbm-venter-chat"
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <Knapp full icon="message-circle">Åpne coach-tråden</Knapp>
                </Link>
              </Kort>
            </>
          )}
        </PaperKropp>
      </PaperPage>
    </div>
  );
}
