from pathlib import Path
import os,subprocess
# Bruk kun den isolerte kopien; les aldri prosjektets .env-filer her.
root=Path(__file__).resolve().parents[3]/'.worktrees/portering-kontroll-2026-09-10'
if any((root / name).exists() for name in ['.env', '.env.local', '.env.production', '.env.production.local']):
    raise SystemExit('Kontrollkopien skal ikke inneholde miljøfiler.')
env={k:os.environ[k] for k in ['PATH','HOME','TMPDIR','LANG','USER','SHELL'] if k in os.environ}
env.update({'DATABASE_URL':'postgresql://dummy:dummy@127.0.0.1:1/dummy','DIRECT_URL':'postgresql://dummy:dummy@127.0.0.1:1/dummy','NEXT_PUBLIC_SUPABASE_URL':'https://dummy.supabase.co','NEXT_PUBLIC_SUPABASE_ANON_KEY':'dummy','ANTHROPIC_API_KEY':'dummy','STRIPE_SECRET_KEY':'sk_test_dummy','STRIPE_WEBHOOK_SECRET':'whsec_dummy','NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY':'pk_test_dummy','STRIPE_PRICE_ID_PRO':'price_dummy','CRON_SECRET':'dummy','NODE_OPTIONS':'--max-old-space-size=8192','NEXT_TELEMETRY_DISABLED':'1'})
env['VEDLIKEHOLD']='0'
env['SUPABASE_SERVICE_ROLE_KEY']='dummy-local-test-only'
subprocess.run(['npm','start','--','-H','127.0.0.1','-p','5452'],cwd=root,env=env,check=True)
