"use client";

/**
 * AgencyOS Innstillinger · API-nøkler — v2 (retning C «Presis»). Rekomponerer
 * /admin/(legacy)/settings/api i v2-språket, bygget utelukkende av
 * v2-komponentbiblioteket (src/components/v2) — ingen ad-hoc UI, ingen rå hex
 * (kun T.*).
 *
 * Mutasjonene (opprett/revoker) er UENDRET — gjenbruker server actions
 * direkte fra legacy-mappen (createApiKey/revokeApiKey), samme mønster som
 * AdminBookingerV2/AdminNySpillerV2/AdminEmailV2 (ingen duplisert
 * forretningslogikk, ingen ny mutasjon skrevet her).
 *
 * Sikkerhetskritisk UX bevart 1:1 fra legacy: den fulle nøkkelen («secret»)
 * vises KUN i det ene øyeblikket den opprettes — aldri igjen etterpå (verken
 * i lista eller ved refresh). Overlegget her er bygget som et ekte
 * interaktivt dialog-panel (samme idiom som CaddieApprovalModalV2), ikke de
 * statiske galleri-komponentene i overlays.tsx (Modal/Ark der har ingen
 * open/onClose-kontrakt — de er kun ment for screenshot-galleriet).
 *
 * Mobil-først: rad-lista er Rad-baserte (ikke CSS-grid-tabellen fra legacy)
 * slik at den stables trygt på 375px uten horisontal scroll.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  StatusPill,
  CTAPill,
  Knapp,
  Inndata,
  Avkryssing,
  TomTilstand,
  Icon,
} from "@/components/v2";
import { createApiKey, revokeApiKey } from "@/app/admin/(legacy)/settings/api/actions";

// ── Datakontrakt (mappes fra Prisma i ruten) ───────────────────
export interface AdminApiKeysV2Nokkel {
  id: string;
  navn: string;
  prefix: string;
  scopes: string[];
  /** Eier-navn — siden er ADMIN-only, så alle nøkler i organisasjonen vises. */
  eier: string;
  /** Ferdig formatert (dd.mm.åååå). */
  opprettet: string;
  /** «Brukt N siden» eller «Aldri brukt». */
  sistBrukt: string;
  /** Ferdig formatert dato eller null (ingen utløpsdato satt). */
  utloper: string | null;
  revokert: boolean;
}
export interface AdminApiKeysV2Data {
  nokler: AdminApiKeysV2Nokkel[];
  aktiveCount: number;
  totalCount: number;
}

const SCOPE_VALG = [
  { value: "read:players", label: "Les spillerdata" },
  { value: "read:bookings", label: "Les bookinger" },
  { value: "write:rounds", label: "Skriv runder" },
  { value: "admin", label: "Full admin (kun ADMIN)" },
];

function scopeOppsummering(scopes: string[]) {
  if (scopes.length === 0) return "Ingen scopes";
  return scopes.length === 1 ? "1 scope" : `${scopes.length} scopes`;
}

/* ── KopierPrefixKnapp — samme klikk-og-bekreft-idiom som legacy CopyPrefixButton ── */
function KopierPrefixKnapp({ prefix }: { prefix: string }) {
  const [kopiert, setKopiert] = useState(false);

  async function kopier() {
    try {
      await navigator.clipboard.writeText(prefix);
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2000);
    } catch (err) {
      console.error("[AdminApiKeysV2] kopiering av prefix feilet", err);
    }
  }

  return (
    <button
      type="button"
      onClick={kopier}
      aria-label="Kopier prefix"
      title={kopiert ? "Kopiert" : "Kopier prefix"}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 28, height: 28, borderRadius: 8, background: T.panel2,
        border: `1px solid ${T.border}`, cursor: "pointer", flex: "none",
      }}
    >
      <Icon name={kopiert ? "check" : "copy"} size={13} style={{ color: kopiert ? T.lime : T.mut }} />
    </button>
  );
}

/* ── NokkelRad ─────────────────────────────────────────────────── */
function NokkelRad({ n, last, onRevoke, pending }: { n: AdminApiKeysV2Nokkel; last: boolean; onRevoke: (id: string) => void; pending: boolean }) {
  return (
    <div style={{ opacity: n.revokert ? 0.55 : 1 }}>
      <Rad
        title={n.navn}
        sub={`${n.prefix}… · ${scopeOppsummering(n.scopes)} · ${n.eier} · Opprettet ${n.opprettet}`}
        meta={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span className="hidden md:inline-flex">
              <StatusPill tone={n.revokert ? "down" : "lime"}>{n.revokert ? "Revokert" : n.sistBrukt}</StatusPill>
            </span>
            <KopierPrefixKnapp prefix={n.prefix} />
          </span>
        }
        trailing={
          n.revokert ? (
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>—</span>
          ) : (
            <Knapp ghost icon="trash-2" disabled={pending} onClick={() => onRevoke(n.id)} style={{ color: T.down }}>
              Revoker
            </Knapp>
          )
        }
        last={last}
      />
    </div>
  );
}

/* ── NyNokkelModal — ekte interaktivt dialog-panel (ikke overlays.tsx-galleriet) ──
   To faser: skjema → secret. Secret vises kun denne ene gangen. */
function NyNokkelModal({ onClose }: { onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  const [navn, setNavn] = useState("");
  const [valgteScopes, setValgteScopes] = useState<string[]>(["read:players"]);
  const [feil, setFeil] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [kopiert, setKopiert] = useState(false);

  function toggleScope(value: string) {
    setValgteScopes((curr) => (curr.includes(value) ? curr.filter((s) => s !== value) : [...curr, value]));
  }

  function opprett() {
    if (!navn.trim()) {
      setFeil("Skriv navn på nøkkelen.");
      return;
    }
    if (valgteScopes.length === 0) {
      setFeil("Velg minst én scope.");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      try {
        const res = await createApiKey({ name: navn, scopes: valgteScopes });
        setSecret(res.secret);
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Kunne ikke opprette nøkkelen.");
      }
    });
  }

  async function kopierSecret() {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2000);
    } catch (err) {
      console.error("[AdminApiKeysV2] kopiering av nøkkel feilet", err);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ny-api-nokkel-tittel"
      className="fixed inset-0 z-[80] flex items-center justify-center px-4"
      style={{ background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }}
      onClick={() => {
        if (!pending) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 440, borderRadius: 20, border: `1px solid ${T.borderS}`, background: T.panel, boxShadow: "0 24px 60px rgba(0,0,0,0.5)", padding: "20px 22px" }}
      >
        {secret ? (
          <>
            <h2 id="ny-api-nokkel-tittel" style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", color: T.fg, margin: 0 }}>
              <em style={{ fontStyle: "italic", color: T.lime }}>Lagre</em> nøkkelen nå
            </h2>
            <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55, margin: "10px 0 0" }}>
              Dette er den eneste gangen du kan se hele nøkkelen. Lagre den i passordforvalter — den
              vises aldri igjen.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
              <code style={{ flex: 1, minWidth: 0, wordBreak: "break-all", borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "12px 14px", fontFamily: T.mono, fontSize: 12, color: T.fg }}>
                {secret}
              </code>
              <button
                type="button"
                onClick={kopierSecret}
                aria-label="Kopier nøkkel"
                title={kopiert ? "Kopiert" : "Kopier nøkkel"}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: T.panel3, border: `1px solid ${T.borderS}`, cursor: "pointer", flex: "none" }}
              >
                <Icon name={kopiert ? "check" : "copy"} size={15} style={{ color: kopiert ? T.lime : T.fg2 }} />
              </button>
            </div>
            <div style={{ marginTop: 20 }}>
              <Knapp full icon="check" onClick={onClose}>Jeg har lagret den</Knapp>
            </div>
          </>
        ) : (
          <>
            <h2 id="ny-api-nokkel-tittel" style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", color: T.fg, margin: 0 }}>
              <em style={{ fontStyle: "italic", color: T.lime }}>Ny</em> API-nøkkel
            </h2>
            <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55, margin: "6px 0 16px" }}>
              For tredjeparts-integrasjoner mot AgencyOS.
            </p>

            <Inndata label="Navn" value={navn} onChange={setNavn} placeholder="f.eks. GolfBox-sync" />

            <div style={{ marginTop: 16 }}>
              <Caps size={9} style={{ marginBottom: 8 }}>Scopes</Caps>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {SCOPE_VALG.map((s) => (
                  <Avkryssing key={s.value} label={s.label} checked={valgteScopes.includes(s.value)} onChange={() => toggleScope(s.value)} />
                ))}
              </div>
            </div>

            {feil && (
              <div role="alert" style={{ marginTop: 14, borderRadius: 10, border: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)`, background: `color-mix(in srgb, ${T.down} 10%, transparent)`, padding: "10px 14px", fontFamily: T.ui, fontSize: 13, color: T.down }}>
                {feil}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <Knapp ghost disabled={pending} onClick={onClose} style={{ flex: 1 }}>Avbryt</Knapp>
              <Knapp icon={pending ? "loader" : "plus"} disabled={pending} onClick={opprett} style={{ flex: 1 }}>
                {pending ? "Oppretter…" : "Opprett"}
              </Knapp>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── AdminApiKeysV2 ────────────────────────────────────────────── */
export function AdminApiKeysV2({ data }: { data: AdminApiKeysV2Data }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [visModal, setVisModal] = useState(false);

  function lukkModal() {
    setVisModal(false);
    router.refresh();
  }

  function revoker(id: string) {
    if (!confirm("Sikker på at du vil revokere denne nøkkelen?")) return;
    startTransition(async () => {
      await revokeApiKey(id);
      router.refresh();
    });
  }

  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>{`${data.aktiveCount} aktiv${data.aktiveCount === 1 ? "" : "e"} · ${data.totalCount} totalt`}</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="og integrasjoner.">API-nøkler</Tittel>
        </div>
      </div>
      <span onClick={() => setVisModal(true)} style={{ display: "inline-flex" }}>
        <CTAPill icon="plus">Ny API-nøkkel</CTAPill>
      </span>
    </div>
  );

  const liste =
    data.nokler.length === 0 ? (
      <Kort>
        <TomTilstand
          icon="lock"
          title="Ingen API-nøkler ennå"
          sub="Generer en nøkkel for å la et eksternt verktøy lese eller skrive data fra AgencyOS."
        />
      </Kort>
    ) : (
      <Kort eyebrow="API-nøkler" action={<Caps size={9}>Brukes av eksterne verktøy</Caps>} pad="6px 20px 8px">
        {data.nokler.map((n, i) => (
          <NokkelRad key={n.id} n={n} last={i === data.nokler.length - 1} onRevoke={revoker} pending={pending} />
        ))}
      </Kort>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {liste}
      <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.6, margin: 0 }}>
        Trackman, FlightScope, Garmin, Zapier og NGF Golfbox kommer som egne integrasjoner senere.
        Inntil da brukes API-nøkler over.
      </p>
      {visModal && <NyNokkelModal onClose={lukkModal} />}
    </div>
  );
}
