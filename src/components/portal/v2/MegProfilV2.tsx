"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ · Meg · Profil (W3-port).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-profil.html (§8 skjema).
 *
 * Tilstander: Komplett · Ufullstendig. «Ufullstendig» er ikke en feil —
 * profilen fungerer, men coachen mangler noe (fasitens egen formulering).
 *
 * Vedtak (manifest-w3-komplett.md): HCP er LESEFELT — eies av forbundet.
 * Feil tall meldes til klubben, ikke rettes i appen. Eneste clay på
 * skjermen er «Lagre profilen».
 *
 * Ærlige avvik fra fasit-demoen (ingen fabrikkerte data):
 *  - «Kjønn» og «Dominant hånd» finnes ikke som felter i datamodellen — utelatt.
 *  - Hjemmeklubb er fritekst (User.homeClub er String, ingen klubbregister).
 *  - Handicap-mål leses fra Goal (HCP_TARGET) og redigeres i Workbench
 *    (låst beslutning: mål bor i Oversikt, redigeres i Workbench).
 *  - E-post eies av Supabase Auth — vises, endres ikke her.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon, Inndata, TekstOmraade } from "@/components/v2";
import { PaperPage, PaperTopp, PaperKropp } from "./PaperChrome";
import type { LagreProfilInput } from "@/app/portal/meg/profil/actions";

export type MegProfilData = {
  navn: string;
  avatarUrl: string | null;
  epost: string;
  mobil: string | null;
  /** Lesefelt — eies av forbundet. Null = ikke satt. */
  hcp: number | null;
  homeClub: string | null;
  /** YYYY-MM-DD eller null. */
  fodselsdatoISO: string | null;
  ambition: string | null;
  /** «mars 2024» — fra User.createdAt (Oslo). */
  spillerSiden: string;
  stallNavn: string | null;
  runderIAar: number;
  ngfId: string | null;
  /** Ferdig formatert visningstekst for aktivt HCP-mål, eller null. */
  hcpMaalTekst: string | null;
  /** Manglende felter (ufullstendig-tilstanden), f.eks. ["fødselsdato", "klubb"]. */
  mangler: string[];
};

type LagreFn = (
  input: LagreProfilInput,
) => Promise<{ ok: true } | { ok: false; feil: string }>;

/* ── Lokale byggeklosser (kun T.*) ─────────────────────────────────── */

function Kort({ eyebrow, children }: { eyebrow?: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        background: TL.elev,
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.card,
        padding: 16,
        minWidth: 0,
      }}
    >
      {eyebrow && (
        <span
          style={{
            display: "block",
            fontFamily: TL.font.mono,
            fontSize: TL.storrelse.capsSm,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: TL.mute,
            marginBottom: 4,
          }}
        >
          {eyebrow}
        </span>
      )}
      {children}
    </section>
  );
}

/** Fasitens `.les` — lesefelt-rad: navn + mono-undertekst venstre, mono-verdi høyre. */
function LesRad({
  navn,
  sub,
  verdi,
  tom,
  last,
}: {
  navn: string;
  sub?: string;
  verdi: string;
  tom?: boolean;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 0",
        borderBottom: last ? "none" : `1px solid ${TL.hair}`,
        minWidth: 0,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text }}>{navn}</span>
        {sub && (
          <span
            style={{
              display: "block",
              fontFamily: TL.font.mono,
              fontSize: 10,
              color: TL.mute,
              marginTop: 1,
            }}
          >
            {sub}
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: TL.font.mono,
          fontSize: 13.5,
          fontWeight: 600,
          color: tom ? TL.mute : TL.text,
          textAlign: "right",
          flex: "none",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {verdi}
      </span>
    </div>
  );
}

/** Fasitens `.hjelp` — mono-forklaring under et kort-innhold. */
function Hjelp({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: "10px 0 0",
        fontFamily: TL.font.mono,
        fontSize: 10,
        color: TL.mute,
        letterSpacing: "0.03em",
        lineHeight: 1.5,
      }}
    >
      {children}
    </p>
  );
}

/** Fasitens `.rad` — lenkerad i «Videre»-kortet. */
function VidereRad({
  href,
  tittel,
  sub,
  odId,
  last,
}: {
  href: string;
  tittel: string;
  sub: string;
  odId: string;
  last?: boolean;
}) {
  return (
    <Link
      href={href}
      data-od-id={odId}
      className="v2-focus"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 0",
        borderBottom: last ? "none" : `1px solid ${TL.hair}`,
        textDecoration: "none",
        color: "inherit",
        minWidth: 0,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text }}>
          {tittel}
        </span>
        <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>
          {sub}
        </span>
      </div>
      <Icon name="chevron-right" size={16} style={{ color: TL.mute, flex: "none" }} />
    </Link>
  );
}

function initialer(navn: string): string {
  return navn
    .split(/\s+/)
    .filter(Boolean)
    .map((d) => d[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatHcp(hcp: number | null): string {
  if (hcp == null) return "—";
  return hcp.toFixed(1).replace(".", ",");
}

/** «fødselsdato, klubb og målsetting» — norsk oppramsing. */
function listeTekst(deler: string[]): string {
  if (deler.length <= 1) return deler[0] ?? "";
  return `${deler.slice(0, -1).join(", ")} og ${deler[deler.length - 1]}`;
}

const ANTALL_ORD = ["", "Ett", "To", "Tre"];

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function MegProfilV2({ data, lagre }: { data: MegProfilData; lagre: LagreFn }) {
  const router = useRouter();
  const [navn, setNavn] = useState(data.navn);
  const [fodt, setFodt] = useState(data.fodselsdatoISO ?? "");
  const [klubb, setKlubb] = useState(data.homeClub ?? "");
  const [maal, setMaal] = useState(data.ambition ?? "");
  const [mobil, setMobil] = useState(data.mobil ?? "");
  const [pending, startTransition] = useTransition();
  const [lagret, setLagret] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  function submit() {
    setFeil(null);
    startTransition(async () => {
      const res = await lagre({
        navn: navn.trim(),
        fodselsdato: fodt || null,
        hjemmeklubb: klubb.trim() || null,
        maalTekst: maal.trim() || null,
        mobil: mobil.trim() || null,
      });
      if (res.ok) {
        setLagret(true);
        router.refresh();
        setTimeout(() => setLagret(false), 2000);
      } else {
        setFeil(res.feil);
      }
    });
  }

  const antallMangler = data.mangler.length;

  return (
    <PaperPage odId="playerhq-profil">
      <div data-paper-portal-meg-profil data-paper-slug="playerhq-profil" style={{ display: "contents" }}>
        <PaperTopp
          tittel="Profil"
          sub="Navn, klubb, handicap og mål"
          tilbakeHref="/portal/meg"
          tilbakeLabel="Til Meg"
        />
        <PaperKropp>
          {/* Hero — avatar + navn + siden/klubb + stall-tag */}
          <section
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
              background: TL.elev,
              border: `1px solid ${TL.hair}`,
              borderRadius: TL.radius.card,
              padding: 16,
              minWidth: 0,
            }}
          >
            {data.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.avatarUrl}
                alt=""
                style={{
                  flex: "none",
                  width: 64,
                  height: 64,
                  borderRadius: 9999,
                  border: `1px solid ${TL.hair}`,
                  objectFit: "cover",
                }}
              />
            ) : (
              <span
                aria-hidden
                style={{
                  flex: "none",
                  width: 64,
                  height: 64,
                  borderRadius: 9999,
                  background: TL.dock,
                  border: `1px solid ${TL.hair}`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: TL.font.mono,
                  fontSize: 20,
                  fontWeight: 600,
                  color: TL.text,
                }}
              >
                {initialer(data.navn)}
              </span>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>
                {data.navn}
              </span>
              <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>
                {data.spillerSiden ? `Spiller siden ${data.spillerSiden}` : ""}
                {data.spillerSiden && data.homeClub ? " · " : ""}
                {data.homeClub ?? ""}
              </span>
              {data.stallNavn && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    marginTop: 6,
                    padding: "3px 8px",
                    borderRadius: 9999,
                    background: TL.dim,
                    color: TL.fill,
                    fontFamily: TL.font.mono,
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  {data.stallNavn}
                </span>
              )}
            </div>
          </section>

          {/* Ufullstendig-tilstand — banner, aldri sperre */}
          {antallMangler > 0 && (
            <div
              data-od-id="profil-mangler"
              style={{
                display: "flex",
                gap: 12,
                padding: "12px 16px",
                borderRadius: TL.radius.card,
                background: TL.dim,
                minWidth: 0,
              }}
            >
              <p style={{ flex: 1, minWidth: 0, margin: 0, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.55 }}>
                <strong style={{ color: TL.text, fontWeight: 600 }}>
                  {ANTALL_ORD[antallMangler] ?? antallMangler} felt mangler
                </strong>{" "}
                — {listeTekst(data.mangler)}. Coachen bruker dem til å sette riktig nivå og
                turneringsklasse. Du kan bruke appen som normalt uten.
              </p>
            </div>
          )}

          {/* Handicap — lesefelt (vedtak: eies av forbundet) */}
          <Kort eyebrow="Handicap og runder">
            <LesRad
              navn="Handicap"
              sub="Eies av forbundet · lesefelt"
              verdi={formatHcp(data.hcp)}
              tom={data.hcp == null}
            />
            <LesRad navn="Registrerte runder i år" sub="Logget i appen" verdi={String(data.runderIAar)} />
            <LesRad
              navn="Golfbox-ID"
              sub={data.ngfId ? "Koblet til turneringshistorikk" : "Ikke koblet ennå"}
              verdi={data.ngfId ?? "—"}
              tom={!data.ngfId}
              last
            />
            <Hjelp>
              Handicap eies av forbundet og kan ikke endres her. Er tallet feil, meld det til
              klubben din.
            </Hjelp>
          </Kort>

          {/* Om deg */}
          <Kort eyebrow="Om deg">
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
              <Inndata label="Fullt navn" value={navn} onChange={setNavn} />
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <Inndata label="Fødselsdato" type="date" mono value={fodt} onChange={setFodt} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <Inndata
                    label="Hjemmeklubb"
                    value={klubb}
                    placeholder="F.eks. Gamle Fredrikstad Golfklubb"
                    onChange={setKlubb}
                  />
                </div>
              </div>
            </div>
            <Hjelp>Klubben avgjør hvilke turneringer og klasser du kan meldes på.</Hjelp>
          </Kort>

          {/* Mål for sesongen */}
          <Kort eyebrow="Mål for sesongen">
            <LesRad
              navn="Handicap-mål"
              sub={data.hcpMaalTekst ? "Redigeres i Workbench" : "Settes sammen med coachen i Workbench"}
              verdi={data.hcpMaalTekst ?? "—"}
              tom={!data.hcpMaalTekst}
              last
            />
            <div style={{ marginTop: 8 }}>
              <TekstOmraade
                label="Hva vil du bli bedre på?"
                value={maal}
                rows={3}
                placeholder="F.eks. putting fra 1–3 meter, eller å tåle press på de siste hullene."
                onChange={setMaal}
              />
            </div>
            <Hjelp>Coachen ser dette og bruker det når planen legges.</Hjelp>
          </Kort>

          {/* Kontakt */}
          <Kort eyebrow="Kontakt">
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
              <Inndata label="E-post" type="email" value={data.epost} disabled onChange={() => undefined} />
              <Inndata label="Mobil" type="tel" mono value={mobil} placeholder="+47 …" onChange={setMobil} />
            </div>
            <Hjelp>
              Brukes til timevarsler og innlogging. E-post endres under Personvern og sikkerhet.
            </Hjelp>
          </Kort>

          {/* Én ting nå — eneste clay på skjermen */}
          <button
            type="button"
            data-od-id="profil-lagre"
            data-paper-en-ting="true"
            className="v2-press v2-focus"
            disabled={pending}
            onClick={submit}
            style={{
              width: "100%",
              padding: "13px 18px",
              borderRadius: TL.radius.field,
              border: "1px solid transparent",
              background: TL.fill,
              color: TL.onFill,
              fontFamily: TL.font.sans,
              fontSize: 14,
              fontWeight: 600,
              cursor: pending ? "default" : "pointer",
              opacity: pending ? 0.7 : 1,
            }}
          >
            {pending ? "Lagrer …" : "Lagre profilen"}
          </button>
          <div aria-live="polite" style={{ minHeight: 16, textAlign: "center" }}>
            {lagret && (
              <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.ok }}>
                Lagret
              </span>
            )}
            {feil && (
              <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.danger }}>
                {feil}
              </span>
            )}
          </div>

          {/* Videre */}
          <Kort eyebrow="Videre">
            <VidereRad
              href="/portal/meg/utstyr"
              tittel="Utstyr og bag"
              sub="Bag, køller og målte lengder"
              odId="profil-til-utstyr"
            />
            <VidereRad
              href="/portal/meg/innstillinger/personvern"
              tittel="Personvern og data"
              sub="Samtykker, eksport og sletting"
              odId="profil-til-innst"
              last
            />
          </Kort>
        </PaperKropp>
      </div>
    </PaperPage>
  );
}
