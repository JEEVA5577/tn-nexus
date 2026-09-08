// TN NEXUS - Tamil Nadu's Real-Time Urban Decision & Simulation Platform
// Master Application Component
import React from 'react';
import { CityCanvas } from './components/canvas/CityCanvas';
import { TopNavBar } from './components/ui/TopNavBar';
import { UniversalSearch } from './components/ui/UniversalSearch';
import { SiteAnalysisBadge } from './components/ui/SiteAnalysisBadge';
import { NecessityPanel } from './components/ui/NecessityPanel';
import { VisualModeSelector } from './components/ui/VisualModeSelector';
import { TimelineControls } from './components/ui/TimelineControls';
import { WhyModal } from './components/ui/WhyModal';
import { PolicyOptimizerModal } from './components/ui/PolicyOptimizerModal';
import { ScenarioComparisonModal } from './components/ui/ScenarioComparisonModal';
import { WhatIfLabModal } from './components/ui/WhatIfLabModal';
import { RedTeamModal } from './components/ui/RedTeamModal';
import { EquityLensModal } from './components/ui/EquityLensModal';
import { DecisionAuditTrailModal } from './components/ui/DecisionAuditTrailModal';
import { HackathonDemoModal } from './components/ui/HackathonDemoModal';
import { CMPresentationView } from './components/ui/CMPresentationView';

export const App: React.FC = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-nexus-950 font-sans text-slate-100">
      {/* 1. Fullscreen 3D Living City WebGL Canvas */}
      <CityCanvas />

      {/* 2. Top Civic Command Bar */}
      <TopNavBar />

      {/* 3. 12 Visualization Modes Selector */}
      <VisualModeSelector />

      {/* 4. Universal City-Building Search ("WHAT DO YOU WANT TO BUILD?") */}
      <UniversalSearch />

      {/* 5. Live Cursor Site Suitability Badge */}
      <SiteAnalysisBadge />

      {/* 6. The Signature Necessity Engine & Redundancy Inspector */}
      <NecessityPanel />

      {/* 7. Bottom Timeline (2026-2040) & Camera Controls */}
      <TimelineControls />

      {/* 8. Specialized Decision Support & Explainability Modals */}
      <WhyModal />
      <PolicyOptimizerModal />
      <ScenarioComparisonModal />
      <WhatIfLabModal />
      <RedTeamModal />
      <EquityLensModal />
      <DecisionAuditTrailModal />
      <HackathonDemoModal />
      <CMPresentationView />
    </div>
  );
};

export default App;
