// Signature Necessity Engine Panel for TN NEXUS
import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  Building,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  Info,
  Layers,
  MapPin,
  Trash2
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { NecessityVerdict } from '../../types/city';

export const NecessityPanel: React.FC = () => {
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null);

  const activeAssetTemplate = useCityStore((state) => state.activeAssetTemplate);
  const currentNecessity = useCityStore((state) => state.currentNecessity);
  const currentSiteAnalysis = useCityStore((state) => state.currentSiteAnalysis);
  const selectedPlacedAsset = useCityStore((state) => state.selectedPlacedAsset);
  const roadNecessity = useCityStore((state) => state.roadNecessity);
  const placeActiveAsset = useCityStore((state) => state.placeActiveAsset);
  const approveProposal = useCityStore((state) => state.approveProposal);
  const rejectProposal = useCityStore((state) => state.rejectProposal);
  const removeAsset = useCityStore((state) => state.removeAsset);
  const selectAssetTemplate = useCityStore((state) => state.selectAssetTemplate);
  const selectExistingAsset = useCityStore((state) => state.selectExistingAsset);
  const setModalState = useCityStore((state) => state.setModalState);
  const openWhyModal = useCityStore((state) => state.openWhyModal);

  // If nothing is active or selected, don't show the panel
  if (!currentNecessity) return null;

  const nec = currentNecessity;
  const isInspectingPlaced = !!selectedPlacedAsset;
  const assetTitle = isInspectingPlaced ? selectedPlacedAsset.name : activeAssetTemplate?.name;
  const assetType = isInspectingPlaced ? selectedPlacedAsset.type : activeAssetTemplate?.type;
  const isRoad = activeAssetTemplate?.category === 'transport' || selectedPlacedAsset?.category === 'transport';

  // Verdict style mapping
  const getVerdictBadge = (verdict: NecessityVerdict) => {
    switch (verdict) {
      case 'STRONGLY JUSTIFIED':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        };
      case 'JUSTIFIED':
        return {
          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: <CheckCircle2 className="w-4 h-4 text-cyan-400" />,
        };
      case 'JUSTIFIED WITH MODIFICATIONS':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        };
      case 'LOW PRIORITY':
        return {
          bg: 'bg-slate-700/40 text-slate-300 border-slate-600',
          icon: <Info className="w-4 h-4 text-slate-400" />,
        };
      case 'NOT CURRENTLY JUSTIFIED':
        return {
          bg: 'bg-red-500/20 text-red-300 border-red-500/40',
          icon: <XCircle className="w-4 h-4 text-red-400" />,
        };
    }
  };

  const badge = getVerdictBadge(nec.verdict);

  return (
    <div className="fixed top-20 right-4 z-20 w-[420px] nexus-glass rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[calc(100vh-140px)] select-none">
      {/* 1. Header Bar */}
      <div className="p-4 border-b border-white/10 bg-slate-900/50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            NEXUS NECESSITY ANALYSIS
          </span>
          <button
            onClick={() => {
              selectAssetTemplate(null);
              selectExistingAsset(null);
            }}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors text-xs"
          >
            ✕
          </button>
        </div>

        <h3 className="text-base font-bold text-white truncate">
          {assetTitle}
        </h3>

        {/* Status indicator */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
            {isInspectingPlaced ? selectedPlacedAsset.status : 'PROPOSED INFRASTRUCTURE'}
          </span>
          {isInspectingPlaced && selectedPlacedAsset.specialty && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Specialty: {selectedPlacedAsset.specialty}
            </span>
          )}
        </div>
      </div>

      {/* 2. Scrollable Analysis Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Score & Verdict Card */}
        <div className="p-4 rounded-xl nexus-glass-subtle border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 block uppercase">
              Demonstration Necessity Score
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold font-mono text-cyan-400 glow-cyan">
                {nec.overallScore}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 100</span>
            </div>
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold font-mono border mt-2 ${badge.bg}`}>
              {badge.icon}
              <span>{nec.verdict}</span>
            </div>
          </div>

          {/* Radial progress ring */}
          <div className="relative w-18 h-18 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={nec.overallScore >= 80 ? 'text-emerald-400' : nec.overallScore >= 50 ? 'text-amber-400' : 'text-red-400'}
                strokeDasharray={`${nec.overallScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono text-xs font-bold text-white">
              {nec.overallScore}%
            </span>
          </div>
        </div>

        {/* Verdict Explanation Narrative */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 leading-relaxed">
          <p>{nec.verdictDescription}</p>
        </div>

        {/* Potential Redundancy Warning if any */}
        {nec.redundancyWarning && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300 font-mono text-[11px] mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>POTENTIAL REDUNDANCY DETECTED</span>
            </div>
            <p>{nec.redundancyWarning}</p>
          </div>
        )}

        {/* Specialty Differentiation Insight */}
        {nec.specialtyInsight && (
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-cyan-300 font-mono text-[11px] mb-1">
              <Building className="w-3.5 h-3.5" />
              <span>FACILITY SPECIALTY DIFFERENTIATION</span>
            </div>
            <p>{nec.specialtyInsight}</p>
          </div>
        )}

        {/* Road & Highway Specific Analysis (if road/expressway) */}
        {roadNecessity && (
          <div className="p-3 rounded-xl bg-slate-900/70 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="font-mono text-cyan-400 font-semibold text-[11px]">
                ROAD NECESSITY & OD ANALYSIS
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                Score: {roadNecessity.score}/100
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-1.5 rounded bg-slate-950/50">
                <span className="text-[10px] text-slate-400 block">OD Relief</span>
                <span className="text-emerald-400 font-bold">+{roadNecessity.odPressureReliefPct}%</span>
              </div>
              <div className="p-1.5 rounded bg-slate-950/50">
                <span className="text-[10px] text-slate-400 block">Travel Time</span>
                <span className="text-cyan-400 font-bold">-{roadNecessity.travelTimeReductionMins} mins</span>
              </div>
              <div className="p-1.5 rounded bg-slate-950/50">
                <span className="text-[10px] text-slate-400 block">Freight Throughput</span>
                <span className="text-purple-400 font-bold">+{roadNecessity.freightThroughputBoostPct}%</span>
              </div>
              <div className="p-1.5 rounded bg-slate-950/50">
                <span className="text-[10px] text-slate-400 block">Agri Land Take</span>
                <span className={roadNecessity.agriculturalLossHectares > 0 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                  {roadNecessity.agriculturalLossHectares} Ha
                </span>
              </div>
            </div>

            {/* Alternatives dropdown preview */}
            <div className="pt-2 border-t border-white/5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Alternative Solutions Evaluated:
              </span>
              <div className="space-y-1.5">
                {roadNecessity.alternativeOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg text-[11px] border ${
                      opt.recommended
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200 font-medium'
                        : 'bg-slate-950/40 border-white/5 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-slate-200">{opt.name}</span>
                      <span className="font-mono text-[10px] text-emerald-400">₹{opt.costCrore} Cr</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-slate-400">{opt.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Policy Conflicts (if any detected) */}
        {nec.conflicts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-rose-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>POLICY CONFLICTS DETECTED ({nec.conflicts.length})</span>
            </div>

            {nec.conflicts.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-red-300">{c.title}</h5>
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300">
                    {c.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">{c.reason}</p>
                <div className="text-[10px] text-amber-300/90 font-mono pt-1 border-t border-red-500/20">
                  <span className="font-semibold">Alternative: </span>
                  {c.suggestedAlternative}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transparent Multi-Factor Breakdown Cards */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
            Factor Evaluation Breakdown
          </span>

          {nec.factors.map((f) => {
            const isExp = expandedFactor === f.id;
            return (
              <div
                key={f.id}
                className="p-2.5 rounded-xl nexus-glass-subtle border border-white/5 transition-all text-xs"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedFactor(isExp ? null : f.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${f.score >= 75 ? 'bg-emerald-400' : f.score >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} />
                    <span className="font-medium text-slate-200">{f.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-300">{f.score}/100</span>
                    {isExp ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 mt-1 pl-4">
                  {f.summary}
                </div>

                {isExp && (
                  <div className="mt-2 pt-2 border-t border-white/5 pl-4 text-[10px] text-cyan-300/80 font-mono">
                    {f.details}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Explainability / "WHY?" Drill-down Prompt */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Need causal explanation?</span>
          </div>
          <button
            onClick={() => openWhyModal('congestion')}
            className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono font-semibold transition-all"
          >
            Explain WHY?
          </button>
        </div>
      </div>

      {/* 3. Action Decision Controls */}
      <div className="p-3 border-t border-white/10 bg-slate-900/80 space-y-2">
        {!isInspectingPlaced ? (
          // Placement Confirmation Buttons
          <div className="flex items-center gap-2">
            <button
              onClick={placeActiveAsset}
              className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Simulate</span>
            </button>
            <button
              onClick={() => setModalState('isOptimizerOpen', true)}
              className="px-3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center gap-1"
              title="Launch AI Policy Optimizer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Optimize</span>
            </button>
          </div>
        ) : (
          // Placed Facility Inspection & Decision Gates
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => approveProposal()}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>APPROVE PROJECT</span>
              </button>
              <button
                onClick={() => setModalState('isOptimizerOpen', true)}
                className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>OPTIMIZE</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => rejectProposal()}
                className="flex-1 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold text-xs border border-red-500/30 transition-all"
              >
                REJECT
              </button>
              <button
                onClick={() => removeAsset(selectedPlacedAsset.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-white/10 transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
