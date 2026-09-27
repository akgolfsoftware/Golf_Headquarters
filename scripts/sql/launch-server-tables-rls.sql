-- Server-only tables: application reads/writes through Prisma using the postgres role.
-- No browser policies: deny direct anon/authenticated access, retain server access.
SET lock_timeout = '3s';
ALTER TABLE public.datagolf_tak ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.position_task_maal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tn_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tn_post_vedlegg ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tn_post_lesekvitteringer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kondisjon_segmenter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datagolf_tak_band ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_active_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drift_rutiner ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.putt_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.week_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_day_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_cases ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.putt_details FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.week_plans FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.test_days FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.test_day_participants FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.follow_up_cases FROM anon, authenticated;
