/**
 * HomePage — premium BTC dashboard.
 * All colors via CSS variables → works in light + dark.
 */
import { useMemo } from 'react'
import { Card, CardHead }   from '../components/shared/Card'
import { StatCard }         from '../components/shared/StatCard'
import { EntryRow }         from '../components/shared/EntryRow'
import { ProgressBar }      from '../components/shared/ProgressBar'
import { computeMetrics }   from '../utils/metrics'
import {
  fmtBtc, fmtUsdCompact, fmtThbCompact,
  fmtPct, fmtDate, sortDesc,
} from '../utils/format'

const $$ = (v, d = 2) => {
  const n = Math.abs(Number(v) || 0), s = Number(v) < 0 ? '-' : ''
  return `${s}$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`
}

export function HomePage({ state, onEditGoal }) {
  const m = useMemo(() => computeMetrics(state), [state])
  const { settings } = state

  const goalPct   = Math.min(100, (m.totalBtc / settings.goalBtc) * 100)
  const heroUsd   = m.totalBtc * m.price
  const remaining = Math.max(0, settings.goalBtc - m.totalBtc)

  /* recent rows */
  const recentRows = useMemo(() => [
    ...state.dca.slice(0, 3).map(x => ({
      kind: 'dca', badge: 'DCA',
      title:    fmtDate(x.date),
      sub:      (x.note || x.source || '').replace(/, 1m candle/g, '').slice(0, 38),
      val:      `${x.btcQty >= 0 ? '+' : ''}${fmtBtc(x.btcQty)} BTC`,
      subVal:   $$(x.usdtAmount),
      valClass: x.btcQty >= 0 ? 'positive' : 'negative',
    })),
    ...state.futures.slice(0, 2).map(x => ({
      kind: 'futures', badge: 'FUT',
      title:    fmtDate(x.dateClose),
      sub:      `${x.side} · ${x.mode}`,
      val:      $$(x.pnlUsdt),
      valClass: x.pnlUsdt >= 0 ? 'positive' : 'negative',
    })),
  ].slice(0, 5), [state.dca, state.futures])

  return (
    <>
      {/* ── Hero ─────────────────────────────────── */}
      <Card>
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="label-xs">TOTAL BTC HOLDINGS</span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span
                className="font-mono font-bold leading-none"
                style={{ fontSize: 52, letterSpacing: '-0.05em', color: 'var(--text)' }}
              >
                {fmtBtc(m.totalBtc, 4)}
              </span>
              <span className="text-[18px] font-bold" style={{ color: 'var(--muted)' }}>BTC</span>
            </div>
            <p className="font-mono text-[13px] mt-1" style={{ color: 'var(--muted)' }}>
              ≈ {fmtUsdCompact(heroUsd)} · {fmtThbCompact(heroUsd * m.usdthb)}
            </p>
          </div>
          <button
            onClick={onEditGoal}
            className="mt-1 px-3.5 py-1.5 rounded-chip text-[12px] font-semibold shrink-0"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)' }}
          >
            Edit Goal
          </button>
        </div>

        <ProgressBar pct={goalPct} color="default" />

        <div
          className="grid grid-cols-3 gap-3 mt-3 pt-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <Foot label="REMAINING" value={`${fmtBtc(remaining, 4)} BTC`} accent="#f59e0b" />
          <Foot label="PROGRESS"  value={fmtPct(goalPct)} center />
          <Foot label="GOAL"      value={`${fmtBtc(settings.goalBtc, 4)} BTC`} right />
        </div>
      </Card>

      {/* ── Stats Grid ─────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Avg Cost"    value={fmtUsdCompact(m.avgCost)}  hint="per BTC" />
        <StatCard label="Capital"     value={fmtUsdCompact(m.totalInv)} hint="deployed" />
        <StatCard label="BTC Stacked" value={fmtBtc(m.totalBtc, 4)}    hint="total" />
      </div>

      {/* ── Cash Flow → BTC ────────────────────────── */}
      <Card>
        <CardHead
          title="Cash Flow → BTC"
          right={<span className="label-xs">ALL TIME</span>}
        />
        <div className="flex flex-col gap-3">
          <FlowRow
            icon="↗" iconBg="rgba(34,197,94,0.12)" iconColor="#22c55e"
            label="Futures PnL"  cash={m.futPnl}  btc={m.futsToBtc}
          />
          <FlowRow
            icon="⊞" iconBg="rgba(167,139,250,0.12)" iconColor="#a78bfa"
            label="Grid Bot PnL" cash={m.gridPnl} btc={m.gridToBtc}
          />
        </div>
        <div className="flex justify-between items-center mt-3 pt-3"
             style={{ borderTop: '1px solid var(--border)' }}>
          <span className="text-[13px]" style={{ color: 'var(--muted)' }}>Total converted</span>
          <span
            className="font-mono text-[15px] font-bold"
            style={{ color: m.totalConverted >= 0 ? '#22c55e' : '#ef4444' }}
          >
            {m.totalConverted >= 0 ? '+' : ''}{fmtBtc(m.totalConverted, 4)} BTC
          </span>
        </div>
      </Card>

      {/* ── This Month ─────────────────────────────── */}
      <Card>
        <CardHead title="This Month" />
        <div className="grid grid-cols-3 gap-2 text-center">
          <MonthCell value={`${m.moBtc >= 0 ? '+' : ''}${fmtBtc(m.moBtc, 4)}`}
                     label="BTC ACCUM." color="#22c55e" />
          <MonthCell value={String(m.moCount)} label="ENTRIES" />
          <MonthCell value={fmtUsdCompact(m.moInv)} label="CAPITAL" />
        </div>
      </Card>

      {/* ── Recent Activity ────────────────────────── */}
      <Card>
        <CardHead title="Recent Activity" />
        <div className="[&>*:last-child]:border-b-0">
          {recentRows.map((r, i) => <EntryRow key={i} {...r} />)}
        </div>
      </Card>
    </>
  )
}

/* ── Sub-components ── */
function Foot({ label, value, accent, center, right }) {
  return (
    <div className={center ? 'text-center' : right ? 'text-right' : ''}>
      <span className="label-xs">{label}</span>
      <p className="font-mono text-[14px] font-bold mt-1"
         style={{ color: accent || 'var(--text)', letterSpacing: '-0.02em' }}>
        {value}
      </p>
    </div>
  )
}

function FlowRow({ icon, iconBg, iconColor, label, cash, btc }) {
  return (
    <div className="grid grid-cols-[36px_1fr_18px_auto] items-center gap-2.5">
      <div className="w-9 h-9 rounded-[10px] grid place-items-center text-[14px] font-bold"
           style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div>
        <p className="text-[12px]" style={{ color: 'var(--muted)' }}>{label}</p>
        <p className="font-mono text-[13px] font-bold"
           style={{ color: cash >= 0 ? '#22c55e' : '#ef4444' }}>
          {$$(cash)}
        </p>
      </div>
      <span style={{ color: 'var(--muted)' }}>→</span>
      <span className="font-mono text-[12px] font-bold text-right"
            style={{ color: btc >= 0 ? '#22c55e' : '#ef4444', minWidth: 80 }}>
        {btc >= 0 ? '+' : ''}{fmtBtc(btc, 4)} BTC
      </span>
    </div>
  )
}

function MonthCell({ value, label, color }) {
  return (
    <div>
      <p className="font-mono text-[19px] font-bold tracking-tight"
         style={{ color: color || 'var(--text)' }}>
        {value}
      </p>
      <span className="label-xs mt-1">{label}</span>
    </div>
  )
}
