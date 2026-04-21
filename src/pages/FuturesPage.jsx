/**
 * FuturesPage — Futures trade journal
 */
import { useMemo } from 'react'
import { Card, CardHead } from '../components/shared/Card'
import { StatCard }       from '../components/shared/StatCard'
import { EntryRow }       from '../components/shared/EntryRow'
import { MiniChart }      from '../components/shared/MiniChart'
import { computeMetrics } from '../utils/metrics'
import { fmtUsd, fmtPct, fmtDate, sortDesc } from '../utils/format'

const $f = (v, d = 2) => {
  const n = Math.abs(Number(v) || 0)
  const s = Number(v) < 0 ? '-' : ''
  return `${s}$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`
}

export function FuturesPage({ state }) {
  const m = useMemo(() => computeMetrics(state), [state])

  // Build cumulative PnL chart points
  const chartPts = useMemo(() => {
    let acc = 0
    return [...state.futures]
      .sort((a, b) => sortDesc(b, a, 'dateClose'))
      .map((x, i) => {
        acc += +x.pnlUsdt || 0
        return { x: i + 1, y: acc, label: String(i + 1) }
      })
  }, [state.futures])

  const cumPnl = chartPts.at(-1)?.y ?? 0

  return (
    <div className="flex flex-col gap-3">

      {/* ── Stats ────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          label="Total PnL"
          value={$f(m.futPnl)}
          hint="cumulative"
          valueClass={m.futPnl >= 0 ? 'text-green' : 'text-red'}
        />
        <StatCard
          label="Win Rate"
          value={fmtPct(m.winRate, 0)}
          hint={`${m.wins}/${state.futures.length} wins`}
          valueClass={m.winRate >= 50 ? 'text-green' : 'text-red'}
        />
        <StatCard
          label="Trades"
          value={String(state.futures.length)}
          hint="all time"
        />
      </div>

      {/* ── Cumulative PnL Chart ──────────────────── */}
      <Card>
        <CardHead title="Cumulative PnL" />
        {chartPts.length > 0 ? (
          <MiniChart
            points={chartPts}
            currency
            pillText={$f(cumPnl)}
          />
        ) : (
          <p className="text-muted text-sm py-6 text-center">No trades yet.</p>
        )}
      </Card>

      {/* ── Trade Log ────────────────────────────── */}
      <Card>
        <CardHead
          title="Trade Log"
          right={<span className="label-xs">{state.futures.length} trades</span>}
        />
        <div>
          {[...state.futures]
            .sort((a, b) => sortDesc(a, b, 'dateClose'))
            .slice(0, 20)
            .map((x, i) => (
              <EntryRow
                key={i}
                kind="futures" badge="FUT"
                title={fmtDate(x.dateClose)}
                sub={`${x.side} ${x.leverage || ''} · ${x.mode}${x.mistakeTag ? ' · ' + x.mistakeTag : ''}`}
                val={$f(x.pnlUsdt)}
                subVal={x.roi != null ? fmtPct(x.roi, 2) : ''}
                valClass={x.pnlUsdt >= 0 ? 'text-green' : 'text-red'}
              />
            ))}
          {!state.futures.length && (
            <p className="text-muted text-sm py-4 text-center">No trades yet.</p>
          )}
        </div>
      </Card>

    </div>
  )
}
