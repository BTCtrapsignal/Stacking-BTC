/**
 * AddEntrySheet — premium Add Entry bottom sheet.
 * Uses InputWithUnit for guided, minimal field UX.
 * Does NOT affect any other page or component.
 */
import { useState, useMemo } from 'react'
import { X } from 'lucide-react'


const MODES = ['DCA', 'Dip', 'Futures', 'Grid']

/* ── Reusable components — scoped to this file only ── */

/**
 * InputWithUnit — single input with optional right-side unit badge
 * and optional helper text below.
 */
function InputWithUnit({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  step,
  required,
  unit,
  helper,
}) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="text-[10px] font-semibold tracking-[0.07em] uppercase"
        style={{ color: 'var(--muted)' }}
      >
        {label}
      </span>
      <div className="flex items-center gap-0" style={{ position: 'relative' }}>
        <input
          type={type}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          step={step}
          required={required}
          className="w-full text-[14px] font-medium outline-none transition"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: unit ? '10px 0 0 10px' : '10px',
            borderRight: unit ? 'none' : undefined,
            padding: '11px 14px',
            color: 'var(--text)',
          }}
        />
        {unit && (
          <div
            className="shrink-0 flex items-center justify-center px-3 text-[11px] font-bold"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderLeft: '1px solid var(--border)',
              borderRadius: '0 10px 10px 0',
              height: '100%',
              minWidth: 44,
              color: 'var(--muted)',
              alignSelf: 'stretch',
            }}
          >
            {unit}
          </div>
        )}
      </div>
      {helper && (
        <span
          className="text-[11px]"
          style={{ color: 'var(--muted)', paddingLeft: 2 }}
        >
          {helper}
        </span>
      )}
    </div>
  )
}

/**
 * SelectRow — two equal-width option buttons (Side: Long/Short, Mode: Cross/Isolated)
 */
function SelectRow({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="text-[10px] font-semibold tracking-[0.07em] uppercase"
        style={{ color: 'var(--muted)' }}
      >
        {label}
      </span>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="py-2.5 text-[13px] font-semibold rounded-[10px] transition-colors"
            style={{
              background: value === opt ? 'var(--text)' : 'var(--surface)',
              border: '1px solid var(--border)',
              color: value === opt ? 'var(--card)' : 'var(--muted)',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Main component ── */

export function AddEntrySheet({ open, onClose, onSave, settings }) {
  const [mode, setMode]  = useState('DCA')
  const [form, setForm]  = useState({})

  if (!open) return null

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const price    = settings?.currentPrice || 71000
  const usdthb   = settings?.usdthb       || 32.86

  /* helper text calculators */
  function btcToUsd(btc)    { return btc > 0   ? `≈ $${(btc * price).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : null }
  function usdToThb(usd)    { return usd > 0   ? `≈ ฿${(usd * usdthb).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : null }
  function priceToThb(px)   { return px > 0    ? `≈ ฿${(px * usdthb).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : null }
  function roiFromGrid()    {
    const cap = +form.capitalUsdt, pnl = +form.netProfitUsdt
    return cap > 0 && pnl ? `ROI ≈ ${((pnl / cap) * 100).toFixed(2)}%` : null
  }
  function futurePnl()      {
    const entry = +form.entryPrice, exit = +form.exitPrice, size = +form.sizeBtc
    const side  = form.side || 'Long'
    if (!entry || !exit || !size) return null
    const pnl = side === 'Long' ? (exit - entry) * size : (entry - exit) * size
    return `PnL ≈ ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`
  }

  function handleSave(e) {
    e.preventDefault()
    const today = new Date().toISOString().slice(0, 10)
    if (mode === 'Futures') {
      const entryPrice = +form.entryPrice || 0
      const sizeBtc    = +form.sizeBtc    || 0
      const pnlUsdt    = +form.pnlUsdt    || 0
      const leverageRaw = form.leverage ? `${form.leverage}x` : '3x'
      const roi = calcFuturesRoi(pnlUsdt, entryPrice, sizeBtc, leverageRaw)
      onSave('futures', {
        dateOpen:  form.dateOpen  || today,
        dateClose: form.dateClose || today,
        symbol:    'BTCUSDT',
        side:      form.side      || 'Long',
        leverage:  leverageRaw,
        mode:      form.tradeMode || 'Cross',
        entryPrice,
        exitPrice:  +form.exitPrice  || 0,
        sizeBtc,
        pnlUsdt,
        roi,
        mistakeTag: form.mistakeTag  || null,
        notes:      form.notes       || null,
        strategy:   'Futures',
      })
    } else if (mode === 'Grid') {
      onSave('grid', {
        dateStart:     form.dateStart || today,
        dateEnd:       form.dateEnd   || today,
        gridType:      form.gridType  || 'Spot',
        mode:          form.gridMode  || 'Grid',
        capitalUsdt:   +form.capitalUsdt   || 0,
        netProfitUsdt: +form.netProfitUsdt || 0,
        roi:           +form.roi           || 0,
        note:          form.gridNote       || '',
        strategy:      'Grid Bot',
      })
    } else {
      onSave(mode === 'Dip' ? 'dip' : 'dca', {
        date:        form.date     || today,
        type:        form.type     || 'BUY',
        source:      form.source   || 'Manual',
        btcQty:      +form.btcQty     || 0,
        usdtAmount:  +form.usdtAmount || 0,
        price:       +form.price      || 0,
        note:        form.note        || '',
        location:    form.location    || 'Wallet',
        strategy:    mode === 'Dip' ? 'Dip Reserve' : 'DCA',
      })
    }
    setForm({})
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[90] bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[100] max-w-[430px] mx-auto
                   rounded-t-[24px] max-h-[92svh] overflow-y-auto"
        style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}
      >
        {/* Drag handle */}
        <div className="sticky top-0 z-10 pt-3 pb-2 px-5"
             style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
          <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ background: 'var(--border)' }} />

          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[18px] font-bold" style={{ color: 'var(--text)' }}>Add Entry</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full grid place-items-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Mode tabs */}
          <div className="grid grid-cols-4 gap-1.5">
            {MODES.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setForm({}) }}
                className="py-2 rounded-[8px] text-[12px] font-semibold border transition-colors"
                style={{
                  background:  mode === m ? 'var(--text)'    : 'var(--surface)',
                  borderColor: mode === m ? 'var(--text)'    : 'var(--border)',
                  color:       mode === m ? 'var(--card)'    : 'var(--muted)',
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Form body */}
        <form onSubmit={handleSave} className="px-5 py-4 flex flex-col gap-3.5">

          {/* ── DCA / Dip fields ── */}
          {(mode === 'DCA' || mode === 'Dip') && (
            <>
              <InputWithUnit
                label="Date" type="date"
                value={form.date} onChange={v => set('date', v)}
                placeholder="YYYY-MM-DD" required
              />
              <InputWithUnit
                label="BTC Amount" type="number"
                value={form.btcQty} onChange={v => set('btcQty', v)}
                placeholder="0.00500" step="0.00000001" unit="BTC"
                helper={btcToUsd(+form.btcQty)}
              />
              <InputWithUnit
                label="Price" type="number"
                value={form.price} onChange={v => set('price', v)}
                placeholder="65,000" step="0.01" unit="USD"
                helper={priceToThb(+form.price)}
              />
              <InputWithUnit
                label="USD Amount" type="number"
                value={form.usdtAmount} onChange={v => set('usdtAmount', v)}
                placeholder="325.00" step="0.01" unit="USD"
                helper={usdToThb(+form.usdtAmount)}
              />

              {/* Row: Exchange + Wallet */}
              <div className="grid grid-cols-2 gap-2.5">
                <InputWithUnit
                  label="Exchange" type="text"
                  value={form.source} onChange={v => set('source', v)}
                  placeholder="Bitkub"
                />
                <InputWithUnit
                  label="Wallet" type="text"
                  value={form.location} onChange={v => set('location', v)}
                  placeholder="Trezor"
                />
              </div>

              <InputWithUnit
                label="Note" type="text"
                value={form.note} onChange={v => set('note', v)}
                placeholder="Auto DCA (THB→USDT)"
              />
            </>
          )}

          {/* ── Futures fields ── */}
          {mode === 'Futures' && (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <InputWithUnit
                  label="Date Open" type="date"
                  value={form.dateOpen} onChange={v => set('dateOpen', v)}
                  placeholder="YYYY-MM-DD"
                />
                <InputWithUnit
                  label="Date Close" type="date"
                  value={form.dateClose} onChange={v => set('dateClose', v)}
                  placeholder="YYYY-MM-DD"
                />
              </div>

              <SelectRow
                label="Side"
                value={form.side || 'Long'}
                onChange={v => set('side', v)}
                options={['Long', 'Short']}
              />

              <SelectRow
                label="Mode"
                value={form.tradeMode || 'Cross'}
                onChange={v => set('tradeMode', v)}
                options={['Cross', 'Isolated']}
              />

              <InputWithUnit
                label="Leverage" type="number"
                value={form.leverage} onChange={v => set('leverage', v)}
                placeholder="3" step="1" unit="x"
                helper="Effective leverage multiplier"
              />

              <div className="grid grid-cols-2 gap-2.5">
                <InputWithUnit
                  label="Entry Price" type="number"
                  value={form.entryPrice} onChange={v => set('entryPrice', v)}
                  placeholder="65,000" step="0.01" unit="USD"
                />
                <InputWithUnit
                  label="Exit Price" type="number"
                  value={form.exitPrice} onChange={v => set('exitPrice', v)}
                  placeholder="70,000" step="0.01" unit="USD"
                />
              </div>

              <InputWithUnit
                label="Size" type="number"
                value={form.sizeBtc} onChange={v => set('sizeBtc', v)}
                placeholder="0.035" step="0.0001" unit="BTC"
                helper={futurePnl()}
              />

              <InputWithUnit
                label="Realized PnL" type="number"
                value={form.pnlUsdt} onChange={v => set('pnlUsdt', v)}
                placeholder="100.33" step="0.01" unit="USD"
                helper={form.pnlUsdt ? usdToThb(Math.abs(+form.pnlUsdt)) : null}
              />

              <InputWithUnit
                label="Mistake Tag" type="text"
                value={form.mistakeTag} onChange={v => set('mistakeTag', v)}
                placeholder="Stop Hunt / Late Entry"
              />
              <InputWithUnit
                label="Note" type="text"
                value={form.notes} onChange={v => set('notes', v)}
                placeholder="Sweep → TP"
              />
            </>
          )}

          {/* ── Grid fields ── */}
          {mode === 'Grid' && (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <InputWithUnit
                  label="Date Start" type="date"
                  value={form.dateStart} onChange={v => set('dateStart', v)}
                  placeholder="YYYY-MM-DD"
                />
                <InputWithUnit
                  label="Date End" type="date"
                  value={form.dateEnd} onChange={v => set('dateEnd', v)}
                  placeholder="YYYY-MM-DD"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <SelectRow
                  label="Grid Type"
                  value={form.gridType || 'Spot'}
                  onChange={v => set('gridType', v)}
                  options={['Spot', 'Futures']}
                />
                <SelectRow
                  label="Grid Mode"
                  value={form.gridMode || 'Arithmetic'}
                  onChange={v => set('gridMode', v)}
                  options={['Arithmetic', 'Geometric']}
                />
              </div>

              <InputWithUnit
                label="Capital" type="number"
                value={form.capitalUsdt} onChange={v => set('capitalUsdt', v)}
                placeholder="1,000" step="0.01" unit="USD"
                helper={usdToThb(+form.capitalUsdt)}
              />

              <InputWithUnit
                label="Net Profit" type="number"
                value={form.netProfitUsdt} onChange={v => set('netProfitUsdt', v)}
                placeholder="120.00" step="0.01" unit="USD"
                helper={roiFromGrid()}
              />

              <InputWithUnit
                label="ROI %" type="number"
                value={form.roi} onChange={v => set('roi', v)}
                placeholder="3.57" step="0.01" unit="%"
              />

              <InputWithUnit
                label="Note" type="text"
                value={form.gridNote} onChange={v => set('gridNote', v)}
                placeholder="Closed near upper range"
              />
            </>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2.5 pt-1 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 rounded-[12px] text-[14px] font-semibold"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-3 rounded-[12px] text-[14px] font-bold hover:opacity-90 transition-opacity"
              style={{ background: 'var(--text)', color: 'var(--card)' }}
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
