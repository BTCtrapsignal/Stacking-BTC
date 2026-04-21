/**
 * BottomNav — fixed bottom navigation.
 * Tabs: Home | DCA | [+FAB] | Futures | Triggers | More
 */
import { Home, TrendingUp, DollarSign, Zap, MoreHorizontal } from 'lucide-react'

const TABS = [
  { id: 'home',     label: 'Home',     Icon: Home },
  { id: 'dca',      label: 'DCA',      Icon: TrendingUp },
  null, // FAB placeholder
  { id: 'futures',  label: 'Futures',  Icon: DollarSign },
  { id: 'triggers', label: 'Triggers', Icon: Zap },
  { id: 'more',     label: 'More',     Icon: MoreHorizontal },
]

export function BottomNav({ active, onChange, onAdd }) {
  return (
    <nav className="
      fixed bottom-0 left-0 right-0 z-50
      bg-surface/95 backdrop-blur-xl
      border-t border-border
      safe-area-pb
    ">
      <div className="max-w-[430px] mx-auto grid grid-cols-6 items-end px-1 py-2">
        {TABS.map((tab, i) => {
          if (!tab) {
            // FAB slot
            return (
              <div key="fab" className="flex justify-center items-end pb-1">
                <button
                  onClick={onAdd}
                  className="
                    w-12 h-12 rounded-full
                    bg-primary text-bg
                    grid place-items-center
                    shadow-[0_4px_18px_rgba(0,0,0,0.35)]
                    hover:opacity-90 active:scale-95 transition-all
                  "
                  aria-label="Add entry"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5"  y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            )
          }

          const { id, label, Icon } = tab
          const isActive = active === id

          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`
                flex flex-col items-center gap-1 py-1 px-0.5
                text-[9px] font-semibold tracking-wide uppercase
                transition-colors
                ${isActive ? 'text-primary' : 'text-muted hover:text-secondary'}
              `}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
