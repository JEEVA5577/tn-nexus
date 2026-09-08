// Equity Lens Modal for Synthetic Ward Distribution in TN NEXUS
import React from 'react';
import { Scale, X, Users, Heart, Wind, Droplets, ArrowUpRight } from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';

export const EquityLensModal: React.FC = () => {
  const isEquityOpen = useCityStore((state) => state.isEquityOpen);
  const setModalState = useCityStore((state) => state.setModalState);
  const wards = useCityStore((state) => state.wards);

  if (!isEquityOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-3xl nexus-glass rounded-2xl border border-amber-500/30 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setModalState('isEquityOpen', false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs mb-1">
          <Scale className="w-4 h-4" />
          <span>CIVIC EQUITY & GEOGRAPHIC JUSTICE LENS</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">
          Geographic Distribution of Benefits & Burdens
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Synthetic ward-level evaluation checking that civic capital investments, hospital beds, and clean air are equitably distributed across all zones.
        </p>

        {/* Ward Cards */}
        <div className="space-y-3 mb-6">
          {wards.map((w) => {
            const hasHospitalDeficit = w.hospitalBedsPer1k < 2.5;
            const hasAirDeficit = w.airQualityIndex > 80;

            return (
              <div
                key={w.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-3 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{w.name}</h4>
                    <span className="text-[10px] text-slate-400">
                      Population: {w.population.toLocaleString()} • Growth: +{w.growthRatePct}%/yr • Income Tier: {w.avgIncomeLevel}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-white/5 text-cyan-300">
                    {w.zone.replace('_', ' ')}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-slate-950/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Hospital Beds</span>
                    <span className={`font-bold ${hasHospitalDeficit ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {w.hospitalBedsPer1k} / 1k pop
                    </span>
                  </div>

                  <div className="p-2 rounded bg-slate-950/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Traffic Friction</span>
                    <span className="font-bold text-amber-400">
                      {w.trafficCongestionIndex}% index
                    </span>
                  </div>

                  <div className="p-2 rounded bg-slate-950/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Water Stress</span>
                    <span className="font-bold text-cyan-400">
                      {w.waterStressIndex}%
                    </span>
                  </div>

                  <div className="p-2 rounded bg-slate-950/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Ambient AQI</span>
                    <span className={`font-bold ${hasAirDeficit ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {w.airQualityIndex} PM2.5
                    </span>
                  </div>
                </div>

                {/* Equity Assessment Note */}
                <div className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-white/5">
                  {hasHospitalDeficit ? (
                    <span className="text-amber-300">
                      ⚠️ Critical Healthcare Equity Deficit: Ward currently underserved relative to WHO 3.5 bed standard.
                    </span>
                  ) : (
                    <span className="text-emerald-400">
                      ✓ Healthcare accessibility meets regional benchmark.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-mono text-slate-400">
          <span>Synthetic ward models preserve demographic privacy.</span>
          <button
            onClick={() => setModalState('isEquityOpen', false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            Close Equity Lens
          </button>
        </div>
      </div>
    </div>
  );
};
