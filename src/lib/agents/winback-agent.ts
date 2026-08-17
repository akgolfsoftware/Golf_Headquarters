/**
 * Winback-agenten (plan A4): sender vinn-tilbake-tilbudet når en spiller sier
 * opp coaching-pakken — «behold PlayerHQ for 299 kr/mnd eller 2 690 kr/år».
 *
 * Kjøres daglig (cron). Tre trinn, alle idempotente:
 *   1. TILBUDT uten sendtAt → tilbuds-e-post + in-app-varsel + coach-varsel.
 *   2. TILBUDT med utlopsDato < 7 dager frem og uten påminnelse → påminnelse.
 *   3. TILBUDT med passert utlopsDato → status UTLOPT.
 *
 * Regler (mønster fra betalings-purring):
 * - Mindreårig spiller: e-post går til godkjent foresatt — ALDRI barnet.
 *   Uten foresatt-e-post sendes kun in-app-varsel.
 * - E-postmal: EmailTemplate-slug «vinn-tilbake-playerhq» ({{name}},
 *   {{utlopsDato}}) — opprettes med standardtekst ved første kjøring,
 *   redigerbar i admin. Lenken går ALLTID til tilbudssiden i appen
 *   (/portal/meg/abonnement/fortsett) — aldri rå checkout-URL i e-post.
 * - Utsendelsen er automatisk (Anders 2026-08-16) — coach varsles med
 *   notify, ingen godkjenningskø.
 */

import { prisma } from "@/lib/prisma";
import { resendKlient, FRA_EPOST } from "@/lib/email";
import { isMinor } from "@/lib/auth/minor";
import { notify } from "@/lib/notifications";
import { runAgent } from "./agent-runner";

// Filnavnet er kanonisk agentnavn i loggen — cron-sluggen «winback-oppfolging»
// er en alias i ruten, ikke navnet i AgentRun.
const AGENT_NAME = "winback-agent";
const MAL_SLUG = "vinn-tilbake-playerhq";
const PAAMINNELSE_DAGER = 7;

const STANDARD_MAL = {
  subject: "Behold PlayerHQ etter coaching-pakken",
  body: `Hei {{name}},

Coaching-pakken din hos AK Golf Academy avsluttes {{utlopsDato}}. Treningsplanen, statistikken og historikken din i PlayerHQ ligger klar til deg videre.

Fortsett med PlayerHQ for 299 kr/mnd — eller betal 2 690 kr for et helt år og få tre måneder gratis (du sparer 898 kr).

Velg på abonnementssiden din i appen. Abonnementet starter først når coaching-perioden din utløper, så du betaler aldri dobbelt.`,
} as const;

const APP_URL = (process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf.no").replace(/\/$/, "");

async function hentEllerOpprettMal() {
  const eksisterende = await prisma.emailTemplate.findUnique({ where: { slug: MAL_SLUG } });
  if (eksisterende) return eksisterende;
  return prisma.emailTemplate.create({
    data: {
      slug: MAL_SLUG,
      name: "Vinn tilbake: PlayerHQ etter coaching (auto, A4)",
      subject: STANDARD_MAL.subject,
      body: STANDARD_MAL.body,
    },
  });
}

function fyll(mal: string, verdier: Record<string, string>): string {
  return Object.entries(verdier).reduce(
    (s, [k, v]) => s.replaceAll(`{{${k}}}`, v),
    mal,
  );
}

type WinbackOpts = {
  /** Test-modus: hopp over Resend-utsendelse (alt annet kjører som normalt). */
  dryRunEpost?: boolean;
};

type WinbackResultat = { sendt: number; paaminnet: number; utlopt: number; hoppet: number; feilet: number };

/** Logger kjøringen til AgentRun (maskinrommet) — logikken er uendret. */
export async function runWinbackAgent(opts?: WinbackOpts): Promise<WinbackResultat> {
  let resultat!: WinbackResultat;
  await runAgent(AGENT_NAME, null, async () => {
    resultat = await winbackKjerne(opts);
    return { output: resultat };
  });
  return resultat;
}

async function winbackKjerne(opts?: WinbackOpts): Promise<WinbackResultat> {
  const now = new Date();
  const resultat = { sendt: 0, paaminnet: 0, utlopt: 0, hoppet: 0, feilet: 0 };
  const mal = await hentEllerOpprettMal();

  const osloDato = (d: Date | null) =>
    d
      ? d.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Oslo" })
      : "ved periodens slutt";

  // ── 3. Utløpte tilbud først (billig, rydder køen) ────────────────────────
  const utlopt = await prisma.winbackTilbud.updateMany({
    where: { status: "TILBUDT", utlopsDato: { not: null, lt: now } },
    data: { status: "UTLOPT" },
  });
  resultat.utlopt = utlopt.count;

  // ── 1+2. Utsendelse og påminnelse ────────────────────────────────────────
  const tilbud = await prisma.winbackTilbud.findMany({
    where: { status: "TILBUDT" },
    take: 100,
    orderBy: { createdAt: "asc" },
  });

  for (const t of tilbud) {
    try {
      const bruker = await prisma.user.findUnique({
        where: { id: t.userId },
        select: {
          id: true,
          name: true,
          email: true,
          dateOfBirth: true,
          deletedAt: true,
          // Coach-varselet går til nyeste aktive enrollment-coach. (G2 innfører
          // User.primaryCoachId + felles resolver — G4 kobler agenten dit.)
          enrollmentsAsPlayer: {
            where: { endedAt: null, coachId: { not: null } },
            orderBy: { enrolledAt: "desc" },
            select: { coachId: true },
            take: 1,
          },
          parentRelations: {
            where: { approved: true },
            select: { parent: { select: { name: true, email: true } } },
            take: 1,
          },
        },
      });
      if (!bruker || bruker.deletedAt) {
        resultat.hoppet++;
        continue;
      }

      const erPaaminnelse = t.sendtAt != null;
      if (erPaaminnelse) {
        const skalPaaminnes =
          t.paaminnelseSendtAt == null &&
          t.utlopsDato != null &&
          t.utlopsDato.getTime() - now.getTime() < PAAMINNELSE_DAGER * 86_400_000;
        if (!skalPaaminnes) {
          resultat.hoppet++;
          continue;
        }
      }

      // Mottaker: mindreårig → godkjent foresatt, aldri barnet.
      const foresatt = bruker.parentRelations[0]?.parent;
      const mindreaarig = isMinor(bruker.dateOfBirth);
      const mottakerEpost = mindreaarig ? (foresatt?.email ?? null) : bruker.email;

      const verdier = {
        name: bruker.name ?? "spiller",
        utlopsDato: osloDato(t.utlopsDato),
      };

      if (mottakerEpost && !opts?.dryRunEpost) {
        await resendKlient().emails.send({
          from: FRA_EPOST,
          to: mottakerEpost,
          subject: erPaaminnelse ? `Påminnelse: ${fyll(mal.subject, verdier)}` : fyll(mal.subject, verdier),
          text: `${fyll(mal.body, verdier)}\n\nSe tilbudet: ${APP_URL}/portal/meg/abonnement/fortsett`,
        });
      }

      // In-app-varsel til spilleren (alltid — også når e-post mangler mottaker).
      await notify({
        userId: bruker.id,
        type: "system",
        title: erPaaminnelse ? "Påminnelse: behold PlayerHQ" : "Behold PlayerHQ",
        body: `Coaching-pakken avsluttes ${verdier.utlopsDato}. Fortsett med PlayerHQ for 299 kr/mnd eller 2 690 kr/år (tre måneder gratis).`,
        link: "/portal/meg/abonnement/fortsett",
      }).catch(() => undefined);

      if (erPaaminnelse) {
        await prisma.winbackTilbud.update({
          where: { id: t.id },
          data: { paaminnelseSendtAt: now },
        });
        resultat.paaminnet++;
      } else {
        // Coach-varsel kun ved første utsendelse.
        const coachId = bruker.enrollmentsAsPlayer[0]?.coachId ?? null;
        if (coachId) {
          await notify({
            userId: coachId,
            type: "system",
            title: "Coaching-oppsigelse: vinn-tilbake sendt",
            body: `${bruker.name ?? "En spiller"} har sagt opp coaching-pakken. Tilbud om å beholde PlayerHQ er sendt automatisk.`,
            link: `/admin/spillere/${bruker.id}`,
          }).catch(() => undefined);
        }
        await prisma.winbackTilbud.update({
          where: { id: t.id },
          data: { sendtAt: now },
        });
        resultat.sendt++;
      }
    } catch (err) {
      console.error("[winback-agent] feilet for tilbud", t.id, err);
      resultat.feilet++;
    }
  }

  return resultat;
}
