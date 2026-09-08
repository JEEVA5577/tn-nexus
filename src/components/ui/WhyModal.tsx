// Quantitative Causal Explainability Modal for TN NEXUS
import React from 'react';
import { HelpCircle, X, ArrowDownRight, Layers, Sparkles } from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';

export const WhyModal: React.FC = () => {
  const isWhyModalOpen = useCityStore((state) => state.isWhyModalOpen);
  const activeWhyType = useCityStore((state) => state.activeWhyType);
  const setModalState = useCityStore((state) => state.setModalState);
  const whyCongestion = useCityStore((state) => state.whyCongestion);
  const whyWaterStress = useCityStore((state) => state.whyWaterStress);
  const whyAQI = useCityStore((state) => state.whyAQI);
  const causalEffects = useCityStore((state) => state.causalEffects);

  if (!isWhyModalOpen || !activeWhyType) return null;

  const dataMap = {
    congestion: {
      title: 'Why is Arterial Traffic Congestion at this level?',
      subtitle: 'Corridor Level-of-Service attribution across radial expressways',
      breakdown: whyCongestion,
      unit: '% contribution',
    },
    water: {
      title: 'Why is Municipal Water Stress at this index?',
      subtitle: 'Siruvani & Pillur bulk gravity supply drawdowns vs demand',
      breakdown: whyWaterStress,
      unit: '% consumption share',
    },
    aqi: {
      title: 'Why is the Ambient Air Quality Index (PM2.5) at this level?',
      subtitle: 'Atmospheric particulate dispersion and emission sources',
      breakdown: whyAQI,
      unit: '% pollution load',
    },
  };

  const current = dataMap[activeWhyType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full max-w-xl nexus-glass rounded-2xl border border-cyan-500/30 shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={() => setModalState('isWhyModalOpen', false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
          <HelpCircle className="w-4 h-4" />
          <span>CAUSAL ATTRIBUTION & EXPLAINABILITY ENGINE</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-1">{current.title}</h3>
        <p className="text-xs text-slate-400 mb-6">{current.subtitle}</p>

        {/* Quantitative Attribution Breakdown */}
        <div className="space-y-3 mb-6">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Primary Causal Attribution Drivers:
          </span>
          {current.breakdown.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{item.reason}</span>
                <span className="font-mono font-bold text-cyan-400">
                  {item.contributionPct}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-500"
                  style={{ width: `${item.contributionPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Second-Order Causal Transmission Chains */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Propagated Second-Order Transmission Chain:
          </span>
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5 text-xs text-slate-300">
            {causalEffects.slice(0, 2).map((eff, i) => (
              <div key={i} className="mb-2 last:mb-0">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-300 font-semibold mb-1">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>{eff.driver} → {eff.metric} ({eff.delta})</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono pl-5">
                  {eff.chain.join(' → ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Deterministic causal engine active.</span>
          <button
            onClick={() => setModalState('isWhyModalOpen', false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-all"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
