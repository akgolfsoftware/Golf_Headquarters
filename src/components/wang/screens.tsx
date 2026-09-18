import { useMemo, useState } from "react";
import {
  ACCESS_DENIAL,
  canAccessScreen,
  canPostToPlayer,
  canSetConsent,
  latestConsent,
  playersVisibleTo,
  schoolAggregates,
  tournamentRowsFor,
  type Role,
  type ScreenId,
} from "@/lib/wang/access";
import {
  COACHES,
  CONSENTS,
  GROUPS,
  MEMBERSHIPS,
  PARENTS,
  PLAYERS,
  PROTOCOLS,
  SCHOOLS,
  TOURNAMENTS,
} from "@/lib/wang/data";
import { SCREEN_TITLES } from "@/lib/wang/nav";
import {
  DataRow,
  EmptyLock,
  Label,
  StatusChip,
  WangButton,
  WangCard,
  WangHero,
} from "./ui";

const ALL_GROUPS = GROUPS.map((g) => g.id);

export function WangScreen({
  id,
  role,
  userId,
  onOpen,
}: {
  id: ScreenId;
  role: Role;
  userId: string;
  onOpen: (id: ScreenId) => void;
}) {
  const players = useMemo(
    () =>
      playersVisibleTo({
        role,
        userId,
        memberships: MEMBERSHIPS,
        players: PLAYERS,
        allGroupIds: ALL_GROUPS,
      }),
    [role, userId],
  );

  if (!canAccessScreen(role, id)) {
    return (
      <EmptyLock
        title={SCREEN_TITLES[id]}
        body={ACCESS_DENIAL[id]}
      />
    );
  }

  switch (id) {
    case "oversikt":
      return <Oversikt role={role} players={players.length} />;
    case "spillere":
      return <Spillere players={players} />;
    case "fellestesting":
      return <Fellestesting players={players} />;
    case "samling":
      return <Samling role={role} />;
    case "college":
      return <College />;
    case "manedsplan":
      return <Manedsplan role={role} />;
    case "uttak":
      return <Uttak role={role} players={players} />;
    case "rangliste":
      return <Rangliste players={players} />;
    case "skoler":
      return (
        <Skoler
          role={role}
          visibleIds={players.map((p) => p.id)}
        />
      );
    case "poster":
      return <Poster />;
    case "utoverpost":
      return <Utoverpost role={role} />;
    case "dokumenter":
      return <Dokumenter />;
    case "samtykke":
      return <Samtykke role={role} userId={userId} />;
    case "protokoller":
      return <Protokoller onOpen={onOpen} />;
    case "protokolldetalj":
      return <Protokolldetalj />;
    case "turneringer":
      return <Turneringer role={role} userId={userId} />;
    case "ny-turnering":
      return <NyTurnering role={role} />;
    case "referanse":
      return <Referanse />;
    case "tilgang":
      return <Tilgang />;
    case "inviter":
      return <Inviter />;
    case "apparatet":
      return <Apparatet />;
    default:
      return null;
  }
}

function Oversikt({ role, players }: { role: Role; players: number }) {
  const groups =
    role === "SS" ? 6 : role === "TR" ? 2 : role === "HJ" ? 1 : 1;
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="WANG Toppidrett Fredrikstad"
        title="Dekningsgrad"
        value={`${players}`}
        unit={role === "SP" || role === "FO" ? "profil" : "av 12"}
        insight={
          role === "SP"
            ? "Profilen din er komplett for golfgruppa. Neste samling er 3. oktober."
            : `Du ser ${groups} av 6 grupper. ${players} utøvere i utsnittet har aktiv profil.`
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        <WangCard>
          <Label>Denne uka</Label>
          <DataRow title="Fellestesting PEI" sub="Tirsdag 08:00 · 12 utøvere" meta={<StatusChip tone="wait">Kø</StatusChip>} />
          <DataRow title="Høstsamling Halmstad" sub="3.–5. okt · 8 uttatt" meta={<StatusChip tone="ok">Bekreftet</StatusChip>} />
          <DataRow title="Månedsplan oktober" sub="2 avvik mot publisert" meta={<StatusChip tone="warn">Avvik</StatusChip>} last />
        </WangCard>
        <WangCard>
          <Label>Krever handling</Label>
          <DataRow title="Ida Strand uten foresatt" sub="1:1-post er sperret" meta={<StatusChip tone="lock">Sperret</StatusChip>} />
          <DataRow title="To invitasjoner venter" sub="U16 · sendt 12.09" meta={<StatusChip tone="wait">Åpnet?</StatusChip>} last />
        </WangCard>
      </div>
    </div>
  );
}

function Spillere({
  players,
}: {
  players: ReturnType<typeof playersVisibleTo>;
}) {
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="Workdesk"
        title="Utøvere i egne grupper"
        value={String(players.length)}
        insight="Hjelpetrener ser samme liste, men kan ikke publisere. Spillere utenfor egne grupper kommer aldri hit."
      />
      <WangCard>
        <Label>Spillere</Label>
        {players.map((p, i) => (
          <DataRow
            key={p.id}
            title={p.name}
            sub={`${p.age} år · ${SCHOOLS.find((s) => s.id === p.schoolId)?.name ?? "—"}`}
            meta={
              p.parentId ? (
                <StatusChip tone="ok">Foresatt</StatusChip>
              ) : p.age < 18 ? (
                <StatusChip tone="lock">Mangler foresatt</StatusChip>
              ) : (
                <StatusChip tone="info">Myndig</StatusChip>
              )
            }
            last={i === players.length - 1}
          />
        ))}
      </WangCard>
    </div>
  );
}

function Fellestesting({
  players,
}: {
  players: ReturnType<typeof playersVisibleTo>;
}) {
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="Protokoll PEI v3"
        title="I kø i dag"
        value={String(Math.min(players.length, 8))}
        unit="utøvere"
        insight="TestSession er per spiller. Køen er en seanse — ikke en felles rad i databasen."
      />
      <WangCard>
        <Label>Føringskø</Label>
        {players.slice(0, 8).map((p, i) => (
          <DataRow
            key={p.id}
            title={p.name}
            sub="PEI nærspill · 8 av 10 forsøk kreves"
            meta={<StatusChip tone={i < 2 ? "ok" : "wait"}>{i < 2 ? "Ført" : "Venter"}</StatusChip>}
            last={i === Math.min(players.length, 8) - 1}
          />
        ))}
      </WangCard>
    </div>
  );
}

function Samling({ role }: { role: Role }) {
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="3.–5. oktober"
        title="Uttatt til Halmstad"
        value="8"
        unit="av 12"
        insight={
          role === "SP"
            ? "Du er uttatt. Laget er synlig. Reserveliste og vurderingene bak er skjult for deg."
            : "Spilleren ser hvem som er uttatt. Reserveliste og vurderinger er trenerens underlag."
        }
      />
      <WangCard>
        <Label>Program · fredag</Label>
        <DataRow title="08:00 Range" sub="Felles · fullsving uten ball" meta={<StatusChip tone="info">FYS</StatusChip>} />
        <DataRow title="10:30 Banespill" sub="9 hull · observert" meta={<StatusChip tone="info">SLAG</StatusChip>} />
        <DataRow title="15:00 Egentid" sub="Putt 3–5 fot" last />
      </WangCard>
    </div>
  );
}

function College() {
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="Collegegruppen"
        title="Aktive søkere"
        value="3"
        insight="Studieår og NCAA-kollisjon mot norsk sesong. Karakterer og opptaksdokumenter holdes utenfor."
      />
      <WangCard>
        <Label>Spillere</Label>
        <DataRow title="Marius Dahl" sub="1. studieår · NCAA fall 2027" meta={<StatusChip tone="warn">Kollisjon uke 38</StatusChip>} />
        <DataRow title="Lea Moen" sub="Søker · venteliste" meta={<StatusChip tone="wait">Utkast</StatusChip>} />
        <DataRow title="Isak Nygård" sub="Committed · vår 2027" meta={<StatusChip tone="ok">Bekreftet</StatusChip>} last />
      </WangCard>
    </div>
  );
}

function Manedsplan({ role }: { role: Role }) {
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="Oktober"
        title="Avvik mot publisert"
        value={role === "SP" ? "1" : "2"}
        unit="uker"
        insight={
          role === "SP"
            ? "Du ser egen plan og eget avvik. Gruppens avviksliste er skjult."
            : "Avvik måles mot publisert snapshot, aldri mot et utkast."
        }
      />
      <WangCard>
        <Label>Uker</Label>
        <DataRow title="Uke 40" sub="Grunnperiode · volum 6 t" meta={<StatusChip tone="ok">På plan</StatusChip>} />
        <DataRow title="Uke 41" sub="Testuke · PEI + styrke" meta={<StatusChip tone="warn">+2 økter</StatusChip>} />
        <DataRow title="Uke 42" sub="Samling Halmstad" last />
      </WangCard>
    </div>
  );
}

function Uttak({
  role,
  players,
}: {
  role: Role;
  players: ReturnType<typeof playersVisibleTo>;
}) {
  const canScore = role === "SS" || role === "TR";
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="Underlag"
        title="Vurdert til Halmstad"
        value={String(players.length)}
        insight="Ingen totalskår. Ingen kolonne som kan bli en. Vurdering er tekst, ikke karakter."
      />
      <WangCard>
        <Label>{canScore ? "Vurdering (kun trener)" : "Sperret for vurdering"}</Label>
        {players.slice(0, 6).map((p, i) => (
          <DataRow
            key={p.id}
            title={p.name}
            sub={
              canScore
                ? i % 2 === 0
                  ? "Stabil i nærspill. Tas med."
                  : "Mangler 8-ball. Avvent."
                : "Vurderingstekst er skjult for denne rollen."
            }
            meta={
              canScore ? (
                <StatusChip tone={i % 2 === 0 ? "ok" : "wait"}>
                  {i % 2 === 0 ? "Uttatt" : "Avvent"}
                </StatusChip>
              ) : (
                <StatusChip tone="lock">Låst</StatusChip>
              )
            }
            last={i === Math.min(players.length, 6) - 1}
          />
        ))}
      </WangCard>
    </div>
  );
}

function Rangliste({
  players,
}: {
  players: ReturnType<typeof playersVisibleTo>;
}) {
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="Målt · 14.09.2026 · protokoll v3 · AK"
        title="PEI nærspill"
        value="12,4"
        unit="snitt"
        insight="Lavere er bedre. Spilleren ser ikke denne flaten — det er et vurderingsuttrykk systemet har lovet å ikke gi."
      />
      <WangCard>
        <Label>Egne grupper</Label>
        {players.slice(0, 8).map((p, i) => (
          <DataRow
            key={p.id}
            title={`${i + 1}. ${p.name}`}
            sub="Kilde: PEI v3 · 14.09.2026 · MB"
            meta={
              <span className="font-wang-brand text-lg font-extrabold tabular-nums text-wang-navy">
                {(11 + i * 0.4).toFixed(1).replace(".", ",")}
              </span>
            }
            last={i === Math.min(players.length, 8) - 1}
          />
        ))}
      </WangCard>
    </div>
  );
}

function Skoler({
  role,
  visibleIds,
}: {
  role: Role;
  visibleIds: string[];
}) {
  const rows = schoolAggregates({
    role,
    elSchoolId: role === "EL" ? "s-wang" : null,
    schools: SCHOOLS,
    players: PLAYERS,
    visiblePlayerIds: visibleIds,
  });
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="Aggregat · navn er låst"
        title="Skoler i utsnittet"
        value={String(rows.length)}
        insight="NGF er en annen behandlingsansvarlig. Samtykke til egen skole dekker ikke en navngitt liste hos forbundet. Under tre utøvere vises som «under 3»."
      />
      <WangCard>
        <Label>Per skole</Label>
        {rows.map((r, i) => (
          <DataRow
            key={r.schoolId}
            title={r.name}
            sub={r.coverageLabel}
            meta={
              <StatusChip tone={r.athleteCountLabel === "under 3" ? "lock" : "ok"}>
                {r.athleteCountLabel}
              </StatusChip>
            }
            last={i === rows.length - 1}
          />
        ))}
        <p className="mt-3 text-sm text-wang-muted">
          Vis navn er deaktivert fordi hjemmelen mangler — 0 av {PLAYERS.length} har
          samtykket til at NGF ser navnet i en skoleliste.
        </p>
        <div className="mt-3">
          <WangButton disabled>Vis navn</WangButton>
        </div>
      </WangCard>
    </div>
  );
}

function Poster() {
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="WANG Golf 2026"
        title="Uleste"
        value="3"
        insight="Spilleren ser lesebrøken, ikke hvem som ikke har lest."
      />
      <WangCard>
        <Label>Siste poster</Label>
        <DataRow title="Oppmøte Halmstad" sub="Marte · i går · 9/12 lest" meta={<StatusChip tone="wait">3 mangler</StatusChip>} />
        <DataRow title="Ny PEI-protokoll v3" sub="Anders · 12.09 · 12/12" meta={<StatusChip tone="ok">Lest</StatusChip>} />
        <DataRow title="Timeplan uke 40" sub="Jonas · 10.09 · 11/12" last />
      </WangCard>
    </div>
  );
}

function Utoverpost({ role }: { role: Role }) {
  const [target, setTarget] = useState("u-ida");
  const player = PLAYERS.find((p) => p.id === target)!;
  const gate = canPostToPlayer({ role, player, parentRelations: PARENTS });
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="1:1-post"
        title="Mottaker"
        value={player.name.split(" ")[0] ?? player.name}
        insight="Foresatt står i mottakerlinjen. Posting til mindreårig uten foresatt er sperret i domenelaget, ikke bare i knappen."
      />
      <WangCard>
        <Label>Velg utøver</Label>
        <div className="mt-3 flex flex-wrap gap-2">
          {PLAYERS.filter((p) => ["u-emma", "u-ida", "u-marius"].includes(p.id)).map(
            (p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setTarget(p.id)}
                className={`h-10 rounded-wang-chip px-4 font-wang-brand text-sm font-semibold active:scale-[0.97] ${
                  target === p.id
                    ? "bg-wang-navy text-white"
                    : "bg-wang-navy/10 text-wang-navy"
                }`}
              >
                {p.name}
              </button>
            ),
          )}
        </div>
        <p className="mt-4 text-sm text-wang-muted">
          Mottakerlinje: {player.name}
          {player.parentId ? " · Kari Larsen (foresatt)" : " · ingen foresatt koblet"}
        </p>
        <div className="mt-4">
          <WangButton disabled={!gate.ok} variant={gate.ok ? "primary" : "danger"}>
            {gate.ok ? "Send post" : "Sperret"}
          </WangButton>
          {!gate.ok && "reason" in gate ? (
            <p className="mt-3 text-sm text-wang-pink">{gate.reason}</p>
          ) : null}
        </div>
      </WangCard>
    </div>
  );
}

function Dokumenter() {
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="Dokumentdeling"
        title="Mangler kvittering"
        value="2"
        insight="Spilleren ser brøken, ikke navnene som mangler."
      />
      <WangCard>
        <Label>Filer</Label>
        <DataRow title="Samtykkeskjema reise.pdf" sub="12/12 kvittert" meta={<StatusChip tone="ok">Komplett</StatusChip>} />
        <DataRow title="Halmstad timeplan.pdf" sub="10/12 kvittert" meta={<StatusChip tone="warn">Mangler 2</StatusChip>} last />
      </WangCard>
    </div>
  );
}

function Samtykke({ role, userId }: { role: Role; userId: string }) {
  const player =
    PLAYERS.find((p) => p.id === userId) ??
    PLAYERS.find((p) => p.parentId === userId) ??
    PLAYERS[0]!;
  const row = latestConsent(CONSENTS, player.id, "deling-tn", "g-golf");
  const can = canSetConsent({ actorRole: role, player });
  return (
    <div className="grid gap-4">
      <WangHero
        kicker={player.name}
        title="Deling med WANG Golf"
        value={row?.gitt ? "På" : "Av"}
        insight={
          player.age < 18
            ? "Bryteren er foresattes. Spilleren ser den, kan ikke sette den."
            : "Myndig spiller styrer eget samtykke. Trekk = ny rad, aldri oppdatering."
        }
      />
      <WangCard>
        <Label>Brytere</Label>
        <DataRow
          title="Deling med gruppen"
          sub={`Sist satt ${row?.at.slice(0, 10) ?? "—"} · ${row?.gittAvRolle === "FORESATT" ? "foresatt" : "spiller"}`}
          meta={<StatusChip tone={row?.gitt ? "ok" : "lock"}>{row?.gitt ? "Gitt" : "Ikke gitt"}</StatusChip>}
        />
        <DataRow
          title="Navn i NGF-skoleliste"
          sub="0 av 12 har samtykket. Derfor er Vis navn låst på skoleflaten."
          meta={<StatusChip tone="lock">Av</StatusChip>}
          last
        />
        <div className="mt-4">
          <WangButton disabled={!can}>
            {can ? "Lag ny samtykkerad" : "Bare foresatt kan endre"}
          </WangButton>
        </div>
      </WangCard>
    </div>
  );
}

function Protokoller({ onOpen }: { onOpen: (id: ScreenId) => void }) {
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="Bibliotek"
        title="Protokoller"
        value={String(PROTOCOLS.length)}
        insight="Deling gir tilgang til protokollen, aldri til andres måledata."
      />
      <WangCard>
        <Label>Eier · versjon · lås</Label>
        {PROTOCOLS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onOpen("protokolldetalj")}
            className="block w-full text-left"
          >
            <DataRow
              title={p.name}
              sub={`${p.owner} · ${p.version}`}
              meta={
                <StatusChip tone={p.locked ? "lock" : "wait"}>
                  {p.locked ? "Låst" : "Åpen"}
                </StatusChip>
              }
              last={i === PROTOCOLS.length - 1}
            />
          </button>
        ))}
      </WangCard>
    </div>
  );
}

function Protokolldetalj() {
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="PEI nærspill · v3"
        title="Låst"
        value="14.09"
        unit="2026"
        insight="En låst versjon kan ikke endres av noen. Hjelpetrener kommer ikke hit."
      />
      <WangCard>
        <Label>Versjonshistorikk</Label>
        <DataRow title="v3" sub="Låst 14.09.2026 · Anders" meta={<StatusChip tone="lock">Låst</StatusChip>} />
        <DataRow title="v2" sub="Arkivert 02.05.2026" last />
      </WangCard>
    </div>
  );
}

function Turneringer({ role, userId }: { role: Role; userId: string }) {
  const rows = tournamentRowsFor({ role, userId, rows: TOURNAMENTS });
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="Egne grupper"
        title="Resultatrader"
        value={String(rows.length)}
        insight="Manuell rad uten belegg er utkast og teller ikke i rangliste eller uttak. Mot felt vises aldri som 0 når feltet mangler."
      />
      <WangCard>
        <Label>Runder · til par · kilde</Label>
        {rows.map((r, i) => (
          <DataRow
            key={`${r.playerId}-${r.event}`}
            title={`${r.playerName} · ${r.event}`}
            sub={`${r.rounds} · ${r.toPar} · mot felt ${r.felt ?? "ikke mulig"}`}
            meta={
              <StatusChip tone={r.utkast ? "wait" : "ok"}>
                {r.utkast ? "Utkast" : r.kilde === "GOLFBOX" ? "GolfBox" : "Manuelt"}
              </StatusChip>
            }
            last={i === rows.length - 1}
          />
        ))}
      </WangCard>
    </div>
  );
}

function NyTurnering({ role }: { role: Role }) {
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="Manuell rad"
        title="Utkast til det belegges"
        value="—"
        insight={
          role === "SP"
            ? "Du kan legge inn egen rad, aldri en annens."
            : "Uten resultatlenke eller fil blir raden utkast."
        }
      />
      <WangCard>
        <Label>Skjema</Label>
        <div className="mt-3 grid gap-3">
          <input
            className="h-12 rounded-2xl bg-wang-subtle px-4 text-sm text-wang-ink outline-none"
            placeholder="Turnering"
            defaultValue="Junior Open Halmstad"
          />
          <input
            className="h-12 rounded-2xl bg-wang-subtle px-4 text-sm text-wang-ink outline-none"
            placeholder="Runder, f.eks. 76 · 74"
          />
          <WangButton>Lagre som utkast</WangButton>
        </div>
      </WangCard>
    </div>
  );
}

function Referanse() {
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="Tour-benchmark"
        title="Median PEI"
        value="9,8"
        insight="Ingen individuelle tall. TN-junior-kolonnen står tom med vilje."
      />
      <WangCard>
        <Label>Bånd</Label>
        <DataRow title="Scratch" sub="Median 8,2 · 140 treff" />
        <DataRow title="0–4,9" sub="Median 9,8 · 220 treff" />
        <DataRow title="5–9,9" sub="Median 12,1 · 90 treff" last />
      </WangCard>
    </div>
  );
}

function Tilgang() {
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="Bare sportssjef"
        title="Aktive tilganger"
        value="3"
        insight="Å kunne gi tilgang er å kunne gi seg selv tilgang. Derfor ser ikke trener eller hjelpetrener denne skjermen."
      />
      <WangCard>
        <Label>Gruppe · rolle · periode</Label>
        <DataRow title="Anders Kristiansen" sub="Sportssjef · alle 6 · aktiv" meta={<StatusChip tone="ok">Aktiv</StatusChip>} />
        <DataRow title="Marte Berg" sub="Trener · Golf 2026, U16 · fra 01.08" meta={<StatusChip tone="ok">Aktiv</StatusChip>} />
        <DataRow title="Jonas Nilsen" sub="Hjelpetrener · Golf 2026 · fra 15.08" meta={<StatusChip tone="info">Assistent</StatusChip>} />
        <DataRow title="Utmeldt trener" sub="Golf 2026 · endedAt 01.06.2026" meta={<StatusChip tone="lock">Utmeldt</StatusChip>} last />
      </WangCard>
    </div>
  );
}

function Inviter() {
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="ParentInvitation-mønster"
        title="Ventende"
        value="2"
        insight="Registreringen skjer i PlayerHQ og vises aldri her. Under 15 går invitasjonen til foresatt."
      />
      <WangCard>
        <Label>Invitasjoner</Label>
        <DataRow title="Noah Berg" sub="U16 · sendt 12.09 · Kari som mottaker" meta={<StatusChip tone="wait">Sendt</StatusChip>} />
        <DataRow title="Ada Solberg" sub="U16 · sendt 14.09" meta={<StatusChip tone="wait">Sendt</StatusChip>} last />
      </WangCard>
    </div>
  );
}

function Apparatet() {
  return (
    <div className="grid gap-4">
      <WangHero
        kicker="Katalog"
        title="Roller"
        value={String(COACHES.length)}
        insight="Å stå i katalogen gir ingen tilgang til en gruppe."
      />
      <WangCard>
        <Label>TN Coaches</Label>
        {COACHES.map((c, i) => (
          <DataRow
            key={c.name}
            title={c.name}
            sub={`${c.title} · grupper: ${c.groups}`}
            last={i === COACHES.length - 1}
          />
        ))}
      </WangCard>
    </div>
  );
}
