/**
 * AddEntrySheet — bottom sheet for adding entries.
 * All colors via CSS variables.
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
        dateOpen: form.dateOpen || today, dateClose: form.dateClose || today,
        symbol: 'BTCUSDT', side: form.side || 'Long', leverage: form.leverage || '3x',
        mode: form.tradeMode || 'Cross', entryPrice: +form.entryPrice || 0,
        exitPrice: +form.exitPrice || 0, sizeBtc: +form.sizeBtc || 0,
        pnlUsdt: +form.pnlUsdt || 0, mistakeTag: form.mistakeTag || null,
        notes: form.notes || null, strategy: 'Futures',
      })
    } else if (mode === 'Grid') {
      onSave('grid', {
        dateStart: form.dateStart || today, dateEnd: form.dateEnd || today,
        gridType: form.gridType || 'Spot', mode: form.gridMode || 'Grid',
        capitalUsdt: +form.capitalUsdt || 0, netProfitUsdt: +form.netProfitUsdt || 0,
        roi: +form.roi || 0, note: form.gridNote || '', strategy: 'Grid Bot',
      })
    } else {
      onSave(mode === 'Dip' ? 'dip' : 'dca', {
        date: form.date || today, type: form.type || 'BUY', source: form.source || 'Manual',
        btcQty: +form.btcQty || 0, usdtAmount: +form.usdtAmount || 0,
        price: +form.price || 0, note: form.note || '',
        location: form.location || 'Wallet',
        strategy: mode === 'Dip' ? 'Dip Reserve' : 'DCA',
      })
    }
    setForm({})
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/50" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-[100] max-w-[430px] mx-auto
                   rounded-t-[24px] p-5 max-h-[88svh] overflow-y-auto"
        style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--border)' }} />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[18px] font-bold" style={{ color: 'var(--text)' }}>Add Entry</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full grid place-items-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
          ><X size={14} /></button>
        </div>

        {/* Mode tabs */}
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          {MODES.map(m => (
            <button
              key={m} onClick={() => setMode(m)}
              className="py-2 rounded-[8px] text-[12px] font-semibold border transition-colors"
              style={{
                background: mode === m ? 'var(--text)' : 'var(--surface)',
                borderColor: mode === m ? 'var(--text)' : 'var(--border)',
                color: mode === m ? 'var(--card)' : 'var(--muted)',
              }}
            >{m}</button>
          ))}
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-3">
          {(mode === 'DCA' || mode === 'Dip') && (
            <>
              <SF l="Date" t="date" v={form.date} o={v => set('date', v)} req />
              <SF l="Type" t="text" v={form.type} o={v => set('type', v)} p="BUY" />
              <SF l="BTC Amount" t="number" v={form.btcQty} o={v => set('btcQty', v)} s="0.00000001" />
              <SF l="Price (USD)" t="number" v={form.price} o={v => set('price', v)} s="0.01" />
              <SF l="USD Amount" t="number" v={form.usdtAmount} o={v => set('usdtAmount', v)} s="0.01" />
              <SF l="Exchange" t="text" v={form.source} o={v => set('source', v)} p="Manual" />
              <SF l="Wallet" t="text" v={form.location} o={v => set('location', v)} p="Wallet" />
              <SF l="Note" t="text" v={form.note} o={v => set('note', v)} />
            </>
          )}
          {mode === 'Futures' && (
            <>
              <SF l="Date Open"   t="date"   v={form.dateOpen}   o={v => set('dateOpen', v)} />
              <SF l="Date Close"  t="date"   v={form.dateClose}  o={v => set('dateClose', v)} />
              <SF l="Side"        t="text"   v={form.side}       o={v => set('side', v)} p="Long" />
              <SF l="Leverage"    t="text"   v={form.leverage}   o={v => set('leverage', v)} p="3x" />
              <SF l="Mode"        t="text"   v={form.tradeMode}  o={v => set('tradeMode', v)} p="Cross" />
              <SF l="Entry Price" t="number" v={form.entryPrice} o={v => set('entryPrice', v)} s="0.01" />
              <SF l="Exit Price"  t="number" v={form.exitPrice}  o={v => set('exitPrice', v)} s="0.01" />
              <SF l="Size BTC"    t="number" v={form.sizeBtc}    o={v => set('sizeBtc', v)} s="0.0001" />
              <SF l="PnL (USD)"   t="number" v={form.pnlUsdt}    o={v => set('pnlUsdt', v)} s="0.01" />
              <SF l="Mistake Tag" t="text"   v={form.mistakeTag} o={v => set('mistakeTag', v)} />
              <SF l="Note"        t="text"   v={form.notes}      o={v => set('notes', v)} />
            </>
          )}
          {mode === 'Grid' && (
            <>
              <SF l="Date Start"    t="date"   v={form.dateStart}     o={v => set('dateStart', v)} />
              <SF l="Date End"      t="date"   v={form.dateEnd}       o={v => set('dateEnd', v)} />
              <SF l="Grid Type"     t="text"   v={form.gridType}      o={v => set('gridType', v)} p="Spot" />
              <SF l="Mode"          t="text"   v={form.gridMode}      o={v => set('gridMode', v)} p="Grid" />
              <SF l="Capital (USD)" t="number" v={form.capitalUsdt}   o={v => set('capitalUsdt', v)} s="0.01" />
              <SF l="Net Profit"    t="number" v={form.netProfitUsdt} o={v => set('netProfitUsdt', v)} s="0.01" />
              <SF l="ROI %"         t="number" v={form.roi}           o={v => set('roi', v)} s="0.01" />
              <SF l="Note"          t="text"   v={form.gridNote}      o={v => set('gridNote', v)} />
            </>
          )}
          <div className="grid grid-cols-2 gap-2.5 mt-1">
            <button
              type="button" onClick={onClose}
              className="py-3 rounded-[12px] text-[14px] font-semibold"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)' }}
            >Cancel</button>
            <button
              type="submit"
              className="py-3 rounded-[12px] text-[14px] font-bold hover:opacity-90"
              style={{ background: 'var(--text)', color: 'var(--card)' }}
            >Save Entry</button>
          </div>
        </form>
      </div>
    </>
  )
}

function SF({ l, t, v, o, p, s, req }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="label-xs">{l}</span>
      <input
        type={t} value={v || ''} step={s} placeholder={p} required={req}
        onChange={e => o(e.target.value)}
        className="w-full px-3.5 py-3 rounded-[10px] text-[14px] font-medium outline-none transition"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        }}
      />
    </label>
  )
}
