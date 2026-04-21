/**
 * DcaPage — DCA tracking & projection
 */
import { useMemo, useState } from 'react'
import { Card, CardHead }    from '../components/shared/Card'
import { ProgressBar }       from '../components/shared/ProgressBar'
import { MiniChart }         from '../components/shared/MiniChart'
import { EntryRow }          from '../components/shared/EntryRow'
import { estimateProjection } from '../utils/metrics'
import {
  fmtBtc, fmtUsdCompact, fmtUsd, fmtPct, fmtDate, sortDesc,
} from '../utils/format'

// Full USD formatter (local)
const $f = (v, d = 0) => {
  const n = Math.abs(Number(v) || 0)
  const s = Number(v) < 0 ? '-' : ''
  return `${s}$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`
}

export function DcaPage({ state, onEditPlan }) {
  const { settings } = state
  const dcaBtc = useMemo(
    () => state.dca.reduce((s, x) => s + (+x.btcQty || 0), 0),
    [state.dca]
  )

  const proj = useMemo(
    () => estimateProjection({ settings, dcaBtc }),
    [settings, dcaBtc]
  )

  const stackPct = Math.min(100, (proj.currentBtc / proj.targetBTC) * 100)

  // Chart data: sample path every 12 months
  const chartPts = useMemo(() =>
    proj.path
      .filter((_, i) => i === 0 || i === proj.path.length - 1 || i % 12 === 0)
      .map(pt => ({
        x:     pt.age - proj.currentAge,
        y:     pt.btc,
        label: `${Math.round(pt.age)}`,
      })),
    [proj]
  )

  return (
    <div className="flex flex-col gap-3">

      {/* ── DCA Stack Hero ──────────────────────────── */}
      <Card>
        <span className="label-xs">DCA STACK</span>

        {/* Main numbers */}
        <div className="grid grid-cols-[1fr_auto] gap-4 items-start mt-3">
          {/* Left: big BTC number */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[44px] font-bold tracking-[-0.05em] leading-none">
                {fmtBtc(proj.currentBtc, 4)}
              </span>
              <span className="text-[17px] font-bold text-muted">BTC</span>
            </div>
            <p className="font-mono text-[13px] text-muted mt-1">
              of {fmtBtc(proj.targetBTC, 4)} BTC
            </p>
          </div>

          {/* Right: target meta */}
          <div className="flex flex-col gap-2 pl-4 border-l border-border">
            <MetaItem label="TARGET"    value={`${fmtBtc(proj.targetBTC, 4)} BTC`} />
            <MetaItem label="BY AGE"    value={String(proj.targetAge)} />
            <MetaItem label="TIME LEFT" value={`${Math.max(0, proj.targetAge - proj.currentAge)} yrs`} />
          </div>
        </div>

        {/* Progress */}
        <ProgressBar pct={stackPct} color="orange" className="mt-4" />
        <div className="flex items-center justify-between mt-2">
          <span className="font-mono text-[12px] text-muted">{fmtPct(stackPct)}</span>
          <span className="text-[12px] text-muted">
            {proj.currentBtc < proj.targetBTC * 0.05
              ? 'Early days. Keep stacking.'
              : proj.onTrack
                ? 'On target. Stay consistent.'
                : 'Raise DCA to stay on track.'}
          </span>
        </div>
      </Card>

      {/* ── Estimated BTC at Age X ──────────────────── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="label-xs">ESTIMATED BTC AT AGE {proj.targetAge}</span>
          </div>
          <div className={`text-[11px] font-bold px-3 py-1.5 rounded-chip
            ${proj.onTrack
              ? 'bg-green-soft text-green'
              : 'bg-orange-soft text-orange'}`}>
            {proj.onTrack ? '✓ On target' : `−${fmtBtc(proj.shortfall, 3)} BTC`}
          </div>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
          {/* Big number */}
          <div>
            <span className={`font-mono text-[48px] font-bold tracking-[-0.05em] leading-none
              ${proj.onTrack ? 'text-green' : 'text-orange'}`}>
              {fmtBtc(proj.estimatedBTCAtTargetAge, 3)}
            </span>
            <p className="text-[13px] text-muted mt-1">BTC</p>
          </div>

          {/* Mini grid */}
          <div className="flex flex-col gap-2">
            <MiniCell label="REACH AGE"   value={proj.reachAge > 100 ? '100+' : proj.reachAge.toFixed(1)}
                      sub="At current pace" />
            <MiniCell label="GAP AT TARGET"
                      value={proj.onTrack ? 'On target' : `−${fmtBtc(proj.shortfall, 3)} BTC`}
                      sub={`By age ${proj.targetAge}`} />
            <MiniCell label="NEED / MONTH" value={$f(proj.requiredDca)}
                      sub={`To hit age ${proj.targetAge}`} />
          </div>
        </div>
      </Card>

      {/* ── Plan & Assumptions ──────────────────────── */}
      <Card>
        <CardHead
          title="Plan & Assumptions"
          right={
            <button onClick={onEditPlan}
                    className="text-blue text-[12px] font-semibold">Edit</button>
          }
        />
        <div className="grid grid-cols-2 gap-2">
          {[
            ['Age',         String(proj.currentAge),                   'years'],
            ['Target Age',  String(proj.targetAge),                    'years'],
            ['DCA Stack',   fmtBtc(proj.currentBtc, 4),               'BTC'],
            ['Monthly DCA', $f(proj.monthlyDcaUsd),                   '/month'],
            ['BTC Price',   fmtUsdCompact(proj.currentPrice),         'current'],
            ['Growth',      `${settings.annualGrowthRate}%`,          '/year'],
          ].map(([l, v, h]) => (
            <div key={l} className="bg-surface border border-border rounded-[10px] p-3">
              <span className="label-xs">{l}</span>
              <p className="font-mono text-[16px] font-bold tracking-tight mt-1">{v}</p>
              <p className="text-[11px] text-muted mt-0.5">{h}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted mt-3">
          Assumes {settings.annualGrowthRate}% annual BTC price growth. Live price auto-updates.
        </p>
      </Card>

      {/* ── BTC Growth Chart ────────────────────────── */}
      <Card>
        <CardHead title="BTC Growth Projection" />
        <MiniChart
          points={chartPts}
          goalY={proj.targetBTC}
          pillText={`${fmtBtc(proj.estimatedBTCAtTargetAge, 3)} BTC`}
        />
        <div className="mt-3 p-3 rounded-[10px] bg-green-soft border border-green/15 text-[13px] leading-relaxed text-secondary">
          {proj.onTrack
            ? <>At age <strong className="text-primary">{proj.targetAge}</strong>, your DCA path reaches{' '}
                <strong className="text-primary">{fmtBtc(proj.estimatedBTCAtTargetAge, 3)} BTC</strong>. On track ✓</>
            : <>At age <strong className="text-primary">{proj.targetAge}</strong>, you'll have{' '}
                <strong className="text-primary">{fmtBtc(proj.estimatedBTCAtTargetAge, 3)} BTC</strong>.
                Raise DCA to <strong className="text-primary">{$f(proj.requiredDca)}/month</strong> to hit goal.</>
          }
        </div>
      </Card>

      {/* ── What-If Scenarios ───────────────────────── */}
      <Card>
        <CardHead title="What-If Scenarios" />
        <div>
          {proj.suggestions.map((s, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
              <div className={`w-10 h-10 rounded-[10px] grid place-items-center text-[18px]
                ${i === 0 ? 'bg-green-soft' : i === 1 ? 'bg-orange-soft' : 'bg-purple/10'}`}>
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold">{s.label}</p>
                <p className="text-[12px] text-secondary mt-0.5">
                  Reach goal at age <strong className="font-mono">{s.reach.toFixed(1)}</strong>
                </p>
                <p className={`text-[11px] font-semibold mt-0.5 ${s.isEarly ? 'text-green' : 'text-orange'}`}>
                  {s.diffLabel}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── DCA Entries ─────────────────────────────── */}
      <Card>
        <CardHead
          title="DCA Entries"
          right={<span className="label-xs">{state.dca.length} entries</span>}
        />
        <div>
          {[...state.dca]
            .sort((a, b) => sortDesc(a, b, 'date'))
            .slice(0, 20)
            .map((x, i) => (
              <EntryRow
                key={i}
                kind="dca" badge="DCA"
                title={fmtDate(x.date)}
                sub={(x.note || x.source || '').replace(/, 1m candle/g, '').slice(0, 40)}
                val={`${x.btcQty >= 0 ? '+' : ''}${fmtBtc(x.btcQty)} BTC`}
                subVal={$f(x.price)}
                valClass={x.btcQty >= 0 ? 'text-green' : 'text-red'}
              />
            ))}
        </div>
      </Card>

    </div>
  )
}

/* ── Local sub-components ── */

function MetaItem({ label, value }) {
  return (
    <div>
      <span className="label-xs">{label}</span>
      <p className="font-mono text-[14px] font-bold mt-0.5">{value}</p>
    </div>
  )
}

function MiniCell({ label, value, sub }) {
  return (
    <div className="bg-surface border border-border rounded-[10px] px-3 py-2.5">
      <span className="label-xs">{label}</span>
      <p className="font-mono text-[14px] font-bold mt-1 tracking-tight">{value}</p>
      <p className="text-[10px] text-muted mt-0.5">{sub}</p>
    </div>
  )
}
