/**
 * MiniChart — lightweight SVG area/line chart.
 * Props:
 *   points    — [{ x, y, label }]
 *   goalY     — optional goal line (number)
 *   currency  — bool: format y-axis as $
 *   pillText  — string shown at end-point
 *   height    — SVG height (default 160)
 */
import { useMemo } from 'react'

export function MiniChart({
  points = [],
  goalY,
  currency = false,
  pillText,
  height = 160,
}) {
  const W = 320
  const H = height
  const P = { l: 44, r: 12, t: 14, b: 24 }

  const derived = useMemo(() => {
    if (!points.length) return null

    const xs   = points.map(p => p.x)
    const ys   = points.map(p => p.y)
    const maxX = Math.max(...xs, 1)
    const minY = Math.min(...ys, goalY ?? Infinity, 0)
    const maxY = Math.max(...ys, goalY ?? 0, 1)
    const rangeY = maxY === minY ? 1 : maxY - minY

    const cx = v => P.l + (v / maxX) * (W - P.l - P.r)
    const cy = v => H - P.b - ((v - minY) / rangeY) * (H - P.t - P.b)

    const isNeg   = points.at(-1).y < 0
    const lineClr = isNeg ? '#ef4444' : '#22c55e'
    const areaClr = isNeg ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)'
    const pillClr = isNeg ? '#ef4444' : '#22c55e'

    const linePts  = points.map((p, i) => `${i ? 'L' : 'M'}${cx(p.x).toFixed(1)},${cy(p.y).toFixed(1)}`).join(' ')
    const baseY    = cy(Math.max(0, minY))
    const areaPts  = `M${cx(points[0].x)},${baseY} ` +
      points.map(p => `L${cx(p.x).toFixed(1)},${cy(p.y).toFixed(1)}`).join(' ') +
      ` L${cx(points.at(-1).x)},${baseY}Z`

    // Y-axis ticks (3 labels)
    const ticks = [minY, (minY + maxY) / 2, maxY]

    // Goal line
    const goalLineY = goalY != null ? cy(goalY) : null

    // End-point pill
    const ex     = cx(points.at(-1).x)
    const ey     = cy(points.at(-1).y)
    const pillW  = 66
    const pillH  = 18
    const pillX  = Math.min(Math.max(ex - pillW / 2, P.l), W - P.r - pillW)
    const pillY  = Math.max(P.t, ey - 24)

    // X-axis labels (first, mid, last)
    const xLabels = [points[0], points[Math.floor(points.length / 2)], points.at(-1)]

    return { cx, cy, isNeg, lineClr, areaClr, pillClr, linePts, areaPts,
             ticks, goalLineY, ex, ey, pillW, pillH, pillX, pillY, xLabels, minY, maxY, currency }
  }, [points, goalY, currency, H])

  if (!derived) return null

  const { cx, cy, lineClr, areaClr, pillClr, linePts, areaPts,
          ticks, goalLineY, ex, ey, pillW, pillH, pillX, pillY, xLabels } = derived

  function fmtTick(v) {
    if (!currency) return v.toFixed(2)
    const abs = Math.abs(Math.round(v))
    return (v < 0 ? '-' : '') + '$' + abs
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
      {/* Y-axis grid + labels */}
      {ticks.map((v, i) => (
        <g key={i}>
          <line x1={P.l} y1={cy(v).toFixed(1)} x2={W - P.r} y2={cy(v).toFixed(1)}
                stroke="#252830" strokeWidth="1" />
          <text x="2" y={cy(v) + 4} fill="#686e7d" fontSize="9.5"
                fontFamily="'Space Mono', monospace">{fmtTick(v)}</text>
        </g>
      ))}

      {/* Goal line */}
      {goalLineY != null && (
        <line x1={P.l} y1={goalLineY.toFixed(1)} x2={W - P.r} y2={goalLineY.toFixed(1)}
              stroke="#f7931a" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.55" />
      )}

      {/* Area fill */}
      <path d={areaPts} fill={areaClr} />

      {/* Line */}
      <path d={linePts} fill="none" stroke={lineClr} strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" />

      {/* End dot */}
      <circle cx={ex} cy={ey} r="4" fill={lineClr} />

      {/* Pill */}
      {pillText && (
        <>
          <rect x={pillX} y={pillY} width={pillW} height={pillH} rx="6"
                fill={pillClr} />
          <text x={pillX + pillW / 2} y={pillY + 12.5}
                fill="white" fontSize="9" fontWeight="700"
                fontFamily="'Space Mono', monospace" textAnchor="middle">
            {pillText}
          </text>
        </>
      )}

      {/* X-axis labels */}
      {xLabels.map((p, i) => (
        <text key={i} x={cx(p.x).toFixed(1)} y={H - 4}
              fill="#686e7d" fontSize="9" fontFamily="'Space Mono', monospace"
              textAnchor="middle">
          {p.label}
        </text>
      ))}
    </svg>
  )
}
