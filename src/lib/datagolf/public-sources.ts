import type { Prisma } from '@/generated/prisma/client';
export const PUBLIC_TOURNAMENT_SOURCES = ['NGF','GJGT','GOLFBOX','WAGR','VAGR','NCAA','MANUAL','REGIONTOUR','SRIXON','NORGESCUP','OLYO','NARVESEN','OSTLANDS','MIDAM','SENIOR','NM'] as const;
export function publicTournamentSourceWhere(): Prisma.TournamentWhereInput { return { sourceOrigin: { in: [...PUBLIC_TOURNAMENT_SOURCES] } }; }
export function publicEntrySourceWhere(): Prisma.PublicPlayerEntryWhereInput { return { tournament: publicTournamentSourceWhere() }; }
export function publicRoundSourceWhere(): Prisma.PublicPlayerRoundWhereInput { return { source: { in: ['NGF','GJGT','GOLFBOX','WAGR','VAGR','NCAA','MANUAL','PLAYERHQ','GJGT-entry'] } }; }
/** Current PgaPlayerSeason producer is exclusively DG; no independently permitted public source is registered. */
export function publicPgaSourceWhere(): Prisma.PgaPlayerSeasonWhereInput { return { source: { in: [] } }; }
