import React from 'react';
import { Languages } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 sticky top-0 z-50 transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2 rounded-xl shadow-lg shadow-violet-200/50 flex-shrink-0">
              <Languages className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight leading-none">CataLive</h1>
              <p className="text-[11px] text-violet-600 font-semibold tracking-wide mt-0.5">Catalan ↔ English</p>
            </div>
          </div>
          <div className="flex items-center">
             <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100/50 shadow-sm">
               <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
               Live
             </span>
          </div>
        </div>
      </div>
    </header>
  );
};