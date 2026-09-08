// Fullscreen CM Executive Presentation View for TN NEXUS
import React, { useState } from 'react';
import {
  Tv,
  X,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  Users,
  Gauge,
  Droplets,
  Wind
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';

export const CMPresentationView: React.FC = () => {
  const isPresentationMode = useCityStore((state) => state.isPresentationMode);
  const togglePresentationMode = useCityStore((state) => state.togglePresentationMode);
  const simulationState = useCityStore((state) => state.simulationState);
  const selectedPlacedAsset = useCityStore((state) => state.selectedPlacedAsset);
  const currentNecessity = useCityStore((state) => state.currentNecessity);
  const assets = useCityStore((state) => state.assets);

  const [activeStage, setActiveStage] = useState<'PROBLEM' | 'PROPOSAL' | 'NECESSITY' | 'CONSEQUENCES' | 'OPTIMIZATION' | 'RECOMMENDATION'>('NECESSITY');

  if (!isPresentationMode) return null;

  const stages: ('PROBLEM' | 'PROPOSAL' | 'NECESSITY' | 'CONSEQUENCES' | 'OPTIMIZATION' | 'RECOMMENDATION')[] = [
    'PROBLEM',
    'PROPOSAL',
    'NECESSITY',
    'CONSEQUENCES',
    'OPTIMIZATION',
    'RECOMMENDATION'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 text-white flex flex-col justify-between p-8 select-none backdrop-blur-xl animate-in fade-in duration-300">
      {/* 1. Executive Top Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-extrabold text-xl">
            TN
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">
                TN NEXUS
              </h1>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                CM EXECUTIVE BRIEFING
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Coimbatore Digital Twin Demonstration • 2026 Simulation Model
            </p>
          </div>
        </div>

        {/* Exit Fullscreen Presentation */}
        <button
          onClick={togglePresentationMode}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-white/10 transition-all"
        >
          <X className="w-4 h-4" />
          <span>Exit Presentation Mode</span>
        </button>
      </div>

      {/* 2. Central High-Impact Presentation Stage */}
      <div className="my-auto max-w-5xl mx-auto w-full">
        {/* Stage Navigation Pills */}
        <div className="flex items-center justify-center gap-2 mb-8 font-mono text-xs">
          {stages.map((st, i) => (
            <React.Fragment key={st}>
              <button
                onClick={() => setActiveStage(st)}
                className={`px-4 py-2 rounded-xl transition-all font-semibold ${
                  activeStage === st
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {st}
              </button>
              {i < stages.length - 1 && <ChevronRight className="w-4 h-4 text-slate-600" />}
            </React.Fragment>
          ))}
        </div>

        {/* Content by Stage */}
        <div className="nexus-glass rounded-3xl p-8 border border-white/10 shadow-2xl">
          {activeStage === 'PROBLEM' && (
            <div className="space-y-4">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block">
                The Urban Planning Challenge
              </span>
              <h2 className="text-3xl font-bold text-white">
                Coimbatore Core Corridor Congestion & Peripheral Healthcare Gaps
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                Rapid manufacturing and software cluster expansion has overwhelmed the inner radial highways (Avinashi & Trichy Roads), with peak travel speeds falling to 28 km/h and western wards experiencing an acute lack of emergency specialty medical centers.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 font-mono">
                  <span className="text-xs text-slate-400 block">Current Population</span>
                  <span className="text-2xl font-bold text-white">1.28 Million</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 font-mono">
                  <span className="text-xs text-slate-400 block">Peak Congestion</span>
                  <span className="text-2xl font-bold text-rose-400">68% Index</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 font-mono">
                  <span className="text-xs text-slate-400 block">Water Stress Margin</span>
                  <span className="text-2xl font-bold text-amber-400">62% Utilized</span>
                </div>
              </div>
            </div>
          )}

          {activeStage === 'PROPOSAL' && (
            <div className="space-y-4">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block">
                The Infrastructure Proposal
              </span>
              <h2 className="text-3xl font-bold text-white">
                {selectedPlacedAsset ? selectedPlacedAsset.name : 'Multi-Modal Infrastructure Expansion Proposal'}
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                Departmental submission proposing capital expenditure to relieve arterial transit bottlenecks and augment public healthcare coverage.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4 font-mono">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-xs text-slate-400 block">Capital Expenditure</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    ₹{selectedPlacedAsset ? selectedPlacedAsset.constructionCostCrore : 450} Cr
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-xs text-slate-400 block">Jobs Created</span>
                  <span className="text-2xl font-bold text-cyan-400">
                    +{selectedPlacedAsset ? selectedPlacedAsset.jobsCreated.toLocaleString() : '1,400'} Jobs
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-xs text-slate-400 block">Beneficiary Catchment</span>
                  <span className="text-2xl font-bold text-purple-400">
                    {selectedPlacedAsset ? selectedPlacedAsset.populationServed.toLocaleString() : '180,000'} Citizens
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeStage === 'NECESSITY' && (
            <div className="space-y-4">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block">
                Objective Necessity Score
              </span>
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">
                  Necessity Score:{' '}
                  <span className="text-cyan-400 font-mono">
                    {currentNecessity ? currentNecessity.overallScore : 82} / 100
                  </span>
                </h2>
                <div className="px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-sm">
                  {currentNecessity ? currentNecessity.verdict : 'STRONGLY JUSTIFIED'}
                </div>
              </div>
              <p className="text-base text-slate-300 leading-relaxed">
                {currentNecessity
                  ? currentNecessity.verdictDescription
                  : 'Demonstrates clear public necessity, filling verified specialty clinical and transit deficits while preserving statutory setbacks from water bodies.'}
              </p>
              <div className="grid grid-cols-4 gap-3 pt-4 font-mono text-center">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block">Demand Need</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {currentNecessity ? currentNecessity.demandScore : 88}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block">Accessibility</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {currentNecessity ? currentNecessity.accessibilityScore : 82}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block">Specialty Value</span>
                  <span className="text-lg font-bold text-purple-400">
                    {currentNecessity ? currentNecessity.specialtyDifferentiationScore : 94}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block">Resilience</span>
                  <span className="text-lg font-bold text-amber-400">
                    {currentNecessity ? currentNecessity.resilienceScore : 85}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeStage === 'CONSEQUENCES' && (
            <div className="space-y-4">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block">
                Cross-Sector Systemic Consequences
              </span>
              <h2 className="text-3xl font-bold text-white">
                Simulated Second-Order Cascades
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                Capital deployment triggers real-time responses across housing demand, peak-hour transit flows, bulk water drawdown, and ambient air quality.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4 font-mono">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-xs text-slate-400 block">Traffic Speed Shift</span>
                  <span className="text-2xl font-bold text-cyan-400">
                    {simulationState.averageTravelSpeedKmh} km/h
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-xs text-slate-400 block">Healthcare Coverage</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    {simulationState.healthcareCoveragePct}%
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-xs text-slate-400 block">Disaster Resilience Index</span>
                  <span className="text-2xl font-bold text-amber-400">
                    {simulationState.disasterResilienceIndex} / 100
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeStage === 'OPTIMIZATION' && (
            <div className="space-y-4">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block">
                Algorithmic Policy Optimization
              </span>
              <h2 className="text-3xl font-bold text-white">
                Maximizing Public Value While Minimizing Externalities
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                By integrating a 250m native green sound buffer, 45,000 m³ sponge retention swales, and dedicated electric feeder bus bays, project necessity score advances by +18 points with zero agricultural severance.
              </p>
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/60 to-cyan-950/60 border border-cyan-500/30 text-center font-mono">
                <span className="text-xs text-cyan-300 uppercase block mb-1">
                  Public Benefit Enhancement
                </span>
                <span className="text-2xl font-black text-white">
                  64/100 (Conventional) → <span className="text-emerald-400 glow-emerald">88/100 (Optimized Solution)</span>
                </span>
              </div>
            </div>
          )}

          {activeStage === 'RECOMMENDATION' && (
            <div className="space-y-4">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block">
                Statutory Decision Recommendation
              </span>
              <h2 className="text-3xl font-bold text-emerald-400 flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8" />
                APPROVE WITH OPTIMIZED MULTI-MODAL MITIGATIONS
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                Sanction the proposal conditional on inclusion of the sponge retention bioswales and electric transit feeder package. Proceed to detailed project report (DPR) and municipal tendering.
              </p>
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-white/10 text-center text-lg italic text-slate-200 font-serif">
                "The best project is not the biggest project. It is the project that creates the greatest public value with the least unnecessary impact."
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Executive Bottom Bar */}
      <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs font-mono text-slate-400">
        <span>GOVERNMENT OF TAMIL NADU • DIGITAL TWIN DECISION SYSTEM</span>
        <span>PROTOTYPE DEMONSTRATION ENGINE</span>
      </div>
    </div>
  );
};
