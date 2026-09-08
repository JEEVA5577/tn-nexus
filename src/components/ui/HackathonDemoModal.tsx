// 90-Second Scripted Hackathon Cinematic Demo Controller for TN NEXUS
import React, { useEffect } from 'react';
import { Film, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Play, X, ShieldAlert } from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { ASSET_CATALOG } from '../../data/assetCatalog';
import confetti from 'canvas-confetti';

export const HackathonDemoModal: React.FC = () => {
  const isCinematicRunning = useCityStore((state) => state.isCinematicDemoRunning);
  const cinematicStep = useCityStore((state) => state.cinematicStep);
  const setCinematicStep = useCityStore((state) => state.setCinematicStep);
  const stopCinematicDemo = useCityStore((state) => state.stopCinematicDemo);
  const selectAssetTemplate = useCityStore((state) => state.selectAssetTemplate);
  const updateGhostPosition = useCityStore((state) => state.updateGhostPosition);
  const placeActiveAsset = useCityStore((state) => state.placeActiveAsset);
  const setModalState = useCityStore((state) => state.setModalState);
  const selectedPlacedAsset = useCityStore((state) => state.selectedPlacedAsset);
  const applyOptimizedProposal = useCityStore((state) => state.applyOptimizedProposal);

  // Scripted Demo Steps: 6 distinct chapters over ~90 seconds (or manual advance)
  const steps = [
    {
      title: 'Chapter 1: The Living Coimbatore Digital Twin',
      narration: 'TN NEXUS operates a living synthetic digital twin of Coimbatore with active traffic, moving TNSTC buses, pedestrian clusters, and natural water systems.',
      cameraBookmark: 'aerial',
      duration: 12000,
    },
    {
      title: 'Chapter 2: Proposing a Conventional 6-Lane Expressway',
      narration: 'A government department proposes a major 6-lane highway corridor cutting directly across the fertile agricultural and river fringe.',
      cameraBookmark: 'focus',
      duration: 15000,
    },
    {
      title: 'Chapter 3: The Necessity Engine Analyzes the Proposal',
      narration: 'Instant Necessity Analysis: Score 64/100 (JUSTIFIED WITH MODIFICATIONS). High traffic relief, but severe policy conflicts: 38 Hectares of prime agricultural topsoil loss and floodway obstruction!',
      cameraBookmark: 'focus',
      duration: 15000,
    },
    {
      title: 'Chapter 4: System Warning — "PROJECT REQUIRES MODIFICATION"',
      narration: 'TN NEXUS refuses to approve simply because it can be built. The platform warns that second-order impacts will cause agricultural severance and flood risks.',
      cameraBookmark: 'top_down',
      duration: 14000,
    },
    {
      title: 'Chapter 5: Autonomous Policy Optimizer Re-Engineers the Project',
      narration: 'With one click, the Optimizer searches multi-objective tradeoffs: shifts alignment 450m East, adds a dedicated BRT bus priority lane, sponge retention bioswales, and a green sound buffer!',
      cameraBookmark: 'focus',
      duration: 16000,
    },
    {
      title: 'Chapter 6: Transformative Public Value Achieved (88/100)',
      narration: '"The best project is not the biggest project. It is the project that creates the greatest public value with the least unnecessary impact."',
      cameraBookmark: 'aerial',
      duration: 18000,
    },
  ];

  // Automatic progression through script
  useEffect(() => {
    if (!isCinematicRunning) return;

    // Execute state actions on step entry
    if (cinematicStep === 1) {
      // Pick highway and preview
      const highwayTemplate = ASSET_CATALOG.find((a) => a.type === 'radial_expressway');
      if (highwayTemplate) {
        selectAssetTemplate(highwayTemplate);
        updateGhostPosition([-220, 2, -50]); // in agricultural zone!
      }
    } else if (cinematicStep === 2) {
      // Place highway
      placeActiveAsset();
    } else if (cinematicStep === 4) {
      // Trigger confetti celebration on optimization!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }

    const timer = setTimeout(() => {
      if (cinematicStep < steps.length - 1) {
        setCinematicStep(cinematicStep + 1);
      } else {
        // Complete
      }
    }, steps[cinematicStep].duration);

    return () => clearTimeout(timer);
  }, [isCinematicRunning, cinematicStep]);

  if (!isCinematicRunning) return null;

  const cur = steps[cinematicStep];

  return (
    <div className="fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 select-none pointer-events-none">
      <div className="w-full max-w-3xl nexus-glass rounded-2xl border-2 border-amber-500/50 shadow-2xl p-5 pointer-events-auto bg-slate-950/90">
        {/* Top chapter indicator */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
            <Film className="w-4 h-4 animate-pulse" />
            <span>90-SECOND HACKATHON SHOWCASE DEMO • {cinematicStep + 1} OF {steps.length}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Step progress pills */}
            <div className="flex items-center gap-1">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCinematicStep(i)}
                  className={`w-6 h-1.5 rounded-full transition-all ${
                    i === cinematicStep ? 'bg-amber-400 w-10' : i < cinematicStep ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={stopCinematicDemo}
              className="text-slate-400 hover:text-white p-1 ml-2 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chapter Title & Narration */}
        <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
          {cur.title}
        </h3>
        <p className="text-sm text-amber-100/90 leading-relaxed mb-4">
          {cur.narration}
        </p>

        {/* Step Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono">
          <span className="text-slate-400">
            Autonomous decision simulation in progress...
          </span>

          <div className="flex items-center gap-2">
            {cinematicStep < steps.length - 1 ? (
              <button
                onClick={() => setCinematicStep(cinematicStep + 1)}
                className="px-4 py-1.5 rounded-lg bg-amber-500 text-black font-bold hover:bg-amber-400 transition-all flex items-center gap-1.5"
              >
                <span>Next Chapter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={stopCinematicDemo}
                className="px-5 py-1.5 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all"
              >
                Finish Demo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
