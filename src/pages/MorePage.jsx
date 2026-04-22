/**
 * MorePage — Live Price, Dip Reserve, Grid Bot.
 */
import { useMemo } from 'react'
import { Card, CardHead } from '../components/shared/Card'
import { StatCard }       from '../components/shared/StatCard'
import { EntryRow }       from '../components/shared/EntryRow'
import { computeMetrics } from '../utils/metrics'
import { fmtBtc, fmtUsdCompact, fmtThbCompact, fmtPct, fmtDate, sortDesc } from '../utils/format'

const $$ = (v, d = 2) => {
  const n = Math.abs(Number(v) || 0), s = Number(v) < 0 ? '-' : ''
  return `${s}$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`
}

export function MorePage({ state, priceLoading, updatedAt, onRefresh }) {
  const m          = useMemo(() => computeMetrics(state), [state])
  const thb        = m.price * m.usdthb
  const dipCap     = state.dip.reduce((s, x)  => s + Math.abs(+x.usdtAmount  || 0), 0)
  const gridCap    = state.grid.reduce((s, x) => s + Math.abs(+x.capitalUsdt || 0), 0)
  const updatedStr = updatedAt
    ? updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <>
      {/* Live Market Price */}
      <Card>
        <div className="flex justify-between items-start">
          <div>
            <span className="label-xs">BTC / USD</span>
            <p className="font-mono text-[28px] font-bold mt-1"
               style={{ letterSpacing: '-0.05em', color: 'var(--text)' }}>
              {fmtUsdCompact(m.price)}
            </p>
          </div>
          <div className="text-right">
            <span className="label-xs">BTC / THB</span>
            <p className="font-mono text-[28px] font-bold mt-1"
               style={{ letterSpacing: '-0.05em', color: 'var(--muted)' }}>
              {fmtThbCompact(thb)}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3"
             style={{ borderTop: '1px solid var(--border)' }}>
          <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
            {updatedStr ? `Updated ${updatedStr}` : 'Using saved price'}
          </span>
          <button
            onClick={onRefresh}
            disabled={priceLoading}
            className="text-[12px] font-semibold disabled:opacity-40"
            style={{ color: '#60a5fa' }}
          >
            {priceLoading ? '↻ Loading…' : '↻ Refresh'}
          </button>
        </div>
      </Card>

      {/* Dip Reserve */}
      <Card>
        <CardHead title="Dip Reserve" />
        <div className="grid grid-cols-3 gap-2 mb-3">
          <StatCard label="BTC Total" value={fmtBtc(m.dipBtc, 4)}   hint="BTC" />
          <StatCard label="Capital"   value={fmtUsdCompact(dipCap)}  hint="USD" />
          <StatCard label="Entries"   value={String(state.dip.length)} hint="count" />
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}
             className="[&>*:last-child]:border-b-0">
          {[...state.dip].sort((a, b) => sortDesc(a, b, 'date')).slice(0, 10).map((x, i) => (
            <EntryRow key={i} kind="dip" badge="DIP"
              title={fmtDate(x.date)} sub={x.note || x.source || ''}
              val={`${x.btcQty >= 0 ? '+' : ''}${fmtBtc(x.btcQty)} BTC`}
              subVal={$$(x.price, 0)}
              valClass={x.btcQty >= 0 ? 'positive' : 'negative'}
            />
          ))}
          {!state.dip.length && (
            <p className="text-[13px] py-4 text-center" style={{ color: 'var(--muted)' }}>No dip entries yet.</p>
          )}
        </div>
      </Card>

      {/* Grid Bot */}
      <Card>
        <CardHead title="Grid Bot" />
        <div className="grid grid-cols-3 gap-2 mb-3">
          <StatCard label="Net Profit" value={$$(m.gridPnl)}
                    valueColor={m.gridPnl >= 0 ? '#22c55e' : '#ef4444'} hint="USD" />
          <StatCard label="Capital"    value={fmtUsdCompact(gridCap)} hint="USD" />
          <StatCard label="Runs"       value={String(state.grid.length)} hint="bots" />
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}
             className="[&>*:last-child]:border-b-0">
          {[...state.grid].sort((a, b) => sortDesc(a, b, 'dateEnd')).slice(0, 8).map((x, i) => (
            <EntryRow key={i} kind="grid" badge="GRD"
              title={fmtDate(x.dateEnd)} sub={`${x.gridType || ''} · ${x.mode || ''}`}
              val={$$(x.netProfitUsdt)}
              subVal={fmtPct(x.roi, 2)}
              valClass={x.netProfitUsdt >= 0 ? 'positive' : 'negative'}
            />
          ))}
          {!state.grid.length && (
            <p className="text-[13px] py-4 text-center" style={{ color: 'var(--muted)' }}>No grid bots yet.</p>
          )}
        </div>
      </Card>
    </>
  )
}
