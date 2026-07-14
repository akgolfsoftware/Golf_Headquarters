/**
 * Supabase Storage — bucket-konstanter.
 *
 * Sentral kilde for alle bucket-navn vi bruker. Bruk disse konstantene
 * i stedet for hardkodede strenger. Hvis du legger til en ny bucket:
 *
 * 1. Legg navnet inn her.
 * 2. Marker som offentlig (`PUBLIC_BUCKETS`) eller la den være privat.
 * 3. Sett en `MAX_FILE_SIZES`-grense.
 * 4. Kjør `npx tsx scripts/create-storage-buckets.ts` for å opprette i Supabase.
 */

export const STORAGE_BUCKETS = {
  PLAYER_AVATARS: "player-avatars",
  COACH_AVATARS: "coach-avatars",
  DRILL_THUMBNAILS: "drill-thumbnails",
  CLUB_LOGOS: "club-logos",
  SESSION_RECORDINGS: "recordings", // privat
  INVOICES: "invoices", // privat
  REPORTS: "reports", // privat
  PLAYER_SWING_VIDEOS: "player-swing-videos", // privat
  MESSAGE_ATTACHMENTS: "message-attachments", // privat
  TASK_MEDIA: "task-media",
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

// Offentlige buckets — Supabase serverer signert URL for privat innhold,
// men disse buckets eksponerer public URLs (avatars, logoer, miniatyrer).
export const PUBLIC_BUCKETS: readonly StorageBucket[] = [
  STORAGE_BUCKETS.PLAYER_AVATARS,
  STORAGE_BUCKETS.COACH_AVATARS,
  STORAGE_BUCKETS.DRILL_THUMBNAILS,
  STORAGE_BUCKETS.CLUB_LOGOS,
  STORAGE_BUCKETS.TASK_MEDIA,
];

// Maksimum filstørrelse per bucket (bytes).
export const MAX_FILE_SIZES: Record<StorageBucket, number> = {
  [STORAGE_BUCKETS.PLAYER_AVATARS]: 2 * 1024 * 1024, // 2 MB
  [STORAGE_BUCKETS.COACH_AVATARS]: 2 * 1024 * 1024, // 2 MB
  [STORAGE_BUCKETS.DRILL_THUMBNAILS]: 5 * 1024 * 1024, // 5 MB
  [STORAGE_BUCKETS.CLUB_LOGOS]: 1 * 1024 * 1024, // 1 MB
  [STORAGE_BUCKETS.SESSION_RECORDINGS]: 50 * 1024 * 1024, // 50 MB (Supabase tier-limit)
  [STORAGE_BUCKETS.INVOICES]: 10 * 1024 * 1024, // 10 MB
  [STORAGE_BUCKETS.REPORTS]: 10 * 1024 * 1024, // 10 MB
  [STORAGE_BUCKETS.PLAYER_SWING_VIDEOS]: 50 * 1024 * 1024, // 50 MB (Supabase tier-limit)
  [STORAGE_BUCKETS.MESSAGE_ATTACHMENTS]: 10 * 1024 * 1024, // 10 MB
  [STORAGE_BUCKETS.TASK_MEDIA]: 50 * 1024 * 1024, // 50 MB (Supabase tier-limit) — video-taket; bilder valideres strengere (5 MB) i uploadTaskMedia
};

// Tillatte MIME-typer per bucket. Bruker for valider opplasting.
export const ALLOWED_MIME_TYPES: Record<StorageBucket, readonly string[]> = {
  [STORAGE_BUCKETS.PLAYER_AVATARS]: ["image/jpeg", "image/png", "image/webp"],
  [STORAGE_BUCKETS.COACH_AVATARS]: ["image/jpeg", "image/png", "image/webp"],
  [STORAGE_BUCKETS.DRILL_THUMBNAILS]: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
  ],
  [STORAGE_BUCKETS.CLUB_LOGOS]: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
  ],
  [STORAGE_BUCKETS.SESSION_RECORDINGS]: [
    "audio/mpeg",
    "audio/mp4",
    "audio/wav",
    "audio/webm",
    "video/mp4",
    "video/quicktime",
    "video/webm",
  ],
  [STORAGE_BUCKETS.INVOICES]: ["application/pdf"],
  [STORAGE_BUCKETS.REPORTS]: ["application/pdf"],
  [STORAGE_BUCKETS.PLAYER_SWING_VIDEOS]: [
    "video/mp4",
    "video/quicktime",
    "video/webm",
  ],
  [STORAGE_BUCKETS.MESSAGE_ATTACHMENTS]: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "audio/mpeg",
    "audio/mp4",
    "audio/wav",
    "audio/webm",
  ],
  [STORAGE_BUCKETS.TASK_MEDIA]: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/quicktime",
  ],
};

export function isPublicBucket(bucket: StorageBucket): boolean {
  return PUBLIC_BUCKETS.includes(bucket);
}
