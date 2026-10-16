"use client";

/**
 * AG-RD-01 Rundeanalyse i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-RD.jsx). Runder på tvers av stallen med
 * brutto score, datagrunnlag og kilde. Søket og lenken til spilleren fra den
 * gamle Runder-siden er beholdt; raden åpner Spiller 360 › Stats › Snittscore.
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Flag } from "lucide-react";
import { FeilTilstand, LasterTilstand, Meta, TomTilstand } from "@/components/precision/pa";
import { Sokefelt } from "@/components/precision/pa-a2";
import { Tabell, type TabellKolonne } from "@/components/precision/pa-a4";
import { FaneLenker, Seksjon, TallFlis, Valg } from "@/components/precision/pa-spiller360";
import { SideHode } from "@/components/precision/pa-a4";
import { desimal, sg, tilPar } from "@/lib/admin-spiller/spiller360-visning";

export type RundeRad = {
  id: string;
  spiller: string;
  spillerId: string;
  hcp: string | null;
  bane: string;
  dato: string;
  brutto: number;
  tilPar: number;
  hull: number | null;
  sg: number | null;
  type: "Turnering" | "Trening";
  grunnlag: "Slag for slag" | "Hullkort" | "Scorekort";
};

export type RunderData = {
  vist: number;
  total: number;
  spillere: number;
  snittBrutto: number | null;
  snittTilPar: number | null;
  tellende: number;
  beste: { brutto: number; tilPar: number; spiller: string; bane: string } | null;
  sgSnitt: number | null;
  sgRunder: number;
  kilde: string;
  runder: RundeRad[];
};

const INNSIKT = [
  { href: "/admin/analyse", navn: "Stall" },
  { href: "/admin/tester", navn: "Tester" },
  { href: "/admin/trackman", navn: "TrackMan" },
  { href: "/admin/runder", navn: "Runder" },
  { href: "/admin/agencyos/okonomi#rapporter", navn: "Rapporter" },
  { href: "/admin/analyse?fane=etterlevelse", navn: "Etterlevelse" },
];

const veksle = <T,>(l: T[], v: T) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v]);

export function AGRD01Runder({ tilstand, data }: { tilstand: "data" | "tom" | "laster" | "feil"; data: RunderData }) {
  const router = useRouter();
  const [sok, setSok] = useState("");
  const [type, setType] = useState<RundeRad["type"][]>([]);
  const [grunnlag, setGrunnlag] = useState<("Komplett" | "Ukomplett")[]>([]);

  const rader = useMemo(() => {
    const q = sok.trim().toLowerCase();
    return data.runder.filter((r) =>
      (!q || r.spiller.toLowerCase().includes(q) || r.bane.toLowerCase().includes(q)) &&
      (!type.length || type.includes(r.type)) &&
      (!grunnlag.length || grunnlag.includes(r.grunnlag === "Scorekort" ? "Ukomplett" : "Komplett")));
  }, [data.runder, sok, type, grunnlag]);

  const kolonner: TabellKolonne<RundeRad>[] = [
    { key: "spiller", label: "Spiller", render: (r) => r.spiller },
    { key: "dato", label: "Dato", mono: true, render: (r) => r.dato },
    { key: "bane", label: "Bane", render: (r) => r.bane },
    { key: "type", label: "Type", render: (r) => r.type },
    { key: "brutto", label: "Brutto", mono: true, align: "right", render: (r) => `${r.brutto} (${tilPar(r.tilPar)})${r.hull && r.hull < 18 ? ` · ${r.hull} hull` : ""}` },
    { key: "sg", label: "SG", mono: true, align: "right", render: (r) => sg(r.sg) },
    { key: "grunnlag", label: "Grunnlag", render: (r) => r.grunnlag },
  ];

  return (
    <div className="a8-side">
      <SideHode kicker="Innsikt · Runder" title="Rundeanalyse" sub="Runder per spiller med datagrunnlag og kilde. Brutto score. Ingen diagnose uten at du godkjenner." />
      <FaneLenker label="Innsikt-visninger" faner={INNSIKT.map((f) => ({ ...f, aktiv: f.href === "/admin/runder" }))} />
      {tilstand === "laster" ? <LasterTilstand text="Henter runder …" />
        : tilstand === "feil" ? <FeilTilstand icon={CircleAlert} title="Rundene kunne ikke hentes" text="Ingen runder er endret." code="FEIL · RUNDER" />
        : tilstand === "tom" || data.total === 0 ? <TomTilstand icon={Flag} title="Ingen runder registrert" text="Når spillerne registrerer runder, vises de her med brutto score og datagrunnlag." />
        : <>
          <div className="a8-tall-rutenett">
            <TallFlis k="Runder" v={`${data.vist}/${data.total}`} kilde={`${data.spillere} SPILLERE · NYESTE ${data.vist}`} />
            <TallFlis k="Snitt brutto" v={desimal(data.snittBrutto)} kilde={`${data.tellende} TELLENDE · NI HULL TELLER IKKE`} />
            <TallFlis k="Mot par · snitt" v={data.snittTilPar == null ? "—" : sg(data.snittTilPar)} kilde="TELLENDE RUNDER" />
            <TallFlis k="SG totalt · snitt" v={sg(data.sgSnitt)} kilde={`${data.sgRunder} RUNDER MED SG`} />
            <TallFlis k="Beste runde" v={data.beste ? `${data.beste.brutto} (${tilPar(data.beste.tilPar)})` : "—"} kilde={data.beste ? `${data.beste.spiller} · ${data.beste.bane}`.toUpperCase() : "—"} />
          </div>
          <div className="a8-stabel">
            <Seksjon k={`Runder · ${rader.length}`} meta={data.kilde} gap={12}>
              <div className="a8-skjema__rad"><Sokefelt value={sok} onChange={setSok} label="Søk etter spiller eller bane" placeholder="Søk etter spiller eller bane" /></div>
              <div className="a8-faner">
                <div className="a8-faner" role="group" aria-label="Rundetype">{(["Turnering", "Trening"] as const).map((t) => <Valg key={t} valgt={type.includes(t)} onClick={() => setType((l) => veksle(l, t))}>{t}</Valg>)}</div>
                <div className="a8-faner" role="group" aria-label="Datagrunnlag">{(["Komplett", "Ukomplett"] as const).map((t) => <Valg key={t} valgt={grunnlag.includes(t)} onClick={() => setGrunnlag((l) => veksle(l, t))}>{t}</Valg>)}</div>
              </div>
              <Tabell caption="Runder" columns={kolonner} rows={rader} onSelect={(id) => {
                const r = rader.find((x) => x.id === id);
                if (r) router.push(`/admin/spillere/${r.spillerId}?fane=stats&del=snitt`);
              }} tomTekst="Ingen runder med dette filteret." />
              <Meta>SG «—» = IKKE NOK DATA. SCOREKORTNIVÅ GIR ALDRI BEREGNET SG.</Meta>
            </Seksjon>
          </div>
        </>}
    </div>
  );
}
