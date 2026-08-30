export default function LineChart({ series = [], color = "#7FD4F0", height = 150, fill = false }) {
  if (!series.length) return null;

  const width = 480;
  const values = series.map((p) => p.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = series.map((p, i) => {
    const x = (i / (series.length - 1)) * width;
    const y = height - ((p.v - min) / range) * (height - 20) - 10;
    return `${x},${y}`;
  });

  const polyline = points.join(" ");
  const polygon = fill ? `0,${height} ${polyline} ${width},${height}` : null;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <line x1="0" y1={height * 0.2} x2={width} y2={height * 0.2} stroke="#1E2B39" strokeWidth="1" />
      <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#1E2B39" strokeWidth="1" />
      <line x1="0" y1={height * 0.8} x2={width} y2={height * 0.8} stroke="#1E2B39" strokeWidth="1" />
      {fill && <polygon points={polygon} fill={color} opacity="0.08" />}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}
