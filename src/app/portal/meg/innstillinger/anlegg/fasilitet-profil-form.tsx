"use client";

/**
 * Interaktivt skjema for å registrere tilgjengelige fasiliteter/utstyr.
 * Grupperte checkboxes med forklaring. Lagres med server action.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare2, Square, CheckCircle2, Loader2, MapPin, Wifi, Wind, Target, Dumbbell } from "lucide-react";
import type { DrillFasilitet } from "@/generated/prisma/client";
import { lagreFasilitetProfil } from "../actions";

type Gruppe = {
  label: string;
  icon: React.ReactNode;
  items: {
    kode: DrillFasilitet;
    tittel: string;
    beskrivelse: string;
  }[];
};

const GRUPPER: Gruppe[] = [
  {
    label: "Utstyr",
    icon: <Wifi className="h-4 w-4" />,
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
    icon: <Wind className="h-4 w-4" />,
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
    icon: <MapPin className="h-4 w-4" />,
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
    icon: <Target className="h-4 w-4" />,
    items: [
      {
        kode: "PUTTING_GREEN_KORT",
        tittel: "Putting green (opptil 10m)",
        beskrivelse:
          "Liten putting-green — dekker drills på 1-10m avstand. Kortspill og 1-2m presisjon.",
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
    icon: <Dumbbell className="h-4 w-4" />,
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

export function FasilitetProfilForm({
  initial,
}: {
  initial: DrillFasilitet[];
}) {
  const router = useRouter();
  const [valgte, setValgte] = useState<Set<DrillFasilitet>>(new Set(initial));
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
    <div className="space-y-6">
      {/* Status-banner */}
      {status === "lagret" && (
        <div className="flex items-center gap-2 rounded-lg bg-accent/20 border border-accent/40 px-4 py-3 text-sm text-accent-foreground">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Lagret! Drill-biblioteket oppdateres med dine anlegg.
        </div>
      )}
      {status === "feil" && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          Noe gikk galt. Prøv igjen.
        </div>
      )}

      {/* Grupper */}
      {GRUPPER.map((gruppe) => {
        const alleValgt = gruppe.items.every((i) => valgte.has(i.kode));
        const noenValgt = gruppe.items.some((i) => valgte.has(i.kode));

        return (
          <section key={gruppe.label} className="space-y-2">
            {/* Gruppe-header */}
            <button
              type="button"
              onClick={() => toggleGruppe(gruppe)}
              className="flex w-full items-center gap-2 text-sm font-semibold text-foreground py-1 hover:text-primary transition-colors"
            >
              <span className="text-muted-foreground">{gruppe.icon}</span>
              {gruppe.label}
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {alleValgt
                  ? "Fjern alle"
                  : noenValgt
                    ? "Legg til alle"
                    : "Velg alle"}
              </span>
            </button>

            {/* Elementer */}
            <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
              {gruppe.items.map((item) => {
                const erValgt = valgte.has(item.kode);
                return (
                  <button
                    key={item.kode}
                    type="button"
                    onClick={() => toggle(item.kode)}
                    className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors
                      ${erValgt
                        ? "bg-accent/10 hover:bg-accent/15"
                        : "bg-card hover:bg-muted/50"
                      }`}
                  >
                    <span className={`mt-0.5 shrink-0 transition-colors ${erValgt ? "text-primary" : "text-muted-foreground"}`}>
                      {erValgt ? (
                        <CheckSquare2 className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </span>
                    <span className="flex-1 space-y-0.5">
                      <span className={`block text-sm font-medium ${erValgt ? "text-foreground" : "text-foreground/80"}`}>
                        {item.tittel}
                      </span>
                      <span className="block text-xs text-muted-foreground leading-relaxed">
                        {item.beskrivelse}
                      </span>
                    </span>
                    {erValgt && (
                      <span className="shrink-0 mt-0.5 rounded-full bg-accent/30 px-2 py-0.5 font-mono text-[10px] text-accent-foreground">
                        PÅ
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Lagre-knapp */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {antallValgt === 0
            ? "Ingen fasiliteter valgt — du ser alle drills."
            : `${antallValgt} fasilitet${antallValgt !== 1 ? "er" : ""} valgt — drills filtreres deretter.`}
        </p>
        <button
          type="button"
          onClick={handleLagre}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          Lagre anleggsprofil
        </button>
      </div>

      {/* Info-boks */}
      <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 text-xs text-muted-foreground leading-relaxed space-y-1">
        <p className="font-semibold text-foreground text-xs">Slik virker dette:</p>
        <p>
          Drills med krav om spesiell fasilitet (f.eks. bunker, radar, lang
          putting-green) vil automatisk filtreres bort hvis du ikke har den
          fasiliteten registrert. Drill-biblioteket og treningsplanen din
          blir da 100 % praktisk gjennomførbar.
        </p>
        <p>
          Hvis du har <strong>ingen fasiliteter</strong> registrert, vises
          alle drills ufiltrert — som før.
        </p>
      </div>
    </div>
  );
}
