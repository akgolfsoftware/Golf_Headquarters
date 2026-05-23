-- Add GYM to SessionEnvironment enum
ALTER TYPE "SessionEnvironment" ADD VALUE IF NOT EXISTS 'GYM';

-- Add physical equipment flags to DrillFasilitet enum
ALTER TYPE "DrillFasilitet" ADD VALUE IF NOT EXISTS 'VEKTSTANG';
ALTER TYPE "DrillFasilitet" ADD VALUE IF NOT EXISTS 'TRAPBAR';
ALTER TYPE "DrillFasilitet" ADD VALUE IF NOT EXISTS 'LOPEBANE';
ALTER TYPE "DrillFasilitet" ADD VALUE IF NOT EXISTS 'MED_BALL';
