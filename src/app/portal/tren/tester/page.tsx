/**
 * PH14Hub — PlayerHQ tester-hub i PlayerHQSkall.
 * Flat liste gruppert GOLFSLAG/TEKNIKK, samme loadTesterScreen.
 * Detalj, ny test og Team Norway-siden er ikke med.
 * Tegningen ui_kits/playerhq/screens/PH-14.jsx ligger ikke i git.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, RefreshCw } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { loadTesterScreen, type TestRow } from "@/lib/portal-tester/tester-data";
import { hubGruppeForNavn, formatHubVerdi, HUB_GRUPPE_LABEL, HUB_GRUPPE_REKKEFOLGE, type HubGruppe } from "@/lib/portal-tester/hub-gruppe";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { Ikon, TomTilstand } from "@/components/precision/pa";

export const dynamic = "force-dynamic";

export default async function TesterHubPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [screen, ulest] = await Promise.all([
    loadTesterScreen({ id: user.id, name: user.name, hcp: user.hcp, tier: user.tier }),
    getUnreadNotifications(user.id, 1),
  ]);

  const alleRader = screen.groups.flatMap((g) => g.rows);
  const grupper = new Map<HubGruppe, TestRow[]>();
  for (const gruppe of HUB_GRUPPE_REKKEFOLGE) grupper.set(gruppe, []);
  for (const rad of alleRader) {
    const gruppe = rad.hubGruppe ?? hubGruppeForNavn(rad.name);
    grupper.get(gruppe)!.push(rad);
  }

  const forfallerAntall = alleRader.filter((r) => r.forfallDato != null).length;
  const forfallTekst = forfallerAntall === 0 ? "Ingen forfaller" : forfallerAntall === 1 ? "1 forfaller" : `${forfallerAntall} forfaller`;

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side ph14-hub">
        <header className="ph14-hode">
          <p className="ph14-kicker">Analyse · satt av Anders</p>
          <h1>Tester</h1>
          <Link href="/portal/tren/tester/team-norway">Team Norway · oppdaterte scorekort</Link>
          <p className="ph14-meta">{forfallTekst}</p>
        </header>

        {screen.totalTests === 0 ? (
          <TomTilstand
            icon={ClipboardList}
            title="Ingen tester i batteriet ditt ennå"
            text="Testene avtaler du med Anders i Workbench — legg dem inn som vanlige økter der, sammen med resten av planen din."
            actions={
              <Link href="/portal/planlegge/workbench" data-od-id="tester-tom-workbench" className="pa-btn pa-btn--primary pa-btn--full">
                Åpne Workbench
              </Link>
            }
          />
        ) : (
          <>
            {HUB_GRUPPE_REKKEFOLGE.map((gruppe) => {
              const rader = grupper.get(gruppe)!;
              if (rader.length === 0) return null;
              return (
                <section key={gruppe} className="ph14-gruppe">
                  <p className="ph14-kicker">{HUB_GRUPPE_LABEL[gruppe]}</p>
                  <div>
                    {rader.map((r) => (
                      <TesterRad key={r.id} r={r} />
                    ))}
                  </div>
                </section>
              );
            })}
            <Link href="/portal/tren/tester/ny/egen" data-od-id="tester-ny-egen" className="pa-btn pa-btn--secondary pa-btn--full ph14-egen">
              + egen test
            </Link>
            <p className="ph14-sync">
              <Ikon icon={RefreshCw} size={16} name="refresh-cw" />
              <span>
                Nye tester planlegges i Workbench, sammen med Anders — som vanlige økter. Hvert
                logget resultat oppdaterer talentprofilen din automatisk.
              </span>
            </p>
          </>
        )}
      </div>
    </PlayerHQSkall>
  );
}

function TesterRad({ r }: { r: TestRow }) {
  const verdi = r.attempts > 0 ? formatHubVerdi({ scoringKind: r.scoringKind, latestRaw: r.latestRaw, shotsCount: r.shotsCount }) : "—";
  const capsTekst = r.forfallDato ? (r.attempts > 0 ? `FORFALL ${r.forfallDato}` : `PLANLAGT ${r.forfallDato}`) : null;

  return (
    <Link href={r.href} data-od-id={`tester-hub-rad-${r.id}`} className="ph14-rad">
      <span>
        <strong>{r.name}</strong>
        <small>{r.rule}</small>
      </span>
      <span>
        <strong>{verdi}</strong>
        {capsTekst && <small>{capsTekst}</small>}
      </span>
    </Link>
  );
}
