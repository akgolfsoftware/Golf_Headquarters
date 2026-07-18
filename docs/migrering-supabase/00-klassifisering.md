# Tabellklassifisering — AK Golf HQ migrering (2026-07-18)

Kilde: pg_stat_user_tables mot `eljkjqvggsmnbbszzbpj` + eierskaps-kolonnesjekk.
160 public-tabeller totalt. Skjema (DDL) gjenskapes for ALLE tabeller —
klassifiseringen gjelder kun DATA.

## BEHOLD — innholdsbibliotek/konfig (data kopieres, ~2 286 rader)

| Tabell | Rader | Remap |
|---|---|---|
| baner | 38 | — |
| course_definitions | 9 | — |
| course_holes | 71 | — |
| competence_goals | 26 | — |
| design_koblinger | 47 | — |
| email_templates | 9 | — |
| exercise_definitions | 931 | createdBy → ny admin |
| facilities | 18 | — |
| locations | 4 | — |
| plan_templates | 93 | byCoachId → ny coach |
| plan_template_sessions | 874 | — (FK til plan_templates) |
| position_tasks | 15 | — |
| position_task_tm_goals | 16 | — |
| service_types | 20 | coachUserId → ny coach |
| test_definitions | 36 | createdById → ny admin |
| training_drills_v2 | 42 | — |
| groups | 9 | coachId → ny coach |
| group_schedules | 14 | — (FK til groups) |
| group_period_blocks | 1 | — (FK til groups) |
| coach_availability | 13 | coachId → ny coach |

Lasterekkefølge (FK): Anders' nye kontoer FØRST, deretter locations/facilities/
baner/course_definitions → course_holes → resten → til slutt FK-avhengige
(plan_template_sessions, group_*, course_holes).

## KAST — data gjenskapes ikke (skjema beholdes)

- **Brukere/auth-koblet:** users (68), player_enrollments, parent_invitations,
  parent_relations, friendships, achievements (userId), documents (userId),
  equipment_bags, club_settings, clubs_practiced, goals, push_subscriptions,
  google_calendar_connections, google_calendar_subscriptions (stale watch-kanaler),
  notion_connections + notion_database_links (re-bootstrappes fra
  NOTION_INTERNAL_TOKEN automatisk), api_keys, data_export_requests
- **Test-forretningsdata:** payments (2205 — én testbruker), subscriptions (31),
  bookings (29), session_requests, coaching_sessions, leads, leaves, invoices-rel.
- **Trenings-/spillerdata (test):** rounds, hole_scores, shots, shot_annotations,
  trackman_sessions/shots, test_results, test_sessions, test_assignments,
  training_logs, training_plans, training_plan_sessions (329),
  training_plan_session_logs, training_sessions_v2, session_drills (128),
  session_* (alle), drill_logs_v2, drill_challenges, challenge_participants,
  health_entries (124), bruker_sg_inputs, bruker_sammenligninger,
  fysiske_planer + fys_uker + fys_okter + fys_ovelse_rader (FYS-kjede, userId på
  toppen; FYS-formel avventer uansett), season_plans, period_blocks,
  training_periods, technical_plans-kjeden (userId), talent_tracking,
  player_swing_videos, swing_analyses, gameplan_*, tournament_entries,
  tournament_preparations, tournament_results, marketing_posts, moderation_cases,
  message_attachments, caddie_* (conversations/drafts/messages), innboks_epost,
  page_approvals, coach_notes, coach_drill_directiv, coach_fokus_pins,
  coach_pinned_players, best_session_references, conditional_rules,
  facility_prefs, invariant_overrides, locked_anchors, kommando_* (alle 0),
  okt_maler, okt_mal_driller, drill_maler, plan_actions (436), plan_adjustments,
  plan_change_requests, plan_effectiveness, plan_sessions, plan_suggestions,
  period_recipe_okter, period_volume_recipes, periode_fordelinger,
  recurring_patterns, school_schedule_entries, calendar_events, hole_scores,
  ai_plan_generations, app_feedback, questions, talent_ressurser
- **Synket/beregnet (cron regenererer):** public_players (6244),
  public_player_entries (23084), public_player_rounds (18046), tournaments (2218),
  pga_player_seasons (1359), pga_approach_distance, pga_putt_distance,
  wagr_snapshots, club_metric_trends, sg_insights, sg_baselines,
  leaderboard_snapshots, monthly_reports, datagolf_sync_state (skjema beholdes!),
  oppgave_cache, prosjekt_cache
- **Logger:** agent_runs (3775), audit_logs, error_logs, notifications, signals,
  webhook_failures
- **System:** _prisma_migrations (ny baseline skrives i stedet)

## Skjema-fakta (målt)
- 64 enums · 0 egne funksjoner (alle 219 var pg_trgm/btree_gist) · 0 views ·
  0 egne triggere · 99 RLS-policyer · installerte extensions: pgcrypto, uuid-ossp,
  pg_trgm (public), btree_gist (public), supabase_vault, pg_stat_statements
- Realtime-publikasjon: kun `dashboard.test_competition_results` (dashboard-testtabell,
  IKKE app — gjenskapes ikke)
- Ingen pg_cron-jobber, ingen DB-webhooks, 0 edge functions

## Bucket-konfig (gjenskapes eksakt — fanget 2026-07-18)
| Bucket | Public | Size limit | MIME |
|---|---|---|---|
| avatars | ja | 2 MB | jpeg/png/webp |
| club-logos | ja | 1 MB | jpeg/png/webp/svg |
| coach-avatars | ja | 2 MB | jpeg/png/webp |
| coaching-recordings | nei | — | alle |
| coaching-videos | nei | 500 MB | mp4/quicktime/webm |
| drill-thumbnails | ja | 5 MB | jpeg/png/webp/svg |
| invoices | nei | 10 MB | pdf |
| message-attachments | nei | 10 MB | jpeg/png/webp/pdf/lyd |
| player-avatars | ja | 2 MB | jpeg/png/webp |
| player-swing-videos | nei | 50 MB | mp4/quicktime/webm |
| recordings | nei | 50 MB | lyd+video |
| reports | nei | 10 MB | pdf |
| task-media | ja | 50 MB | jpeg/png/webp/mp4/quicktime |

## Auth-innstillinger å gjenskape (fra /auth/v1/settings 2026-07-18)
- E-post-provider PÅ, signup ÅPEN (disable_signup=false)
- E-postbekreftelse PÅKREVD (mailer_autoconfirm=false)
- Google/alle andre OAuth: AV i dag → Google skal PÅ i nytt prosjekt (Fase 6)
- SMS: twilio konfigurert som provider men phone-login AV → ikke gjenskap
- SAML AV, passkeys AV, anonyme brukere AV
- SJEKK i nytt prosjekt: SMTP (custom eller Supabase-default?), auth-e-postmaler
  (norske?), passordpolicy, JWT expiry — ikke lesbart via API herfra; Anders
  sjekker mot nytt prosjekt-defaults i Fase 6
