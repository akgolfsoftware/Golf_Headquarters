import Link from "next/link";

export type TabItem = {
  key: string;
  label: string;
};

/**
 * TabStrip — server-rendered query-tab-strip for samle-sider.
 * Bygger href via basePath + ?tab=<key>. Aktiv tab markeres med underline.
 */
export function TabStrip({
  basePath,
  tabs,
  active,
}: {
  basePath: string;
  tabs: TabItem[];
  active: string;
}) {
  return (
    <nav
      aria-label="Tabs"
      className="mb-6 flex gap-1 border-b border-border"
    >
      {tabs.map((tab) => {
        const aktiv = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={`${basePath}?tab=${tab.key}`}
            aria-current={aktiv ? "page" : undefined}
            className={`relative px-4 py-4 text-sm font-medium transition-colors ${
              aktiv
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {aktiv && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
