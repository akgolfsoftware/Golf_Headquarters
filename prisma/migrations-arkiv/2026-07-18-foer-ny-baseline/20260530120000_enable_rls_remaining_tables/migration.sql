-- Enable RLS on 22 tables added after 20260523090400_enable_rls_all_tables
-- (created by the 0524–0526 migrations: fys_plan, push_subscription,
--  session_participant/coach_note, player_enrollment, pga_*, sg_sammenligning,
--  bane_modell, page_approval, training_camp, facility_prefs, plan_session,
--  design_koblinger). These were never covered by ENABLE RLS, so anon/
--  authenticated had full PostgREST read access (security advisor lint
--  0013_rls_disabled_in_public — ERROR).
--
-- Same model as enable_rls_all_tables: service-role-key (used by Prisma
-- server-actions) bypasses RLS automatically; anon/authenticated get DENY by
-- default. The app never reads these tables via the Supabase client (only
-- Prisma + Storage), so deny-all does not affect any app flow.
--
-- ENABLE ROW LEVEL SECURITY is idempotent (no error if already enabled).

-- Sensitive user/coach data (was fully exposed) -------------------------------
ALTER TABLE public.coach_notes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bruker_sg_inputs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bruker_sammenligninger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_enrollments     ENABLE ROW LEVEL SECURITY;

-- Plan / training data --------------------------------------------------------
ALTER TABLE public.plan_sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fysiske_planer         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fys_uker               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fys_okter              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fys_ovelse_rader       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_camps         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_prefs         ENABLE ROW LEVEL SECURITY;

-- Public-facing reference data (served via Prisma, never via anon client) ------
ALTER TABLE public.baner                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_players         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_player_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_snapshots  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pga_player_seasons     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pga_putt_distance      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pga_approach_distance  ENABLE ROW LEVEL SECURITY;

-- Internal / admin tooling ----------------------------------------------------
ALTER TABLE public.page_approvals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_koblinger       ENABLE ROW LEVEL SECURITY;
