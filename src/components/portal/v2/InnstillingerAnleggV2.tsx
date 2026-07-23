"use client";

/**
 * PlayerHQ Innstillinger · Anlegg — v2 Presis + B-pakke (status, lagre = full CTA).
 */

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DrillFasilitet } from "@/generated/prisma/client";
import { lagreFasilitetProfil } from "@/app/portal/meg/innstillinger/actions";
import { T, Caps, Tittel, Kort, Knapp, StatusPill, Icon } from "@/components/v2";

/* ── Katalog (uendret innhold fra fasilitet-profil-form.tsx) ───────── */

type Gruppe = {
  label: string;
  /** Icon-navn fra v2-MAP-en (kebab-case). */
  ikon: string;
  items: {
    kode: DrillFasilitet;
    tittel: string;
    beskrivelse: string;
  }[];
};

const GRUPPER: Gruppe[] = [
  {
    label: "Utstyr",
    ikon: "radar",
    items: [
      {
        kode: "RADAR",
        tittel: "Launch monitor / radar",
        beskrivelse:
          "TrackMan, FlightScope, Garmin R10, Mevo+, SkyTrak eller tilsvarende. Brukes til å måle ballhastighet, spinn, bane og avstand.",
      },
      {
        kode: "KAMERA",
        tittel: "Kamera + stativ",
        beskrivelse:
          "iPhone, Action-kamera eller tilsvarende på stativ. Brukes til video-feedback og swing-analyse.",
      },
    ],
  },
  {
    label: "Innendørs",
    ikon: "home",
    items: [
      {
        kode: "SIMULATOR",
        tittel: "Innendørs simulator-bay",
        beskrivelse:
          "Full-scale simulator med impact-screen (TrackMan Bay, Foresight GC, etc.).",
      },
      {
        kode: "MAT_NET",
        tittel: "Matte + nett",
        beskrivelse:
          "Innendørs setup med gummimatte og nett. Kan brukes hjemme, i garasje eller treningsstudio.",
      },
    ],
  },
  {
    label: "Utendørs anlegg",
    ikon: "map-pin",
    items: [
      {
        kode: "DRIVING_RANGE",
        tittel: "Driving range",
        beskrivelse:
          "Utendørs driving range — kan slå lange slag og jobbe med full swing.",
      },
      {
        kode: "BANE",
        tittel: "Tilgang til banen",
        beskrivelse:
          "Kan spille runder eller øve på hull (9 eller 18 hull). Brukes til bane-spesifikke drills.",
      },
    ],
  },
  {
    label: "Nærspill og putting",
    ikon: "target",
    items: [
      {
        kode: "PUTTING_GREEN_KORT",
        tittel: "Putting green (opptil 10m)",
        beskrivelse:
          "Liten putting-green — dekker drills på 1-10m avstand. Nærspill og 1-2m presisjon.",
      },
      {
        kode: "PUTTING_GREEN_LANG",
        tittel: "Putting green (15m og lengre)",
        beskrivelse:
          "Stor putting-green som tillater lag-putts på 15-30m. Distansekontroll og lange strekk.",
      },
      {
        kode: "SHORT_GAME_AREA",
        tittel: "Nærspillsareal",
        beskrivelse:
          "Gress-areal for chip, pitch og lobber — fra fairway, rough og bratte vinkler rundt greenen.",
      },
      {
        kode: "BUNKER",
        tittel: "Sandbunker",
        beskrivelse:
          "Tilgang til greenside- eller fairway-bunker for bunker-spesifikke øvelser.",
      },
    ],
  },
  {
    label: "Styrke og kondisjon",
    ikon: "dumbbell",
    items: [
      {
        kode: "VEKTSTANG",
        tittel: "Vektstang / rack",
        beskrivelse:
          "Olympisk vektstang med rack. Brukes til styrkeøvelser som squat, deadlift og press.",
      },
      {
        kode: "TRAPBAR",
        tittel: "Trapbar / hex bar",
        beskrivelse:
          "Trapbar (hex bar) for sikkert løft med nøytral gripestilling. Egner seg godt til hip-hinge-øvelser.",
      },
      {
        kode: "LOPEBANE",
        tittel: "Løpebane / tredemølle",
        beskrivelse:
          "Utendørs løpebane eller innendørs tredemølle. Brukes til kondisjonsdrill og oppvarmingsøkter.",
      },
      {
        kode: "MED_BALL",
        tittel: "Medisinball",
        beskrivelse:
          "Medisinball for eksplosive kast og rotasjonsøvelser. Direkte overføring til golf-spesifikk kraft.",
      },
    ],
  },
];

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type InnstillingerAnleggData = {
  /** Spillerens registrerte fasiliteter fra User.tilgjengeligeFasiliteter. */
  tilgjengelig: DrillFasilitet[];
};

/* ── Hjelpere ──────────────────────────────────────────────────────── */

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
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

/** Avkryssbar fasilitet-rad — lime check-boks + tittel + flerlinje-beskrivelse. */
function FasilitetRad({
  tittel,
  beskrivelse,
  valgt,
  onClick,
  last,
}: {
  tittel: string;
  beskrivelse: string;
  valgt: boolean;
  onClick: () => void;
  last?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="v2-press v2-focus"
      role="checkbox"
      aria-checked={valgt}
      tabIndex={0}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "13px 0",
        borderBottom: last ? "none" : `1px solid ${T.border}`,
        cursor: "pointer",
      }}
    >
      <span
        style={{
          marginTop: 1,
          width: 20,
          height: 20,
          borderRadius: 6,
          background: valgt ? T.lime : T.panel2,
          border: `1px solid ${valgt ? "transparent" : T.borderS}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
        }}
      >
        {valgt && <Icon name="check" size={13} style={{ color: T.onLime }} />}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{tittel}</div>
        <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.55, marginTop: 3 }}>
          {beskrivelse}
        </div>
      </div>
      {valgt && <StatusPill tone="lime">På</StatusPill>}
    </div>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function InnstillingerAnleggV2({ data }: { data: InnstillingerAnleggData }) {
  const mobile = useMobile();
  const router = useRouter();
  const [valgte, setValgte] = useState<Set<DrillFasilitet>>(new Set(data.tilgjengelig));
  const [status, setStatus] = useState<"idle" | "lagret" | "feil">("idle");
  const [pending, startTransition] = useTransition();

  function toggle(kode: DrillFasilitet) {
    setValgte((prev) => {
      const ny = new Set(prev);
      if (ny.has(kode)) ny.delete(kode);
      else ny.add(kode);
      return ny;
    });
    setStatus("idle");
  }

  function toggleGruppe(gruppe: Gruppe) {
    const alleValgt = gruppe.items.every((i) => valgte.has(i.kode));
    setValgte((prev) => {
      const ny = new Set(prev);
      for (const item of gruppe.items) {
        if (alleValgt) ny.delete(item.kode);
        else ny.add(item.kode);
      }
      return ny;
    });
    setStatus("idle");
  }

  function handleLagre() {
    startTransition(async () => {
      const res = await lagreFasilitetProfil([...valgte]);
      if (res.ok) {
        setStatus("lagret");
        router.refresh();
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("feil");
      }
    });
  }

  const antallValgt = valgte.size;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <Tittel mobile={mobile}>Hva har du tilgang til?</Tittel>
        {status === "lagret" && <StatusPill tone="up">Lagret</StatusPill>}
        {status === "feil" && <StatusPill tone="down">Noe gikk galt — prøv igjen</StatusPill>}
      </div>

      {/* B: status først */}
      <Kort pad="12px">
        <Caps size={9}>Valgt</Caps>
        <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 18, marginTop: 8, color: T.fg }}>
          {antallValgt}
        </div>
        <div style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, marginTop: 4 }}>
          {antallValgt === 0 ? "Ingen filter — alle drills vises" : "Drills filtreres etter dette"}
        </div>
      </Kort>

      {/* Grupper */}
      {GRUPPER.map((gruppe) => {
        const alleValgt = gruppe.items.every((i) => valgte.has(i.kode));
        const noenValgt = gruppe.items.some((i) => valgte.has(i.kode));
        return (
          <div key={gruppe.label}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "0 4px 8px" }}>
              <Icon name={gruppe.ikon} size={13} style={{ color: T.mut }} />
              <Caps size={9} style={{ display: "inline" }}>{gruppe.label}</Caps>
              <span style={{ flex: 1 }} />
              <button
                type="button"
                onClick={() => toggleGruppe(gruppe)}
                className="v2-press v2-focus"
                style={{
                  appearance: "none",
                  background: "transparent",
                  border: 0,
                  cursor: "pointer",
                  fontFamily: T.mono,
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: T.fg2,
                  padding: "2px 4px",
                }}
              >
                {alleValgt ? "Fjern alle" : noenValgt ? "Legg til alle" : "Velg alle"}
              </button>
            </div>
            <Kort pad="4px 20px 4px">
              {gruppe.items.map((item, i) => (
                <FasilitetRad
                  key={item.kode}
                  tittel={item.tittel}
                  beskrivelse={item.beskrivelse}
                  valgt={valgte.has(item.kode)}
                  onClick={() => toggle(item.kode)}
                  last={i === gruppe.items.length - 1}
                />
              ))}
            </Kort>
          </div>
        );
      })}

      <Knapp icon={pending ? "loader" : "check"} full disabled={pending} onClick={handleLagre}>
        {pending ? "Lagrer …" : "Lagre anleggsprofil"}
      </Knapp>
    </div>
  );
}
