"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  CalendarRange,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Database,
  FlaskConical,
  LayoutDashboard,
  LockKeyhole,
  Luggage,
  MapPin,
  Menu,
  MessagesSquare,
  School,
  Trophy,
  UsersRound,
  X,
} from "lucide-react";

import type {
  WangDemoEvent,
  WangDemoPlanNode,
  WangDemoStudent,
  WangGolfDemoData,
  WangPlanLevel,
} from "@/lib/wang-supabase/types";

import styles from "./demo.module.css";

type DemoArea =
  | "oversikt"
  | "workbench"
  | "utovere"
  | "analyse"
  | "samlinger"
  | "meldinger";

const navigation: Array<{
  id: DemoArea;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: "oversikt", label: "Oversikt", icon: LayoutDashboard },
  { id: "workbench", label: "Workbench", icon: CalendarRange },
  { id: "utovere", label: "Utøvere", icon: UsersRound },
  { id: "analyse", label: "Analyse og tester", icon: ChartNoAxesCombined },
  { id: "samlinger", label: "Samlinger", icon: Luggage },
  { id: "meldinger", label: "Meldinger", icon: MessagesSquare },
];

const mobileNavigation = navigation.filter((item) =>
  ["oversikt", "workbench", "utovere", "samlinger"].includes(item.id),
);

const planLevelLabels: Record<WangPlanLevel, string> = {
  year: "Årsplan",
  period: "Periodeplan",
  month: "Månedsplan",
  week: "Ukeplan",
  session: "Øktplan",
};

const planLevelOrder: WangPlanLevel[] = ["year", "period", "month", "week", "session"];

const eventKindLabels: Record<WangDemoEvent["kind"], string> = {
  school_lesson: "Skole",
  assessment: "Prøve",
  training: "WANG-trening",
  competition: "Konkurranse",
  camp: "Samling",
  self_training: "Egentrening",
  club_training: "Klubbtrening",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  }).format(new Date(value));
}

function demoInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function WangGolfDemo({ data }: { data: WangGolfDemoData }) {
  const [activeArea, setActiveArea] = useState<DemoArea>("oversikt");
  const defaultGroup = data.groups.find((group) => group.code === "FRE-GO-G2") ?? data.groups[0];
  const [activeGroupId, setActiveGroupId] = useState(defaultGroup?.id ?? "");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showMobileMore, setShowMobileMore] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const previousArea = useRef<DemoArea>(activeArea);

  const activeGroup = data.groups.find((group) => group.id === activeGroupId) ?? defaultGroup;
  const groupStudents = data.students.filter((student) => student.groupId === activeGroupId);
  const groupEvents = data.events.filter((event) => event.groupId === activeGroupId);
  const groupPlans = data.plans
    .filter((plan) => plan.groupId === activeGroupId)
    .sort(
      (a, b) => planLevelOrder.indexOf(a.level) - planLevelOrder.indexOf(b.level),
    );
  const selectedEvent = data.events.find((event) => event.id === selectedEventId) ?? null;
  const selectedStudent =
    data.students.find((student) => student.id === selectedStudentId) ?? null;

  const activeSports = data.sports.filter((sport) => sport.workbenchStatus === "active");
  const futureSports = data.sports.filter((sport) => sport.workbenchStatus === "future");
  const campEvents = data.events.filter((event) => event.kind === "camp");

  const nextStudentEvent = useMemo(() => {
    if (!selectedStudent) return null;
    return data.events.find((event) => event.groupId === selectedStudent.groupId) ?? null;
  }, [data.events, selectedStudent]);

  useEffect(() => {
    if (previousArea.current === activeArea) return;

    previousArea.current = activeArea;
    mainRef.current?.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
  }, [activeArea]);

  function navigate(area: DemoArea) {
    setActiveArea(area);
    setShowMobileMore(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function closeEventPreview() {
    const returnEventId = selectedEventId;
    setSelectedEventId(null);
    if (!returnEventId) return;

    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(`[data-event-id="${returnEventId}"]`)
        ?.focus({ preventScroll: true });
    });
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Brand />
        <nav className={styles.desktopNav} aria-label="Hovedmeny for WANG Golf-demo">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activeArea === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={active ? styles.navItemActive : styles.navItem}
                aria-current={active ? "page" : undefined}
                onClick={() => navigate(item.id)}
              >
                <Icon aria-hidden="true" size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          <span className={styles.demoBadge}>Demo</span>
          <p>Fiktive navn og tall</p>
          <p>Sportssjef · desktop</p>
        </div>
      </aside>

      <div className={styles.mainColumn}>
        <header className={styles.mobileHeader}>
          <Brand compact />
          <button
            type="button"
            className={styles.iconButtonDark}
            aria-label={showMobileMore ? "Lukk meny" : "Åpne meny"}
            aria-expanded={showMobileMore}
            onClick={() => setShowMobileMore((current) => !current)}
          >
            {showMobileMore ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </header>

        <header className={styles.topbar}>
          <div>
            <p className={styles.eyebrow}>WANG Toppidrett Fredrikstad · Golf</p>
            <p className={styles.topbarTitle}>{navigation.find((item) => item.id === activeArea)?.label}</p>
          </div>
          <div className={styles.topbarMeta}>
            <span className={styles.databaseBadge}>
              <Database aria-hidden="true" size={15} />
              WANG demo-database
            </span>
            <span className={styles.roleBadge}>Sportssjef</span>
          </div>
        </header>

        {showMobileMore ? (
          <div className={styles.mobileMorePanel}>
            {navigation
              .filter((item) => ["analyse", "meldinger"].includes(item.id))
              .map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} type="button" onClick={() => navigate(item.id)}>
                    <Icon aria-hidden="true" size={18} />
                    {item.label}
                    <ChevronRight aria-hidden="true" size={18} />
                  </button>
                );
              })}
          </div>
        ) : null}

        <main ref={mainRef} className={styles.content}>
          <DemoNotice />
          {activeArea === "oversikt" ? (
            <Overview
              data={data}
              activeSportsCount={activeSports.length}
              futureSportsCount={futureSports.length}
              onNavigate={navigate}
              onSelectEvent={(eventId) => setSelectedEventId(eventId)}
            />
          ) : null}
          {activeArea === "workbench" ? (
            <Workbench
              groups={data.groups}
              activeGroupId={activeGroupId}
              activeGroupName={activeGroup?.name ?? "Ingen gruppe"}
              plans={groupPlans}
              events={groupEvents}
              selectedEventId={selectedEventId}
              onGroupChange={setActiveGroupId}
              onSelectEvent={setSelectedEventId}
            />
          ) : null}
          {activeArea === "utovere" ? (
            <Athletes
              groups={data.groups}
              activeGroupId={activeGroupId}
              students={groupStudents}
              selectedStudent={selectedStudent}
              nextEvent={nextStudentEvent}
              onGroupChange={(groupId) => {
                setActiveGroupId(groupId);
                setSelectedStudentId(null);
              }}
              onSelectStudent={setSelectedStudentId}
            />
          ) : null}
          {activeArea === "analyse" ? <Analysis /> : null}
          {activeArea === "samlinger" ? (
            <Camps events={campEvents} onSelectEvent={setSelectedEventId} />
          ) : null}
          {activeArea === "meldinger" ? <Messages /> : null}

          {selectedEvent ? (
            <EventPreview event={selectedEvent} onClose={closeEventPreview} />
          ) : null}
        </main>
      </div>

      <nav className={styles.mobileNav} aria-label="Mobilmeny for WANG Golf-demo">
        {mobileNavigation.map((item) => {
          const Icon = item.icon;
          const active = activeArea === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={active ? styles.mobileNavActive : undefined}
              aria-current={active ? "page" : undefined}
              onClick={() => navigate(item.id)}
            >
              <Icon aria-hidden="true" size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          className={["analyse", "meldinger"].includes(activeArea) ? styles.mobileNavActive : undefined}
          aria-expanded={showMobileMore}
          onClick={() => setShowMobileMore((current) => !current)}
        >
          <Menu aria-hidden="true" size={19} />
          <span>Mer</span>
        </button>
      </nav>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? styles.brandCompact : styles.brand}>
      <span className={styles.brandMark}>W</span>
      <span>
        <strong>WANG TOPPIDRETT</strong>
        <small>Golf · Fredrikstad</small>
      </span>
    </div>
  );
}

function DemoNotice() {
  return (
    <section className={styles.demoNotice} aria-label="Demostatus">
      <CircleAlert aria-hidden="true" size={20} />
      <div>
        <strong>Demo – fiktive navn og tall</strong>
        <span>
          Skjermreisen bruker egen WANG-database. B16 er ikke koblet, og fagmodellen for WANG Golf er ikke godkjent.
        </span>
      </div>
    </section>
  );
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className={styles.pageHeading}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 tabIndex={-1}>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

function Overview({
  data,
  activeSportsCount,
  futureSportsCount,
  onNavigate,
  onSelectEvent,
}: {
  data: WangGolfDemoData;
  activeSportsCount: number;
  futureSportsCount: number;
  onNavigate: (area: DemoArea) => void;
  onSelectEvent: (eventId: string) => void;
}) {
  const weekEvents = data.events.filter((event) => event.startsAt.startsWith("2026-10"));

  return (
    <>
      <PageHeading
        eyebrow="Fredrikstad · skoleåret 2026/2027"
        title="Golf-demo med sammenhengende data"
        description="Fra skoleoversikt til plan, økt og utøverprofil – uten ekte elevdata."
      />

      <section className={styles.statGrid} aria-label="Demotall">
        <StatCard label="Aktive idretter" value={String(activeSportsCount)} detail="Offisiell 2026/27-liste" />
        <StatCard label="Golfgrupper" value={String(data.groups.length)} detail="G1 og G2 i demo" />
        <StatCard label="Demo-utøvere" value={String(data.students.length)} detail="Alle navn er fiktive" />
        <StatCard label="Kalenderhendelser" value={String(data.events.length)} detail="Skole, trening og samling" />
      </section>

      <section className={styles.twoColumn}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.eyebrow}>Idretter ved skolen</p>
              <h2>Fredrikstad 2026/2027</h2>
            </div>
            <span className={styles.countBadge}>{activeSportsCount} aktive</span>
          </div>
          <div className={styles.sportGrid}>
            {data.sports.map((sport) => {
              const isGolf = sport.code === "golf";
              return (
                <button
                  key={sport.code}
                  type="button"
                  className={isGolf ? styles.sportCardActive : styles.sportCard}
                  disabled={!isGolf}
                  onClick={() => onNavigate("workbench")}
                >
                  <span>
                    <strong>{sport.name}</strong>
                    <small>
                      {sport.workbenchStatus === "future"
                        ? "Fremtidig Workbench"
                        : isGolf
                          ? "Demo klar"
                          : "Grunnskjerm neste fase"}
                    </small>
                  </span>
                  {isGolf ? <ChevronRight aria-hidden="true" size={18} /> : null}
                </button>
              );
            })}
          </div>
          {futureSportsCount > 0 ? (
            <p className={styles.cardFootnote}>Roing ligger som fremtidig Workbench og er ikke aktiv idrett i 2026/27.</p>
          ) : null}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.eyebrow}>Uke 43</p>
              <h2>Plan og hendelser</h2>
            </div>
            <button type="button" className={styles.textButton} onClick={() => onNavigate("workbench")}>
              Åpne Workbench
              <ChevronRight aria-hidden="true" size={17} />
            </button>
          </div>
          <div className={styles.eventList}>
            {weekEvents.length > 0 ? (
              weekEvents.map((event) => (
                <EventRow key={event.id} event={event} onSelect={() => onSelectEvent(event.id)} />
              ))
            ) : (
              <EmptyState title="Ingen hendelser" text="Uken har ingen registrerte demohendelser." />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className={styles.statCard}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function Workbench({
  groups,
  activeGroupId,
  activeGroupName,
  plans,
  events,
  selectedEventId,
  onGroupChange,
  onSelectEvent,
}: {
  groups: WangGolfDemoData["groups"];
  activeGroupId: string;
  activeGroupName: string;
  plans: WangDemoPlanNode[];
  events: WangDemoEvent[];
  selectedEventId: string | null;
  onGroupChange: (groupId: string) => void;
  onSelectEvent: (eventId: string) => void;
}) {
  return (
    <>
      <div className={styles.headingRow}>
        <PageHeading
          eyebrow="Planlegging"
          title="Workbench"
          description="Fem nivåer fra årsplan til øktplan, koblet til samme gruppe og kalender."
        />
        <label className={styles.selectLabel}>
          Gruppe
          <select value={activeGroupId} onChange={(event) => onGroupChange(event.target.value)}>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>{group.name} · {group.grade}</option>
            ))}
          </select>
        </label>
      </div>

      <section className={styles.planRail} aria-label={`Planstruktur for ${activeGroupName}`}>
        {plans.length > 0 ? (
          plans.map((plan, index) => (
            <div key={plan.id} className={styles.planNode}>
              <span className={styles.planStep}>{index + 1}</span>
              <div>
                <small>{planLevelLabels[plan.level]}</small>
                <strong>{plan.title}</strong>
                <span>{plan.status === "published" ? "Publisert" : "Utkast"}</span>
              </div>
              {index < plans.length - 1 ? <ChevronRight aria-hidden="true" /> : <Check aria-hidden="true" />}
            </div>
          ))
        ) : (
          <EmptyState title="Planstruktur mangler" text="Det er ikke opprettet demo-planer for denne gruppen ennå." />
        )}
      </section>

      <section className={styles.twoColumnWide}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.eyebrow}>{activeGroupName}</p>
              <h2>Ukeplan</h2>
            </div>
            <span className={styles.countBadge}>{events.length} hendelser</span>
          </div>
          <div className={styles.weekCalendar}>
            {events.length > 0 ? events.map((event) => (
              <button
                type="button"
                key={event.id}
                data-event-id={event.id}
                className={event.id === selectedEventId ? styles.calendarEventActive : styles.calendarEvent}
                onClick={() => onSelectEvent(event.id)}
              >
                <span>{formatDateTime(event.startsAt)}</span>
                <strong>{event.title}</strong>
                <small>{event.place ?? "Sted ikke satt"}</small>
              </button>
            )) : <EmptyState title="Tom uke" text="Ingen hendelser er registrert for gruppen." />}
          </div>
        </div>

        <aside className={styles.guardrailCard}>
          <FlaskConical aria-hidden="true" size={24} />
          <div>
            <p className={styles.eyebrow}>Faglig status</p>
            <h2>Struktur klar – innhold venter</h2>
          </div>
          <ul>
            <li>B16 er ikke koblet.</li>
            <li>WANG Golf-fagmodellen er ikke godkjent.</li>
            <li>Øktinnhold og kompetansemål skal ikke fylles med antakelser.</li>
            <li>Gjentakelser blir aktive når redigering og godkjent faggrunnlag kobles på.</li>
          </ul>
        </aside>
      </section>
    </>
  );
}

function Athletes({
  groups,
  activeGroupId,
  students,
  selectedStudent,
  nextEvent,
  onGroupChange,
  onSelectStudent,
}: {
  groups: WangGolfDemoData["groups"];
  activeGroupId: string;
  students: WangDemoStudent[];
  selectedStudent: WangDemoStudent | null;
  nextEvent: WangDemoEvent | null;
  onGroupChange: (groupId: string) => void;
  onSelectStudent: (studentId: string) => void;
}) {
  return (
    <>
      <div className={styles.headingRow}>
        <PageHeading
          eyebrow="Utøveroversikt"
          title="Golfutøvere"
          description="Fiktiv demo-liste fordelt på gruppe og trinn. Ingen ekte elevopplysninger brukes."
        />
        <label className={styles.selectLabel}>
          Gruppe
          <select value={activeGroupId} onChange={(event) => onGroupChange(event.target.value)}>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>{group.name} · {group.grade}</option>
            ))}
          </select>
        </label>
      </div>

      <section className={styles.athleteLayout}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Utøverliste</h2>
            <span className={styles.countBadge}>{students.length} demo-utøvere</span>
          </div>
          <div className={styles.athleteList}>
            {students.length > 0 ? students.map((student) => (
              <button
                key={student.id}
                type="button"
                className={selectedStudent?.id === student.id ? styles.athleteRowActive : styles.athleteRow}
                onClick={() => onSelectStudent(student.id)}
              >
                <span className={styles.avatar}>{demoInitials(student.name)}</span>
                <span>
                  <strong>{student.name}</strong>
                  <small>{student.grade} · {student.statusLabel}</small>
                </span>
                <ChevronRight aria-hidden="true" />
              </button>
            )) : <EmptyState title="Ingen utøvere" text="Gruppen har ingen demo-utøvere." />}
          </div>
        </div>

        <div className={styles.card}>
          {selectedStudent ? (
            <div className={styles.profile}>
              <span className={styles.profileAvatar}>{demoInitials(selectedStudent.name)}</span>
              <div>
                <p className={styles.eyebrow}>Fiktiv demo-profil</p>
                <h2>{selectedStudent.name}</h2>
                <p>{selectedStudent.grade} · Golf · WANG Fredrikstad</p>
              </div>
              <dl className={styles.profileFacts}>
                <div><dt>Status</dt><dd>{selectedStudent.statusLabel}</dd></div>
                <div><dt>Innsjekk</dt><dd>{selectedStudent.checkinStatus}</dd></div>
                <div><dt>Neste aktivitet</dt><dd>{nextEvent ? formatDateTime(nextEvent.startsAt) : "Ingen registrert"}</dd></div>
                <div><dt>Helse og søvn</dt><dd>Skjult i åpen demo</dd></div>
              </dl>
              <div className={styles.lockedNote}>
                <LockKeyhole aria-hidden="true" size={18} />
                Kontaktpersoner, foresatte og sensitive opplysninger krever innlogging og riktig rolle.
              </div>
            </div>
          ) : (
            <EmptyState title="Velg en utøver" text="Åpne en fiktiv profil for å se denne ukens oversikt og tilgangssperrer." />
          )}
        </div>
      </section>
    </>
  );
}

function Analysis() {
  return (
    <>
      <PageHeading
        eyebrow="Analyse og tester"
        title="Riktig tomtilstand før riktige fagdata"
        description="Skjermen er bygget uten oppdiktede testmodeller, normverdier eller treningskonklusjoner."
      />
      <section className={styles.analysisGrid}>
        <EmptyFeature icon={FlaskConical} title="Testbibliotek" text="Venter på godkjent WANG Golf-fagmodell." />
        <EmptyFeature icon={ChartNoAxesCombined} title="Utvikling over tid" text="Vises først når godkjente testresultater finnes." />
        <EmptyFeature icon={School} title="Kompetansemål" text="B16 er ikke koblet. Ingen kobling presenteres som ferdig." />
      </section>
      <section className={styles.emptyPanel}>
        <CircleAlert aria-hidden="true" size={24} />
        <div>
          <h2>Ingen godkjente analyser i demoen</h2>
          <p>Neste faglige steg er å hente godkjent underlag fra WANG Golf og koble det til hver økt.</p>
        </div>
      </section>
    </>
  );
}

function Camps({ events, onSelectEvent }: { events: WangDemoEvent[]; onSelectEvent: (eventId: string) => void }) {
  return (
    <>
      <PageHeading
        eyebrow="Treningssamlinger"
        title="Samlinger"
        description="Dato, gruppe, sted og status ligger i den samme kalenderen som Workbench."
      />
      <section className={styles.cardGrid}>
        {events.length > 0 ? events.map((event) => (
          <button key={event.id} type="button" data-event-id={event.id} className={styles.campCard} onClick={() => onSelectEvent(event.id)}>
            <span className={styles.iconTile}><Luggage aria-hidden="true" /></span>
            <span>
              <small>Demo-samling · {event.status === "published" ? "Publisert" : "Utkast"}</small>
              <strong>{event.title}</strong>
              <span>{formatDateTime(event.startsAt)} – {formatDateTime(event.endsAt)}</span>
              <span>{event.place ?? "Sted ikke satt"}</span>
            </span>
            <ChevronRight aria-hidden="true" />
          </button>
        )) : <EmptyState title="Ingen samlinger" text="Ingen demo-samlinger er registrert." />}
      </section>
    </>
  );
}

function Messages() {
  return (
    <>
      <PageHeading
        eyebrow="Meldinger"
        title="Rollebasert kommunikasjon"
        description="Grunnskjermen er klar. Ingen fiktive samtaler presenteres som ekte meldinger."
      />
      <section className={styles.messageLayout}>
        <div className={styles.card}>
          <div className={styles.cardHeader}><h2>Samtaler</h2><span className={styles.countBadge}>0</span></div>
          <EmptyState title="Ingen samtaler i demoen" text="Rektor, toppidrettssjef, sportssjef og trener får søk og meldinger etter innlogging." />
        </div>
        <div className={styles.card}>
          <EmptyFeature icon={MessagesSquare} title="Velg en mottaker" text="E-postvarsling og rollefilter kobles når autentisering og mottakerregler er ferdige." />
          <button type="button" className={styles.primaryButton} disabled>Ny melding krever innlogging</button>
        </div>
      </section>
    </>
  );
}

function EventRow({ event, onSelect }: { event: WangDemoEvent; onSelect: () => void }) {
  return (
    <button type="button" data-event-id={event.id} className={styles.eventRow} onClick={onSelect}>
      <span className={styles.eventDate}>{formatDateTime(event.startsAt)}</span>
      <span>
        <strong>{event.title}</strong>
        <small>{eventKindLabels[event.kind]} · {event.place ?? "Sted ikke satt"}</small>
      </span>
      <ChevronRight aria-hidden="true" />
    </button>
  );
}

function EventPreview({ event, onClose }: { event: WangDemoEvent; onClose: () => void }) {
  return (
    <section className={styles.preview} aria-live="polite" aria-label={`Forhåndsvisning av ${event.title}`}>
      <div className={styles.previewHeader}>
        <div>
          <p className={styles.eyebrow}>Forhåndsvisning</p>
          <h2>{event.title}</h2>
        </div>
        <button type="button" className={styles.iconButton} aria-label="Lukk forhåndsvisning" onClick={onClose}>
          <X aria-hidden="true" />
        </button>
      </div>
      <dl className={styles.previewFacts}>
        <div><dt><CalendarDays aria-hidden="true" /> Tid</dt><dd>{formatDateTime(event.startsAt)}–{formatTime(event.endsAt)}</dd></div>
        <div><dt><MapPin aria-hidden="true" /> Sted</dt><dd>{event.place ?? "Sted ikke satt"}</dd></div>
        <div><dt><Trophy aria-hidden="true" /> Type</dt><dd>{eventKindLabels[event.kind]}</dd></div>
        <div><dt><LockKeyhole aria-hidden="true" /> Elevkalender</dt><dd>{event.lockedForStudent ? "Låst" : "Kan flyttes"}</dd></div>
      </dl>
      <div className={styles.lockedNote}>
        <CircleAlert aria-hidden="true" size={18} />
        Øktinnhold og kompetansemål vises ikke før fagmodellen er godkjent og B16 er koblet.
      </div>
    </section>
  );
}

function EmptyFeature({ icon: Icon, title, text }: { icon: typeof FlaskConical; title: string; text: string }) {
  return (
    <article className={styles.emptyFeature}>
      <span className={styles.iconTile}><Icon aria-hidden="true" /></span>
      <h2>{title}</h2>
      <p>{text}</p>
    </article>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className={styles.emptyState}>
      <Clock3 aria-hidden="true" size={22} />
      <div><strong>{title}</strong><span>{text}</span></div>
    </div>
  );
}
