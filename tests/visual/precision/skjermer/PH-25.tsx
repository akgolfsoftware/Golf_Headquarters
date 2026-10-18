/** Syntetisk abonnement. Ingen betaling, kortopplysninger eller faktisk bruker. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Abonnement } from "@/components/portal/precision/PH25Abonnement";
import { PH25_PLANER, type PH25AbonnementData } from "@/lib/portal-abonnement/ph25-abonnement-data";
export const sti = "/portal/meg/abonnement";
const base: PH25AbonnementData = { current: { plan: "FULL", period: "mnd", renews: "26.10.2026", ends: "26.10.2026", cancelled: false }, plans: PH25_PLANER, card: null, invoices: [], samtykker: { coach: false, data: false }, varsler: { plan: false, meld: false, turn: false, digest: false, caddie: false }, sikkerhet: { tofaktor: false, telefonMaskert: "—", sidenDato: "—" }, hjelp: [] };
const Vis = (data: PH25AbonnementData) => <PlayerHQSkall innboksHref="#" uleste={0}><PH25Abonnement initialData={data} /></PlayerHQSkall>;
export const tilstander = { full: Vis(base), gratis: Vis({ ...base, current: { ...base.current, plan: "TALENT", renews: "—", ends: "—" } }), avsluttet: Vis({ ...base, current: { ...base.current, cancelled: true } }) };
