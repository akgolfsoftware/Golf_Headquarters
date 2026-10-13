/** Faktiske coachkomponenter, utelukkende syntetiske data. Ingen API-handlinger utføres. */
import type { ReactNode } from "react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { CoachContent } from "@/components/admin/precision/agency-completion/CoachContent";
import { CoachProfile } from "@/components/admin/precision/agency-completion/CoachProfile";
import { CoachLoading, CoachError } from "@/components/admin/precision/agency-completion/CoachRouteState";
import { AG23Oppsett } from "@/components/admin/precision/AG23Oppsett";
import { AdminKalenderSynkTrainLock } from "@/components/admin/v2/oppsett/AdminKalenderSynkTrainLock";
import { AdminApiKeysTrainLock } from "@/components/admin/v2/oppsett/AdminApiKeysTrainLock";
import { AnalyseHode } from "@/components/admin/v2/analyse/AnalyseHode";
import { InnsiktHubV2 } from "@/components/admin/v2/InnsiktHubV2";
import { InnsiktStallV2 } from "@/components/admin/v2/InnsiktStallV2";
import { AdminBookingDetaljV2 } from "@/components/admin/v2/AdminBookingDetaljV2";
import { NyBookingWizard } from "@/components/admin/bookinger/ny-booking-wizard";
import { HendelseForm } from "@/app/admin/kalender/hendelse/ny/hendelse-form";
import { AdminInviterCoachTrainLock } from "@/components/admin/v2/oppsett/AdminInviterCoachTrainLock";
import { AdminEksternLeserTrainLock } from "@/components/admin/v2/oppsett/AdminEksternLeserTrainLock";
import { PeriodeNavnV2 } from "@/components/admin/v2/PeriodeNavnV2";
import { PERIODE_NAVN_LABELS } from "@/app/admin/settings/periode-navn/labels";
import { SideHode } from "@/components/precision/pa-a4";
import { ANALYSE_FANER } from "@/lib/admin/analyse/faner";
export const sti = "/admin/oppsett";
function Vis({ children }: { children: ReactNode }) { return <AdminRolleProvider erAdmin><AgencyOSSkall navn="Testcoach"><CoachContent>{children}</CoachContent></AgencyOSSkall></AdminRolleProvider>; }
const kategorier = [{ key: "ott", label: "Tee", verdi: "−0,4", pct: 40, negativ: true }, { key: "app", label: "Innspill", verdi: "+0,2", pct: 20, negativ: false }, { key: "arg", label: "Nærspill", verdi: "−0,2", pct: 20, negativ: true }, { key: "putt", label: "Putting", verdi: "+0,1", pct: 10, negativ: false }];
const fane = [{ href: "/admin/oppsett?fane=kalender", navn: "Kalender", aktiv: true }, { href: "/admin/oppsett?fane=sikkerhet", navn: "Sikkerhet", aktiv: false }, { href: "/admin/oppsett?fane=perioder", navn: "Perioder", aktiv: false }];
export const tilstander = {
  perioderTom: <Vis><AG23Oppsett faner={fane.map(f => ({...f, aktiv: f.navn === "Perioder"}))}><PeriodeNavnV2 somFane oversikt={{ lagrede: [], ukjente: [] }} typer={PERIODE_NAVN_LABELS} /></AG23Oppsett></Vis>,
  perioder: <Vis><AG23Oppsett faner={fane.map(f => ({...f, aktiv: f.navn === "Perioder"}))}><PeriodeNavnV2 somFane oversikt={{ lagrede: [], ukjente: ["Syntetisk grunnperiode"] }} typer={PERIODE_NAVN_LABELS} /></AG23Oppsett></Vis>,
  inviter: <Vis><AdminInviterCoachTrainLock kanTildeleTilganger /></Vis>,
  eksternTom: <Vis><AdminEksternLeserTrainLock grupper={[]} lesere={[]} /></Vis>,
  ekstern: <Vis><AdminEksternLeserTrainLock grupper={[{id:"syntetisk-gruppe", name:"Testgruppe"}]} lesere={[{id:"syntetisk-leser", navn:"Testleser", epost:"leser@example.test", grupper:["Testgruppe"]}]} /></Vis>,
  profil: <Vis><SideHode title="Min coachprofil" sub="Kontaktinformasjon og profesjonell profil." /><CoachProfile data={{ navn: "Testcoach", epost: "coach@example.test", phone: null, homeClub: "Testklubb", hcp: null, bio: "", certifications: [], languages: ["Norsk"], clubs: [], avatarUrl: null, rolleLabel: "Coach", opprettetLabel: "1. oktober 2026" }} /></Vis>,
  kalenderTom: <Vis><AG23Oppsett faner={fane}><AdminKalenderSynkTrainLock somFane data={{ connection: null, subscriptions: [], okParam: false, errorParam: null }} /></AG23Oppsett></Vis>,
  kalenderFeil: <Vis><AG23Oppsett faner={fane}><AdminKalenderSynkTrainLock somFane data={{ connection: null, subscriptions: [], okParam: false, errorParam: "Tilgangen kunne ikke bekreftes" }} /></AG23Oppsett></Vis>,
  apiTom: <Vis><AdminApiKeysTrainLock somFane data={{ nokler: [], aktiveCount: 0, totalCount: 0 }} /></Vis>,
  innsikt: <Vis><AnalyseHode faner={ANALYSE_FANER} aktiv="stall" antall={{ stall: 3, spiller: 3 }} /><InnsiktHubV2 somFane data={{ nSpillere: 3, periodeLabel: "Siste fire uker", sgSnitt: "−0,3", okterDenneUken: 4, udekket: 1, trackmanOkter: 2, kategorier, harKategoriData: true, lekkasjeTekst: "Tre syntetiske spillere · registrerte runder" }} /></Vis>,
  innsiktTom: <Vis><AnalyseHode faner={ANALYSE_FANER} aktiv="stall" antall={{ stall: 0, spiller: 0 }} /><InnsiktHubV2 somFane data={{ nSpillere: 0, periodeLabel: "Siste fire uker", sgSnitt: "—", okterDenneUken: 0, udekket: 0, trackmanOkter: 0, kategorier: [], harKategoriData: false, lekkasjeTekst: null }} /></Vis>,
  trend: <Vis><AnalyseHode faner={ANALYSE_FANER} aktiv="stall" antall={{ stall: 3 }} /><InnsiktStallV2 somFane data={{ ukenummer: 42, sgUke: "−0,3", nSpillere: 3, kategorier, harKategoriData: true, innsiktTekst: "Syntetiske runder for skjermkontroll", trend: [-0.4,-0.2,0.1,-0.3], harTrend: true }} /></Vis>,
  booking: <Vis><AdminBookingDetaljV2 data={{ tjeneste: "Coaching · 60 minutter", status: "CONFIRMED", spiller: { id: "test-spiller", navn: "Testspiller" }, gjest: null, coachNavn: "Testcoach", dato: "13. oktober 2026", tid: "14.00–15.00", sted: "Testanlegg", pris: "900 kr", notat: "Syntetisk booking for designkontroll", opprettet: "12. oktober 2026" }} /></Vis>,
  bookingNy: <Vis><NyBookingWizard defaultStart="2026-10-13T14:00:00+02:00" spillere={[{ id: "test-spiller", name: "Testspiller", email: "spiller@example.test", homeClub: "Testklubb" }]} tjenester={[{ id: "test-tjeneste", name: "Coaching", durationMin: 60, priceOre: 90000 }]} lokasjoner={[{ id: "test-anlegg", name: "Testanlegg", address: "Testadresse", facilities: [] }]} /></Vis>,
  bookingTom: <Vis><NyBookingWizard spillere={[]} tjenester={[]} lokasjoner={[]} /></Vis>,
  hendelse: <Vis><SideHode title="Ny hendelse" sub="Reserver tid i coachkalenderen." /><HendelseForm startDato="2026-10-13" startKlokkeslett="14:00" /></Vis>,
  laster: <AdminRolleProvider erAdmin><CoachLoading text="Henter oppsett …" /></AdminRolleProvider>,
  feil: <AdminRolleProvider erAdmin><CoachError reset={() => {}} title="Oppsettet kunne ikke hentes" href="/admin/agencyos" /></AdminRolleProvider>,
};
