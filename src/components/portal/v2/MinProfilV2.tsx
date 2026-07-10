"use client";

/**
 * PlayerHQ Min profil — v2 (retning C «Presis»). Komponert 1:1 fra
 * ui_kits/v2/auth-profil.jsx → funksjonen MinProfil, men med EKTE data fra
 * hentProfil + foreldresamtykke-feltene på User (montert i
 * (v2preview)/v2-profil/page.tsx). Kun v2-komponenter fra "@/components/v2";
 * ingen ad-hoc UI, ingen rå hex (kun T.*-tokens).
 *
 * Ærlighet: felt mockupen viser men repoet ikke bærer (Kategori A–K, WAGR-
 * verdensranking, TrackMan-kobling) fabrikkeres ALDRI — de får ærlig tom-/
 * ukoblet-tilstand og meldes som gap. Reelle felter: navn, avatar, klubb,
 * fødselsår, HCP, foreldresamtykke.
 *
 * V2Shell eier chrome-en; denne komponenten rendrer bare den indre stacken.
 */

import { useEffect, useState, useTransition } from "react";
import {
  T,
  Tittel,
  CTAPill,
  Knapp,
  Kort,
  StatusPill,
  AvatarFoto,
  Rad,
  ProfilFelt,
  Inndata,
  TomTilstand,
  Icon,
  type StatusTone,
} from "@/components/v2";
import { oppdaterProfil } from "@/app/portal/meg/actions";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type MinProfilData = {
  navn: string;
  avatarUrl: string | null;
  epost: string;
  hcp: number | null;
  homeClub: string | null;
  fodselsaar: number | null;
  /** Foreldresamtykke (GDPR art. 8) — reelle felter på User. */
  samtykke: {
    kreves: boolean;
    godkjentISO: string | null;
    godkjentAvNavn: string | null;
  };
};

/* ── Rene hjelpere (norsk bokmål) ──────────────────────────────────── */

function hcpTekst(hcp: number | null): string {
  if (hcp == null) return "";
  return hcp.toLocaleString("nb-NO", { maximumFractionDigits: 1 });
}

function datoTekst(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}

/** true på klient etter mount når viewport < 768px (styrer tallstørrelser/layout). */
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

/* ── Ikon-boks for koblings-rader (mockupens leading-idiom) ────────── */
function RadIkon({ name }: { name: string }) {
  return (
    <span style={{ width: 32, height: 32, borderRadius: 10, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
      <Icon name={name} size={14} style={{ color: T.fg2 }} />
    </span>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function MinProfilV2({ data }: { data: MinProfilData }) {
  const mobile = useMobile();
  const { navn, avatarUrl, epost, hcp, homeClub, fodselsaar, samtykke } = data;

  /* Redigerbare felter (minimum-scope: navn/HCP/klubb — samme actions som
     den ekte oppdaterProfil-flyten på /portal/meg). Fødselsår krever full
     dateOfBirth å redigere trygt og forblir skrivebeskyttet (ærlighet). */
  const [navnFelt, setNavnFelt] = useState(navn);
  const [hcpFelt, setHcpFelt] = useState(hcpTekst(hcp));
  const [klubbFelt, setKlubbFelt] = useState(homeClub ?? "");
  const [lagrer, startLagring] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);

  function lagreEndringer() {
    setFeil(null);
    setLagret(false);
    const trimmetHcp = hcpFelt.trim();
    let hcpTall: number | null = null;
    if (trimmetHcp !== "") {
      hcpTall = Number(trimmetHcp.replace(",", "."));
      if (Number.isNaN(hcpTall)) {
        setFeil("Handicap må være et tall, f.eks. 4,2.");
        return;
      }
    }
    const fulltNavn = navnFelt.trim();
    if (!fulltNavn) {
      setFeil("Navn kan ikke være tomt.");
      return;
    }
    startLagring(async () => {
      try {
        await oppdaterProfil({ name: fulltNavn, hcp: hcpTall, homeClub: klubbFelt.trim() });
        setLagret(true);
      } catch {
        setFeil("Kunne ikke lagre. Prøv igjen.");
      }
    });
  }

  /* Statuspiller — kun reelle felter (Kategori A–K finnes ikke i data). */
  const piller: { l: string; tone: StatusTone }[] = [];
  if (hcp != null) piller.push({ l: `HCP ${hcpTekst(hcp)}`, tone: "lime" });
  if (homeClub) piller.push({ l: homeClub, tone: "info" });

  /* Koblinger og status — bygges som liste så `last` beregnes riktig. */
  const godkjentDato = datoTekst(samtykke.godkjentISO);
  const samtykkeSub = !samtykke.kreves
    ? "Ikke påkrevd for denne kontoen"
    : godkjentDato
      ? `Godkjent av ${samtykke.godkjentAvNavn ?? "forelder"} · ${godkjentDato}`
      : "Venter på godkjenning fra en forelder";
  const samtykkeMeta: { l: string; tone: StatusTone } = !samtykke.kreves
    ? { l: "Ikke påkrevd", tone: "info" }
    : godkjentDato
      ? { l: "Godkjent", tone: "up" }
      : { l: "Venter", tone: "warn" };

  const koblingsRader = [
    {
      ikon: "link-2",
      title: "TrackMan-konto",
      sub: `${epost} · ingen kobling registrert`,
      meta: { l: "Ikke koblet", tone: "info" as StatusTone },
    },
    {
      ikon: "shield",
      title: "Foreldresamtykke",
      sub: samtykkeSub,
      meta: samtykkeMeta,
    },
  ];

  /* ── Kort-blokker ──────────────────────────────────────── */

  const topp = (
    <Kort tint pad={mobile ? "22px 18px" : "26px 24px"}>
      <div style={{ display: "flex", alignItems: "center", gap: mobile ? 16 : 22, flexDirection: mobile ? "column" : "row", textAlign: mobile ? "center" : "left" }}>
        <AvatarFoto src={avatarUrl} navn={navn} size={mobile ? 88 : 96} ring />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: mobile ? 24 : 28, letterSpacing: "-0.03em", color: T.fg, margin: 0 }}>{navn}</h1>
          {piller.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 9, justifyContent: mobile ? "center" : "flex-start", flexWrap: "wrap" }}>
              {piller.map((p) => (
                <StatusPill key={p.l} tone={p.tone}>{p.l}</StatusPill>
              ))}
            </div>
          )}
        </div>
        <CTAPill ghost icon="camera">Bytt bilde</CTAPill>
      </div>
    </Kort>
  );

  const felter = (
    <Kort eyebrow="Profil" pad="18px 20px" style={{ gap: 14 }}>
      <Inndata label="Fullt navn" value={navnFelt} onChange={setNavnFelt} placeholder="Ikke satt" />
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 14 }}>
        <Inndata label="Handicap" value={hcpFelt} onChange={setHcpFelt} placeholder="Ikke satt" mono />
        <ProfilFelt label="Fødselsår" value={fodselsaar != null ? String(fodselsaar) : ""} placeholder="Ikke satt" mono hint="Endres ikke her — kontakt coach for å rette fødselsår." />
      </div>
      <Inndata label="Klubb" value={klubbFelt} onChange={setKlubbFelt} placeholder="Ikke satt" />
      {feil && (
        <p style={{ fontFamily: T.ui, fontSize: 12, color: T.down, margin: 0 }}>{feil}</p>
      )}
      {lagret && !feil && (
        <p style={{ fontFamily: T.ui, fontSize: 12, color: T.up, margin: 0 }}>Lagret.</p>
      )}
    </Kort>
  );

  /* WAGR-verdensranking finnes ikke i datamodellen → ærlig tom-tilstand (gap). */
  const wagr = (
    <Kort eyebrow="WAGR">
      <TomTilstand icon="globe" title="Verdensranking ikke koblet" sub="WAGR (World Amateur Golf Ranking) hentes ikke inn i PlayerHQ ennå." />
    </Kort>
  );

  const koblinger = (
    <Kort eyebrow="Koblinger og status" pad="6px 20px 8px">
      {koblingsRader.map((r, i) => (
        <Rad
          key={r.title}
          leading={<RadIkon name={r.ikon} />}
          title={r.title}
          sub={r.sub}
          meta={<StatusPill tone={r.meta.tone}>{r.meta.l}</StatusPill>}
          trailing={null}
          last={i === koblingsRader.length - 1}
        />
      ))}
    </Kort>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Tittel mobile={mobile} em="profil">Min</Tittel>
        {!mobile && (
          <Knapp icon={lagrer ? "loader" : "check"} disabled={lagrer} onClick={lagreEndringer}>
            {lagrer ? "Lagrer …" : "Lagre endringer"}
          </Knapp>
        )}
      </div>

      {topp}

      {mobile ? (
        <>
          {wagr}
          {felter}
          {koblinger}
          <Knapp icon={lagrer ? "loader" : "check"} full disabled={lagrer} onClick={lagreEndringer}>
            {lagrer ? "Lagrer …" : "Lagre endringer"}
          </Knapp>
        </>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: T.gap, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: T.gap, minWidth: 0 }}>
            {felter}
            {koblinger}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: T.gap, minWidth: 0 }}>{wagr}</div>
        </div>
      )}
    </div>
  );
}
