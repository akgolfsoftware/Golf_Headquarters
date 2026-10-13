import Link from "next/link";
import {
  Activity,
  BarChart3,
  Building2,
  CalendarDays,
  Dumbbell,
  Flag,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  Luggage,
  MessageSquare,
  ShieldCheck,
  Trophy,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { hentWangRolledefinisjon, WANG_MODULES, type WangModuleId } from "@/lib/wang-supabase/roles";
import type { WangAuthenticatedProfile, WangStartMetric } from "@/lib/wang-supabase/types";

import { WangLoggUtKnapp } from "./WangLoggUtKnapp";
import styles from "./app.module.css";

const MODULE_ICONS: Record<WangModuleId, LucideIcon> = {
  overview: LayoutDashboard,
  schools: Building2,
  "school-overview": GraduationCap,
  sports: Trophy,
  workbench: CalendarDays,
  athletes: UsersRound,
  analysis: BarChart3,
  camps: Luggage,
  messages: MessageSquare,
  "my-week": CalendarDays,
  school: GraduationCap,
  "my-training": Dumbbell,
  competitions: Flag,
  calendar: CalendarDays,
  plans: Activity,
  contacts: UserRound,
};

export function WangRoleStart({
  profile,
  metrics,
  preview = false,
}: {
  profile: WangAuthenticatedProfile;
  metrics: WangStartMetric[];
  preview?: boolean;
}) {
  const role = hentWangRolledefinisjon(profile.role);

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar} aria-label="WANG-meny">
        <Link href="/team-wang/app" className={styles.brand}>
          <span className={styles.brandMark}>W</span>
          <span>
            <strong>WANG Toppidrett</strong>
            <small>{profile.schoolName ?? "Sentral oversikt"}</small>
          </span>
        </Link>

        <nav className={styles.navigation} aria-label={`Navigasjon for ${role.label}`}>
          {role.modules.map((moduleId) => {
            const moduleDefinition = WANG_MODULES[moduleId];
            const Icon = MODULE_ICONS[moduleId];
            if (moduleDefinition.href) {
              return (
                <Link
                  key={moduleId}
                  href={moduleDefinition.href}
                  className={moduleId === "overview" ? styles.navItemActive : styles.navItem}
                  aria-current={moduleId === "overview" ? "page" : undefined}
                >
                  <Icon size={18} aria-hidden />
                  <span>{moduleDefinition.label}</span>
                </Link>
              );
            }
            return (
              <div key={moduleId} className={styles.navItemPlanned} aria-disabled="true">
                <Icon size={18} aria-hidden />
                <span>{moduleDefinition.label}<small>Neste modul</small></span>
              </div>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.roleBadge}>{role.label}</span>
          <strong>{profile.displayName}</strong>
          {preview
            ? <Link href="/team-wang/demo" className={styles.previewBack}>Tilbake til Golf-demo</Link>
            : <WangLoggUtKnapp />}
        </div>
      </aside>

      <section className={styles.mainColumn}>
        <header className={styles.topbar}>
          <div>
            <span className={styles.eyebrow}>WANG Toppidrett Fredrikstad</span>
            <p>{role.label}</p>
          </div>
          <span className={styles.secureBadge}><ShieldCheck size={17} aria-hidden /> {preview ? "Fiktiv rollevisning" : "Rolle kontrollert"}</span>
        </header>

        <div className={styles.content}>
          <section className={styles.hero} aria-labelledby="wang-start-heading">
            <div>
              <span className={styles.eyebrow}>{profile.schoolName ?? "WANG sentralt"}</span>
              <h1 id="wang-start-heading">{role.heading}</h1>
              <p>{role.description}</p>
            </div>
            <div className={styles.privacyNotice}>
              <LockKeyhole size={20} aria-hidden />
              <p>{role.privacyNotice}</p>
            </div>
          </section>

          {preview ? (
            <p className={styles.previewNotice} role="note">
              Forhåndsvisning med fiktiv rolle og uten personopplysninger. Ingen tilgang er gitt.
            </p>
          ) : null}

          <section className={styles.metrics} aria-label="Status">
            {metrics.map((metric) => (
              <article key={metric.label} className={styles.metricCard}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.detail}</p>
              </article>
            ))}
          </section>

          <section className={styles.modulesSection} aria-labelledby="wang-modules-heading">
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>Din tilgang</span>
                <h2 id="wang-modules-heading">Moduler for {role.label.toLowerCase()}</h2>
              </div>
              <p>Aktive moduler kan åpnes. Resten er tydelig merket og gir ingen falsk handling.</p>
            </div>

            <div className={styles.moduleGrid}>
              {role.modules.map((moduleId) => {
                const moduleDefinition = WANG_MODULES[moduleId];
                const Icon = MODULE_ICONS[moduleId];
                const body = (
                  <>
                    <span className={styles.moduleIcon}><Icon size={21} aria-hidden /></span>
                    <div>
                      <strong>{moduleDefinition.label}</strong>
                      <p>{moduleDefinition.description}</p>
                    </div>
                    <span className={moduleDefinition.href ? styles.liveStatus : styles.plannedStatus}>
                      {moduleDefinition.href ? "Åpen" : "Neste modul"}
                    </span>
                  </>
                );
                return moduleDefinition.href ? (
                  <Link key={moduleId} href={moduleDefinition.href} className={styles.moduleCard}>
                    {body}
                  </Link>
                ) : (
                  <div key={moduleId} className={styles.moduleCardPlanned} aria-disabled="true">
                    {body}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
