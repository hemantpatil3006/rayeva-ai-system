import { useState } from 'react';
import { generateCategory } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultCard from '../components/ResultCard';

export default function ProductUploadPage() {
  const [form, setForm] = useState({ product_name: '', description: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product_name.trim() || !form.description.trim()) {
      setError('Both fields are required.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await generateCategory(form.product_name, form.description);
      setResult(response.data);
    } catch (err) {
      setError(err.message || 'Failed to generate category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg py-8 sm:py-12 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 mb-3 sm:mb-4">
            <span className="text-emerald-400 text-[10px] sm:text-xs font-semibold uppercase tracking-widest">AI Module 1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Product Category Generator</h1>
          <p className="text-slate-400 text-xs sm:text-sm px-2">
            Auto-generate sustainable categories, SEO tags &amp; eco-filters using AI
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-4 sm:p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="field-label" htmlFor="product_name">Product Name</label>
              <input
                id="product_name"
                className="rayeva-input text-sm sm:text-base"
                type="text"
                placeholder="e.g. Bamboo Toothbrush"
                value={form.product_name}
                onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                maxLength={200}
                disabled={loading}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="description">Description</label>
              <textarea
                id="description"
                className="rayeva-input text-sm sm:text-base"
                rows={4}
                placeholder="e.g. Eco-friendly toothbrush made from bamboo handle, BPA-free bristles..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                maxLength={2000}
                disabled={loading}
              />
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1">{form.description.length}/2000 chars</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-400">
                <span>⚠️</span> {error}
              </div>
            )}

            <button id="generate-category-btn" type="submit" className="rayeva-btn w-full text-sm sm:text-base" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner inline-block w-3 sm:w-4 h-3 sm:h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                  Generating with AI...
                </>
              ) : (
                <>
                  <span>✨</span> Generate Category
                </>
              )}
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && <LoadingSpinner message="AI is categorizing your product..." />}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-px bg-emerald-500/20"></div>
              <span className="text-[10px] sm:text-xs text-emerald-400 font-semibold uppercase tracking-widest">AI Result</span>
              <div className="flex-1 h-px bg-emerald-500/20"></div>
            </div>

            {/* Categories */}
            <ResultCard title="Categories" icon="🏷️">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <p className="text-[10px] sm:text-xs text-slate-500 mb-0.5 sm:mb-1">Primary</p>
                  <p className="text-sm sm:text-base font-semibold text-emerald-300">{result.primary_category}</p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] sm:text-xs text-slate-500 mb-0.5 sm:mb-1">Sub-category</p>
                  <p className="text-sm sm:text-base font-semibold text-white">{result.sub_category}</p>
                </div>
              </div>
            </ResultCard>

            {/* SEO Tags */}
            <ResultCard title="SEO Tags" icon="🔍">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {result.seo_tags?.map((tag, i) => (
                  <span key={i} className="tag-pill text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5">#{tag}</span>
                ))}
              </div>
            </ResultCard>

            {/* Sustainability Filters */}
            <ResultCard title="Sustainability Filters" icon="🌿">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {result.sustainability_filters?.map((f, i) => (
                  <span key={i} className="filter-pill text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5">✓ {f}</span>
                ))}
              </div>
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
