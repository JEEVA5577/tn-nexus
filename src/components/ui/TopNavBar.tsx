// Top Navigation and Civic Command Header for TN NEXUS
import React from 'react';
import {
  Activity,
  Play,
  Pause,
  CloudRain,
  Sun,
  AlertTriangle,
  RotateCcw,
  Undo2,
  Redo2,
  Sliders,
  Layers,
  FlaskConical,
  Shield,
  Scale,
  FileText,
  Tv,
  Film,
  Sparkles
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { TimeOfDay, WeatherCondition, DisasterType } from '../../types/city';

export const TopNavBar: React.FC = () => {
  const isSimulating = useCityStore((state) => state.isSimulating);
  const toggleSimulation = useCityStore((state) => state.toggleSimulation);
  const timeOfDay = useCityStore((state) => state.timeOfDay);
  const setTimeOfDay = useCityStore((state) => state.setTimeOfDay);
  const weather = useCityStore((state) => state.weather);
  const setWeather = useCityStore((state) => state.setWeather);
  const disaster = useCityStore((state) => state.disaster);
  const triggerDisaster = useCityStore((state) => state.triggerDisaster);
  const simYear = useCityStore((state) => state.simYear);
  const fps = useCityStore((state) => state.fps);
  const assets = useCityStore((state) => state.assets);
  const simulationState = useCityStore((state) => state.simulationState);
  const history = useCityStore((state) => state.history);
  const future = useCityStore((state) => state.future);
  const undo = useCityStore((state) => state.undo);
  const redo = useCityStore((state) => state.redo);
  const resetCity = useCityStore((state) => state.resetCity);
  const setModalState = useCityStore((state) => state.setModalState);
  const togglePresentationMode = useCityStore((state) => state.togglePresentationMode);
  const startCinematicDemo = useCityStore((state) => state.startCinematicDemo);

  const budgetRemaining = simulationState.municipalBudgetRemainingCrore;
  const budgetPct = Math.round((budgetRemaining / 10000) * 100);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-16 nexus-glass px-4 flex items-center justify-between border-b border-white/10 select-none">
      {/* 1. Left Branding & Civic Digital Twin Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-wider text-slate-100 flex items-center gap-1.5">
              TN NEXUS
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Tamil Nadu
              </span>
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              DEMONSTRATION DIGITAL TWIN
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>COIMBATORE DEMO</span>
            <span>•</span>
            <span className="text-cyan-400 font-semibold">{simYear} SIMULATION</span>
            <span>•</span>
            <span className="text-slate-500">SYNTHETIC DATA</span>
          </div>
        </div>
      </div>

      {/* 2. Center Status Badges: Budget & Live Heartbeat */}
      <div className="hidden lg:flex items-center gap-5">
        {/* Illustrative Demo Budget */}
        <div className="px-3 py-1.5 rounded-lg nexus-glass-subtle flex items-center gap-3 border border-white/5">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Demo Budget Margin</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              ₹{budgetRemaining.toLocaleString()} Cr <span className="text-[10px] text-slate-400 font-normal">/ ₹10,000 Cr</span>
            </span>
          </div>
          <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-500 ${budgetPct > 50 ? 'bg-emerald-500' : budgetPct > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${Math.max(5, budgetPct)}%` }}
            />
          </div>
        </div>

        {/* Live Simulation Heartbeat & Diagnostics */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg nexus-glass-subtle border border-white/5 text-xs font-mono">
          <button
            onClick={toggleSimulation}
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${isSimulating ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-800'}`}
            title="Toggle Live Simulation"
          >
            {isSimulating ? <Play className="w-3.5 h-3.5 fill-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
            <span className="font-semibold">{isSimulating ? 'SIM LIVE' : 'PAUSED'}</span>
          </button>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-radar" />
          <span className="text-slate-400 text-[11px]">{fps} FPS</span>
          <span className="text-slate-400 text-[11px]">{assets.length} ASSETS</span>
        </div>

        {/* Time of Day */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-white/5 text-xs">
          {(['DAWN', 'MORNING_PEAK', 'MIDDAY', 'EVENING_PEAK', 'NIGHT'] as TimeOfDay[]).map((t) => (
            <button
              key={t}
              onClick={() => setTimeOfDay(t)}
              className={`px-2 py-1 rounded text-[10px] font-mono font-medium transition-all ${timeOfDay === t ? 'bg-cyan-500 text-black font-bold shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              {t === 'MORNING_PEAK' ? 'AM PEAK' : t === 'EVENING_PEAK' ? 'PM PEAK' : t}
            </button>
          ))}
        </div>

        {/* Weather Controls */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-white/5 text-xs">
          <button
            onClick={() => setWeather('CLEAR')}
            className={`p-1.5 rounded transition-all ${weather === 'CLEAR' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'}`}
            title="Clear Sky"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setWeather('RAIN')}
            className={`p-1.5 rounded transition-all ${weather === 'RAIN' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
            title="Rainfall"
          >
            <CloudRain className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => triggerDisaster('FLOOD')}
            className={`p-1.5 rounded transition-all ${disaster === 'FLOOD' ? 'bg-red-500 text-white font-bold' : 'text-slate-400 hover:text-red-400'}`}
            title="Trigger Flood Stress Test"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Right Action Tools & Presentation Modals */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-900/60 p-1 rounded-lg border border-white/5">
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-all"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-all"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Decision & Analytics Modals Dropdown / Quick Links */}
        <button
          onClick={() => setModalState('isOptimizerOpen', true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-medium transition-all"
          title="Policy Multi-Objective Optimizer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Optimizer</span>
        </button>

        <button
          onClick={() => setModalState('isScenarioModalOpen', true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg nexus-glass-subtle text-slate-300 hover:text-white text-xs font-medium transition-all border border-white/5"
          title="Scenario Comparison (A vs B vs C)"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Scenarios</span>
        </button>

        <button
          onClick={() => setModalState('isWhatIfOpen', true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg nexus-glass-subtle text-slate-300 hover:text-white text-xs font-medium transition-all border border-white/5"
          title="What-If Experimentation Lab"
        >
          <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden md:inline">What-If</span>
        </button>

        <button
          onClick={() => setModalState('isRedTeamOpen', true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg nexus-glass-subtle text-slate-300 hover:text-white text-xs font-medium transition-all border border-white/5"
          title="Red Team: What Could Go Wrong?"
        >
          <Shield className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden md:inline">Red Team</span>
        </button>

        <button
          onClick={() => setModalState('isEquityOpen', true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg nexus-glass-subtle text-slate-300 hover:text-white text-xs font-medium transition-all border border-white/5"
          title="Ward Equity Distribution Lens"
        >
          <Scale className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Equity</span>
        </button>

        <button
          onClick={() => setModalState('isAuditModalOpen', true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg nexus-glass-subtle text-slate-300 hover:text-white text-xs font-medium transition-all border border-white/5"
          title="Demonstration Decision Audit Trail"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Audit Log</span>
        </button>

        {/* 90-Second Cinematic Demo Button */}
        <button
          onClick={startCinematicDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all"
          title="Launch 90-Second Hackathon Cinematic Demo"
        >
          <Film className="w-3.5 h-3.5" />
          <span>90s Demo</span>
        </button>

        {/* Fullscreen CM Presentation View Toggle */}
        <button
          onClick={togglePresentationMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-semibold text-xs shadow-lg shadow-cyan-600/25 hover:bg-cyan-500 transition-all"
          title="Fullscreen CM Executive Presentation Mode"
        >
          <Tv className="w-3.5 h-3.5" />
          <span className="hidden md:inline">CM Mode</span>
        </button>

        {/* Reset City */}
        <button
          onClick={resetCity}
          className="p-1.5 rounded-lg nexus-glass-subtle text-slate-400 hover:text-rose-400 transition-all border border-white/5"
          title="Reset City to Seed Baseline"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
