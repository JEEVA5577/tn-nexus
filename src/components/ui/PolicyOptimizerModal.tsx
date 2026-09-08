// Multi-Objective Policy Optimizer Modal for TN NEXUS
import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Sliders,
  X,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Trees,
  Bus,
  Droplets
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { optimizeProject, OptimizationWeights } from '../../simulation/optimizer';
import { ASSET_CATALOG } from '../../data/assetCatalog';

export const PolicyOptimizerModal: React.FC = () => {
  const isOptimizerOpen = useCityStore((state) => state.isOptimizerOpen);
  const setModalState = useCityStore((state) => state.setModalState);
  const selectedPlacedAsset = useCityStore((state) => state.selectedPlacedAsset);
  const activeAssetTemplate = useCityStore((state) => state.activeAssetTemplate);
  const ghostPosition = useCityStore((state) => state.ghostPosition);
  const currentNecessity = useCityStore((state) => state.currentNecessity);
  const assets = useCityStore((state) => state.assets);
  const roadSegments = useCityStore((state) => state.roadSegments);
  const applyOptimizedProposal = useCityStore((state) => state.applyOptimizedProposal);

  // User adjustable weights
  const [weights, setWeights] = useState<OptimizationWeights>({
    economy: 0.25,
    environment: 0.25,
    mobility: 0.20,
    healthcare: 0.15,
    resilience: 0.15,
  });

  const targetAsset = selectedPlacedAsset || (activeAssetTemplate && ghostPosition ? {
    id: 'preview_temp',
    type: activeAssetTemplate.type,
    name: activeAssetTemplate.name,
    category: activeAssetTemplate.category,
    position: ghostPosition,
    footprint: activeAssetTemplate.defaultFootprint,
    height: activeAssetTemplate.defaultHeight,
    specialty: undefined,
  } : null);

  const template = useMemo(() => {
    if (!targetAsset) return null;
    return ASSET_CATALOG.find((a) => a.type === targetAsset.type) || null;
  }, [targetAsset]);

  const proposal = useMemo(() => {
    if (!template || !targetAsset || !currentNecessity) return null;
    return optimizeProject(
      template,
      targetAsset.position as [number, number, number],
      currentNecessity,
      assets,
      roadSegments,
      weights,
      targetAsset.specialty
    );
  }, [template, targetAsset, currentNecessity, assets, roadSegments, weights]);

  if (!isOptimizerOpen || !proposal || !targetAsset) return null;

  const handleApply = () => {
    applyOptimizedProposal(
      proposal.recommendedPosition,
      proposal.newNecessityResult,
      proposal.netBudgetImpactCrore
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-2xl nexus-glass rounded-2xl border border-purple-500/30 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setModalState('isOptimizerOpen', false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-purple-400 font-mono text-xs mb-1">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>ALGORITHMIC POLICY OPTIMIZATION ENGINE</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">
          Optimize Project: {targetAsset.name}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Multi-objective search across spatial realignments, sponge city flood resilience, transit feeders, and green buffers.
        </p>

        {/* Priority Objective Sliders */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 mb-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              Adjust Policy Objective Weights
            </span>
            <span className="text-slate-500">Live Dynamic Re-balancing</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            {/* Economy */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Economy & Jobs</span>
                <span>{Math.round(weights.economy * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={weights.economy}
                onChange={(e) => setWeights({ ...weights, economy: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Environment */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Environmental Protection</span>
                <span>{Math.round(weights.environment * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={weights.environment}
                onChange={(e) => setWeights({ ...weights, environment: parseFloat(e.target.value) })}
                className="w-full accent-emerald-400"
              />
            </div>

            {/* Mobility */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Traffic & Mobility</span>
                <span>{Math.round(weights.mobility * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={weights.mobility}
                onChange={(e) => setWeights({ ...weights, mobility: parseFloat(e.target.value) })}
                className="w-full accent-amber-400"
              />
            </div>

            {/* Disaster Resilience */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Flood & Climate Resilience</span>
                <span>{Math.round(weights.resilience * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={weights.resilience}
                onChange={(e) => setWeights({ ...weights, resilience: parseFloat(e.target.value) })}
                className="w-full accent-purple-400"
              />
            </div>
          </div>
        </div>

        {/* Score Transformation Comparison */}
        <div className="grid grid-cols-3 gap-3 mb-6 font-mono">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase block">Original Score</span>
            <span className="text-2xl font-extrabold text-slate-300">
              {proposal.originalScore}/100
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-center flex flex-col items-center justify-center">
            <span className="text-[10px] text-purple-300 uppercase block">Score Uplift</span>
            <span className="text-xl font-extrabold text-purple-300 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> +{proposal.scoreDelta} pts
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center">
            <span className="text-[10px] text-emerald-400 uppercase block">Optimized Score</span>
            <span className="text-2xl font-extrabold text-emerald-400 glow-emerald">
              {proposal.optimizedScore}/100
            </span>
          </div>
        </div>

        {/* Recommended Mitigations & Enhancements */}
        <div className="space-y-3 mb-6">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-300 block">
            Recommended Optimization Package:
          </span>

          {proposal.enhancements.map((enh, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-900/60 border border-white/10 flex items-start justify-between gap-4 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <h4 className="font-bold text-slate-200">{enh.title}</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
                  {enh.description}
                </p>
                <div className="text-[10px] text-cyan-300 font-mono pl-6 mt-1">
                  Impact: {enh.impactBenefit}
                </div>
              </div>

              <span className="font-mono text-xs font-bold text-amber-400 shrink-0">
                +₹{enh.additionalCostCrore} Cr
              </span>
            </div>
          ))}
        </div>

        {/* Signature Quote Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/60 to-cyan-950/60 border border-cyan-500/20 text-center text-xs italic text-slate-300 mb-6 font-serif">
          "{proposal.summaryQuote}"
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={() => setModalState('isOptimizerOpen', false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:brightness-110 text-white font-bold text-xs font-mono shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply Optimization & Simulate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
