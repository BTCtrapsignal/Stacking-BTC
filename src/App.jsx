/**
 * App.jsx — Root component.
 * Manages active screen, global state, dialogs, price refresh.
 */
import { useState, useCallback } from 'react'
import { useAppState }       from './hooks/useAppState'
import { usePrice }          from './hooks/usePrice'
import { AppHeader }         from './components/layout/AppHeader'
import { BottomNav }         from './components/layout/BottomNav'
import { AddEntrySheet }     from './components/layout/AddEntrySheet'
import { HomePage }          from './pages/HomePage'
import { DcaPage }           from './pages/DcaPage'
import { FuturesPage }       from './pages/FuturesPage'
import { TriggersPage }      from './pages/TriggersPage'
import { MorePage }          from './pages/MorePage'

// ── Page title map ────────────────────────────────────
const PAGE_TITLES = {
  home:     'Home',
  dca:      'Stacking',
  futures:  'Futures',
  triggers: 'Triggers',
  more:     'More',
}

export default function App() {
  const { state, updateSettings, addEntry } = useAppState()

  const [activeTab, setActiveTab]   = useState('home')
  const [addSheetOpen, setAddSheet] = useState(false)

  // Price refresh
  const handlePriceUpdate = useCallback((price) => {
    updateSettings({ currentPrice: price })
  }, [updateSettings])

  const { loading: priceLoading, updatedAt, refresh: refreshPrice } =
    usePrice(handlePriceUpdate)

  // Page title sync
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    const el = document.getElementById('page-title')
    if (el) el.textContent = PAGE_TITLES[tab] || tab
  }

  // Add entry handler
  const handleSaveEntry = useCallback((type, entry) => {
    addEntry(type, entry)
  }, [addEntry])

  // Edit Goal dialog (inline)
  const [goalOpen, setGoalOpen]   = useState(false)
  const [planOpen, setPlanOpen]   = useState(false)
  const [goalForm, setGoalForm]   = useState({})
  const [planForm, setPlanForm]   = useState({})

  function openGoal() {
    setGoalForm({ goalBtc: state.settings.goalBtc, usdthb: state.settings.usdthb })
    setGoalOpen(true)
  }
  function saveGoal(e) {
    e.preventDefault()
    const g = parseFloat(goalForm.goalBtc)
    const r = parseFloat(goalForm.usdthb)
    if (g > 0) updateSettings({ goalBtc: g })
    if (r > 0) updateSettings({ usdthb: r })
    setGoalOpen(false)
  }

  function openPlan() {
    setPlanForm({
      currentAge:       state.settings.currentAge,
      targetAge:        state.settings.targetAge,
      monthlyDcaUsd:    state.settings.monthlyDcaUsd,
      annualGrowthRate: state.settings.annualGrowthRate,
    })
    setPlanOpen(true)
  }
  function savePlan(e) {
    e.preventDefault()
    const p = planForm
    updateSettings({
      currentAge:       +p.currentAge       || 29,
      targetAge:        +p.targetAge        || 40,
      monthlyDcaUsd:    +p.monthlyDcaUsd    || 300,
      annualGrowthRate: +p.annualGrowthRate || 10,
    })
    setPlanOpen(false)
  }

  return (
    <div className="max-w-[430px] mx-auto min-h-svh flex flex-col bg-bg">

      {/* ── Fixed Header ─────────────────────────── */}
      <AppHeader
        settings={state.settings}
        onRefreshPrice={refreshPrice}
        priceLoading={priceLoading}
      />

      {/* ── Scrollable Content ───────────────────── */}
      <main className="flex-1 overflow-y-auto px-3.5 pt-3 pb-[96px]">
        {activeTab === 'home' && (
          <HomePage state={state} onEditGoal={openGoal} />
        )}
        {activeTab === 'dca' && (
          <DcaPage state={state} onEditPlan={openPlan} />
        )}
        {activeTab === 'futures' && (
          <FuturesPage state={state} />
        )}
        {activeTab === 'triggers' && (
          <TriggersPage state={state} />
        )}
        {activeTab === 'more' && (
          <MorePage
            state={state}
            priceLoading={priceLoading}
            updatedAt={updatedAt}
            onRefresh={refreshPrice}
          />
        )}
      </main>

      {/* ── Bottom Nav ───────────────────────────── */}
      <BottomNav
        active={activeTab}
        onChange={handleTabChange}
        onAdd={() => setAddSheet(true)}
      />

      {/* ── Add Entry Sheet ──────────────────────── */}
      <AddEntrySheet
        open={addSheetOpen}
        onClose={() => setAddSheet(false)}
        onSave={handleSaveEntry}
      />

      {/* ── Edit Goal Sheet ──────────────────────── */}
      <SimpleSheet open={goalOpen} title="Edit Goal" onClose={() => setGoalOpen(false)}>
        <form onSubmit={saveGoal} className="flex flex-col gap-3">
          <SheetField label="Target BTC"   type="number" value={goalForm.goalBtc}
                      step="0.0001" onChange={v => setGoalForm(f => ({ ...f, goalBtc: v }))} />
          <SheetField label="USD / THB Rate" type="number" value={goalForm.usdthb}
                      step="0.01" onChange={v => setGoalForm(f => ({ ...f, usdthb: v }))} />
          <SheetActions onCancel={() => setGoalOpen(false)} />
        </form>
      </SimpleSheet>

      {/* ── Edit Plan Sheet ──────────────────────── */}
      <SimpleSheet open={planOpen} title="Edit DCA Plan" onClose={() => setPlanOpen(false)}>
        <form onSubmit={savePlan} className="flex flex-col gap-3">
          <SheetField label="Current Age"   type="number" value={planForm.currentAge}
                      step="1" onChange={v => setPlanForm(f => ({ ...f, currentAge: v }))} />
          <SheetField label="Target Age"    type="number" value={planForm.targetAge}
                      step="1" onChange={v => setPlanForm(f => ({ ...f, targetAge: v }))} />
          <SheetField label="Monthly DCA (USD)" type="number" value={planForm.monthlyDcaUsd}
                      step="10" onChange={v => setPlanForm(f => ({ ...f, monthlyDcaUsd: v }))} />
          <SheetField label="Annual Growth (%)" type="number" value={planForm.annualGrowthRate}
                      step="1" onChange={v => setPlanForm(f => ({ ...f, annualGrowthRate: v }))} />
          <SheetActions onCancel={() => setPlanOpen(false)} />
        </form>
      </SimpleSheet>

    </div>
  )
}

/* ── Reusable dialog sub-components ─────────────────── */

function SimpleSheet({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/50" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-[100] max-w-[430px] mx-auto
                      bg-surface border-t border-border rounded-t-[24px] p-5
                      max-h-[80svh] overflow-y-auto">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-bold">{title}</h3>
          <button onClick={onClose}
                  className="w-8 h-8 rounded-full bg-card border border-border
                             grid place-items-center text-muted hover:text-primary">
            <span className="text-[14px] leading-none">✕</span>
          </button>
        </div>
        {children}
      </div>
    </>
  )
}

function SheetField({ label, type, value, step, onChange }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="label-xs">{label}</span>
      <input
        type={type} value={value || ''} step={step}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3.5 py-3 rounded-[10px] bg-card border border-border
                   text-primary text-[15px] font-medium placeholder:text-muted
                   outline-none focus:border-blue/60 focus:ring-2 focus:ring-blue/10 transition"
      />
    </label>
  )
}

function SheetActions({ onCancel }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 mt-2">
      <button type="button" onClick={onCancel}
              className="py-3 rounded-[12px] border border-border bg-card
                         text-secondary text-[14px] font-semibold">
        Cancel
      </button>
      <button type="submit"
              className="py-3 rounded-[12px] bg-primary text-bg text-[14px] font-bold
                         hover:opacity-90 transition-opacity">
        Save
      </button>
    </div>
  )
}
