/**
 * Business logic — metrics, projection math, dip calculator.
 * Pure functions: no side effects, no UI imports.
 */

// ── Portfolio Metrics ─────────────────────────────────

export function computeMetrics({ dca, dip, futures, grid, settings }) {
  const price   = +settings.currentPrice || 0
  const usdthb  = +settings.usdthb || 33

  const dcaBtc  = dca.reduce((s, x) => s + (+x.btcQty || 0), 0)
  const dipBtc  = dip.reduce((s, x) => s + (+x.btcQty || 0), 0)
  const totalBtc = dcaBtc + dipBtc

  const dcaInv  = dca.reduce((s, x) => s + Math.abs(+x.usdtAmount || 0), 0)
  const dipInv  = dip.reduce((s, x) => s + Math.abs(+x.usdtAmount || 0), 0)
  const totalInv = dcaInv + dipInv

  const avgCost  = totalBtc > 0 ? totalInv / totalBtc : 0
  const futPnl   = futures.reduce((s, x) => s + (+x.pnlUsdt || 0), 0)
  const gridPnl  = grid.reduce((s, x) => s + (+x.netProfitUsdt || 0), 0)
  const wins     = futures.filter(x => +x.pnlUsdt > 0).length
  const winRate  = futures.length ? (wins / futures.length) * 100 : 0

  const mo      = new Date().toISOString().slice(0, 7)
  const moDca   = dca.filter(x => String(x.date).slice(0, 7) === mo)
  const moBtc   = moDca.reduce((s, x) => s + (+x.btcQty || 0), 0)
  const moInv   = moDca.reduce((s, x) => s + Math.abs(+x.usdtAmount || 0), 0)

  return {
    price, usdthb, dcaBtc, dipBtc, totalBtc,
    dcaInv, dipInv, totalInv, avgCost,
    futPnl, gridPnl, wins, winRate,
    moCount: moDca.length, moBtc, moInv,
    futsToBtc:     price > 0 ? futPnl  / price : 0,
    gridToBtc:     price > 0 ? gridPnl / price : 0,
    totalConverted: price > 0 ? (futPnl + gridPnl) / price : 0,
  }
}

// ── DCA Projection ────────────────────────────────────

export function estimateProjection({ settings, dcaBtc }) {
  const cur  = +(settings.manualCurrentDcaBtc || dcaBtc)
  const tgt  = +(settings.goalBtc || 1)
  const age  = +(settings.currentAge || 29)
  const tAge = +(settings.targetAge  || 40)
  const dca  = +(settings.monthlyDcaUsd || 300)
  const gr   = +(settings.annualGrowthRate || 0) / 100
  const p0   = +(settings.currentPrice || 1)
  const mgr  = Math.pow(1 + gr, 1 / 12) - 1
  const months = Math.max(0, Math.round((tAge - age) * 12))

  // Build path for chart
  let btc = cur, price = p0
  const path = [{ age, btc }]
  for (let i = 1; i <= months; i++) {
    btc   += dca / price
    price *= (1 + mgr)
    path.push({ age: age + i / 12, btc })
  }
  const estimatedBTCAtTargetAge = btc

  // Find when goal is reached
  let b2 = cur, p2 = p0, mo2 = 0
  while (b2 < tgt && mo2 < 1200) { b2 += dca / p2; p2 *= (1 + mgr); mo2++ }
  const reachAge  = age + mo2 / 12
  const shortfall = Math.max(0, tgt - btc)
  const requiredDca = solveRequiredDca({ cur, tgt, age, tAge, p0, gr })

  return {
    currentBtc: cur, targetBTC: tgt, currentAge: age, targetAge: tAge,
    currentPrice: p0, monthlyDcaUsd: dca, annualGrowthRate: gr,
    estimatedBTCAtTargetAge, shortfall, reachAge,
    onTrack: btc >= tgt, requiredDca, path,
    suggestions: buildSuggestions({ cur, tgt, age, tAge, p0, dca, gr }),
  }
}

function projectWith({ cur, tgt, age, tAge, p0, dca, gr }) {
  const mgr    = Math.pow(1 + gr, 1 / 12) - 1
  const months = Math.max(0, Math.round((tAge - age) * 12))
  let btc = cur, price = p0
  for (let i = 1; i <= months; i++) { btc += dca / price; price *= (1 + mgr) }
  let b2 = cur, p2 = p0, mo = 0
  while (b2 < tgt && mo < 1200) { b2 += dca / p2; p2 *= (1 + mgr); mo++ }
  return { projBtc: btc, reachAge: age + mo / 12, onTrack: btc >= tgt }
}

function solveRequiredDca({ cur, tgt, age, tAge, p0, gr }) {
  let lo = 0, hi = 100_000
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2
    projectWith({ cur, tgt, age, tAge, p0, dca: mid, gr }).projBtc >= tgt
      ? (hi = mid) : (lo = mid)
  }
  return hi
}

function buildSuggestions({ cur, tgt, age, tAge, p0, dca, gr }) {
  return [
    { extra: 100,  growthAdj: gr,   icon: '💵', label: `Add $100/month`,          cls: 's1' },
    { extra: 300,  growthAdj: gr,   icon: '💰', label: `Add $300/month`,          cls: 's2' },
    { extra: 0,    growthAdj: 0.15, icon: '📈', label: `Growth at 15%/yr`,        cls: 's3' },
  ].map(({ extra, growthAdj, icon, label, cls }) => {
    const s    = projectWith({ cur, tgt, age, tAge, p0, dca: dca + extra, gr: growthAdj })
    const diff = s.reachAge - tAge
    return {
      icon, label, cls, reach: s.reachAge,
      isEarly: diff <= 0,
      diffLabel: Math.abs(diff) < 0.1
        ? 'On target 🎯'
        : diff < 0
          ? `${Math.abs(diff).toFixed(1)} yrs early`
          : `${diff.toFixed(1)} yrs late`,
    }
  })
}

// ── Buy The Dip Calculator ────────────────────────────

/**
 * Calculate investment per layer from user inputs.
 *
 * @param {number} totalBudgetUsd  - Total capital in USD
 * @param {number} usdthb          - USD/THB exchange rate
 * @param {number} refPrice        - Reference BTC price (USD)
 * @param {Array}  layers          - [{ level, pct, dropPct }]
 * @returns {Array}                - Enriched layer objects with amounts
 */
export function calcDipLayers({ totalBudgetUsd, usdthb, refPrice, layers }) {
  return layers.map(layer => {
    const usdAmount  = (totalBudgetUsd * layer.pct) / 100
    const thbAmount  = usdAmount * usdthb
    const buyPrice   = refPrice * (1 + layer.dropPct / 100)
    const btcEst     = buyPrice > 0 ? usdAmount / buyPrice : 0
    return { ...layer, usdAmount, thbAmount, buyPrice, btcEst }
  })
}

/** Validate that layer percentages sum to exactly 100 */
export function validateDipLayers(layers) {
  const sum = layers.reduce((s, l) => s + (Number(l.pct) || 0), 0)
  return { valid: Math.abs(sum - 100) < 0.001, sum }
}
