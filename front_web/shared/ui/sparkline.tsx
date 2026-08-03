export type SparklineTone = "accent" | "success" | "danger" | "warning" | "violet";

const TONE_STROKE: Record<SparklineTone, string> = {
  accent: "var(--accent)",
  success: "var(--success)",
  danger: "var(--danger)",
  warning: "var(--warning)",
  violet: "var(--violet)",
};

/**
 * Mini gráfico de línea presentacional (solo visual). Normaliza una serie de
 * valores a coordenadas SVG dentro de un viewBox fijo. `tone` tiñe el trazo y,
 * si `area` está activo, el relleno degradado bajo la línea.
 */
export function Sparkline({
  values,
  tone = "accent",
  area = false,
  className = "h-9 w-full",
  ariaLabel,
}: {
  values: number[];
  tone?: SparklineTone;
  area?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const width = 100;
  const height = 32;
  const stroke = TONE_STROKE[tone];
  const gradientId = `spark-${tone}-${values.length}-${Math.round(values[0] ?? 0)}`;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = values.length > 1 ? width / (values.length - 1) : width;

  const points = values.map((value, index) => {
    const x = index * step;
    const y = height - 3 - ((value - min) / span) * (height - 6);
    return [Number(x.toFixed(2)), Number(y.toFixed(2))] as const;
  });

  const line = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  const areaPath = `${line} L${width} ${height} L0 ${height} Z`;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={ariaLabel ?? "Tendencia reciente"}
    >
      {area ? (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.2" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradientId})`} />
        </>
      ) : null}
      <polyline
        points={points.map(([x, y]) => `${x},${y}`).join(" ")}
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
