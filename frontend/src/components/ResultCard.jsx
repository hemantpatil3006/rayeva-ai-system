/**
 * ResultCard — Reusable card to display a labelled AI output section.
 * Variants: 'default' | 'tags' | 'filters' | 'product' | 'budget' | 'impact'
 */
export default function ResultCard({ title, icon, children, variant = 'default', className = '' }) {
  return (
    <div className={`glass-card p-5 fade-in-up ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-lg">{icon}</span>}
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
