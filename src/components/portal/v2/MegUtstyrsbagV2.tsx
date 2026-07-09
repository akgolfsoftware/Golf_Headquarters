"use client";

/**
 * PlayerHQ Meg · Utstyrsbag — v2 (retning C «Presis»). Rekomponert fra den
 * ekte skjermen (src/app/portal/meg/utstyrsbag) med BEVART funksjon + datakontrakt:
 * køllesett + ball/øvrig som lese-rader, redigering via samme lagreUtstyrsbag-
 * server-action (upsert av EquipmentBag) og samme 200-tegns validering.
 *
 * Kun v2-komponenter fra "@/components/v2"; ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Ærlighet: EquipmentBag har ETT fritekstfelt per kategori (ikke spec + modell
 * separat). Verdien vises som mono-meta under kategorinavnet — aldri oppdiktet.
 * Tomme grupper får ærlig tom-tilstand. Fasitens Hanske/Sko finnes ikke i
 * modellen og vises ikke.
 *
 * V2Shell eier chrome-en; denne komponenten rendrer bare den indre stacken.
 */

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  Knapp,
  TomTilstand,
  Icon,
  Inndata,
  TekstOmraade,
} from "@/components/v2";
import { lagreUtstyrsbag, type UtstyrsbagInput } from "@/app/portal/meg/utstyrsbag/actions";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type MegUtstyrsbagData = {
  /** Lagrede EquipmentBag-felter (alle valgfrie). */
  utstyr: UtstyrsbagInput;
};

const FELT_MAX = 200;

type Felt = {
  key: keyof UtstyrsbagInput;
  label: string;
  ikon: string;
  placeholder: string;
  hint: string;
  flerlinje?: boolean;
};

const KOLLER: Felt[] = [
  { key: "driver", label: "Driver", ikon: "crosshair", placeholder: "f.eks. TaylorMade Qi10 9°", hint: "Merke + modell + loft" },
  { key: "fairwayWoods", label: "Fairway-køller", ikon: "crosshair", placeholder: "f.eks. TaylorMade Qi10 3W + 5W", hint: "3- og 5-wood, evt. mini" },
  { key: "hybrids", label: "Hybrider", ikon: "crosshair", placeholder: "f.eks. Ping G430 22°", hint: "Hybrid-modeller" },
  { key: "irons", label: "Jernsett", ikon: "crosshair", placeholder: "f.eks. Mizuno JPX925 5–PW", hint: "Modell + spennvidde" },
  { key: "wedges", label: "Wedger", ikon: "crosshair", placeholder: "f.eks. Vokey 50/54/58", hint: "Loft og grind" },
  { key: "putter", label: "Putter", ikon: "crosshair", placeholder: "f.eks. Scotty Cameron Newport 34″", hint: "Modell + lengde" },
];

const OVRIG: Felt[] = [
  { key: "ball", label: "Ball", ikon: "circle", placeholder: "f.eks. Titleist Pro V1", hint: "Modell" },
  { key: "bag", label: "Bag", ikon: "layers", placeholder: "f.eks. Sun Mountain C-130", hint: "Stativ, cart, tour-bag" },
  { key: "notes", label: "Notater", ikon: "file-text", placeholder: "f.eks. Project X 6.0 i jernsett, Golf Pride MCC grep", hint: "Skaft, grep, fitting-data", flerlinje: true },
];

/* ── Hjelpere ──────────────────────────────────────────────────────── */

function harVerdi(v: string | undefined): boolean {
  return v != null && v.trim().length > 0;
}

function medVerdi(u: UtstyrsbagInput, felter: Felt[]): Felt[] {
  return felter.filter((f) => harVerdi(u[f.key]));
}

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

/* ── Lese-rad: kategori + mono-spec ────────────────────────────────── */

function UtstyrRad({ felt, verdi, last }: { felt: Felt; verdi: string; last: boolean }) {
  return (
    <Rad
      leading={<Icon name={felt.ikon} size={16} style={{ color: T.mut }} />}
      title={felt.label}
      sub={
        <span style={{ fontFamily: T.mono, fontSize: 11.5, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>
          {verdi}
        </span>
      }
      trailing={null}
      last={last}
    />
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function MegUtstyrsbagV2({ data }: { data: MegUtstyrsbagData }) {
  const mobile = useMobile();
  const router = useRouter();
  const [redigerer, setRedigerer] = useState(false);

  if (redigerer) {
    return (
      <UtstyrsbagRediger
        initial={data.utstyr}
        onFerdig={() => setRedigerer(false)}
        onLagret={() => router.refresh()}
      />
    );
  }

  const koller = medVerdi(data.utstyr, KOLLER);
  const ovrig = medVerdi(data.utstyr, OVRIG);
  const harNoe = koller.length > 0 || ovrig.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div>
        <Tittel mobile={mobile}>Utstyrsbag</Tittel>
        <Caps size={9} style={{ marginTop: 10 }}>
          Køllesett, ball og spesifikasjoner · TrackMan-kalibrering
        </Caps>
      </div>

      {/* Køller */}
      <Kort eyebrow="Køller" action={<Caps size={9}>{`${koller.length} / ${KOLLER.length}`}</Caps>}>
        {koller.length === 0 ? (
          <TomTilstand
            icon="crosshair"
            title="Ingen køller registrert"
            sub="Legg inn køllesettet ditt for å kalibrere TrackMan-tallene."
          />
        ) : (
          koller.map((f, i) => (
            <UtstyrRad key={f.key} felt={f} verdi={data.utstyr[f.key] as string} last={i === koller.length - 1} />
          ))
        )}
      </Kort>

      {/* Ball og øvrig */}
      <Kort eyebrow="Ball og øvrig">
        {ovrig.length === 0 ? (
          <TomTilstand icon="circle" title="Ikke registrert ennå" sub="Ball, bag og notater legges inn her." />
        ) : (
          ovrig.map((f, i) => (
            <UtstyrRad key={f.key} felt={f} verdi={data.utstyr[f.key] as string} last={i === ovrig.length - 1} />
          ))
        )}
      </Kort>

      {/* Handlinger */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Knapp icon="plus" onClick={() => setRedigerer(true)}>
          {harNoe ? "Rediger utstyr" : "Legg til utstyr"}
        </Knapp>
        <Knapp ghost icon="bar-chart" onClick={() => router.push("/portal/analysere")}>
          Se TrackMan-tall
        </Knapp>
      </div>
    </div>
  );
}

/* ── Redigering (samme action + validering som den ekte skjermen) ──── */

function UtstyrsbagRediger({
  initial,
  onFerdig,
  onLagret,
}: {
  initial: UtstyrsbagInput;
  onFerdig: () => void;
  onLagret: () => void;
}) {
  const mobile = useMobile();
  const [pending, startTransition] = useTransition();
  const [lagret, setLagret] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  const [felter, setFelter] = useState<Record<keyof UtstyrsbagInput, string>>({
    driver: initial.driver ?? "",
    fairwayWoods: initial.fairwayWoods ?? "",
    hybrids: initial.hybrids ?? "",
    irons: initial.irons ?? "",
    wedges: initial.wedges ?? "",
    putter: initial.putter ?? "",
    ball: initial.ball ?? "",
    bag: initial.bag ?? "",
    notes: initial.notes ?? "",
  });

  function sett(key: keyof UtstyrsbagInput, value: string) {
    setFelter((f) => ({ ...f, [key]: value }));
  }

  function lagre() {
    setFeil(null);
    for (const f of [...KOLLER, ...OVRIG]) {
      if (felter[f.key].length > FELT_MAX) {
        setFeil(`Feltet «${f.label}» er for langt (maks ${FELT_MAX} tegn).`);
        return;
      }
    }
    startTransition(async () => {
      try {
        await lagreUtstyrsbag(felter);
        setLagret(true);
        onLagret();
        setTimeout(() => setLagret(false), 1500);
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Kunne ikke lagre.");
      }
    });
  }

  function feltInput(f: Felt) {
    if (f.flerlinje) {
      return (
        <TekstOmraade
          key={f.key}
          label={f.label}
          value={felter[f.key]}
          placeholder={f.placeholder}
          rows={4}
          onChange={(v) => sett(f.key, v)}
        />
      );
    }
    return (
      <Inndata
        key={f.key}
        label={f.label}
        value={felter[f.key]}
        placeholder={f.placeholder}
        onChange={(v) => sett(f.key, v)}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Tittel mobile={mobile}>Rediger utstyr</Tittel>
        <Caps size={9} style={{ marginTop: 10 }}>Alle felter er valgfrie</Caps>
      </div>

      <Kort eyebrow="Køller">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {KOLLER.map(feltInput)}
        </div>
      </Kort>

      <Kort eyebrow="Ball og øvrig">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {OVRIG.map(feltInput)}
        </div>
      </Kort>

      {feil && (
        <div
          style={{
            padding: "11px 14px",
            borderRadius: 12,
            background: `color-mix(in srgb, ${T.down} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`,
            fontFamily: T.ui,
            fontSize: 12.5,
            color: T.down,
          }}
        >
          {feil}
        </div>
      )}

      {/* Lagre-bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          borderRadius: T.rCard,
          background: T.panel2,
          border: `1px solid ${T.border}`,
        }}
      >
        <span style={{ flex: 1, minWidth: 0, display: "inline-flex", alignItems: "center", gap: 6 }}>
          {lagret && <Icon name="check" size={13} style={{ color: T.lime }} />}
          <Caps size={9} color={lagret ? T.fg2 : T.mut}>
            {pending ? "Lagrer …" : lagret ? "Lagret" : "Endringene lagres til utstyrsbagen din"}
          </Caps>
        </span>
        <Knapp ghost onClick={onFerdig} disabled={pending}>Avbryt</Knapp>
        <Knapp icon="check" onClick={lagre} disabled={pending}>{pending ? "Lagrer" : "Lagre"}</Knapp>
      </div>
    </div>
  );
}
