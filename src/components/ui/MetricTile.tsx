/**
 * MetricTile — premium stat tile with label, value, optional unit, and tone.
 * Values are rendered verbatim from content; never derived.
 * Consumes color and typography tokens via CSS variables.
 */
import React from 'react';

export type MetricTone = 'neutral' | 'positive';

export interface MetricTileProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Metric label */
  label: string;
  /** Metric value (rendered verbatim) */
  value: string;
  /** Optional unit suffix */
  unit?: string;
  /** Color tone */
  tone?: MetricTone;
}

const METRIC_STYLE_ID = 'ui-metric-styles';
const metricCss = `
.ui-metric {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0) 40%),
    var(--color-surface);
  box-shadow: 0 1px 0 0 rgba(255,255,255,0.05) inset, var(--shadow-md);
  overflow: hidden;
  transition: transform var(--duration-base) var(--ease-standard),
    border-color var(--duration-base) var(--ease-standard),
    box-shadow var(--duration-base) var(--ease-standard);
}
.ui-metric::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary));
  opacity: 0.7;
}
.ui-metric:hover {
  transform: translateY(-4px);
  border-color: rgba(129,140,248,0.42);
  box-shadow: 0 1px 0 0 rgba(255,255,255,0.06) inset,
    0 22px 48px -22px rgba(0,0,0,0.85),
    0 16px 50px -30px rgba(99,102,241,0.5);
}
.ui-metric__value {
  font-family: var(--font-sans);
  font-weight: 800;
  letter-spacing: -0.02em;
  font-size: clamp(2rem, 4vw, 2.75rem);
  line-height: 1.2;
  padding-bottom: 0.06em;
  min-width: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
  background: linear-gradient(120deg, #ffffff 0%, #c7cdf7 60%, #a78bfa 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
/* Text-based values (e.g. "Socket.IO", "Full audit") need a smaller size
   so they fit inside the tile instead of being clipped by overflow. */
.ui-metric__value--text {
  font-size: clamp(1.15rem, 2.2vw, 1.5rem);
  line-height: 1.3;
}
.ui-metric__unit {
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--color-text-muted);
  margin-left: var(--space-1);
  -webkit-text-fill-color: var(--color-text-muted);
}
.ui-metric__label {
  font-family: var(--font-sans);
  font-size: var(--font-size-caption);
  line-height: var(--line-height-caption);
  color: var(--color-text-secondary);
  font-weight: 500;
}
@media (prefers-reduced-motion: reduce) {
  .ui-metric { transition: none; }
  .ui-metric:hover { transform: none; }
}
`;

let metricStyleInjected = false;
function injectMetricStyles() {
  if (metricStyleInjected || typeof document === 'undefined') return;
  if (document.getElementById(METRIC_STYLE_ID)) {
    metricStyleInjected = true;
    return;
  }
  const style = document.createElement('style');
  style.id = METRIC_STYLE_ID;
  style.textContent = metricCss;
  document.head.appendChild(style);
  metricStyleInjected = true;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  unit,
  tone = 'neutral',
  className,
  style,
  ...rest
}) => {
  injectMetricStyles();

  // Numbers (e.g. "1,000+", "< 200", "3") keep the large display size;
  // text values (e.g. "Socket.IO", "Gemini", "Full audit") use a smaller
  // size so they fit the tile instead of being clipped.
  const isTextValue = /[a-z]/i.test(value);
  const valueClassName = ['ui-metric__value', isTextValue && 'ui-metric__value--text']
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={['ui-metric', className].filter(Boolean).join(' ')}
      style={style}
      data-tone={tone}
      {...rest}
    >
      <span className={valueClassName}>
        {value}
        {unit && <span className="ui-metric__unit">{unit}</span>}
      </span>
      <span className="ui-metric__label">{label}</span>
    </div>
  );
};

export default MetricTile;
