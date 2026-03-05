import { useState } from 'react';
import ProductUploadPage from './pages/ProductUploadPage';
import ProposalPage from './pages/ProposalPage';
import './index.css';

const NAV_LINKS = [
  { id: 'category', label: '🌿 Product Categorizer', sublabel: 'Module 1' },
  { id: 'proposal', label: '📋 B2B Proposal', sublabel: 'Module 2' },
];

export default function App() {
  const [activePage, setActivePage] = useState('category');

  return (
    <div className="min-h-screen" style={{ background: '#0a0f0d' }}>
      <nav className="sticky top-0 z-50" style={{ background: 'rgba(10,15,13,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(16,185,129,0.12)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-900/50 flex-shrink-0">
              R
            </div>
            <div>
              <span className="font-bold text-white text-base leading-none block">Rayeva</span>
              <span className="block text-[10px] sm:text-xs text-emerald-400/70 leading-none mt-0.5">Sustainable Commerce AI</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-end">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                id={`nav-${link.id}`}
                onClick={() => setActivePage(link.id)}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex flex-col items-center gap-0.5 whitespace-nowrap ${
                  activePage === link.id
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{link.label}</span>
                <span className={`text-[10px] sm:text-xs font-normal ${activePage === link.id ? 'text-emerald-500' : 'text-slate-600'}`}>
                  {link.sublabel}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Pages */}
      <main>
        {activePage === 'category' && <ProductUploadPage />}
        {activePage === 'proposal' && <ProposalPage />}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-600" style={{ borderTop: '1px solid rgba(16,185,129,0.08)' }}>
        <p>🌿 Rayeva AI Platform · Sustainable Commerce · Powered by OpenAI</p>
      </footer>
    </div>
  );
}
