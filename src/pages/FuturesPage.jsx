/**
 * FuturesPage — Futures journal + Mistake Analysis.
 */
import { useMemo } from 'react'
import { Card, CardHead } from '../components/shared/Card'
import { StatCard }       from '../components/shared/StatCard'
import { EntryRow }       from '../components/shared/EntryRow'
import { MiniChart }      from '../components/shared/MiniChart'
import { computeMetrics, calcFuturesRoi } from '../utils/metrics'
import { fmtPct, fmtDate, sortDesc } from '../utils/format'

const $$ = (v, d = 2) => {
  const n = Math.abs(Number(v) || 0), s = Number(v) < 0 ? '-' : ''
  return `${s}$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`
}

export function FuturesPage({ state }) {
  const m = useMemo(() => computeMetrics(state), [state])

  /* Cumulative PnL chart points */
  const chartPts = useMemo(() => {
    let acc = 0
    return [...state.futures]
      .sort((a, b) => sortDesc(b, a, 'dateClose'))
      .map((x, i) => { acc += +x.pnlUsdt || 0; return { x: i + 1, y: acc, label: String(i + 1) } })
  }, [state.futures])

  const cumPnl = chartPts.at(-1)?.y ?? 0

  /* ── Mistake Analysis ── */
  const mistakeAnalysis = useMemo(() => {
    const withMistake = state.futures.filter(x => x.mistakeTag)
    const clean       = state.futures.filter(x => !x.mistakeTag)

    // Group by mistake tag
    const groups = {}
    withMistake.forEach(x => {
      const tag = x.mistakeTag
      if (!groups[tag]) groups[tag] = { tag, trades: [], totalPnl: 0 }
      groups[tag].trades.push(x)
      groups[tag].totalPnl += +x.pnlUsdt || 0
    })

    const sorted = Object.values(groups).sort((a, b) => a.totalPnl - b.totalPnl)

    const cleanPnl    = clean.reduce((s, x) => s + (+x.pnlUsdt || 0), 0)
    const mistakePnl  = withMistake.reduce((s, x) => s + (+x.pnlUsdt || 0), 0)
    const cleanWins   = clean.filter(x => +x.pnlUsdt > 0).length
    const cleanWinRate = clean.length > 0 ? (cleanWins / clean.length) * 100 : 0

    return { groups: sorted, withMistake, clean, cleanPnl, mistakePnl, cleanWinRate }
  }, [state.futures])

  const hasMistakes = mistakeAnalysis.withMistake.length > 0

  return (
    <>
      {/* ── Summary stats ── */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Total PnL" value={$$(m.futPnl)}
                  valueColor={m.futPnl >= 0 ? '#22c55e' : '#ef4444'} hint="cumulative" />
        <StatCard label="Win Rate"  value={fmtPct(m.winRate, 0)}
                  valueColor={m.winRate >= 50 ? '#22c55e' : '#ef4444'}
                  hint={`${m.wins}/${state.futures.length} wins`} />
        <StatCard label="Trades"    value={String(state.futures.length)} hint="all time" />
      </div>

      {/* ── Cumulative PnL chart ── */}
      <Card>
        <CardHead title="Cumulative PnL" />
        {chartPts.length > 0
          ? <MiniChart points={chartPts} currency pillText={$$(cumPnl)} />
          : <p className="text-[13px] py-6 text-center" style={{ color: 'var(--muted)' }}>No trades yet.</p>
        }
      </Card>

      {/* ── Mistake Analysis ── */}
      {hasMistakes && (
        <Card>
          <CardHead title="Mistake Analysis" />

          {/* Cost of mistakes vs clean trades */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="rounded-[10px] p-3.5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <span className="label-xs">WITH MISTAKE</span>
              <p className="font-mono text-[18px] font-bold mt-1.5"
                 style={{ color: '#ef4444', letterSpacing: '-0.03em' }}>
                {$$(mistakeAnalysis.mistakePnl)}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                {mistakeAnalysis.withMistake.length} trades tagged
              </p>
            </div>
            <div className="rounded-[10px] p-3.5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <span className="label-xs">CLEAN TRADES</span>
              <p className="font-mono text-[18px] font-bold mt-1.5"
                 style={{ color: mistakeAnalysis.cleanPnl >= 0 ? '#22c55e' : '#ef4444', letterSpacing: '-0.03em' }}>
                {mistakeAnalysis.cleanPnl >= 0 ? '+' : ''}{$$(mistakeAnalysis.cleanPnl)}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                {fmtPct(mistakeAnalysis.cleanWinRate, 0)} win rate
              </p>
            </div>
          </div>

          {/* Per-mistake-type breakdown */}
          <div className="flex flex-col gap-2">
            {mistakeAnalysis.groups.map((g, i) => {
              const worst = g.totalPnl < 0
              const barPct = Math.min(100, Math.abs(g.totalPnl) / Math.max(1, Math.abs(mistakeAnalysis.mistakePnl)) * 100)
              return (
                <div key={i} className="rounded-[10px] p-3.5"
                     style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text)' }}>
                        {g.tag}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                        {g.trades.length} trade{g.trades.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="font-mono text-[14px] font-bold shrink-0"
                          style={{ color: worst ? '#ef4444' : '#22c55e' }}>
                      {g.totalPnl >= 0 ? '+' : ''}{$$(g.totalPnl)}
                    </span>
                  </div>
                  {/* Loss bar */}
                  <div className="h-1 rounded-full" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                         style={{ width: `${barPct}%`, background: worst ? '#ef4444' : '#22c55e', opacity: 0.6 }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Takeaway */}
          <div className="mt-3 p-3 rounded-[10px] text-[12px] leading-relaxed"
               style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)' }}>
            {(() => {
              const worst = mistakeAnalysis.groups[0]
              if (!worst) return null
              return <>
                Biggest cost: <strong style={{ color: 'var(--text)' }}>{worst.tag}</strong>
                {' '}at <strong style={{ color: '#ef4444' }}>{$$(worst.totalPnl)}</strong>.
                {' '}Clean trades {mistakeAnalysis.cleanWinRate >= 50
                  ? <span style={{ color: '#22c55e' }}>outperform</span>
                  : <span style={{ color: '#f59e0b' }}>still need work</span>
                } at {fmtPct(mistakeAnalysis.cleanWinRate, 0)} win rate.
              </>
            })()}
          </div>
        </Card>
      )}

      {/* ── Trade Log ── */}
      <Card>
        <CardHead
          title="Trade Log"
          right={<span className="label-xs">{state.futures.length} trades</span>}
        />
        <div className="[&>*:last-child]:border-b-0">
          {[...state.futures]
            .sort((a, b) => sortDesc(a, b, 'dateClose'))
            .slice(0, 20)
            .map((x, i) => (
              <EntryRow
                key={i} kind="futures" badge="FUT"
                title={fmtDate(x.dateClose)}
                sub={`${x.side} ${x.leverage || ''} · ${x.mode}${x.mistakeTag ? ' · ' + x.mistakeTag : ''}`}
                val={$$(x.pnlUsdt)}
                subVal={fmtPct(calcFuturesRoi(x.pnlUsdt, x.entryPrice, x.sizeBtc, x.leverage), 2)}
                valClass={x.pnlUsdt >= 0 ? 'positive' : 'negative'}
              />
            ))}
          {!state.futures.length && (
            <p className="text-[13px] py-4 text-center" style={{ color: 'var(--muted)' }}>No trades yet.</p>
          )}
        </div>
      </Card>
    </>
  )
}
