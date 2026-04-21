/**
 * MorePage — Live Price, Dip Reserve, Grid Bot
 */
import { useMemo } from 'react'
import { Card, CardHead } from '../components/shared/Card'
import { StatCard }       from '../components/shared/StatCard'
import { EntryRow }       from '../components/shared/EntryRow'
import { computeMetrics } from '../utils/metrics'
import {
  fmtBtc, fmtUsdCompact, fmtThbCompact,
  fmtUsd, fmtPct, fmtDate, sortDesc,
} from '../utils/format'

const $f = (v, d = 2) => {
  const n = Math.abs(Number(v) || 0)
  const s = Number(v) < 0 ? '-' : ''
  return `${s}$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`
}

export function MorePage({ state, priceLoading, updatedAt, onRefresh }) {
  const m = useMemo(() => computeMetrics(state), [state])
  const thb = m.price * m.usdthb

  const dipCapital  = state.dip.reduce((s, x)  => s + Math.abs(+x.usdtAmount  || 0), 0)
  const gridCapital = state.grid.reduce((s, x) => s + Math.abs(+x.capitalUsdt || 0), 0)

  const updatedStr = updatedAt
    ? updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="flex flex-col gap-3">

      {/* ── Live Market Price ─────────────────────── */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex gap-8">
            <div>
              <span className="label-xs">BTC / USD</span>
              <p className="font-mono text-[26px] font-bold tracking-[-0.05em] mt-1">
                {fmtUsdCompact(m.price)}
              </p>
            </div>
            <div>
              <span className="label-xs">BTC / THB</span>
              <p className="font-mono text-[26px] font-bold tracking-[-0.05em] mt-1 text-muted">
                {fmtThbCompact(thb)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="text-[11px] text-muted">
            {updatedStr ? `Updated ${updatedStr}` : 'Using saved price'}
          </span>
          <button
            onClick={onRefresh}
            disabled={priceLoading}
            className="text-blue text-[12px] font-semibold disabled:opacity-40"
          >
            {priceLoading ? '↻ Loading…' : '↻ Refresh'}
          </button>
        </div>
      </Card>

      {/* ── Dip Reserve ──────────────────────────── */}
      <Card>
        <CardHead title="Dip Reserve" />
        <div className="grid grid-cols-3 gap-2 mb-3">
          <StatCard label="BTC Total" value={fmtBtc(m.dipBtc, 4)}       hint="BTC" />
          <StatCard label="Capital"   value={fmtUsdCompact(dipCapital)}  hint="USD" />
          <StatCard label="Entries"   value={String(state.dip.length)}   hint="count" />
        </div>
        <div className="border-t border-border pt-3">
          {[...state.dip]
            .sort((a, b) => sortDesc(a, b, 'date'))
            .slice(0, 10)
            .map((x, i) => (
              <EntryRow
                key={i}
                kind="dip" badge="DIP"
                title={fmtDate(x.date)}
                sub={x.note || x.source || ''}
                val={`${x.btcQty >= 0 ? '+' : ''}${fmtBtc(x.btcQty)} BTC`}
                subVal={$f(x.price, 0)}
                valClass={x.btcQty >= 0 ? 'text-green' : 'text-red'}
              />
            ))}
          {!state.dip.length && (
            <p className="text-muted text-sm py-4 text-center">No dip entries yet.</p>
          )}
        </div>
      </Card>

      {/* ── Grid Bot ─────────────────────────────── */}
      <Card>
        <CardHead title="Grid Bot" />
        <div className="grid grid-cols-3 gap-2 mb-3">
          <StatCard
            label="Net Profit"
            value={$f(m.gridPnl)}
            hint="USD"
            valueClass={m.gridPnl >= 0 ? 'text-green' : 'text-red'}
          />
          <StatCard label="Capital" value={fmtUsdCompact(gridCapital)} hint="USD" />
          <StatCard label="Runs"    value={String(state.grid.length)}  hint="bots" />
        </div>
        <div className="border-t border-border pt-3">
          {[...state.grid]
            .sort((a, b) => sortDesc(a, b, 'dateEnd'))
            .slice(0, 8)
            .map((x, i) => (
              <EntryRow
                key={i}
                kind="grid" badge="GRD"
                title={fmtDate(x.dateEnd)}
                sub={`${x.gridType || ''} · ${x.mode || ''}`}
                val={$f(x.netProfitUsdt)}
                subVal={fmtPct(x.roi, 2)}
                valClass={x.netProfitUsdt >= 0 ? 'text-green' : 'text-red'}
              />
            ))}
          {!state.grid.length && (
            <p className="text-muted text-sm py-4 text-center">No grid bots yet.</p>
          )}
        </div>
      </Card>

    </div>
  )
}
