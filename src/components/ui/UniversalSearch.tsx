// Universal City-Building Search Engine ("WHAT DO YOU WANT TO BUILD?") for TN NEXUS
import React, { useState, useMemo } from 'react';
import {
  Search,
  Building2,
  Activity,
  HeartPulse,
  Heart,
  Navigation,
  TrendingUp,
  GitCommit,
  Bus,
  Train,
  Factory,
  Cpu,
  Truck,
  GraduationCap,
  BookOpen,
  Droplets,
  Sun,
  RefreshCw,
  Trash2,
  Trees,
  Trophy,
  ShieldAlert,
  Home,
  ShoppingBag,
  Package,
  X,
  ChevronRight,
  Filter
} from 'lucide-react';
import { ASSET_CATALOG } from '../../data/assetCatalog';
import { AssetTemplate, AssetCategory } from '../../types/city';
import { useCityStore } from '../../store/useCityStore';

// Map icon names to Lucide icons
const IconMap: { [key: string]: React.FC<{ className?: string }> } = {
  Building2,
  Activity,
  HeartPulse,
  Heart,
  Navigation,
  TrendingUp,
  GitCommit,
  Bus,
  Train,
  Factory,
  Cpu,
  Truck,
  GraduationCap,
  BookOpen,
  Droplets,
  Sun,
  RefreshCw,
  Trash2,
  Trees,
  Trophy,
  ShieldAlert,
  Home,
  ShoppingBag,
  Package,
};

export const UniversalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'all'>('all');
  const [isOpen, setIsOpen] = useState(true);

  const activeAssetTemplate = useCityStore((state) => state.activeAssetTemplate);
  const selectAssetTemplate = useCityStore((state) => state.selectAssetTemplate);

  const categories: { id: AssetCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Assets' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'transport', label: 'Mobility' },
    { id: 'industrial', label: 'Industrial/IT' },
    { id: 'utilities', label: 'Utilities/Water' },
    { id: 'education', label: 'Education' },
    { id: 'recreation', label: 'Green/Parks' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'residential', label: 'Housing' },
    { id: 'agriculture', label: 'Agro' },
  ];

  // Fuzzy filter assets based on search query, category, and synonyms
  const filteredAssets = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ASSET_CATALOG.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;

      // Fuzzy match on name, description, typical function, or keywords
      const inName = item.name.toLowerCase().includes(q);
      const inDesc = item.description.toLowerCase().includes(q);
      const inFunc = item.typicalFunction.toLowerCase().includes(q);
      const inKeywords = item.keywords.some((k) => k.toLowerCase().includes(q));

      return inName || inDesc || inFunc || inKeywords;
    });
  }, [query, selectedCategory]);

  return (
    <div className={`fixed top-20 left-4 z-20 transition-all duration-300 ${isOpen ? 'w-96' : 'w-12'}`}>
      {/* Floating Header / Collapsed Toggle */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-xl nexus-glass flex items-center justify-center text-cyan-400 hover:text-white border border-cyan-500/30 shadow-lg shadow-black/50"
          title="Open Construction Search"
        >
          <Search className="w-5 h-5" />
        </button>
      ) : (
        <div className="nexus-glass rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[calc(100vh-140px)] overflow-hidden">
          {/* Header Bar */}
          <div className="p-4 border-b border-white/10 bg-slate-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                Universal City-Building Search
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-base font-bold text-white mb-2">
              What do you want to build?
            </h2>

            {/* Search Input Bar */}
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search hospital, flyover, solar, tech park, school..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Quick Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-2 mt-1 no-scrollbar text-[11px] font-mono">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-2 py-1 rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === c.id
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Asset List Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredAssets.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs font-mono">
                No matching infrastructure found for "{query}".
                <div className="mt-2 text-cyan-400">Try "hospital", "expressway", "textile", or "water".</div>
              </div>
            ) : (
              filteredAssets.map((item) => {
                const isSelected = activeAssetTemplate?.type === item.type;
                const IconComp = IconMap[item.iconName] || Building2;

                return (
                  <div
                    key={item.type}
                    onClick={() => {
                      if (isSelected) {
                        selectAssetTemplate(null);
                      } else {
                        selectAssetTemplate(item);
                      }
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-500/15'
                        : 'bg-slate-900/40 border-white/5 hover:border-cyan-500/30 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-cyan-500 text-black shadow-md'
                            : 'bg-slate-800 text-cyan-400 border border-white/5'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {item.name}
                          </h4>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/5 text-cyan-300 border border-white/5">
                            {item.category}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                          {item.description}
                        </p>

                        {/* Quick Spec Tags */}
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                          <span className="text-emerald-400">
                            ₹{item.baseCostCrore} Cr
                          </span>
                          <span>•</span>
                          <span>
                            {item.defaultCapacity.toLocaleString()} {item.defaultCapacityUnit}
                          </span>
                          <span>•</span>
                          <span className="text-cyan-400 flex items-center gap-0.5">
                            {isSelected ? 'ACTIVE PREVIEW' : 'Select'}
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Active Selection Banner */}
          {activeAssetTemplate && (
            <div className="p-2.5 bg-cyan-950/80 border-t border-cyan-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-cyan-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Move cursor on 3D city & click to place</span>
              </div>
              <button
                onClick={() => selectAssetTemplate(null)}
                className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-white/10"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
