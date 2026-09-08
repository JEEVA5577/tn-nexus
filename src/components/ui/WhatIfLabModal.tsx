// What-If Experimentation Lab for TN NEXUS
import React from 'react';
import {
  FlaskConical,
  X,
  TrendingUp,
  CloudRain,
  Car,
  Heart,
  Droplets,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';

export const WhatIfLabModal: React.FC = () => {
  const isWhatIfOpen = useCityStore((state) => state.isWhatIfOpen);
  const setModalState = useCityStore((state) => state.setModalState);
  const triggerDisaster = useCityStore((state) => state.triggerDisaster);
  const setSimYear = useCityStore((state) => state.setSimYear);

  if (!isWhatIfOpen) return null;

  const experiments = [
    {
      title: 'What if Monsoon Rainfall Doubles (+100%)?',
      desc: 'Simulate severe convective storm burst testing Noyyal river discharge channels and Singanallur lake overflow basins.',
      action: () => {
        triggerDisaster('EXTREME_RAINFALL');
        setModalState('isWhatIfOpen', false);
      },
      icon: CloudRain,
      tag: 'Climate Resilience',
      color: 'text-cyan-400',
    },
    {
      title: 'What if Radial Traffic Surges +25%?',
      desc: 'Inject peak-hour freight and private vehicle volume to identify intersection saturation choke points.',
      action: () => {
        triggerDisaster('TRAFFIC_GRIDLOCK');
        setModalState('isWhatIfOpen', false);
      },
      icon: Car,
      tag: 'Mobility Stress',
      color: 'text-rose-400',
    },
    {
      title: 'What if Population Expands to Year 2035?',
      desc: 'Accelerate demographic timeline by 9 years to evaluate infrastructure aging and water deficit pressure.',
      action: () => {
        setSimYear(2035);
        setModalState('isWhatIfOpen', false);
      },
      icon: TrendingUp,
      tag: 'Growth Projection',
      color: 'text-amber-400',
    },
    {
      title: 'What if Extreme Heat Wave (43°C) Strikes?',
      desc: 'Simulate peak thermal load on power substations, evaporative water reservoir loss, and elderly health vulnerability.',
      action: () => {
        triggerDisaster('HEAT_WAVE');
        setModalState('isWhatIfOpen', false);
      },
      icon: Zap,
      tag: 'Urban Heat Island',
      color: 'text-orange-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-2xl nexus-glass rounded-2xl border border-purple-500/30 shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={() => setModalState('isWhatIfOpen', false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-purple-400 font-mono text-xs mb-1">
          <FlaskConical className="w-4 h-4" />
          <span>WHAT-IF POLICY EXPERIMENTATION LAB</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">
          Simulate Macro Stresses & Shocks
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Test how the digital twin absorbs exogenous demographic, environmental, and infrastructure shocks.
        </p>

        {/* Experiment Cards */}
        <div className="space-y-3 mb-6">
          {experiments.map((exp, idx) => {
            const Icon = exp.icon;
            return (
              <div
                key={idx}
                onClick={exp.action}
                className="p-4 rounded-xl bg-slate-900/60 border border-white/10 hover:border-purple-500/40 hover:bg-slate-800/60 cursor-pointer transition-all flex items-start justify-between gap-4 group"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-slate-950 border border-white/5 shrink-0 ${exp.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                        {exp.title}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                        {exp.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {exp.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-purple-400 text-xs font-mono shrink-0 pt-2 group-hover:translate-x-1 transition-transform">
                  <span>Run Shock</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-mono text-slate-400">
          <span>Simulation propagates feedback across all 12 visual layers.</span>
          <button
            onClick={() => setModalState('isWhatIfOpen', false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
