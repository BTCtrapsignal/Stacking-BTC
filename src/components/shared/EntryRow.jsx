/**
 * EntryRow — a single row in an entry/activity list.
 * Props: kind ('dca'|'futures'|'dip'|'grid'), badge, title, sub, val, subVal, valClass
 */
const BADGE_STYLES = {
  dca:     'bg-btc-soft text-btc     border-btc/20',
  futures: 'bg-green-soft text-green border-green/20',
  dip:     'bg-orange-soft text-orange border-orange/20',
  grid:    'bg-purple/10 text-purple  border-purple/20',
  default: 'bg-card border-border text-muted',
}

export function EntryRow({ kind = 'default', badge, title, sub, val, subVal, valClass = '' }) {
  const badgeCls = BADGE_STYLES[kind] || BADGE_STYLES.default

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0">
      {/* Left */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className={`shrink-0 w-8 h-8 rounded-[8px] border grid place-items-center
                         text-[9px] font-bold tracking-wide ${badgeCls}`}>
          {badge}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold truncate">{title}</p>
          <p className="text-[11px] text-muted truncate">{sub}</p>
        </div>
      </div>
      {/* Right */}
      <div className="text-right shrink-0">
        <span className={`block font-mono text-[13px] font-bold tracking-tight ${valClass}`}>{val}</span>
        {subVal && <span className="block font-mono text-[10px] text-muted mt-0.5">{subVal}</span>}
      </div>
    </div>
  )
}
