/**
 * AddEntrySheet — slide-up bottom sheet for adding DCA / Dip / Futures / Grid entries.
 */
import { useState } from 'react'
import { X } from 'lucide-react'

const MODES = ['DCA', 'Dip', 'Futures', 'Grid']

export function AddEntrySheet({ open, onClose, onSave }) {
  const [mode, setMode] = useState('DCA')
  const [form, setForm] = useState({})

  if (!open) return null

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSave(e) {
    e.preventDefault()
    const today = new Date().toISOString().slice(0, 10)

    if (mode === 'Futures') {
      onSave('futures', {
        dateOpen:  form.dateOpen  || today,
        dateClose: form.dateClose || today,
        symbol: 'BTCUSDT',
        side:     form.side    || 'Long',
        leverage: form.leverage || '3x',
        mode:     form.tradeMode || 'Cross',
        entryPrice: +form.entryPrice || 0,
        exitPrice:  +form.exitPrice  || 0,
        sizeBtc:    +form.sizeBtc    || 0,
        pnlUsdt:    +form.pnlUsdt    || 0,
        mistakeTag: form.mistakeTag  || null,
        notes:      form.notes       || null,
        strategy: 'Futures',
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
        strategy: 'Grid Bot',
      })
    } else {
      const arr = mode === 'Dip' ? 'dip' : 'dca'
      onSave(arr, {
        date:        form.date       || today,
        type:        form.type       || 'BUY',
        source:      form.source     || 'Manual',
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
      <div className="
        fixed bottom-0 left-0 right-0 z-[100]
        max-w-[430px] mx-auto
        bg-surface border-t border-border
        rounded-t-[24px] p-5
        max-h-[88svh] overflow-y-auto
      ">
        {/* Handle */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Add Entry</h3>
          <button onClick={onClose}
                  className="w-8 h-8 rounded-full bg-card border border-border grid place-items-center text-muted hover:text-primary">
            <X size={14} />
          </button>
        </div>

        {/* Mode selector */}
        <div className="grid grid-cols-4 gap-1.5 mb-5">
          {MODES.map(m => (
            <button key={m} onClick={() => setMode(m)}
                    className={`py-2 rounded-[8px] text-[12px] font-semibold border transition-colors
                      ${mode === m
                        ? 'bg-primary text-bg border-primary'
                        : 'bg-card border-border text-muted hover:text-secondary'}`}>
              {m}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-3">
          {/* Shared: BUY / DCA / Dip */}
          {(mode === 'DCA' || mode === 'Dip') && (
            <>
              <Field label="Date"         type="date"   value={form.date}        onChange={v => set('date', v)} required />
              <Field label="Type"         type="text"   value={form.type}        onChange={v => set('type', v)} placeholder="BUY" />
              <Field label="BTC Amount"   type="number" value={form.btcQty}      onChange={v => set('btcQty', v)} step="0.00000001" />
              <Field label="Price (USD)"  type="number" value={form.price}       onChange={v => set('price', v)} step="0.01" />
              <Field label="USD Amount"   type="number" value={form.usdtAmount}  onChange={v => set('usdtAmount', v)} step="0.01" />
              <Field label="Exchange"     type="text"   value={form.source}      onChange={v => set('source', v)} placeholder="Manual" />
              <Field label="Wallet"       type="text"   value={form.location}    onChange={v => set('location', v)} placeholder="Wallet" />
              <Field label="Note"         type="text"   value={form.note}        onChange={v => set('note', v)} />
            </>
          )}

          {/* Futures */}
          {mode === 'Futures' && (
            <>
              <Field label="Date Open"   type="date"   value={form.dateOpen}   onChange={v => set('dateOpen', v)} />
              <Field label="Date Close"  type="date"   value={form.dateClose}  onChange={v => set('dateClose', v)} />
              <Field label="Side"        type="text"   value={form.side}       onChange={v => set('side', v)} placeholder="Long" />
              <Field label="Leverage"    type="text"   value={form.leverage}   onChange={v => set('leverage', v)} placeholder="3x" />
              <Field label="Mode"        type="text"   value={form.tradeMode}  onChange={v => set('tradeMode', v)} placeholder="Cross" />
              <Field label="Entry Price" type="number" value={form.entryPrice} onChange={v => set('entryPrice', v)} step="0.01" />
              <Field label="Exit Price"  type="number" value={form.exitPrice}  onChange={v => set('exitPrice', v)} step="0.01" />
              <Field label="Size BTC"    type="number" value={form.sizeBtc}    onChange={v => set('sizeBtc', v)} step="0.0001" />
              <Field label="PnL (USD)"   type="number" value={form.pnlUsdt}    onChange={v => set('pnlUsdt', v)} step="0.01" />
              <Field label="Mistake Tag" type="text"   value={form.mistakeTag} onChange={v => set('mistakeTag', v)} />
              <Field label="Note"        type="text"   value={form.notes}      onChange={v => set('notes', v)} />
            </>
          )}

          {/* Grid */}
          {mode === 'Grid' && (
            <>
              <Field label="Date Start"    type="date"   value={form.dateStart}     onChange={v => set('dateStart', v)} />
              <Field label="Date End"      type="date"   value={form.dateEnd}       onChange={v => set('dateEnd', v)} />
              <Field label="Grid Type"     type="text"   value={form.gridType}      onChange={v => set('gridType', v)} placeholder="Spot" />
              <Field label="Mode"          type="text"   value={form.gridMode}      onChange={v => set('gridMode', v)} placeholder="Grid" />
              <Field label="Capital (USD)" type="number" value={form.capitalUsdt}   onChange={v => set('capitalUsdt', v)} step="0.01" />
              <Field label="Net Profit"    type="number" value={form.netProfitUsdt} onChange={v => set('netProfitUsdt', v)} step="0.01" />
              <Field label="ROI %"         type="number" value={form.roi}           onChange={v => set('roi', v)} step="0.01" />
              <Field label="Note"          type="text"   value={form.gridNote}      onChange={v => set('gridNote', v)} />
            </>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2.5 mt-2">
            <button type="button" onClick={onClose}
                    className="py-3 rounded-[12px] border border-border bg-card text-secondary text-sm font-semibold">
              Cancel
            </button>
            <button type="submit"
                    className="py-3 rounded-[12px] bg-primary text-bg text-sm font-bold hover:opacity-90">
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

/** Reusable field inside the sheet */
function Field({ label, type, value, onChange, placeholder, step, required }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="label-xs">{label}</span>
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        required={required}
        className="
          w-full px-3.5 py-3 rounded-[10px]
          bg-card border border-border
          text-primary text-[14px] font-medium
          placeholder:text-muted
          outline-none focus:border-blue/60 focus:ring-2 focus:ring-blue/10
          transition
        "
      />
    </label>
  )
}
