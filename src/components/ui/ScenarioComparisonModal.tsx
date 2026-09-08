// Scenario Comparison Modal (A vs B vs C) for TN NEXUS
import React from 'react';
import { Layers, X, Check, Save, Download } from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';

export const ScenarioComparisonModal: React.FC = () => {
  const isScenarioModalOpen = useCityStore((state) => state.isScenarioModalOpen);
  const setModalState = useCityStore((state) => state.setModalState);
  const scenarios = useCityStore((state) => state.scenarios);
  const activeScenarioId = useCityStore((state) => state.activeScenarioId);
  const saveScenario = useCityStore((state) => state.saveScenario);
  const loadScenario = useCityStore((state) => state.loadScenario);

  if (!isScenarioModalOpen) return null;

  const slots: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-4xl nexus-glass rounded-2xl border border-cyan-500/30 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setModalState('isScenarioModalOpen', false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
          <Layers className="w-4 h-4" />
          <span>MULTI-SCENARIO POLICY COMPARISON ENGINE</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">
          Comparative Analysis: Scenarios A, B & C
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Compare cross-sector impacts, capital expenditure, and resilience outcomes across alternative urban trajectories.
        </p>

        {/* 3-Column Scenario Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {slots.map((s) => {
            const sc = scenarios[s];
            const isActive = activeScenarioId === s;

            return (
              <div
                key={s}
                className={`p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 border-cyan-400 shadow-xl shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-cyan-300">
                    SLOT {s}
                  </span>
                  {isActive && (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500 text-black font-bold">
                      Active
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white mb-1">{sc.name}</h4>
                <p className="text-[11px] text-slate-400 mb-4 h-10 leading-relaxed">
                  {sc.description}
                </p>

                {/* Metrics Table */}
                <div className="space-y-2 text-xs font-mono border-t border-white/10 pt-3 mb-4">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Population:</span>
                    <span>{sc.state.totalPopulation.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Avg Speed:</span>
                    <span className="text-cyan-400 font-bold">{sc.state.averageTravelSpeedKmh} km/h</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Water Stress:</span>
                    <span className={sc.state.waterStressIndex > 70 ? 'text-rose-400' : 'text-emerald-400'}>
                      {sc.state.waterStressIndex}%
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Ambient AQI:</span>
                    <span>{sc.state.averageAQIPM25} PM2.5</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Resilience:</span>
                    <span className="text-emerald-400 font-bold">{sc.state.disasterResilienceIndex}/100</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-1 border-t border-white/5">
                    <span className="text-slate-500">Budget Spent:</span>
                    <span className="text-amber-400 font-bold">₹{sc.budgetSpentCrore} Cr</span>
                  </div>
                </div>

                {/* Slot Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => loadScenario(s)}
                    disabled={isActive}
                    className="flex-1 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-mono text-xs font-semibold transition-all"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => saveScenario(s)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs transition-all"
                    title={`Save current city state into Slot ${s}`}
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-mono text-slate-400">
          <span>All scenarios maintain deterministic seed consistency.</span>
          <button
            onClick={() => setModalState('isScenarioModalOpen', false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
