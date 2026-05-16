# Rollback-prosedyre — AK Golf HQ

## Rask rollback (< 2 min)

### Vercel
1. Gå til vercel.com → akgolf-hq → Deployments
2. Finn siste fungerende deployment (grønn)
3. Klikk ... → "Redeploy" → bekreft

### Git
```bash
git log --oneline -10   # finn siste gode commit
git revert HEAD         # reverter siste commit
git push origin main
```

## Database rollback
1. Gå til Supabase → Database → Backups
2. Velg backup fra før problemet oppsto
3. Kontakt Supabase support for Point-in-time recovery

## Prisma migration rollback
```bash
npx prisma migrate resolve --rolled-back <migration-name>
```

## Kontaktpersoner ved krise
- Teknisk: akgolfgroup@gmail.com
- Supabase: support.supabase.com
- Vercel: vercel.com/help
