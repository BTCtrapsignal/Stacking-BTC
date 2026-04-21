/**
 * StatCard — small metric tile used in grids.
 * Props: label, value, hint, valueClass
 */
export function StatCard({ label, value, hint, valueClass = '' }) {
  return (
    <div className="bg-card border border-border rounded-[12px] p-4 flex flex-col gap-1.5 min-h-[88px] justify-center">
      <span className="label-xs">{label}</span>
      <span className={`font-mono text-[17px] font-bold tracking-tight leading-none ${valueClass}`}>
        {value}
      </span>
      {hint && <span className="text-[11px] text-muted">{hint}</span>}
    </div>
  )
}
