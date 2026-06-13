"use client";

import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Command,
  Search,
  Settings,
} from "lucide-react";

export function AnalyticsTopbar() {
  const router = useRouter();

  return (
    <div className="wb-top">
      <div className="grp-l">
        <div className="wb-mono">
          <BarChart3 className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.5} />
        </div>
        <div className="wb-crumb">
          WORKBENCH · <span className="cur">ANALYSERE</span> · PRO
        </div>
      </div>

      <div className="grp-c">
        <div className="wb-ai">
          <div className="input-wrap">
            <span className="spk">
              <Command className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
            <input
              type="text"
              placeholder="Spør om statistikken din — f.eks. ‘hvordan er innspillet?’"
              readOnly
            />
            <span className="kbd">⌘K</span>
          </div>
          <div className="chips">
            <button type="button" className="chip" disabled title="Kommer">
              AI-innsikt
            </button>
            <button type="button" className="chip" disabled title="Kommer">
              Sammenlign
            </button>
            <button type="button" className="chip" disabled title="Kommer">
              Eksporter
            </button>
          </div>
        </div>
      </div>

      <div className="grp-r">
        <button
          type="button"
          className="wb-btn-ghost"
          onClick={() => router.push("/portal/planlegge")}
        >
          Planlegg
        </button>
        <button type="button" className="wb-btn-ghost" disabled title="Kommer">
          <Search className="h-4 w-4" strokeWidth={1.5} />
          Søk
        </button>
        <button
          type="button"
          className="wb-bell"
          aria-label="Varsler"
          disabled
          title="Kommer"
        >
          <Bell className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="wb-btn-ghost"
          onClick={() => router.push("/portal/meg")}
        >
          <Settings className="h-4 w-4" strokeWidth={1.5} />
          Meg
        </button>
      </div>
    </div>
  );
}
