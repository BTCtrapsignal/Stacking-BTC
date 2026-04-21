export function Card({ children, className = '' }) {
  return (
    <div className={`bg-card border border-border rounded-card p-5 ${className}`}>
      {children}
    </div>
  )
}

export function CardHead({ title, right, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <h3 className="text-base font-bold tracking-tight">{title}</h3>
      {right && <div>{right}</div>}
    </div>
  )
}
