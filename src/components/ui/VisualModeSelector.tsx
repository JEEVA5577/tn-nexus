// 12 Visualization Modes Selector for TN NEXUS Digital Twin
import React from 'react';
import {
  Eye,
  Car,
  Heart,
  Droplets,
  Zap,
  Wind,
  Users,
  Wheat,
  TrendingUp,
  AlertTriangle,
  Grid,
  Shield
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { VisualMode } from '../../types/city';

interface ModeOption {
  id: VisualMode;
  label: string;
  icon: React.FC<{ className?: string }>;
  color: string;
}

export const VisualModeSelector: React.FC = () => {
  const visualMode = useCityStore((state) => state.visualMode);
  const setVisualMode = useCityStore((state) => state.setVisualMode);

  const modes: ModeOption[] = [
    { id: 'CITY', label: 'City', icon: Eye, color: 'text-slate-200' },
    { id: 'TRAFFIC', label: 'Traffic', icon: Car, color: 'text-rose-400' },
    { id: 'HEALTH', label: 'Health', icon: Heart, color: 'text-emerald-400' },
    { id: 'WATER', label: 'Water', icon: Droplets, color: 'text-cyan-400' },
    { id: 'ENERGY', label: 'Energy', icon: Zap, color: 'text-amber-400' },
    { id: 'ENVIRONMENT', label: 'AQI / Eco', icon: Wind, color: 'text-teal-400' },
    { id: 'POPULATION', label: 'Demographics', icon: Users, color: 'text-indigo-400' },
    { id: 'AGRICULTURE', label: 'Agriculture', icon: Wheat, color: 'text-lime-400' },
    { id: 'ECONOMY', label: 'Economy', icon: TrendingUp, color: 'text-yellow-400' },
    { id: 'DISASTER', label: 'Disaster Flood', icon: AlertTriangle, color: 'text-red-400' },
    { id: 'LAND_USE', label: 'Zoning Map', icon: Grid, color: 'text-purple-400' },
    { id: 'EMERGENCY', label: 'Emergency', icon: Shield, color: 'text-orange-400' },
  ];

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-20 nexus-glass px-2 py-1.5 rounded-2xl border border-white/10 shadow-xl flex items-center gap-1 select-none overflow-x-auto max-w-[95vw]">
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = visualMode === m.id;

        return (
          <button
            key={m.id}
            onClick={() => setVisualMode(m.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-medium transition-all shrink-0 ${
              isActive
                ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
            title={`Switch to ${m.label} visualization layer`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : m.color}`} />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};
