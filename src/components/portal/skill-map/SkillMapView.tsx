"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { type CSSProperties, useMemo, useState } from "react";
import styles from "./SkillMapView.module.css";
import type { SkillMapData, SkillMapFamily, SkillMapZone, SkillMapZoneId } from "@/lib/domain/skill-map";
import { formaterFortegn } from "@/lib/format-tall";

type ZoneGeometry = {
  x: number;
  y: number;
  w: number;
  h: number;
  rx: number;
  zoom: number;
};

const GEOMETRY: Record<SkillMapZoneId, ZoneGeometry> = {
  TEE_TOTAL: { x: 432, y: 468, w: 136, h: 50, rx: 18, zoom: 2.05 },
  INNSPILL_200: { x: 390, y: 382, w: 220, h: 44, rx: 18, zoom: 1.85 },
  INNSPILL_150: { x: 374, y: 318, w: 252, h: 42, rx: 18, zoom: 1.8 },
  INNSPILL_100: { x: 354, y: 250, w: 292, h: 42, rx: 18, zoom: 1.72 },
  INNSPILL_50: { x: 366, y: 182, w: 270, h: 40, rx: 18, zoom: 1.7 },
  CHIP: { x: 300, y: 104, w: 112, h: 44, rx: 18, zoom: 2.2 },
  PITCH: { x: 426, y: 88, w: 112, h: 44, rx: 18, zoom: 2.25 },
  LOB: { x: 556, y: 104, w: 106, h: 44, rx: 18, zoom: 2.2 },
  BUNKER: { x: 682, y: 108, w: 116, h: 44, rx: 18, zoom: 2.15 },
  PUTT_0_3: { x: 458, y: 28, w: 78, h: 34, rx: 16, zoom: 2.75 },
  PUTT_3_5: { x: 548, y: 36, w: 78, h: 34, rx: 16, zoom: 2.75 },
  PUTT_5_10: { x: 368, y: 36, w: 78, h: 34, rx: 16, zoom: 2.75 },
  PUTT_10_25: { x: 316, y: 78, w: 108, h: 34, rx: 16, zoom: 2.6 },
  PUTT_25_40: { x: 574, y: 78, w: 108, h: 34, rx: 16, zoom: 2.6 },
  PUTT_40_PLUSS: { x: 436, y: 116, w: 126, h: 34, rx: 16, zoom: 2.5 },
};

const FAMILY_LABEL: Record<SkillMapFamily, string> = {
  fullsving: "Fullsving",
  naerspill: "Nærspill",
  putting: "Putting",
};

type TracerLayerKey = "good" | "miss" | "dispersion";

const TRACER_LAYER_LABEL: Record<TracerLayerKey, string> = {
  good: "Gode",
  miss: "Feilslag",
  dispersion: "Spredning",
};

function formatSg(value: number | null): string {
  return formaterFortegn(value, 2);
}

function statusLabel(zone: SkillMapZone): string {
  if (zone.dataStatus === "mangler") return "Mangler data";
  if (zone.dataStatus === "tynt") return `${zone.valueCount} målinger`;
  return `${zone.valueCount} målinger`;
}

function valueClass(zone: SkillMapZone): string {
  if (zone.sg == null) return styles.muted;
  if (zone.sg < 0) return styles.negative;
  if (zone.sg > 0) return styles.positive;
  return styles.muted;
}

function focusStyle(zone: SkillMapZone | undefined): CSSProperties {
  if (!zone) {
    return {
      "--skill-map-focus-x": "50%",
      "--skill-map-focus-y": "50%",
      "--skill-map-zoom": "1",
    } as CSSProperties;
  }

  const g = GEOMETRY[zone.id];
  return {
    "--skill-map-focus-x": `${((g.x + g.w / 2) / 1000) * 100}%`,
    "--skill-map-focus-y": `${((g.y + g.h / 2) / 563) * 100}%`,
    "--skill-map-zoom": String(g.zoom),
  } as CSSProperties;
}

function bestLabel(data: SkillMapData, id: SkillMapZoneId | null): string {
  if (!id) return "-";
  const zone = data.zones.find((z) => z.id === id);
  return zone ? zone.label : "-";
}

function ShotTracerLayer({
  visibleLayers,
}: {
  visibleLayers: Record<TracerLayerKey, boolean>;
}) {
  return (
    <svg className={styles.tracerOverlay} viewBox="0 0 1000 563" aria-hidden="true">
      <defs>
        <filter id="skill-map-tracer-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {visibleLayers.dispersion ? (
        <g className={styles.dispersionLayer}>
          <g className={styles.fairwayWidthExample}>
            <path d="M418 304 L418 250" />
            <path d="M612 304 L612 250" />
            <path d="M418 277 L612 277" />
            <text x="515" y="267">50 m</text>
            <text x="515" y="294">Fairway foran høyre bunker</text>
          </g>
          <ellipse cx="512" cy="282" rx="82" ry="27" transform="rotate(-2 512 282)" />
          <ellipse cx="595" cy="304" rx="58" ry="21" transform="rotate(8 595 304)" />
          <ellipse cx="444" cy="316" rx="50" ry="18" transform="rotate(-10 444 316)" />
        </g>
      ) : null}

      {visibleLayers.good ? (
        <g className={styles.goodTracerLayer} filter="url(#skill-map-tracer-glow)">
          <path d="M500 520 C505 442 511 363 516 276" />
          <path d="M500 520 C489 442 499 363 528 273" />
          <path d="M500 520 C520 438 524 358 505 279" />
        </g>
      ) : null}

      {visibleLayers.miss ? (
        <g className={styles.missTracerLayer} filter="url(#skill-map-tracer-glow)">
          <path d="M500 520 C450 438 427 363 438 309" />
          <path d="M500 520 C570 434 623 360 618 305" />
          <path d="M500 520 C536 452 594 388 676 354" />
        </g>
      ) : null}
    </svg>
  );
}

function TracerControls({
  visibleLayers,
  onToggle,
}: {
  visibleLayers: Record<TracerLayerKey, boolean>;
  onToggle: (layer: TracerLayerKey) => void;
}) {
  return (
    <div className={styles.tracerControls} aria-label="Velg slagspor">
      {(Object.keys(TRACER_LAYER_LABEL) as TracerLayerKey[]).map((layer) => (
        <button
          key={layer}
          type="button"
          className={`${styles.tracerButton} ${visibleLayers[layer] ? styles.tracerButtonActive : ""}`}
          aria-pressed={visibleLayers[layer]}
          onClick={() => onToggle(layer)}
        >
          {TRACER_LAYER_LABEL[layer]}
        </button>
      ))}
    </div>
  );
}

function ZoneLayer({
  zone,
  active,
  onSelect,
}: {
  zone: SkillMapZone;
  active: boolean;
  onSelect: (id: SkillMapZoneId) => void;
}) {
  const g = GEOMETRY[zone.id];
  const sgText = formatSg(zone.sg);
  return (
    <g
      role="button"
      tabIndex={0}
      aria-pressed={active}
      aria-label={`${zone.label}, SG ${sgText}, ${statusLabel(zone)}`}
      className={`${styles.zone} ${active ? styles.zoneActive : ""}`}
      onClick={() => onSelect(zone.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(zone.id);
        }
      }}
    >
      <rect className={styles.zoneShape} x={g.x} y={g.y} width={g.w} height={g.h} rx={g.rx} />
      <text className={styles.zoneText} x={g.x + g.w / 2} y={g.y + g.h / 2 - 2}>
        {zone.shortLabel}
      </text>
      <text className={styles.zoneMeta} x={g.x + g.w / 2} y={g.y + g.h / 2 + 18}>
        {sgText}
      </text>
    </g>
  );
}

function SkillMapSvg({
  zones,
  activeZone,
  onSelect,
}: {
  zones: SkillMapZone[];
  activeZone: SkillMapZone | undefined;
  onSelect: (id: SkillMapZoneId) => void;
}) {
  return (
    <svg className={styles.mapOverlay} viewBox="0 0 1000 563" role="img" aria-label="Skill Map hull med klikkbare treningsområder">
      {zones.map((zone) => (
        <ZoneLayer key={zone.id} zone={zone} active={zone.id === activeZone?.id} onSelect={onSelect} />
      ))}
    </svg>
  );
}

function Metric({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={styles.metric}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={`${styles.metricValue} ${className ?? ""}`}>{value}</span>
    </div>
  );
}

function DetailPanel({
  zone,
  onClose,
}: {
  zone: SkillMapZone;
  onClose: () => void;
}) {
  return (
    <aside className={styles.panel} aria-live="polite">
      <div className={styles.panelTop}>
        <div>
          <p className={styles.eyebrow}>{FAMILY_LABEL[zone.family]}</p>
          <h2 className={styles.panelTitle}>{zone.label}</h2>
          <p className={styles.panelSub}>{zone.distance}</p>
        </div>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Lukk detaljpanel">
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.metricGrid}>
        <Metric label="SG" value={formatSg(zone.sg)} className={valueClass(zone)} />
        <Metric label="Datagrunnlag" value={statusLabel(zone)} />
        <Metric label="Trening 30 d" value={`${zone.trainingMinutes} min`} />
        <Metric label="Økter" value={String(zone.trainingSessions)} />
      </div>

      <p className={styles.copyBlock}>{zone.insight}</p>
      <p className={`${styles.copyBlock} ${styles.muted}`}>{zone.coachAction}</p>
    </aside>
  );
}

export function SkillMapView({ data }: { data: SkillMapData }) {
  const [activeId, setActiveId] = useState<SkillMapZoneId | null>(null);
  const [visibleTracerLayers, setVisibleTracerLayers] = useState<Record<TracerLayerKey, boolean>>({
    good: true,
    miss: false,
    dispersion: true,
  });

  const activeZone = useMemo(
    () => data.zones.find((zone) => zone.id === activeId),
    [activeId, data.zones],
  );

  function toggleTracerLayer(layer: TracerLayerKey) {
    setVisibleTracerLayers((current) => ({
      ...current,
      [layer]: !current[layer],
    }));
  }

  return (
    <div className={styles.root} data-ak-skill-map>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Analyse · Skill Map</p>
          <h1 className={styles.title}>Skill Map</h1>
        </div>
        <div className={styles.summary}>
          <span className={styles.pill}>{data.summary.roundWindowLabel}</span>
          <span className={styles.pill}>Sterkest: {bestLabel(data, data.summary.strongestZoneId)}</span>
          <span className={styles.pill}>Fokus: {bestLabel(data, data.summary.weakestZoneId)}</span>
        </div>
      </header>

      <div className={styles.stage}>
        <div className={styles.mapShell} data-zoomed={activeZone ? "true" : "false"} style={focusStyle(activeZone)}>
          <div className={styles.courseFrame}>
            <Image
              src="/images/skill-map/skill-map-overview-v3.png"
              alt=""
              fill
              priority
              sizes="(max-width: 900px) 100vw, 760px"
              className={styles.mapImage}
            />
            <ShotTracerLayer visibleLayers={visibleTracerLayers} />
            <SkillMapSvg zones={data.zones} activeZone={activeZone} onSelect={setActiveId} />
          </div>
          <TracerControls visibleLayers={visibleTracerLayers} onToggle={toggleTracerLayer} />
          {activeZone ? <DetailPanel zone={activeZone} onClose={() => setActiveId(null)} /> : null}
        </div>
      </div>

      <div className={styles.zoneList} aria-label="Skill Map soner">
        {data.zones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            className={`${styles.zoneButton} ${zone.id === activeZone?.id ? styles.zoneButtonActive : ""}`}
            onClick={() => setActiveId(zone.id)}
          >
            <span className={styles.zoneButtonLabel}>{zone.label}</span>
            <span className={styles.zoneButtonValue}>{formatSg(zone.sg)} · {statusLabel(zone)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
