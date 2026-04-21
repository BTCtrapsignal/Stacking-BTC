/**
 * TriggersPage — "Buy the Dip – 4 Layer Strategy"
 *
 * Features:
 *  1. Avg Cost vs Market comparison card
 *  2. Buy Trigger levels (auto-calc from ref price)
 *  3. DIP CALCULATOR — user inputs total budget + % per layer
 *     → auto-calculates USD amount, THB amount, buy price, est. BTC per layer
 *     → validates that %s sum to 100
 */
import { useState, useMemo, useCallback } from 'react'
import { Card, CardHead }   from '../components/shared/Card'
import { computeMetrics }   from '../utils/metrics'
import { calcDipLayers, validateDipLayers } from '../utils/metrics'
import {
  fmtBtc, fmtUsd, fmtThb, fmtUsdCompact,
  fmtThbCompact, fmtPct,
} from '../utils/format'

/* ── Constants ─────────────────────────────────────────── */

// Default layer definitions — drop % from current price
const DEFAULT_LAYERS = [
  { level: 'L1', dropPct: -10, fundSource: 'Dip',   notes: 'First dip entry',          pct: 15 },
  { level: 'L2', dropPct: -20, fundSource: 'Dip',   notes: 'Lower price level',        pct: 25 },
  { level: 'L3', dropPct: -30, fundSource: 'Panic', notes: 'Panic — highest allocation', pct: 40 },
  { level: 'L4', dropPct: -40, fundSource: 'Panic', notes: 'Extreme panic — in reserve', pct: 20 },
]

// Layer colors
const LAYER_STYLE = {
  L1: { bg: 'bg-btc-soft',    border: 'border-btc/20',    text: 'text-btc',    badge: 'bg-btc/15 text-btc' },
  L2: { bg: 'bg-orange-soft', border: 'border-orange/20', text: 'text-orange', badge: 'bg-orange/15 text-orange' },
  L3: { bg: 'bg-red-soft',    border: 'border-red/25',    text: 'text-red',    badge: 'bg-red/15 text-red' },
  L4: { bg: 'bg-red-soft',    border: 'border-red/20',    text: 'text-red',    badge: 'bg-red/10 text-red' },
}

/* ── Component ─────────────────────────────────────────── */

export function TriggersPage({ state }) {
  const m = useMemo(() => computeMetrics(state), [state])
  const refPrice = m.price || state.settings.currentPrice || 0

  // ── Dip Calculator local state ──
  const [budgetInput, setBudgetInput]   = useState('1000')   // USD
  const [layers, setLayers]             = useState(DEFAULT_LAYERS)
  const [showCalc, setShowCalc]         = useState(true)

  const totalBudgetUsd = parseFloat(budgetInput) || 0

  // Validate pct sum
  const { valid: pctValid, sum: pctSum } = useMemo(
    () => validateDipLayers(layers),
    [layers]
  )

  // Calculated layer results
  const calcResults = useMemo(() => {
    if (!pctValid || totalBudgetUsd <= 0 || refPrice <= 0) return []
    return calcDipLayers({
      totalBudgetUsd,
      usdthb:   m.usdthb,
      refPrice,
      layers,
    })
  }, [pctValid, totalBudgetUsd, refPrice, m.usdthb, layers])

  const updateLayerPct = useCallback((idx, val) => {
    setLayers(ls => ls.map((l, i) => i === idx ? { ...l, pct: val } : l))
  }, [])

  // Avg cost vs market
  const diff    = refPrice - m.avgCost
  const diffPct = m.avgCost > 0 ? (diff / m.avgCost) * 100 : 0
  const isUp    = diff >= 0

  return (
    <div className="flex flex-col gap-3">

      {/* ── Avg Cost vs Market ────────────────────── */}
      <Card>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div>
            <span className="label-xs">YOUR AVG COST</span>
            <p className="font-mono text-[20px] font-bold tracking-tight mt-1.5">
              {fmtUsdCompact(m.avgCost)}
            </p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className={`font-mono text-[16px] font-bold ${isUp ? 'text-green' : 'text-red'}`}>
              {isUp ? '+' : ''}{fmtPct(diffPct)}
            </span>
            <span className="label-xs">vs market</span>
          </div>
          <div className="text-right">
            <span className="label-xs">MARKET PRICE</span>
            <p className="font-mono text-[20px] font-bold tracking-tight mt-1.5">
              {fmtUsdCompact(refPrice)}
            </p>
          </div>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════
          BUY THE DIP – 4 LAYER STRATEGY
      ══════════════════════════════════════════════ */}
      <Card>
        {/* Title */}
        <div className="flex items-center justify-between mb-1">
          <div>
            {/* Yellow highlighted title — must remain visible in dark theme */}
            <h2 className="text-[17px] font-bold tracking-tight">
              Buy the Dip —{' '}
              <span className="bg-yellow/15 text-yellow px-1.5 py-0.5 rounded-[5px]">
                4 Layer Strategy
              </span>
            </h2>
            <p className="text-[12px] text-muted mt-1">
              Ref price:{' '}
              <span className="font-mono text-secondary font-semibold">{fmtUsd(refPrice)}</span>
            </p>
          </div>
        </div>

        <div className="border-t border-border my-3" />

        {/* Layer description cards */}
        <div className="flex flex-col gap-2.5 mb-4">
          {DEFAULT_LAYERS.map(l => {
            const s = LAYER_STYLE[l.level]
            const buyPrice = refPrice * (1 + l.dropPct / 100)
            return (
              <div key={l.level}
                   className={`border rounded-[10px] p-3 ${s.border} ${s.bg}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-chip ${s.badge}`}>
                      {l.level}
                    </span>
                    <span className="text-[13px] font-semibold">{l.notes}</span>
                  </div>
                  <span className={`font-mono text-[11px] font-bold ${s.text}`}>
                    {fmtPct(l.dropPct, 0)}
                  </span>
                </div>
                <p className={`font-mono text-[15px] font-bold mt-1.5 ${s.text}`}>
                  {refPrice > 0 ? fmtUsdCompact(buyPrice) : '—'}
                  {l.fundSource === 'Panic' && (
                    <span className="ml-2 text-[9px] font-semibold uppercase tracking-wider
                                     bg-red/10 text-red px-1.5 py-0.5 rounded">
                      PANIC
                    </span>
                  )}
                </p>
              </div>
            )
          })}
        </div>
      </Card>

      {/* ══════════════════════════════════════════════
          DIP CALCULATOR
      ══════════════════════════════════════════════ */}
      <Card>
        <button
          onClick={() => setShowCalc(v => !v)}
          className="w-full flex items-center justify-between"
        >
          <div>
            <h3 className="text-[15px] font-bold text-left">Dip Calculator</h3>
            <p className="text-[12px] text-muted text-left mt-0.5">
              Enter budget → auto-calculate per layer
            </p>
          </div>
          <span className="text-muted text-[20px] leading-none">{showCalc ? '−' : '+'}</span>
        </button>

        {showCalc && (
          <div className="mt-4 flex flex-col gap-4">

            {/* Total Budget Input */}
            <div>
              <label className="label-xs mb-2 block">TOTAL BUDGET (USD)</label>
              <div className="flex items-center gap-2">
                <span className="text-muted text-[16px] font-mono font-bold">$</span>
                <input
                  type="number"
                  min="1"
                  step="100"
                  value={budgetInput}
                  onChange={e => setBudgetInput(e.target.value)}
                  className="
                    flex-1 px-3.5 py-3 rounded-[10px]
                    bg-surface border border-border
                    font-mono text-[18px] font-bold text-primary
                    outline-none focus:border-blue/60 focus:ring-2 focus:ring-blue/10
                    transition
                  "
                  placeholder="1000"
                />
                <div className="flex flex-col text-right">
                  <span className="font-mono text-[12px] text-muted">
                    ≈ {fmtThbCompact(totalBudgetUsd * m.usdthb)}
                  </span>
                  <span className="text-[10px] text-muted">THB equiv.</span>
                </div>
              </div>
            </div>

            {/* % Allocation per Layer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label-xs">% ALLOCATION PER LAYER</label>
                <span className={`text-[11px] font-bold font-mono
                  ${pctValid ? 'text-green' : 'text-red'}`}>
                  {pctSum.toFixed(0)}% / 100%
                  {pctValid ? ' ✓' : ' ✗ must = 100%'}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {layers.map((l, idx) => {
                  const s = LAYER_STYLE[l.level]
                  return (
                    <div key={l.level}
                         className="flex items-center gap-3">
                      <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1.5 rounded-chip ${s.badge}`}>
                        {l.level}
                      </span>
                      <span className="text-[12px] text-secondary flex-1">{l.notes}</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="5"
                          value={l.pct}
                          onChange={e => updateLayerPct(idx, parseFloat(e.target.value) || 0)}
                          className="
                            w-16 px-2.5 py-2 rounded-[8px] text-center
                            bg-surface border border-border
                            font-mono text-[14px] font-bold text-primary
                            outline-none focus:border-blue/60
                          "
                        />
                        <span className="text-muted text-[13px]">%</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pct bar visual */}
              {pctSum > 0 && (
                <div className="flex h-2 rounded-full overflow-hidden mt-3 gap-0.5">
                  {layers.map((l, i) => {
                    const s = LAYER_STYLE[l.level]
                    const colors = ['bg-btc', 'bg-orange', 'bg-red', 'bg-red/60']
                    return (
                      <div
                        key={l.level}
                        className={`${colors[i]} rounded-full transition-all`}
                        style={{ width: `${Math.max(0, (l.pct / Math.max(pctSum, 1)) * 100)}%` }}
                      />
                    )
                  })}
                </div>
              )}
            </div>

            {/* Results Table */}
            {pctValid && calcResults.length > 0 && totalBudgetUsd > 0 && (
              <div>
                <div className="border-t border-border pt-4">
                  <p className="label-xs mb-3">RESULT — INVESTMENT PER LAYER</p>

                  {/* Table Header */}
                  <div className="grid grid-cols-[44px_1fr_1fr_1fr_1fr] gap-x-2 mb-2 px-1">
                    {['', 'Buy Price', 'USD', 'THB', 'Est. BTC'].map((h, i) => (
                      <span key={i} className="label-xs text-right first:text-left">{h}</span>
                    ))}
                  </div>

                  {/* Table Rows */}
                  <div className="flex flex-col gap-1.5">
                    {calcResults.map((r, i) => {
                      const s = LAYER_STYLE[r.level]
                      return (
                        <div
                          key={r.level}
                          className={`grid grid-cols-[44px_1fr_1fr_1fr_1fr] gap-x-2 items-center
                                      rounded-[8px] px-1 py-2.5 border ${s.border} ${s.bg}`}
                        >
                          <span className={`text-[10px] font-bold ${s.text}`}>{r.level}</span>
                          <span className={`font-mono text-[12px] font-bold text-right ${s.text}`}>
                            {fmtUsdCompact(r.buyPrice)}
                          </span>
                          <span className="font-mono text-[12px] font-semibold text-right text-primary">
                            {fmtUsdCompact(r.usdAmount)}
                          </span>
                          <span className="font-mono text-[11px] text-right text-secondary">
                            {fmtThbCompact(r.thbAmount)}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-right text-green">
                            {fmtBtc(r.btcEst, 5)}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Summary Row */}
                  <div className="mt-3 p-3 rounded-[10px] bg-surface border border-border">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="label-xs">TOTAL USD</span>
                        <p className="font-mono text-[14px] font-bold mt-1">
                          {fmtUsdCompact(totalBudgetUsd)}
                        </p>
                      </div>
                      <div>
                        <span className="label-xs">TOTAL THB</span>
                        <p className="font-mono text-[14px] font-bold mt-1">
                          {fmtThbCompact(totalBudgetUsd * m.usdthb)}
                        </p>
                      </div>
                      <div>
                        <span className="label-xs">EST. BTC</span>
                        <p className="font-mono text-[14px] font-bold mt-1 text-green">
                          {fmtBtc(calcResults.reduce((s, r) => s + r.btcEst, 0), 5)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Validation error */}
            {!pctValid && pctSum > 0 && (
              <div className="p-3 rounded-[10px] bg-red-soft border border-red/20 text-red text-[12px] font-semibold">
                ⚠ Percentages must sum to 100%. Currently: {pctSum.toFixed(1)}%
              </div>
            )}

          </div>
        )}
      </Card>

      {/* ── Trigger Level Cards (from data) ──────── */}
      {state.triggers && state.triggers.length > 0 && (
        <Card>
          <CardHead
            title="Saved Triggers"
            right={
              <div className="flex items-center gap-1.5">
                <span className="label-xs text-muted">REF</span>
                <span className="font-mono text-[12px] font-semibold">
                  {fmtUsdCompact(refPrice)}
                </span>
              </div>
            }
          />
          <p className="text-[12px] text-muted mb-3">
            Based on reference price. Deploy on confirmed breakdown.
          </p>
          <div className="flex flex-col gap-2">
            {state.triggers.map(t => {
              const s        = LAYER_STYLE[t.level] || LAYER_STYLE.L1
              const buyPrice = t.buyPrice ?? (refPrice * (1 + (t.drop ?? 0)))
              const btcEst   = t.btcEst ?? (
                t.thbBudget > 0 && buyPrice > 0
                  ? (t.thbBudget / m.usdthb) / buyPrice
                  : 0
              )
              const fired = refPrice > 0 && refPrice <= buyPrice * 1.03

              return (
                <div
                  key={t.level}
                  className={`border rounded-[10px] p-3.5 ${s.border}
                              ${fired ? 'bg-green-soft border-green/25' : s.bg}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-chip ${s.badge}`}>
                      {t.level} · {t.fundSource}
                    </span>
                    <span className="text-[11px] text-muted">{t.notes}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <TrigStat label="Buy Price"   value={fmtUsdCompact(buyPrice)}
                              cls={fired ? 'text-green' : s.text} />
                    <TrigStat label="Drop"        value={fmtPct((t.drop ?? 0) * 100, 0)}
                              cls="text-red" />
                    <TrigStat label="Deploy (THB)" value={fmtThbCompact(t.thbBudget ?? t.thbUse ?? 0)} />
                    <TrigStat label="Est. BTC"    value={fmtBtc(btcEst, 4)}
                              cls="text-green" />
                  </div>

                  {fired && (
                    <div className="mt-2 text-[11px] font-bold text-green">
                      ⚡ Within range — consider deploying
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

    </div>
  )
}

/* ── Local sub-components ─────────────────────────── */

function TrigStat({ label, value, cls = 'text-primary' }) {
  return (
    <div>
      <span className="label-xs">{label}</span>
      <p className={`font-mono text-[14px] font-bold tracking-tight mt-0.5 ${cls}`}>{value}</p>
    </div>
  )
}
