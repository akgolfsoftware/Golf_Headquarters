/**
 * Oppretter (eller reparerer) e2e-testspilleren `screentest@akgolf.test`.
 *
 * Hvorfor ikke `scripts/seed-screentest.ts`? Det scriptet går via Supabase Admin API og krever
 * SUPABASE_SERVICE_ROLE_KEY. Da denne testbrukeren måtte opprettes (kvalitetsaudit tiltak 9,
 * 2026-08-02) var den nøkkelen sensurert i `.env.local`, mens `DIRECT_URL` var intakt.
 * Dette scriptet gjør derfor jobben i ren SQL mot samme database: auth.users + auth.identities
 * (bcrypt via pgcrypto, samme hash-familie som GoTrue bruker) + en tom `User`-rad med rolle PLAYER.
 *
 * Det seeder IKKE demo-data — en tom spiller er riktig for en røyktest, fordi den også beviser at
 * tomtilstandene fungerer. Bruk `seed-screentest.ts` når du vil ha full demo-data og har nøkkelen.
 *
 * Kjør:  npx tsx scripts/opprett-e2e-testspiller-2026-08-02.ts
 * Krever: DIRECT_URL + SCREENTEST_PASSWORD i .env.local
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import pg from "pg";
import { randomUUID } from "node:crypto";

const EMAIL = "screentest@akgolf.test";
const NAME = "Øyvind Rohjan";
const PASSWORD = process.env.SCREENTEST_PASSWORD?.trim() ?? "";

async function main() {
  if (!PASSWORD) throw new Error("SCREENTEST_PASSWORD mangler i .env.local");
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler i .env.local");

  const c = new pg.Client({ connectionString: process.env.DIRECT_URL });
  await c.connect();

  try {
    await c.query("begin");

    const funnet = await c.query<{ id: string }>(
      "select id from auth.users where email = $1",
      [EMAIL],
    );

    let authId: string;
    if (funnet.rowCount) {
      authId = funnet.rows[0].id;
      await c.query(
        // NB: GoTrue feiler med «Database error querying schema» hvis disse token-feltene er
        // NULL i stedet for tom streng — derfor coalesce, ikke bare passord-resett.
        `update auth.users
           set encrypted_password = crypt($2, gen_salt('bf')),
               email_confirmed_at = coalesce(email_confirmed_at, now()),
               confirmation_token = coalesce(confirmation_token, ''),
               recovery_token = coalesce(recovery_token, ''),
               email_change_token_new = coalesce(email_change_token_new, ''),
               email_change = coalesce(email_change, ''),
               updated_at = now()
         where id = $1`,
        [authId, PASSWORD],
      );
      console.log(`Auth-bruker fantes — passord resatt: ${authId}`);
    } else {
      authId = randomUUID();
      await c.query(
        `insert into auth.users (
           instance_id, id, aud, role, email, encrypted_password,
           email_confirmed_at, created_at, updated_at,
           raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
           confirmation_token, recovery_token, email_change_token_new, email_change
         ) values (
           '00000000-0000-0000-0000-000000000000', $1, 'authenticated', 'authenticated', $2,
           crypt($3, gen_salt('bf')), now(), now(), now(),
           '{"provider":"email","providers":["email"]}'::jsonb, $4::jsonb, false, false,
           '', '', '', ''
         )`,
        [
          authId,
          EMAIL,
          PASSWORD,
          JSON.stringify({
            role: "PLAYER",
            tier: "PRO",
            firstName: "Øyvind",
            lastName: "Rohjan",
          }),
        ],
      );
      console.log(`Auth-bruker opprettet: ${authId}`);
    }

    // GoTrue krever en identity-rad for at e-post/passord-innlogging skal virke.
    await c.query(
      `insert into auth.identities (
         id, user_id, provider_id, provider, identity_data, created_at, updated_at, last_sign_in_at
       )
       select $1::uuid, $2::uuid, $2::text, 'email', $3::jsonb, now(), now(), null
       where not exists (
         select 1 from auth.identities where user_id = $2::uuid and provider = 'email'
       )`,
      [randomUUID(), authId, JSON.stringify({ sub: authId, email: EMAIL, email_verified: true })],
    );

    const bruker = await c.query<{ id: string }>(
      `insert into users (id, "authId", email, name, role, tier, hcp, "createdAt", "updatedAt")
         values (gen_random_uuid()::text, $1, $2, $3, 'PLAYER', 'PRO', 4.2, now(), now())
       on conflict (email) do update
         set "authId" = excluded."authId",
             name     = excluded.name,
             role     = excluded.role,
             "updatedAt" = now()
       returning id`,
      [authId, EMAIL, NAME],
    );
    console.log(`User-rad: ${bruker.rows[0].id} (${NAME}, rolle PLAYER)`);

    await c.query("commit");
    console.log(`\nFerdig. Logg inn med ${EMAIL} + SCREENTEST_PASSWORD.`);
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    await c.end();
  }
}

main().catch((e: Error) => {
  console.error("FEIL:", e.message);
  process.exit(1);
});
