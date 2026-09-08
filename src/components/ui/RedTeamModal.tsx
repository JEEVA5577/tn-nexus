// Red Team ("What Could Go Wrong?") Threat Scanner for TN NEXUS
import React, { useMemo } from 'react';
import {
  ShieldAlert,
  X,
  AlertTriangle,
  Waves,
  Gauge,
  Droplets,
  Wind,
  CheckCircle2
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';

export const RedTeamModal: React.FC = () => {
  const isRedTeamOpen = useCityStore((state) => state.isRedTeamOpen);
  const setModalState = useCityStore((state) => state.setModalState);
  const simulationState = useCityStore((state) => state.simulationState);
  const roadSegments = useCityStore((state) => state.roadSegments);
  const wards = useCityStore((state) => state.wards);

  const vulnerabilities = useMemo(() => {
    const list = [];

    // 1. Water Stress Deficit
    if (simulationState.waterStressIndex > 60) {
      list.push({
        id: 'vuln_water_deficit',
        title: 'Municipal Water Deficit & Aquifer Depletion',
        severity: simulationState.waterStressIndex > 80 ? 'CRITICAL' : 'HIGH',
        metric: `${simulationState.waterDailyDemandMLD} MLD Demand vs ${simulationState.waterSupplyCapacityMLD} MLD Supply`,
        consequence: 'Eastern and southern wards face intermittent piped water pressure and increasing dependence on unregulated private tanker supplies.',
        mitigation: 'Mandate decentralized rainwater harvesting swales, 60 MLD sewage reclamation for industrial wet processing, and pipeline leakage detection.',
        icon: Droplets,
        color: 'text-cyan-400',
      });
    }

    // 2. Traffic Bottlenecks on Radials
    const congestedRoads = roadSegments.filter((r) => r.currentCongestionPct > 70);
    if (congestedRoads.length > 0) {
      list.push({
        id: 'vuln_traffic_gridlock',
        title: 'Radial Corridor Choke Points & Golden Hour Delays',
        severity: 'HIGH',
        metric: `${congestedRoads.length} arterial corridors operating above 70% design saturation capacity`,
        consequence: 'Average travel speeds fall below 22 km/h during evening peaks, stalling emergency response ambulances and freight logistics.',
        mitigation: 'Implement intelligent adaptive signal control, grade-separated flyovers at Peelamedu, and dedicated electric bus priority lanes.',
        icon: Gauge,
        color: 'text-rose-400',
      });
    }

    // 3. Flood Inundation Vulnerability
    const vulnerableWards = wards.filter((w) => w.floodVulnerability > 50);
    if (vulnerableWards.length > 0) {
      list.push({
        id: 'vuln_flood_inundation',
        title: 'Monsoon Lowland Inundation & Culvert Choking',
        severity: 'HIGH',
        metric: `${vulnerableWards.length} zones have high flood vulnerability (Singanallur & Kurichi catchments)`,
        consequence: 'Short intense rainfall bursts submerge causeways and cause backwater flooding into low-lying informal and residential settlements.',
        mitigation: 'Desilt Noyyal feeder canals, construct 3 balancing sponge detention wetlands, and raise bridge approach plinths.',
        icon: Waves,
        color: 'text-blue-400',
      });
    }

    // 4. Air Quality Hotspots
    if (simulationState.averageAQIPM25 > 65) {
      list.push({
        id: 'vuln_air_pollution',
        title: 'Industrial & Commuter PM2.5 Micro-Pollution Hotspots',
        severity: 'MODERATE',
        metric: `Average AQI ${simulationState.averageAQIPM25} PM2.5 with localized industrial spikes > 90`,
        consequence: 'Chronic respiratory ailments among children and elderly in manufacturing clusters during winter thermal inversions.',
        mitigation: 'Establish a 250m dense urban forestry green buffer (Miyawaki method) and enforce boiler particulate scrubbers.',
        icon: Wind,
        color: 'text-teal-400',
      });
    }

    return list;
  }, [simulationState, roadSegments, wards]);

  if (!isRedTeamOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-2xl nexus-glass rounded-2xl border border-rose-500/30 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setModalState('isRedTeamOpen', false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-rose-400 font-mono text-xs mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span>RED TEAM VULNERABILITY SCANNER</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">
          What Could Go Wrong?
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Automated single-point-of-failure stress analysis identifying systemic vulnerabilities and actionable mitigations.
        </p>

        {/* Vulnerability Cards */}
        <div className="space-y-4 mb-6">
          {vulnerabilities.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/20 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${v.color}`} />
                    <h4 className="font-bold text-slate-200">{v.title}</h4>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                      v.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {v.severity} RISK
                  </span>
                </div>

                <div className="text-[11px] font-mono text-cyan-300/90 pl-6">
                  {v.metric}
                </div>

                <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                  <strong className="text-slate-300">Failure Mode:</strong> {v.consequence}
                </p>

                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300 pl-6 leading-relaxed">
                  <strong className="text-emerald-400 flex items-center gap-1 mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Recommended Mitigation:
                  </strong>
                  {v.mitigation}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-mono text-slate-400">
          <span>Proactive resilience audit complete.</span>
          <button
            onClick={() => setModalState('isRedTeamOpen', false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
