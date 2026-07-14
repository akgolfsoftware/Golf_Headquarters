"use client";

/**
 * AgencyOS v2 — Innstillinger · API-nøkler (`/admin/settings/api`,
 * AgencyOS Bølge 3.35, 2026-07-14). Port fra `(legacy)/settings/api/
 * page.tsx` + `create-key-modal.tsx` + `revoke-button.tsx` +
 * `copy-prefix-button.tsx` — samme `createApiKey`/`revokeApiKey`-kontrakt
 * (bor i `(legacy)/settings/api/actions.ts`, uendret). Opprett-modalen
 * bruker `BunnArk` i stedet for native `<dialog>`, samme to-stegs flyt
 * (skjema → engangsvisning av hemmeligheten).
 */

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Caps, Tittel, Kort, Knapp, StatusPill, Icon, T, BunnArk } from "@/components/v2";
import { Inndata } from "@/components/v2/skjema";
import { createApiKey, revokeApiKey } from "@/app/admin/(legacy)/settings/api/actions";

const SCOPES = [
  { value: "read:players", label: "Les spillerdata" },
  { value: "read:bookings", label: "Les bookinger" },
  { value: "write:rounds", label: "Skriv runder" },
  { value: "admin", label: "Full admin (kun ADMIN)" },
];

export interface ApiNokkelRadV2 {
  id: string;
  navn: string;
  prefix: string;
  scopes: string[];
  erRevokert: boolean;
  eierNavn: string | null;
  brukTekst: string;
  opprettetTekst: string;
}

function CopyPrefixKnappV2({ prefix }: { prefix: string }) {
  const [kopiert, setKopiert] = useState(false);
  async function handleClick() {
    try {
      await navigator.clipboard.writeText(prefix);
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2000);
    } catch (err) {
      console.error("[CopyPrefixKnappV2] kopiering feilet", err);
    }
  }
  return (
    <button type="button" onClick={handleClick} aria-label="Kopier prefix" title={kopiert ? "Kopiert" : "Kopier prefix"} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, border: "none", background: "none", cursor: "pointer", color: kopiert ? T.lime : T.mut }}>
      <Icon name={kopiert ? "check" : "copy"} size={12} />
    </button>
  );
}

function RevokeKnappV2({ keyId }: { keyId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function handle() {
    if (!confirm("Sikker på at du vil revokere denne nøkkelen?")) return;
    startTransition(async () => {
      await revokeApiKey(keyId);
      router.refresh();
    });
  }
  return <Knapp ghost onClick={handle} disabled={pending}>{pending ? "…" : "Revoker"}</Knapp>;
}

function NyApiNokkelArkV2({ onLukk }: { onLukk: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [valgteScopes, setValgteScopes] = useState<string[]>(["read:players"]);
  const [secret, setSecret] = useState<string | null>(null);

  function toggleScope(value: string) {
    setValgteScopes((curr) => (curr.includes(value) ? curr.filter((s) => s !== value) : [...curr, value]));
  }

  function lagre() {
    if (!name.trim()) {
      setError("Skriv navn på nøkkelen.");
      return;
    }
    if (valgteScopes.length === 0) {
      setError("Velg minst én scope.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const res = await createApiKey({ name, scopes: valgteScopes });
        setSecret(res.secret);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke opprette.");
      }
    });
  }

  function lukk() {
    router.refresh();
    onLukk();
  }

  if (secret) {
    return (
      <BunnArk tittel={<><em style={{ fontStyle: "italic", color: T.lime }}>Lagre</em> nøkkelen nå</>} onLukk={lukk} bredde={460}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut }}>Dette er den eneste gangen du kan se hele nøkkelen. Lagre den i passordforvalter.</p>
          <code style={{ display: "block", wordBreak: "break-all", borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: 14, fontFamily: T.mono, fontSize: 11.5, color: T.fg }}>{secret}</code>
          <Knapp full onClick={lukk}>Jeg har lagret den</Knapp>
        </div>
      </BunnArk>
    );
  }

  return (
    <BunnArk tittel={<><em style={{ fontStyle: "italic", color: T.lime }}>Ny</em> API-nøkkel</>} onLukk={onLukk} laast={pending} bredde={460}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>For tredjeparts-integrasjoner.</p>
        <Inndata label="Navn" value={name} onChange={setName} placeholder="f.eks. GolfBox-sync" />
        <div>
          <Caps size={9}>Scopes</Caps>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {SCOPES.map((s) => {
              const valgt = valgteScopes.includes(s.value);
              return (
                <label key={s.value} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", borderRadius: 10, border: `1px solid ${valgt ? T.lime : T.borderS}`, background: valgt ? `color-mix(in srgb, ${T.lime} 8%, transparent)` : T.panel2, padding: "9px 12px" }}>
                  <input type="checkbox" checked={valgt} onChange={() => toggleScope(s.value)} style={{ accentColor: T.lime }} />
                  <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg }}>{s.label}</span>
                  <code style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 10, color: T.mut }}>{s.value}</code>
                </label>
              );
            })}
          </div>
        </div>
        {error && <div role="alert" style={{ borderRadius: 8, background: `color-mix(in srgb, ${T.down} 12%, transparent)`, padding: "8px 12px", fontFamily: T.ui, fontSize: 12.5, color: T.down }}>{error}</div>}
        <div style={{ display: "flex", gap: 8 }}>
          <Knapp ghost onClick={onLukk} disabled={pending}>Avbryt</Knapp>
          <Knapp full onClick={lagre} disabled={pending}>{pending ? "Oppretter…" : "Opprett"}</Knapp>
        </div>
      </div>
    </BunnArk>
  );
}

export function AdminInnstillingerApiV2({ keys, aktiveAntall }: { keys: ApiNokkelRadV2[]; aktiveAntall: number }) {
  const [nyOpen, setNyOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Link href="/admin/settings" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: T.mut, fontFamily: T.ui, fontSize: 12.5 }}>
          <Icon name="arrow-left" size={14} /> Innstillinger
        </Link>
        <div style={{ marginTop: 10 }}>
          <Caps size={9}>Innstillinger · API</Caps>
          <Tittel em="API-nøkler">og integrasjoner</Tittel>
          <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
            Generer nøkler for eksterne verktøy som skal lese eller skrive data fra AgencyOS. {aktiveAntall} aktiv{aktiveAntall === 1 ? "" : "e"} · {keys.length} totalt.
          </p>
        </div>
      </div>

      <Kort pad="0">
        <div style={{ display: "flex", alignItems: "center", gap: 14, borderBottom: `1px solid ${T.border}`, padding: "16px 20px" }}>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>API-nøkler</div>
          <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>Brukes av eksterne verktøy for å lese data fra AgencyOS</span>
          <span style={{ marginLeft: "auto" }}><Knapp icon="plus" onClick={() => setNyOpen(true)}>Ny API-nøkkel</Knapp></span>
        </div>

        {keys.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: T.disp, fontSize: 15, color: T.fg }}><em style={{ fontStyle: "italic", color: T.lime }}>Ingen</em> API-nøkler ennå</div>
            <p style={{ marginTop: 8, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Generer en nøkkel for å la et eksternt verktøy lese eller skrive data fra AgencyOS.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            {keys.map((k, i) => (
              <div key={k.id} style={{ display: "grid", gridTemplateColumns: "1fr 220px 160px 90px", alignItems: "center", gap: 14, minWidth: 640, padding: "14px 20px", borderTop: i === 0 ? "none" : `1px solid ${T.border}`, opacity: k.erRevokert ? 0.55 : 1 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{k.navn}</span>
                    {k.erRevokert ? <StatusPill tone="down">Revokert</StatusPill> : <StatusPill tone="info">{k.scopes.length === 0 ? "Ingen scopes" : `${k.scopes.length} scope${k.scopes.length === 1 ? "" : "s"}`}</StatusPill>}
                    {k.eierNavn && <span style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: T.mut }}>· {k.eierNavn}</span>}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, width: "fit-content", borderRadius: 6, border: `1px solid ${T.border}`, background: T.panel2, padding: "3px 8px", fontFamily: T.mono, fontSize: 11.5, color: T.mut }}>
                    {k.prefix}…
                    <CopyPrefixKnappV2 prefix={k.prefix} />
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {k.scopes.map((s) => <span key={s} style={{ borderRadius: 6, border: `1px solid ${T.border}`, padding: "2px 7px", fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: T.mut }}>{s}</span>)}
                </div>
                <div style={{ textAlign: "right", fontFamily: T.mono, fontSize: 11, lineHeight: 1.5, color: T.mut }}>
                  <div>Brukt <span style={{ color: T.fg }}>{k.brukTekst}</span></div>
                  <div>Opprettet {k.opprettetTekst}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  {!k.erRevokert && <RevokeKnappV2 keyId={k.id} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </Kort>

      <div style={{ borderRadius: 12, border: `1px dashed ${T.border}`, padding: 20 }}>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Integrasjoner</div>
        <p style={{ marginTop: 8, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Trackman, FlightScope, Garmin, Zapier og NGF Golfbox kommer her når integrasjons-laget er ferdig. Inntil da bruker du API-nøkler over.</p>
      </div>

      {nyOpen && <NyApiNokkelArkV2 onLukk={() => setNyOpen(false)} />}
    </div>
  );
}
