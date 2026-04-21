/**
 * AppHeader — redesigned clean top bar.
 * - Symmetrical vertical padding
 * - Live BTC price pill (USD + THB)
 * - Theme toggle icon
 * - No excess bottom space
 */
import { RefreshCw } from 'lucide-react'
import { fmtUsdCompact, fmtThbCompact, todayStr } from '../../utils/format'

export function AppHeader({ settings, onRefreshPrice, priceLoading }) {
  const { currentPrice, usdthb } = settings
  const thb = currentPrice * usdthb

  return (
    <header className="
      sticky top-0 z-50
      bg-bg border-b border-border
      px-4 py-3
      flex items-center justify-between
    ">
      {/* Left: date + page title (title injected via CSS/context, kept minimal here) */}
      <div className="flex flex-col justify-center gap-0.5">
        <span className="label-xs">{todayStr()}</span>
        <h1 id="page-title" className="text-[26px] font-bold tracking-[-0.04em] leading-none">
          Home
        </h1>
      </div>

      {/* Right: price pill + refresh + (future: settings) */}
      <div className="flex items-center gap-2">
        {/* BTC price pill */}
        <div className="
          flex items-center gap-1.5
          bg-btc-soft border border-btc/20
          rounded-chip px-3 py-1.5
          text-btc font-mono font-bold text-[11px]
          whitespace-nowrap
        ">
          <span>{fmtUsdCompact(currentPrice)}</span>
          <span className="opacity-40">·</span>
          <span className="opacity-75">{fmtThbCompact(thb)}</span>
        </div>

        {/* Refresh price */}
        <button
          onClick={onRefreshPrice}
          disabled={priceLoading}
          className="
            w-9 h-9 rounded-full
            bg-surface border border-border
            grid place-items-center
            text-secondary hover:text-primary
            transition-colors
            disabled:opacity-40
          "
          aria-label="Refresh price"
        >
          <RefreshCw
            size={14}
            className={priceLoading ? 'animate-spin' : ''}
          />
        </button>
      </div>
    </header>
  )
}
