-- AlterEnum: Legg til GUEST i UserRole (kjørt manuelt via Supabase MCP)
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'GUEST';
