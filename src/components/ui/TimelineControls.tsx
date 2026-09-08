// Bottom Timeline & Simulation Controls for TN NEXUS Digital Twin
import React from 'react';
import {
  Calendar,
  Camera,
  Compass,
  Maximize2,
  TrendingDown,
  TrendingUp,
  Wind,
  Droplets,
  Users,
  Gauge
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';

export const TimelineControls: React.FC = () => {
  const simYear = useCityStore((state) => state.simYear);
  const setSimYear = useCityStore((state) => state.setSimYear);
  const simulationState = useCityStore((state) => state.simulationState);
  const cameraBookmark = useCityStore((state) => state.cameraBookmark);
  const setCameraBookmark = useCityStore((state) => state.setCameraBookmark);
  const openWhyModal = useCityStore((state) => state.openWhyModal);

  const timelineYears = [2026, 2027, 2028, 2029, 2030, 2035, 2040];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-20 nexus-glass rounded-2xl p-3 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 select-none">
      {/* 1. Real-time City Vitals Strip with Interactive WHY Drill-down */}
      <div className="flex items-center gap-4 overflow-x-auto text-xs font-mono">
        {/* Population */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-white/5">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <div>
            <span className="text-[9px] text-slate-400 uppercase block">Population</span>
            <span className="font-bold text-slate-200">
              {simulationState.totalPopulation.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Traffic Speed & Congestion */}
        <div
          onClick={() => openWhyModal('congestion')}
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-white/5 cursor-pointer hover:border-cyan-500/40 transition-all"
          title="Click to view Congestion Causal Breakdown"
        >
          <Gauge className="w-3.5 h-3.5 text-rose-400" />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-slate-400 uppercase">Avg Speed</span>
              <span className="text-[9px] text-cyan-400 font-bold underline">WHY?</span>
            </div>
            <span className="font-bold text-slate-200">
              {simulationState.averageTravelSpeedKmh} km/h{' '}
              <span className="text-[10px] text-rose-400 font-normal">
                ({simulationState.networkCongestionIndex}%)
              </span>
            </span>
          </div>
        </div>

        {/* Water Stress */}
        <div
          onClick={() => openWhyModal('water')}
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-white/5 cursor-pointer hover:border-cyan-500/40 transition-all"
          title="Click to view Water Stress Causal Breakdown"
        >
          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-slate-400 uppercase">Water Stress</span>
              <span className="text-[9px] text-cyan-400 font-bold underline">WHY?</span>
            </div>
            <span className="font-bold text-slate-200">
              {simulationState.waterDailyDemandMLD} MLD{' '}
              <span className="text-[10px] text-amber-400 font-normal">
                ({simulationState.waterStressIndex}%)
              </span>
            </span>
          </div>
        </div>

        {/* Ambient AQI */}
        <div
          onClick={() => openWhyModal('aqi')}
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-white/5 cursor-pointer hover:border-cyan-500/40 transition-all"
          title="Click to view Air Quality Causal Breakdown"
        >
          <Wind className="w-3.5 h-3.5 text-teal-400" />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-slate-400 uppercase">Ambient AQI</span>
              <span className="text-[9px] text-cyan-400 font-bold underline">WHY?</span>
            </div>
            <span className="font-bold text-slate-200">
              {simulationState.averageAQIPM25} PM2.5
            </span>
          </div>
        </div>
      </div>

      {/* 2. Timeline Slider (2026 - 2040) */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-slate-400 font-mono text-xs mr-2">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Timeline:</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/70 p-1 rounded-xl border border-white/10">
          {timelineYears.map((yr) => (
            <button
              key={yr}
              onClick={() => setSimYear(yr)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                simYear === yr
                  ? 'bg-cyan-500 text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Camera Bookmarks */}
      <div className="flex items-center gap-1 bg-slate-900/70 p-1 rounded-xl border border-white/10 text-xs font-mono">
        <button
          onClick={() => setCameraBookmark('default')}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            cameraBookmark === 'default' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Perspective 3D View"
        >
          Perspective
        </button>
        <button
          onClick={() => setCameraBookmark('aerial')}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            cameraBookmark === 'aerial' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Aerial 45° Angle"
        >
          Aerial 45°
        </button>
        <button
          onClick={() => setCameraBookmark('top_down')}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            cameraBookmark === 'top_down' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Top-Down GIS Orthographic"
        >
          Top GIS
        </button>
        <button
          onClick={() => setCameraBookmark('street')}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            cameraBookmark === 'street' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Street Level Perspective"
        >
          Street
        </button>
      </div>
    </div>
  );
};
