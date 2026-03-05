import { useState } from 'react';
import { generateProposal } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultCard from '../components/ResultCard';

export default function ProposalPage() {
  const [form, setForm] = useState({ budget: '', client_type: '', event_type: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.budget || !form.client_type.trim() || !form.event_type.trim()) {
      setError('All fields are required.');
      return;
    }
    if (Number(form.budget) < 100) {
      setError('Budget must be at least $100.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await generateProposal(
        Number(form.budget),
        form.client_type,
        form.event_type
      );
      setResult(response.data);
    } catch (err) {
      setError(err.message || 'Failed to generate proposal.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen mesh-bg py-8 sm:py-12 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 mb-3 sm:mb-4">
            <span className="text-blue-400 text-[10px] sm:text-xs font-semibold uppercase tracking-widest">AI Module 2</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">B2B Proposal Generator</h1>
          <p className="text-slate-400 text-xs sm:text-sm px-2">
            Generate tailored sustainable product proposals for corporate clients instantly
          </p>
        </div>

        {/* Form */}
        <div className="glass-card p-4 sm:p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="field-label" htmlFor="budget">Budget (USD)</label>
              <input
                id="budget"
                className="rayeva-input text-sm sm:text-base"
                type="number"
                min="100"
                placeholder="e.g. 5000"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="client_type">Client Type</label>
              <input
                id="client_type"
                className="rayeva-input text-sm sm:text-base"
                type="text"
                placeholder="e.g. Corporate office, Hotel chain, NGO..."
                value={form.client_type}
                onChange={(e) => setForm({ ...form, client_type: e.target.value })}
                maxLength={200}
                disabled={loading}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="event_type">Event / Purpose</label>
              <input
                id="event_type"
                className="rayeva-input text-sm sm:text-base"
                type="text"
                placeholder="e.g. Employee welcome kits, Conference swag, Year-end gifts..."
                value={form.event_type}
                onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                maxLength={200}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-400">
                <span>⚠️</span> {error}
              </div>
            )}

            <button id="generate-proposal-btn" type="submit" className="rayeva-btn w-full text-sm sm:text-base" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner inline-block w-3 sm:w-4 h-3 sm:h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                  Generating Proposal...
                </>
              ) : (
                <>
                  <span>📋</span> Generate Proposal
                </>
              )}
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && <LoadingSpinner message="AI is crafting your sustainability proposal..." />}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-px bg-emerald-500/20"></div>
              <span className="text-[10px] sm:text-xs text-emerald-400 font-semibold uppercase tracking-widest">AI Proposal</span>
              <div className="flex-1 h-px bg-emerald-500/20"></div>
            </div>

            {/* Impact Summary */}
            <ResultCard title="Impact Summary" icon="🌍">
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">{result.impact_summary}</p>
            </ResultCard>

            {/* Recommended Products */}
            <ResultCard title="Recommended Products" icon="📦">
              <div className="space-y-2 sm:space-y-3">
                {result.recommended_products?.map((product, i) => (
                  <div key={i} className="flex flex-col xs:flex-row items-start justify-between gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-white/3 border border-white/5">
                    <div className="flex-1 w-full">
                      <p className="text-xs sm:text-sm font-semibold text-white">{product.name}</p>
                      {product.sustainability_note && (
                        <p className="text-[10px] sm:text-xs text-emerald-400/70 mt-0.5 leading-tight">{product.sustainability_note}</p>
                      )}
                    </div>
                    <div className="text-left xs:text-right w-full xs:w-auto shrink-0 mt-1 xs:mt-0 pt-2 xs:pt-0 border-t xs:border-0 border-white/5">
                      <p className="text-[10px] sm:text-xs text-slate-400">Qty: {product.quantity}</p>
                      <p className="text-xs sm:text-sm font-bold text-emerald-300">{formatCurrency(product.estimated_cost)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ResultCard>

            {/* Budget Allocation */}
            <ResultCard title="Budget Allocation" icon="💰">
              <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3">
                {[
                  { label: 'Products', value: result.budget_allocation?.product_cost, color: 'emerald' },
                  { label: 'Packaging', value: result.budget_allocation?.packaging, color: 'blue' },
                  { label: 'Logistics', value: result.budget_allocation?.logistics, color: 'violet' },
                ].map((item) => (
                  <div key={item.label} className="text-center p-2 sm:p-3 rounded-lg bg-white/3 border border-white/5 flex flex-row xs:flex-col justify-between items-center xs:items-stretch">
                    <p className="text-[10px] sm:text-xs text-slate-400 xs:mb-1">{item.label}</p>
                    <p className="text-sm sm:text-base font-bold text-white">{formatCurrency(item.value || 0)}</p>
                  </div>
                ))}
              </div>
              {/* Budget bar */}
              {result.budget_allocation && result.budget && (
                <div className="mt-3">
                  <div className="w-full h-1.5 sm:h-2 bg-white/5 rounded-full overflow-hidden flex">
                    {[
                      { value: result.budget_allocation.product_cost, bg: 'bg-emerald-500' },
                      { value: result.budget_allocation.packaging, bg: 'bg-blue-500' },
                      { value: result.budget_allocation.logistics, bg: 'bg-violet-500' },
                    ].map((seg, i) => (
                      <div
                        key={i}
                        className={`h-full ${seg.bg}`}
                        style={{ width: `${(seg.value / result.budget) * 100}%` }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-1 sm:mt-1.5 text-right">
                    Total: {formatCurrency(result.budget)}
                  </p>
                </div>
              )}
            </ResultCard>

            {/* Meta */}
            <div className="text-center text-[10px] sm:text-xs text-slate-600 pt-2 pb-4">
              Saved to database · Log ID: {result.ai_log_id || 'N/A'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
