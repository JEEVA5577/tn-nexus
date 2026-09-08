// Floating Live Site Analysis Badge following cursor on 3D terrain
import React from 'react';
import {
  MapPin,
  Waves,
  Zap,
  Droplet,
  Compass,
  Users,
  ShieldCheck,
  AlertCircle,
  Sprout
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';

export const SiteAnalysisBadge: React.FC = () => {
  const currentSiteAnalysis = useCityStore((state) => state.currentSiteAnalysis);
  const activeAssetTemplate = useCityStore((state) => state.activeAssetTemplate);
  const ghostPosition = useCityStore((state) => state.ghostPosition);

  if (!currentSiteAnalysis || !activeAssetTemplate || !ghostPosition) return null;

  const site = currentSiteAnalysis;

  return (
    <div className="fixed bottom-24 left-4 z-20 w-96 nexus-glass rounded-xl p-3.5 border border-white/10 shadow-2xl text-xs select-none">
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
        <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px] font-semibold">
          <MapPin className="w-3.5 h-3.5" />
          <span>LIVE SITE SUITABILITY ANALYSIS</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">
          [{site.position[0]}, {site.position[2]}] @ {site.elevation}m
        </span>
      </div>

      {/* Grid of live geographic parameters */}
      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
        {/* Land & Zone */}
        <div className="p-2 rounded bg-slate-900/60 border border-white/5">
          <span className="text-[10px] text-slate-400 block uppercase">Zone Classification</span>
          <span className="font-semibold text-slate-200 truncate block">
            {site.zoneType.replace('_', ' ').toUpperCase()}
          </span>
          <span className="text-[10px] text-slate-400 truncate block mt-0.5">
            {site.landType}
          </span>
        </div>

        {/* Flood Risk */}
        <div className="p-2 rounded bg-slate-900/60 border border-white/5">
          <span className="text-[10px] text-slate-400 block uppercase">Flood Exposure</span>
          <span
            className={`font-semibold flex items-center gap-1 ${
              site.floodRiskLevel === 'EXTREME' || site.floodRiskLevel === 'HIGH'
                ? 'text-red-400'
                : site.floodRiskLevel === 'MODERATE'
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            <Waves className="w-3 h-3" />
            {site.floodRiskLevel} RISK
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Slope: {site.slope}° grade
          </span>
        </div>

        {/* Road & Transportation Access */}
        <div className="p-2 rounded bg-slate-900/60 border border-white/5">
          <span className="text-[10px] text-slate-400 block uppercase">Road Proximity</span>
          <span
            className={`font-semibold flex items-center gap-1 ${
              site.roadAccessQuality === 'EXCELLENT'
                ? 'text-emerald-400'
                : site.roadAccessQuality === 'GOOD'
                ? 'text-cyan-400'
                : 'text-amber-400'
            }`}
          >
            <Compass className="w-3 h-3" />
            {site.roadAccessQuality} ({site.distanceToNearestRoad}m)
          </span>
        </div>

        {/* Utilities: Water & Power */}
        <div className="p-2 rounded bg-slate-900/60 border border-white/5">
          <span className="text-[10px] text-slate-400 block uppercase">Utility Grid</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-0.5 text-cyan-300 text-[10px]">
              <Droplet className="w-3 h-3" /> {site.waterAccessReadiness}
            </span>
            <span className="flex items-center gap-0.5 text-amber-300 text-[10px]">
              <Zap className="w-3 h-3" /> {site.powerAccessReadiness}
            </span>
          </div>
        </div>

        {/* Population Catchment */}
        <div className="p-2 rounded bg-slate-900/60 border border-white/5">
          <span className="text-[10px] text-slate-400 block uppercase">Catchment Population</span>
          <span className="font-semibold text-slate-200 flex items-center gap-1">
            <Users className="w-3 h-3 text-cyan-400" />
            {site.nearbyPopulation3km.toLocaleString()} (3km)
          </span>
        </div>

        {/* Environmental / Agricultural Impact */}
        <div className="p-2 rounded bg-slate-900/60 border border-white/5">
          <span className="text-[10px] text-slate-400 block uppercase">Agri / Eco Impact</span>
          <span
            className={`font-semibold flex items-center gap-1 truncate ${
              site.agriculturalImpact === 'SEVERE_LOSS' || site.environmentalSensitivity === 'CRITICAL'
                ? 'text-red-400'
                : site.agriculturalImpact === 'MODERATE'
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            <Sprout className="w-3 h-3" />
            {site.agriculturalImpact !== 'ZERO' ? site.agriculturalImpact : 'PRESERVED'}
          </span>
        </div>
      </div>
    </div>
  );
};
