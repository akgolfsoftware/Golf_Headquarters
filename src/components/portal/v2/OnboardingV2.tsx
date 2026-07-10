"use client";

/**
 * PlayerHQ Onboarding — v2 (retning C «Presis»). Komponert 1:1 fra
 * ui_kits/v2/auth-profil.jsx → funksjonen Onboarding (+ AuthRamme, BrandPanel,
 * StegIndikator, StegOm, StegBilde, StegNiva, AmbientHint), men med EKTE data
 * og ekte handlinger (montert i (v2preview)/v2-onboarding/page.tsx).
 *
 * Ekte flyt:
 *  - Profilbilde lastes opp med uploadAvatar (Supabase Storage) og driver både
 *    avatar OG den myke ambient-gløden bak kortet («din egen look»).
 *  - «Hva vil du oppnå?» skrives til User.ambition via saveOnboardingProfile.
 *  - «Fullfør» kaller completeOnboarding (setter completedAt, redirect /portal).
 *  - Navn + fødselsår vises fra ekte bruker (les-visning — onboarding har ingen
 *    egen navne-/DOB-action i denne 3-stegs-flaten; presis DOB-fangst + GDPR-
 *    gate lever i den låste 7-stegs-veiviseren).
 *
 * Ærlighet: Kategori (A–K) har ingen kolonne på User å skrive til — feltet vises
 * som provisorisk valg (coachen justerer det), men lagres ikke. Meldt som gap.
 * Ingen V2Shell (onboarding er egen flyt, ingen nav-rail). Ingen rå hex (kun T.*).
 */

import { useEffect, useRef, useState, useTransition } from "react";
import {
  T,
  Caps,
  Kort,
  Icon,
  AvatarFoto,
  StatusPill,
  InnsiktChip,
  LogoAK,
} from "@/components/v2";
import { uploadAvatar } from "@/lib/storage/avatar";
import { saveOnboardingProfile, completeOnboarding } from "@/app/auth/onboarding/actions";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type OnboardingV2Data = {
  navn: string;
  avatarUrl: string | null;
  /** Fødselsår avledet av User.dateOfBirth (kun år, som i mockup). */
  fodselsaar: number | null;
  /** User.ambition — «Hva vil du oppnå?». */
  ambisjon: string | null;
  /** GDPR art. 8 — mindreårig som venter på foreldresamtykke. */
  venterSamtykke: boolean;
  /**
   * Steg brukeren skal gjenoppta på i den låste 7-stegs state-maskinen
   * (getResumeStep). Bøttes ned i denne 3-stegs v2-flatens visuelle steg.
   */
  resumeStep: number;
};

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

/** true på klient etter mount når viewport < 768px (device-frame-valg). */
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

/** Bøtter det låste 7-stegs resume-steget ned i de 3 visuelle stegene. */
function tilVisueltSteg(resumeStep: number): number {
  if (resumeStep <= 2) return 1;
  if (resumeStep <= 5) return 2;
  return 3;
}

/* ── Steg-indikator (mockup: StegIndikator) ────────────────────────── */

function StegIndikator({ steg, mobile }: { steg: number; mobile: boolean }) {
  const STEG = [
    { n: 1, l: "Om deg" },
    { n: 2, l: "Bildet ditt" },
    { n: 3, l: "Nivå og mål" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {STEG.map((s, i) => {
        const on = steg === s.n;
        const gjort = steg > s.n;
        return (
          <div key={s.n} style={{ display: "contents" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, flex: "none" }}>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 9999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: T.mono,
                  fontSize: 10,
                  fontWeight: 700,
                  background: on ? T.lime : gjort ? T.panel3 : "transparent",
                  color: on ? T.onLime : gjort ? T.fg : T.mut,
                  border: on || gjort ? "none" : `1px solid ${T.borderS}`,
                }}
              >
                {gjort ? <Icon name="check" size={11} /> : s.n}
              </span>
              {!mobile && (
                <span style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: on ? T.fg : T.mut }}>
                  {s.l}
                </span>
              )}
            </div>
            {i < 2 && (
              <span style={{ flex: 1, height: 1, background: steg > s.n ? T.borderS : T.border, minWidth: 14 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Steg 1 — Om deg (mockup: StegOm) ──────────────────────────────── */

function LesFelt({
  label,
  value,
  placeholder,
  mono,
  hint,
  trailing,
}: {
  label: string;
  value?: string | null;
  placeholder?: string;
  mono?: boolean;
  hint?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div>
      <Caps size={9} style={{ marginBottom: 7 }}>
        {label}
      </Caps>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          minHeight: 44,
          padding: "0 14px",
          borderRadius: 12,
          background: T.panel2,
          border: `1px solid ${T.borderS}`,
        }}
      >
        <span
          style={{
            flex: 1,
            fontFamily: mono ? T.mono : T.ui,
            fontSize: 13.5,
            fontWeight: 500,
            color: value ? T.fg : T.mut,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            padding: "11px 0",
          }}
        >
          {value || placeholder}
        </span>
        {trailing}
      </div>
      {hint && (
        <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.55, margin: "7px 2px 0" }}>{hint}</p>
      )}
    </div>
  );
}

function StegOm({ navn, fodselsaar, venterSamtykke }: { navn: string; fodselsaar: number | null; venterSamtykke: boolean }) {
  return (
    <>
      <LesFelt label="Fullt navn" value={navn} placeholder="Ikke registrert" />
      <LesFelt
        label="Fødselsår"
        value={fodselsaar != null ? String(fodselsaar) : null}
        placeholder="Ikke registrert"
        mono
        trailing={venterSamtykke ? <StatusPill tone="warn">Venter samtykke</StatusPill> : undefined}
        hint="Er du under 18, må en forelder godkjenne kontoen. Vi sender dem en e-post automatisk — du kan bruke appen mens dere venter."
      />
    </>
  );
}

/* ── Steg 2 — Bildet ditt (mockup: StegBilde + AmbientHint) ────────── */

function AmbientHint({ med }: { med?: boolean }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          height: 92,
          borderRadius: 14,
          border: `1px solid ${med ? T.borderS : T.border}`,
          overflow: "hidden",
          position: "relative",
          background: med
            ? `radial-gradient(140px 80px at 50% -20%, color-mix(in srgb, ${T.forest} 78%, transparent), transparent 75%), ${T.bg}`
            : T.bg,
        }}
      >
        <div style={{ position: "relative", padding: "12px 12px 0" }}>
          <span
            style={{
              display: "block",
              width: 64,
              height: 7,
              borderRadius: 4,
              background: `color-mix(in srgb, ${T.fg} 28%, transparent)`,
            }}
          />
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <span style={{ flex: 1, height: 34, borderRadius: 8, background: T.panel, border: `1px solid ${T.border}` }} />
            <span style={{ flex: 1, height: 34, borderRadius: 8, background: T.panel, border: `1px solid ${T.border}` }} />
          </div>
        </div>
        {med && (
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 16,
              height: 16,
              borderRadius: 9999,
              background: `color-mix(in srgb, ${T.forest} 90%, transparent)`,
              border: `1px solid ${T.borderS}`,
            }}
          />
        )}
      </div>
      <Caps size={8.5} style={{ marginTop: 7, textAlign: "center", color: med ? T.fg2 : T.mut }}>
        {med ? "Med bildet ditt" : "Uten bilde"}
      </Caps>
    </div>
  );
}

function StegBilde({
  navn,
  avatarUrl,
  laster,
  feil,
  onVelg,
}: {
  navn: string;
  avatarUrl: string | null;
  laster: boolean;
  feil: string | null;
  onVelg: (fil: File) => void;
}) {
  const filInput = useRef<HTMLInputElement>(null);
  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => filInput.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") filInput.current?.click();
        }}
        style={{
          border: `1.5px dashed ${T.borderS}`,
          borderRadius: 16,
          padding: "26px 18px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 11,
          textAlign: "center",
          cursor: "pointer",
          background: T.panel2,
        }}
      >
        <input
          ref={filInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={(e) => {
            const fil = e.target.files?.[0];
            if (fil) onVelg(fil);
            if (filInput.current) filInput.current.value = "";
          }}
        />
        {avatarUrl ? (
          <AvatarFoto src={avatarUrl} navn={navn} size={52} ring />
        ) : (
          <span
            style={{
              width: 52,
              height: 52,
              borderRadius: 9999,
              background: T.panel3,
              border: `1px solid ${T.borderS}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="camera" size={21} style={{ color: T.fg2 }} />
          </span>
        )}
        <div>
          <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>
            {laster ? "Laster opp…" : avatarUrl ? "Bytt profilbilde" : "Last opp profilbilde"}
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.55, margin: "5px 0 0" }}>
            Dra inn et bilde, eller trykk for å velge. Bildet ditt gir appen din egen look.
          </p>
        </div>
      </div>
      {feil && (
        <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.down, margin: "0 2px", lineHeight: 1.5 }}>{feil}</p>
      )}
      <div style={{ display: "flex", gap: 12 }}>
        <AmbientHint />
        <AmbientHint med />
      </div>
      <InnsiktChip>
        Bildet brukes som avatar og som en myk bakgrunnsglød øverst i appen — bare du ser den.
      </InnsiktChip>
    </>
  );
}

/* ── Steg 3 — Nivå og mål (mockup: StegNiva) ───────────────────────── */

const KATEGORIER = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

function StegNiva({
  kategori,
  onKategori,
  ambisjon,
  onAmbisjon,
}: {
  kategori: string | null;
  onKategori: (k: string) => void;
  ambisjon: string;
  onAmbisjon: (v: string) => void;
}) {
  return (
    <>
      <div>
        <Caps size={9} style={{ marginBottom: 7 }}>
          Kategori (A–K)
        </Caps>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {KATEGORIER.map((k) => {
            const on = k === kategori;
            return (
              <button
                key={k}
                type="button"
                onClick={() => onKategori(k)}
                style={{
                  appearance: "none",
                  width: 34,
                  height: 34,
                  borderRadius: 9999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: T.mono,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: on ? T.lime : T.panel2,
                  color: on ? T.onLime : T.fg2,
                  border: `1px solid ${on ? "transparent" : T.border}`,
                }}
              >
                {k}
              </button>
            );
          })}
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.55, margin: "8px 2px 0" }}>
          Usikker? Velg det som ligner mest — coachen din justerer dette sammen med deg.
        </p>
      </div>
      <div>
        <Caps size={9} style={{ marginBottom: 7 }}>
          Hva vil du oppnå?
        </Caps>
        <textarea
          value={ambisjon}
          onChange={(e) => onAmbisjon(e.target.value)}
          placeholder="Skriv målet ditt for sesongen — coachen din leser dette."
          rows={3}
          style={{
            width: "100%",
            minHeight: 88,
            resize: "vertical",
            padding: "12px 14px",
            borderRadius: 12,
            background: T.panel2,
            border: `1px solid ${T.borderS}`,
            fontFamily: T.ui,
            fontSize: 13.5,
            color: T.fg,
            lineHeight: 1.6,
            outline: "none",
          }}
        />
      </div>
    </>
  );
}

/* ── Brand-panel (mockup: BrandPanel) ──────────────────────────────── */

function BrandPanel() {
  return (
    <div
      style={{
        width: 520,
        flex: "none",
        position: "relative",
        overflow: "hidden",
        borderRight: `1px solid ${T.border}`,
        background: `radial-gradient(560px 460px at 28% 24%, color-mix(in srgb, ${T.forest} 55%, transparent), transparent 68%), radial-gradient(420px 380px at 82% 88%, color-mix(in srgb, ${T.lime} 7%, transparent), transparent 60%), ${T.bg}`,
        display: "flex",
        flexDirection: "column",
        padding: "34px 40px 44px",
      }}
    >
      <svg viewBox="0 0 520 720" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
        {[70, 130, 190, 250].map((r) => (
          <circle key={r} cx="260" cy="330" r={r} fill="none" stroke={`color-mix(in srgb, ${T.fg} 5%, transparent)`} strokeWidth="1" />
        ))}
        <circle cx="260" cy="330" r="3.5" fill={`color-mix(in srgb, ${T.lime} 50%, transparent)`} />
      </svg>
      <div style={{ position: "relative" }}>
        <LogoAK size={30} />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ position: "relative" }}>
        <LogoAK size={64} style={{ marginBottom: 22 }} />
        <h2
          style={{
            fontFamily: T.disp,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: "-0.03em",
            lineHeight: 1.12,
            color: T.fg,
            margin: 0,
          }}
        >
          Hele golfutviklingen din. <em style={{ fontStyle: "italic", color: T.lime }}>Ett sted.</em>
        </h2>
        <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.6, margin: "14px 0 0", maxWidth: 360 }}>
          Plan, trening og analyse — koblet rett til coachen din.
        </p>
      </div>
    </div>
  );
}

/* ── Ambient bakgrunnsglød fra opplastet bilde (Spotify-idiomet) ────── */

function OnboardingAmbient({ src }: { src: string | null }) {
  if (!src) return null;
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "120%",
          height: "70%",
          objectFit: "cover",
          filter: "blur(90px) saturate(1.25) brightness(0.55)",
          opacity: 0.38,
          maskImage: "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 55%, transparent 90%)",
          WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 55%, transparent 90%)",
        }}
      />
    </div>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function OnboardingV2({ data }: { data: OnboardingV2Data }) {
  const mobile = useMobile();
  const [steg, setSteg] = useState(() => tilVisueltSteg(data.resumeStep));
  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl);
  const [ambisjon, setAmbisjon] = useState(data.ambisjon ?? "");
  const [kategori, setKategori] = useState<string | null>(null);
  const [laster, setLaster] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function lastOppBilde(fil: File) {
    setFeil(null);
    setLaster(true);
    const formData = new FormData();
    formData.append("file", fil);
    startTransition(async () => {
      try {
        const res = await uploadAvatar(formData);
        setAvatarUrl(res.url);
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Opplasting feilet.");
      } finally {
        setLaster(false);
      }
    });
  }

  function neste() {
    if (steg < 3) {
      setSteg(steg + 1);
      return;
    }
    // Steg 3 → lagre ambisjon + fullfør (redirect til /portal).
    setFeil(null);
    startTransition(async () => {
      try {
        await saveOnboardingProfile({ ambition: ambisjon.trim() || null });
        await completeOnboarding();
      } catch {
        setFeil("Kunne ikke fullføre. Prøv igjen.");
      }
    });
  }

  const TITLER: Record<number, string> = { 1: "Litt om deg", 2: "Bildet ditt", 3: "Nivå og mål" };
  const innhold =
    steg === 1 ? (
      <StegOm navn={data.navn} fodselsaar={data.fodselsaar} venterSamtykke={data.venterSamtykke} />
    ) : steg === 2 ? (
      <StegBilde navn={data.navn} avatarUrl={avatarUrl} laster={laster} feil={feil} onVelg={lastOppBilde} />
    ) : (
      <StegNiva kategori={kategori} onKategori={setKategori} ambisjon={ambisjon} onAmbisjon={setAmbisjon} />
    );

  const kort = (
    <div style={{ width: mobile ? "100%" : 440, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <LogoAK size={24} />
        <Caps size={9}>Steg {steg} av 3</Caps>
      </div>
      <StegIndikator steg={steg} mobile={mobile} />
      <h1
        style={{
          fontFamily: T.disp,
          fontWeight: 700,
          fontSize: mobile ? 24 : 27,
          letterSpacing: "-0.03em",
          color: T.fg,
          margin: "4px 0 0",
        }}
      >
        {TITLER[steg]}
      </h1>
      <Kort pad="20px" style={{ gap: 16 }}>
        {innhold}
      </Kort>
      {steg === 3 && feil && (
        <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.down, margin: "0 2px", lineHeight: 1.5 }}>{feil}</p>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        {steg > 1 && (
          <button
            type="button"
            onClick={() => setSteg(steg - 1)}
            disabled={pending}
            style={{
              appearance: "none",
              cursor: pending ? "default" : "pointer",
              flex: "none",
              width: 44,
              height: 44,
              borderRadius: 12,
              background: T.panel3,
              border: `1px solid ${T.borderS}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: pending ? 0.5 : 1,
            }}
          >
            <Icon name="chevron-left" size={16} style={{ color: T.fg2 }} />
          </button>
        )}
        <button
          type="button"
          onClick={neste}
          disabled={pending}
          style={{
            appearance: "none",
            cursor: pending ? "default" : "pointer",
            flex: 1,
            height: 44,
            borderRadius: 12,
            background: T.lime,
            color: T.onLime,
            border: "none",
            fontFamily: T.ui,
            fontSize: 13.5,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: pending ? 0.6 : 1,
          }}
        >
          {steg === 3 ? "Fullfør og gå til Hjem" : "Neste steg"}
          <Icon name="chevron-right" size={15} />
        </button>
      </div>
      {steg === 2 && (
        <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, textAlign: "center", margin: 0 }}>
          Du kan hoppe over dette og legge til bilde senere under Meg.
        </p>
      )}
    </div>
  );

  if (mobile) {
    return (
      <div
        style={{
          width: 390,
          minHeight: 800,
          background: `radial-gradient(500px 340px at 50% -10%, color-mix(in srgb, ${T.forest} 30%, transparent), transparent 65%), ${T.bg}`,
          borderRadius: 40,
          border: `1px solid ${T.borderS}`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <OnboardingAmbient src={avatarUrl} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "13px 24px 5px",
            flex: "none",
            position: "relative",
          }}
        >
          <span style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: T.fg }}>9:41</span>
          <Icon name="activity" size={13} style={{ color: T.fg }} />
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px 30px", position: "relative" }}>{kort}</div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: 1280,
        minHeight: 720,
        background: T.bg,
        borderRadius: 20,
        border: `1px solid ${T.borderS}`,
        overflow: "hidden",
        display: "flex",
      }}
    >
      <BrandPanel />
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 40px",
          position: "relative",
          background: `radial-gradient(700px 420px at 60% -12%, color-mix(in srgb, ${T.forest} 14%, transparent), transparent 62%), ${T.bg}`,
        }}
      >
        <OnboardingAmbient src={avatarUrl} />
        <div style={{ position: "relative" }}>{kort}</div>
      </div>
    </div>
  );
}
