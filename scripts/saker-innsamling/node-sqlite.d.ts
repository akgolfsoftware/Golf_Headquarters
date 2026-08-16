/**
 * Minimal ambient type-deklarasjon for Node sitt innebygde `node:sqlite`-
 * modul (eksperimentell, tilgjengelig uten flagg i Node 22.5+/24). Prosjektets
 * `@types/node`-versjon (20.x) mangler ennå disse typene — dette er en
 * kirurgisk shim begrenset til det imessage.ts faktisk bruker, ikke en full
 * portering av Node sin API-overflate.
 */
declare module "node:sqlite" {
  export interface DatabaseSyncOptions {
    readOnly?: boolean;
  }

  export interface StatementSync {
    all(...params: unknown[]): unknown[];
    get(...params: unknown[]): unknown;
    run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
  }

  export class DatabaseSync {
    constructor(path: string, options?: DatabaseSyncOptions);
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
