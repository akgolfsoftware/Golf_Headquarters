/* Tilstandsgalleriet — familier: Struktur + Navigasjon + Feedback.
   Lastes av guidelines/tilstander.html (babel). Registrerer på window. */
const dsStruct = window.AKGolfHQDesignSystem_a3d5af;
const {
  Accordion, Avatar, AvatarGroup, Divider, EmptyState, FilterPills,
  KanbanKolonne, Pagination, Skeleton, SkeletonRow, Stepper,
  NavRail, BottomNav, Card, Button, Tag, CountBadge,
  AiTipCard, TipMetric, ListRow, MeldingsTraad,
} = dsStruct;

function Sec({ label, children }) {
  return (
    <div className="sec">
      <p className="sec__lbl">{label}</p>
      {children}
    </div>
  );
}
function St({ l, children }) {
  return (
    <div className="st">
      <span className="st__lbl">{l}</span>
      {children}
    </div>
  );
}

function FamStructure() {
  const [pills, setPills] = React.useState("SLAG");
  const [page, setPage] = React.useState(2);
  return (
    <React.Fragment>
      <Sec label="Accordion / Stepper / Pagination">
        <Accordion
          items={[
            { title: "Hva er plan-kvalitet?", subtitle: "0–100 score", content: "Score på planens etterlevelse av kanon-invarianter og husregler." },
            { title: "Hva er ACWR?", content: "Acute:chronic workload ratio — soner: trygg / varsel / over." },
          ]}
          defaultOpen={[0]}
        />
        <div className="row" style={{ gap: 18, marginTop: 12, alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <Stepper steps={["Detaljer", "Fordeling", "Økter", "Bekreft"]} current={2} />
          </div>
          <Pagination page={page} totalPages={8} onChange={setPage} />
        </div>
      </Sec>
      <Sec label="Avatar / AvatarGroup / Divider">
        <div className="row" style={{ gap: 14, alignItems: "center" }}>
          <Avatar name="Øyvind Rohjan" size="xs" />
          <Avatar name="Øyvind Rohjan" size="sm" />
          <Avatar name="Anders Kristiansen" size="md" />
          <Avatar name="Anders Kristiansen" size="lg" />
          <AvatarGroup max={3} avatars={[{ name: "Øyvind Rohjan" }, { name: "Anders Kristiansen" }, { name: "Jonas Haugen" }, { name: "Mia Berg" }]} />
        </div>
        <div style={{ marginTop: 12 }}>
          <Divider label="Uke 27" />
        </div>
      </Sec>
      <Sec label="FilterPills — valgt / med teller + akse">
        <FilterPills
          value={pills}
          onChange={setPills}
          filters={[
            { value: "alle", label: "Alle", count: 24 },
            { value: "FYS", label: "FYS", count: 5, axis: "FYS" },
            { value: "TEK", label: "TEK", count: 8, axis: "TEK" },
            { value: "SLAG", label: "SLAG", count: 6, axis: "SLAG" },
            { value: "SPILL", label: "SPILL", count: 4, axis: "SPILL" },
            { value: "TURN", label: "TURN", count: 1, axis: "TURN" },
          ]}
        />
      </Sec>
      <Sec label="EmptyState — default / kompakt · Skeleton">
        <div className="grid2">
          <EmptyState
            icon="calendar"
            title="Ingen økter planlagt"
            description="Uka er tom — planlegg første økt i Workbench."
            actions={<Button variant="secondary" size="sm">Planlegg økt</Button>}
          />
          <div className="stack" style={{ gap: 12 }}>
            <EmptyState compact icon="inbox" title="Ingen varsler" />
            <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
              <Skeleton variant="circle" width={36} height={36} />
              <div style={{ flex: 1 }}><SkeletonRow lines={3} /></div>
            </div>
            <Skeleton variant="card" height={56} />
          </div>
        </div>
      </Sec>
      <Sec label="KanbanKolonne — nøytral (tom) / aktiv / ferdig">
        <div className="row" style={{ gap: 12, alignItems: "stretch", flexWrap: "nowrap" }}>
          <KanbanKolonne tittel="Utkast" tone="noytral" style={{ flex: 1, minWidth: 0 }}>
            <KanbanKolonne.Tom>Ingen planer</KanbanKolonne.Tom>
          </KanbanKolonne>
          <KanbanKolonne tittel="Aktiv" tone="aktiv" style={{ flex: 1, minWidth: 0 }}>
            <Card compact eyebrow="Uke 27–34" title="NM-spor sommer">Øyvind Rohjan</Card>
            <Card compact eyebrow="Uke 27–30" title="Teknikkblokk">Mia Berg</Card>
          </KanbanKolonne>
          <KanbanKolonne tittel="Fullført" tone="ferdig" style={{ flex: 1, minWidth: 0 }}>
            <Card compact eyebrow="Uke 18–26" title="Base vår">Jonas Haugen</Card>
          </KanbanKolonne>
        </div>
      </Sec>
    </React.Fragment>
  );
}

function FamNav() {
  return (
    <React.Fragment>
      <Sec label="NavRail — aktiv + badge (utsnitt)">
        <div style={{ height: 300, overflow: "hidden", borderRadius: 12, border: "1px solid var(--border)", display: "inline-block" }}>
          <NavRail
            wordmark="AK GOLF HQ"
            expanded
            items={[
              { icon: "layout-dashboard", label: "Cockpit", active: true },
              { icon: "users", label: "Stall" },
              { icon: "calendar", label: "Kalender" },
              { icon: "inbox", label: "Innboks", badge: 3 },
            ]}
            bottomItems={[{ icon: "settings", label: "Innstillinger" }]}
          />
        </div>
      </Sec>
      <Sec label="BottomNav — aktiv + badge">
        <div style={{ position: "relative", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
          <BottomNav
            style={{ position: "static" }}
            items={[
              { icon: "home", label: "Hjem" },
              { icon: "target", label: "Tren", active: true },
              { icon: "flag", label: "Mål" },
              { icon: "circle-user", label: "Meg", badge: true },
            ]}
          />
        </div>
      </Sec>
      <Sec label="CountBadge">
        <div className="row">
          <CountBadge count={3} />
          <CountBadge count={12} tone="signal" />
        </div>
      </Sec>
    </React.Fragment>
  );
}

function FamFeedback() {
  return (
    <React.Fragment>
      <Sec label="AiTipCard — anbefalingskontrakt-lyd, ett lime-tall">
        <AiTipCard updated="3 min" title="APP-gapet lukker seg" action={<Button variant="ghost" size="sm">Se analyse</Button>}>
          Approach-treningen gir utslag: <TipMetric>+0,6 SG</TipMetric> på APP siste 4 runder. Hold volumet i uke 28.
        </AiTipCard>
      </Sec>
      <Sec label="ListRow — ikon+meta / ulest / navigasjon">
        <div className="stack" style={{ gap: 6 }}>
          <ListRow icon="calendar" title="M2 · Kravtrening driver" subtitle="I dag 16:00 · 60 min" meta={<Tag variant="neutral" size="sm">SLAG</Tag>} />
          <ListRow icon="mail" iconTone="signal" title="Melding fra Øyvind" subtitle="«Kan vi flytte torsdag?»" meta="10:42" unread />
          <ListRow icon="file-text" title="Ukerapport uke 26" subtitle="Klar til gjennomsyn" chevron onClick={() => {}} />
        </div>
      </Sec>
      <Sec label="MeldingsTraad — dem / meg / AI / skriver">
        <MeldingsTraad label="Samtale med Øyvind Rohjan">
          <MeldingsTraad.Skille>I dag</MeldingsTraad.Skille>
          <MeldingsTraad.Melding fra="dem" navn="Øyvind Rohjan" initialer="ØR" tid="10:42">
            Kan vi flytte torsdagsøkta til fredag?
          </MeldingsTraad.Melding>
          <MeldingsTraad.Melding fra="meg" tid="10:45">
            Ja — fredag 16:00 på rangen. Jeg oppdaterer planen.
          </MeldingsTraad.Melding>
          <MeldingsTraad.Melding fra="ai" navn="AI-Caddie" tid="10:46">
            Flyttingen holder mikrosyklusen ren — ingen budsjettbrudd.
          </MeldingsTraad.Melding>
          <MeldingsTraad.Skriver navn="Øyvind" />
        </MeldingsTraad>
      </Sec>
    </React.Fragment>
  );
}

Object.assign(window, { FamStructure, FamNav, FamFeedback });
