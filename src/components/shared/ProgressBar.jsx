/**
 * ProgressBar — thin track with animated fill.
 * Props: pct (0–100), color ('default'|'orange'|'green'|'red')
 */
const FILL_COLOR = {
  default: 'bg-primary',
  orange:  'bg-btc',
  green:   'bg-green',
  red:     'bg-red',
}

export function ProgressBar({ pct = 0, color = 'default', className = '' }) {
  const fillWidth = Math.min(100, Math.max(0, pct))
  const fillCls   = FILL_COLOR[color] || FILL_COLOR.default

  return (
    <div className={`h-1.5 bg-border rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${fillCls}`}
        style={{ width: `${fillWidth}%`, minWidth: fillWidth > 0 ? '6px' : '0' }}
      />
    </div>
  )
}
