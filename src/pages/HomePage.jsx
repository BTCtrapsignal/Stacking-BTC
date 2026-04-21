/**
 * HomePage — dashboard overview
 * Shows: Hero (total BTC + progress), Stats grid, Cash Flow → BTC,
 *        This Month, Recent Activity
 */
import { useMemo } from 'react'
import { Card, CardHead } from '../components/shared/Card'
import { StatCard }       from '../components/shared/StatCard'
import { EntryRow }       from '../components/shared/EntryRow'
import { ProgressBar }    from '../components/shared/ProgressBar'
import { computeMetrics } from '../utils/metrics'
import {
  fmtBtc, fmtUsd, fmtUsdCompact, fmtThbCompact,
  fmtPct, fmtDate, sortDesc,
} from '../utils/format'

export function HomePage({ state, onEditGoal }) {
  const m = useMemo(() => computeMetrics(state), [state])
  const { settings } = state

  const goalPct  = Math.min(100, (m.totalBtc / settings.goalBtc) * 100)
  const heroUsd  = m.totalBtc * m.price
  const remaining = Math.max(0, settings.goalBtc - m.totalBtc)

  // Recent activity (last 3 DCA + last 2 Futures)
  const recentRows = useMemo(() => [
    ...state.dca.slice(0, 3).map(x => ({
      kind: 'dca', badge: 'DCA',
      title:   fmtDate(x.date),
      sub:     (x.note || x.source || '').replace(/, 1m candle/g, '').slice(0, 40),
      val:     `${x.btcQty >= 0 ? '+' : ''}${fmtBtc(x.btcQty)} BTC`,
      subVal:  fmtUsd(x.usdtAmount, 2),
      valClass: x.btcQty >= 0 ? 'positive' : 'negative',
    })),
    ...state.futures.slice(0, 2).map(x => ({
      kind: 'futures', badge: 'FUT',
      title:   fmtDate(x.dateClose),
      sub:     `${x.side} · ${x.mode}`,
      val:     fmtUsd(x.pnlUsdt, 2),
      subVal:  'Closed',
      valClass: x.pnlUsdt >= 0 ? 'positive' : 'negative',
    })),
  ].slice(0, 5), [state.dca, state.futures])

  return (
    <div className="flex flex-col gap-3">

      {/* ── Hero Card ─────────────────────────────── */}
      <Card>
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="label-xs">TOTAL BTC HOLDINGS</span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="font-mono text-[48px] font-bold tracking-[-0.05em] leading-none">
                {fmtBtc(m.totalBtc, 4)}
              </span>
              <span className="text-[18px] font-bold text-muted">BTC</span>
            </div>
            <p className="font-mono text-[13px] text-muted mt-1">
              ≈ {fmtUsdCompact(heroUsd)} · {fmtThbCompact(heroUsd * m.usdthb)}
            </p>
          </div>
          <button
            onClick={onEditGoal}
            className="shrink-0 mt-1 px-3.5 py-1.5 rounded-chip border border-border bg-card
                       text-[12px] font-semibold text-secondary hover:text-primary transition-colors"
          >
            Edit Goal
          </button>
        </div>

        {/* Progress */}
        <ProgressBar pct={goalPct} color="default" />

        {/* Footer */}
        <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-border">
          <div>
            <span className="label-xs">REMAINING</span>
            <p className="font-mono text-[15px] font-bold text-orange mt-1">
              {fmtBtc(remaining, 4)} BTC
            </p>
          </div>
          <div className="text-center">
            <span className="label-xs">PROGRESS</span>
            <p className="font-mono text-[15px] font-bold mt-1">{fmtPct(goalPct)}</p>
          </div>
          <div className="text-right">
            <span className="label-xs">GOAL</span>
            <p className="font-mono text-[15px] font-bold mt-1">
              {fmtBtc(settings.goalBtc, 4)} BTC
            </p>
          </div>
        </div>
      </Card>

      {/* ── Stats Grid ─────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Avg Cost"    value={fmtUsdCompact(m.avgCost)}    hint="per BTC" />
        <StatCard label="Capital"     value={fmtUsdCompact(m.totalInv)}   hint="deployed" />
        <StatCard label="BTC Stacked" value={fmtBtc(m.totalBtc, 4)}      hint="total" />
      </div>

      {/* ── Cash Flow → BTC ────────────────────────── */}
      <Card>
        <CardHead title="Cash Flow → BTC" right={<span className="label-xs">ALL TIME</span>} />

        <div className="flex flex-col gap-3">
          <FlowRow
            icon={<ArrowUpIcon />}  iconBg="bg-green-soft"  iconColor="text-green"
            label="Futures PnL"
            cash={m.futPnl}
            btcVal={m.futsToBtc}
          />
          <FlowRow
            icon={<GridIcon />}     iconBg="bg-purple/10"   iconColor="text-purple"
            label="Grid Bot PnL"
            cash={m.gridPnl}
            btcVal={m.gridToBtc}
          />
        </div>

        <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
          <span className="text-[13px] text-muted">Total converted</span>
          <span className={`font-mono text-[15px] font-bold ${m.totalConverted >= 0 ? 'text-green' : 'text-red'}`}>
            {m.totalConverted >= 0 ? '+' : ''}{fmtBtc(m.totalConverted, 4)} BTC
          </span>
        </div>
      </Card>

      {/* ── This Month ─────────────────────────────── */}
      <Card>
        <CardHead title="This Month" />
        <div className="grid grid-cols-3 gap-2 text-center">
          <MonthCell label="BTC ACCUMULATED" value={`${m.moBtc >= 0 ? '+' : ''}${fmtBtc(m.moBtc, 4)}`} cls="text-green" />
          <MonthCell label="ENTRIES"         value={String(m.moCount)} />
          <MonthCell label="CAPITAL"         value={fmtUsdCompact(m.moInv)} />
        </div>
      </Card>

      {/* ── Recent Activity ────────────────────────── */}
      <Card>
        <CardHead title="Recent Activity" />
        <div>
          {recentRows.map((r, i) => (
            <EntryRow key={i} {...r} />
          ))}
        </div>
      </Card>

    </div>
  )
}

/* ── Internal sub-components ── */

function FlowRow({ icon, iconBg, iconColor, label, cash, btcVal }) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2.5">
      <div className={`w-9 h-9 rounded-[10px] grid place-items-center ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-[12px] text-muted">{label}</p>
        <p className={`font-mono text-[13px] font-bold ${cash >= 0 ? 'text-green' : 'text-red'}`}>
          {fmtUsd(cash, 2)}
        </p>
      </div>
      <span className="text-muted text-[16px]">→</span>
      <span className={`font-mono text-[12px] font-bold min-w-[80px] text-right
                        ${btcVal >= 0 ? 'text-green' : 'text-red'}`}>
        {btcVal >= 0 ? '+' : ''}{fmtBtc(btcVal, 4)} BTC
      </span>
    </div>
  )
}

function MonthCell({ label, value, cls = '' }) {
  return (
    <div>
      <p className={`font-mono text-[18px] font-bold tracking-tight ${cls}`}>{value}</p>
      <p className="label-xs mt-1">{label}</p>
    </div>
  )
}

function ArrowUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <rect x="3"  y="3"  width="7" height="7" rx="1" />
      <rect x="14" y="3"  width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3"  y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

// fmtUsd with decimals — local helper
