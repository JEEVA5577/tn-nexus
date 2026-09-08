// Zustand Global State Store for TN NEXUS Digital Twin
import { create } from 'zustand';
import {
  CityAsset,
  AssetTemplate,
  SiteAnalysis,
  NecessityAnalysisResult,
  RoadNecessityResult,
  CitySimulationState,
  WardMetric,
  VisualMode,
  TimeOfDay,
  WeatherCondition,
  DisasterType,
  DecisionLogEntry,
  ScenarioConfig,
  CausalEffect,
} from '../types/city';
import { SyntheticDataProvider } from '../data/providers/SyntheticDataProvider';
import { RoadSegment } from '../data/providers/ICityDataProvider';
import { analyzeSite } from '../simulation/siteSuitability';
import { calculateNecessity } from '../simulation/necessityEngine';
import { evaluateRoadNecessity } from '../simulation/roadNecessityEngine';
import { propagateConsequences } from '../simulation/causalEngine';
import { simulateDisaster, DisasterImpactSummary } from '../simulation/disasterModel';

interface CityStoreState {
  // Core Data
  provider: SyntheticDataProvider;
  assets: CityAsset[];
  history: CityAsset[][];
  future: CityAsset[][];
  roadSegments: RoadSegment[];
  wards: WardMetric[];
  simulationState: CitySimulationState;

  // Visual & Environmental Controls
  visualMode: VisualMode;
  timeOfDay: TimeOfDay;
  weather: WeatherCondition;
  disaster: DisasterType;
  disasterImpact: DisasterImpactSummary;
  simYear: number;
  isSimulating: boolean;
  fps: number;

  // Placement & Active Proposal State
  activeAssetTemplate: AssetTemplate | null;
  selectedSpecialty: string | undefined;
  ghostPosition: [number, number, number] | null;
  currentSiteAnalysis: SiteAnalysis | null;
  currentNecessity: NecessityAnalysisResult | null;
  roadNecessity: RoadNecessityResult | null;
  selectedPlacedAsset: CityAsset | null;

  // Causal & Explainability
  causalEffects: CausalEffect[];
  whyCongestion: { reason: string; contributionPct: number }[];
  whyWaterStress: { reason: string; contributionPct: number }[];
  whyAQI: { reason: string; contributionPct: number }[];

  // Decision & Audit Log
  decisionAuditLog: DecisionLogEntry[];

  // Scenarios
  scenarios: { [key in 'A' | 'B' | 'C']: ScenarioConfig };
  activeScenarioId: 'A' | 'B' | 'C';

  // Modals & Mode Flags
  isOptimizerOpen: boolean;
  isWhatIfOpen: boolean;
  isRedTeamOpen: boolean;
  isEquityOpen: boolean;
  isScenarioModalOpen: boolean;
  isAuditModalOpen: boolean;
  isWhyModalOpen: boolean;
  activeWhyType: 'congestion' | 'water' | 'aqi' | null;
  isPresentationMode: boolean;
  isCinematicDemoRunning: boolean;
  cinematicStep: number;
  cameraBookmark: 'default' | 'aerial' | 'top_down' | 'street' | 'focus';
  cameraFocusTarget: [number, number, number] | null;

  // Actions
  selectAssetTemplate: (template: AssetTemplate | null, specialty?: string) => void;
  updateGhostPosition: (pos: [number, number, number]) => void;
  placeActiveAsset: () => void;
  selectExistingAsset: (asset: CityAsset | null) => void;
  updateAssetPosition: (assetId: string, newPos: [number, number, number]) => void;
  removeAsset: (assetId: string) => void;
  approveProposal: (notes?: string) => void;
  rejectProposal: (notes?: string) => void;
  applyOptimizedProposal: (newPos: [number, number, number], newNecessity: NecessityAnalysisResult, extraCostCrore: number) => void;

  undo: () => void;
  redo: () => void;

  setVisualMode: (mode: VisualMode) => void;
  setTimeOfDay: (time: TimeOfDay) => void;
  setWeather: (weather: WeatherCondition) => void;
  triggerDisaster: (disaster: DisasterType) => void;
  setSimYear: (year: number) => void;
  toggleSimulation: () => void;
  setFps: (fps: number) => void;

  saveScenario: (slot: 'A' | 'B' | 'C') => void;
  loadScenario: (slot: 'A' | 'B' | 'C') => void;

  setModalState: (modal: string, isOpen: boolean) => void;
  openWhyModal: (type: 'congestion' | 'water' | 'aqi') => void;
  togglePresentationMode: () => void;
  setCameraBookmark: (bookmark: 'default' | 'aerial' | 'top_down' | 'street' | 'focus', target?: [number, number, number]) => void;

  startCinematicDemo: () => void;
  stopCinematicDemo: () => void;
  setCinematicStep: (step: number) => void;

  resetCity: () => void;
}

const providerInstance = new SyntheticDataProvider();
const initialAssets = providerInstance.buildings.getInitialAssets();
const initialRoads = providerInstance.roadNetwork.getRoadSegments();
const initialWards = providerInstance.population.getWards();
const baseState = providerInstance.getBaseState();

export const useCityStore = create<CityStoreState>((set, get) => ({
  provider: providerInstance,
  assets: initialAssets,
  history: [],
  future: [],
  roadSegments: initialRoads,
  wards: initialWards,
  simulationState: baseState,

  visualMode: 'CITY',
  timeOfDay: 'MIDDAY',
  weather: 'CLEAR',
  disaster: 'NONE',
  disasterImpact: simulateDisaster('NONE', 1, baseState, initialRoads),
  simYear: 2026,
  isSimulating: true,
  fps: 60,

  activeAssetTemplate: null,
  selectedSpecialty: undefined,
  ghostPosition: null,
  currentSiteAnalysis: null,
  currentNecessity: null,
  roadNecessity: null,
  selectedPlacedAsset: null,

  causalEffects: [],
  whyCongestion: [],
  whyWaterStress: [],
  whyAQI: [],

  decisionAuditLog: [
    {
      id: 'log_init',
      timestamp: '2026-09-08 09:00:00',
      action: 'APPROVE',
      assetName: 'Coimbatore Digital Twin Baseline',
      assetType: 'system_baseline',
      location: [0, 0, 0],
      necessityScore: 100,
      verdict: 'STRONGLY JUSTIFIED',
      costCrore: 0,
      userNotes: 'System baseline initialized from synthetic municipal cadastral layout.',
    }
  ],

  scenarios: {
    A: { id: 'A', name: 'Scenario A: Baseline Plan', description: 'Current synthetic city configuration.', assets: [...initialAssets], state: { ...baseState }, budgetSpentCrore: 0 },
    B: { id: 'B', name: 'Scenario B: Industrial Hub', description: 'Concentrated tech & manufacturing expansion with radial expressway.', assets: [...initialAssets], state: { ...baseState }, budgetSpentCrore: 0 },
    C: { id: 'C', name: 'Scenario C: Green Sponge City', description: 'Eco-retention wetlands, multi-modal BRT transit, and rooftop solar grid.', assets: [...initialAssets], state: { ...baseState }, budgetSpentCrore: 0 },
  },
  activeScenarioId: 'A',

  isOptimizerOpen: false,
  isWhatIfOpen: false,
  isRedTeamOpen: false,
  isEquityOpen: false,
  isScenarioModalOpen: false,
  isAuditModalOpen: false,
  isWhyModalOpen: false,
  activeWhyType: null,
  isPresentationMode: false,
  isCinematicDemoRunning: false,
  cinematicStep: 0,
  cameraBookmark: 'default',
  cameraFocusTarget: null,

  selectAssetTemplate: (template, specialty) => {
    if (!template) {
      set({
        activeAssetTemplate: null,
        selectedSpecialty: undefined,
        ghostPosition: null,
        currentSiteAnalysis: null,
        currentNecessity: null,
        roadNecessity: null,
      });
      return;
    }

    const defaultPos: [number, number, number] = [0, 0, 0];
    const { assets, roadSegments } = get();
    const site = analyzeSite(defaultPos, assets, roadSegments, template.type);
    const nec = calculateNecessity(template, site, assets, roadSegments, specialty);
    const roadNec = template.category === 'transport' ? evaluateRoadNecessity(template, site, roadSegments) : null;

    set({
      activeAssetTemplate: template,
      selectedSpecialty: specialty || (template.defaultSpecialties ? template.defaultSpecialties[0] : undefined),
      ghostPosition: defaultPos,
      currentSiteAnalysis: site,
      currentNecessity: nec,
      roadNecessity: roadNec,
      selectedPlacedAsset: null,
    });
  },

  updateGhostPosition: (pos) => {
    const { activeAssetTemplate, selectedSpecialty, assets, roadSegments } = get();
    if (!activeAssetTemplate) return;

    const site = analyzeSite(pos, assets, roadSegments, activeAssetTemplate.type);
    const nec = calculateNecessity(activeAssetTemplate, site, assets, roadSegments, selectedSpecialty);
    const roadNec = activeAssetTemplate.category === 'transport' ? evaluateRoadNecessity(activeAssetTemplate, site, roadSegments) : null;

    set({
      ghostPosition: [pos[0], site.elevation, pos[2]],
      currentSiteAnalysis: site,
      currentNecessity: nec,
      roadNecessity: roadNec,
    });
  },

  placeActiveAsset: () => {
    const {
      activeAssetTemplate,
      selectedSpecialty,
      ghostPosition,
      currentSiteAnalysis,
      currentNecessity,
      assets,
      history,
      simulationState,
      wards,
      decisionAuditLog
    } = get();

    if (!activeAssetTemplate || !ghostPosition || !currentSiteAnalysis || !currentNecessity) return;

    const newAsset: CityAsset = {
      id: `proposed_${Date.now()}`,
      name: `Proposed ${activeAssetTemplate.name}`,
      type: activeAssetTemplate.type,
      category: activeAssetTemplate.category,
      position: [ghostPosition[0], currentSiteAnalysis.elevation, ghostPosition[2]],
      footprint: activeAssetTemplate.defaultFootprint,
      height: activeAssetTemplate.defaultHeight,
      status: 'PROPOSED',
      zone: currentSiteAnalysis.zoneType,
      capacity: activeAssetTemplate.defaultCapacity,
      capacityUnit: activeAssetTemplate.defaultCapacityUnit,
      currentUtilizationPct: 50,
      specialty: selectedSpecialty || (activeAssetTemplate.defaultSpecialties ? activeAssetTemplate.defaultSpecialties[0] : undefined),
      serviceRadius: activeAssetTemplate.serviceRadius,
      populationServed: Math.round(currentSiteAnalysis.nearbyPopulation3km * 0.8),
      jobsCreated: activeAssetTemplate.baseJobs,
      trafficGeneratedPerHour: activeAssetTemplate.baseTrafficHourly,
      waterDemandKLD: activeAssetTemplate.baseWaterKLD,
      energyDemandMW: activeAssetTemplate.baseEnergyMW,
      wasteGenerationTPD: activeAssetTemplate.baseWasteTPD,
      environmentalScoreDelta: currentNecessity.environmentalScore - 70,
      economicImpactCrore: Math.round(activeAssetTemplate.baseCostCrore * 1.6),
      constructionCostCrore: activeAssetTemplate.baseCostCrore,
      annualMaintenanceCrore: activeAssetTemplate.baseMaintenanceCrore,
      dependencies: activeAssetTemplate.dependencies,
      yearBuilt: get().simYear,
      notes: `Evaluated with Necessity Score: ${currentNecessity.overallScore}/100 (${currentNecessity.verdict}).`,
    };

    const nextAssets = [...assets, newAsset];
    const simResult = propagateConsequences(nextAssets, simulationState, wards);

    const logEntry: DecisionLogEntry = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: 'PROPOSE',
      assetName: newAsset.name,
      assetType: newAsset.type,
      location: newAsset.position,
      necessityScore: currentNecessity.overallScore,
      verdict: currentNecessity.verdict,
      costCrore: newAsset.constructionCostCrore,
      userNotes: currentNecessity.verdictDescription,
    };

    set({
      history: [...history, assets],
      future: [],
      assets: nextAssets,
      simulationState: simResult.updatedState,
      wards: simResult.updatedWards,
      causalEffects: simResult.causalEffects,
      whyCongestion: simResult.whyCongestion,
      whyWaterStress: simResult.whyWaterStress,
      whyAQI: simResult.whyAQI,
      decisionAuditLog: [logEntry, ...decisionAuditLog],
      selectedPlacedAsset: newAsset,
      activeAssetTemplate: null, // clear active tool
      ghostPosition: null,
    });
  },

  selectExistingAsset: (asset) => {
    if (!asset) {
      set({ selectedPlacedAsset: null });
      return;
    }
    const { roadSegments, assets } = get();
    const site = analyzeSite(asset.position, assets, roadSegments, asset.type);

    // Mock template from asset for necessity check
    const template: AssetTemplate = {
      type: asset.type,
      name: asset.name,
      category: asset.category,
      description: asset.notes || '',
      typicalFunction: 'Operational municipal facility',
      iconName: 'Building',
      keywords: [],
      defaultFootprint: asset.footprint,
      defaultHeight: asset.height,
      defaultCapacity: asset.capacity,
      defaultCapacityUnit: asset.capacityUnit,
      serviceRadius: asset.serviceRadius,
      baseJobs: asset.jobsCreated,
      baseCostCrore: asset.constructionCostCrore,
      baseMaintenanceCrore: asset.annualMaintenanceCrore,
      baseWaterKLD: asset.waterDemandKLD,
      baseEnergyMW: asset.energyDemandMW,
      baseTrafficHourly: asset.trafficGeneratedPerHour,
      baseWasteTPD: asset.wasteGenerationTPD,
      dependencies: asset.dependencies,
      recommendedZones: [asset.zone],
    };

    const nec = calculateNecessity(template, site, assets, roadSegments, asset.specialty);

    set({
      selectedPlacedAsset: asset,
      activeAssetTemplate: null,
      ghostPosition: null,
      currentSiteAnalysis: site,
      currentNecessity: nec,
      roadNecessity: asset.category === 'transport' ? evaluateRoadNecessity(template, site, roadSegments) : null,
      cameraBookmark: 'focus',
      cameraFocusTarget: asset.position,
    });
  },

  updateAssetPosition: (assetId, newPos) => {
    const { assets, roadSegments, history, simulationState, wards } = get();
    const target = assets.find(a => a.id === assetId);
    if (!target) return;

    const site = analyzeSite(newPos, assets, roadSegments, target.type);
    const updated = assets.map(a => (a.id === assetId ? { ...a, position: [newPos[0], site.elevation, newPos[2]] as [number, number, number], zone: site.zoneType } : a));
    const simResult = propagateConsequences(updated, simulationState, wards);

    set({
      history: [...history, assets],
      future: [],
      assets: updated,
      simulationState: simResult.updatedState,
      wards: simResult.updatedWards,
      causalEffects: simResult.causalEffects,
      currentSiteAnalysis: site,
    });
  },

  removeAsset: (assetId) => {
    const { assets, history, simulationState, wards } = get();
    const updated = assets.filter(a => a.id !== assetId);
    const simResult = propagateConsequences(updated, simulationState, wards);

    set({
      history: [...history, assets],
      future: [],
      assets: updated,
      simulationState: simResult.updatedState,
      wards: simResult.updatedWards,
      causalEffects: simResult.causalEffects,
      selectedPlacedAsset: null,
    });
  },

  approveProposal: (notes = 'Statutory municipal sanction granted.') => {
    const { selectedPlacedAsset, assets, decisionAuditLog, currentNecessity } = get();
    if (!selectedPlacedAsset) return;

    const updated = assets.map(a => (a.id === selectedPlacedAsset.id ? { ...a, status: 'APPROVED' as any } : a));
    const logEntry: DecisionLogEntry = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: 'APPROVE',
      assetName: selectedPlacedAsset.name,
      assetType: selectedPlacedAsset.type,
      location: selectedPlacedAsset.position,
      necessityScore: currentNecessity ? currentNecessity.overallScore : 85,
      verdict: 'STRONGLY JUSTIFIED',
      costCrore: selectedPlacedAsset.constructionCostCrore,
      userNotes: notes,
    };

    set({
      assets: updated,
      selectedPlacedAsset: { ...selectedPlacedAsset, status: 'APPROVED' as any },
      decisionAuditLog: [logEntry, ...decisionAuditLog],
    });
  },

  rejectProposal: (notes = 'Proposal rejected based on redundancy and environmental risk analysis.') => {
    const { selectedPlacedAsset, assets, decisionAuditLog, currentNecessity } = get();
    if (!selectedPlacedAsset) return;

    const updated = assets.filter(a => a.id !== selectedPlacedAsset.id);
    const logEntry: DecisionLogEntry = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: 'REJECT',
      assetName: selectedPlacedAsset.name,
      assetType: selectedPlacedAsset.type,
      location: selectedPlacedAsset.position,
      necessityScore: currentNecessity ? currentNecessity.overallScore : 30,
      verdict: 'NOT CURRENTLY JUSTIFIED',
      costCrore: 0,
      userNotes: notes,
    };

    set({
      assets: updated,
      selectedPlacedAsset: null,
      decisionAuditLog: [logEntry, ...decisionAuditLog],
    });
  },

  applyOptimizedProposal: (newPos, newNecessity, extraCostCrore) => {
    const { selectedPlacedAsset, assets, roadSegments, simulationState, wards, decisionAuditLog } = get();
    if (!selectedPlacedAsset) return;

    const site = analyzeSite(newPos, assets, roadSegments, selectedPlacedAsset.type);
    const updated = assets.map(a =>
      a.id === selectedPlacedAsset.id
        ? {
            ...a,
            position: [newPos[0], site.elevation, newPos[2]] as [number, number, number],
            status: 'OPTIMIZED' as any,
            constructionCostCrore: a.constructionCostCrore + extraCostCrore,
            notes: `OPTIMIZED: ${newNecessity.overallScore}/100 (${newNecessity.verdict}). Critical conflicts resolved.`,
          }
        : a
    );

    const simResult = propagateConsequences(updated, simulationState, wards);
    const logEntry: DecisionLogEntry = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: 'OPTIMIZE',
      assetName: selectedPlacedAsset.name,
      assetType: selectedPlacedAsset.type,
      location: newPos,
      necessityScore: newNecessity.overallScore,
      verdict: newNecessity.verdict,
      costCrore: selectedPlacedAsset.constructionCostCrore + extraCostCrore,
      userNotes: 'Re-aligned coordinates and applied sponge retention + green buffer package.',
    };

    set({
      assets: updated,
      selectedPlacedAsset: updated.find(a => a.id === selectedPlacedAsset.id) || null,
      currentSiteAnalysis: site,
      currentNecessity: newNecessity,
      simulationState: simResult.updatedState,
      wards: simResult.updatedWards,
      decisionAuditLog: [logEntry, ...decisionAuditLog],
      isOptimizerOpen: false,
    });
  },

  undo: () => {
    const { history, future, assets, simulationState, wards } = get();
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    const simResult = propagateConsequences(previous, simulationState, wards);

    set({
      history: newHistory,
      future: [assets, ...future],
      assets: previous,
      simulationState: simResult.updatedState,
      wards: simResult.updatedWards,
      selectedPlacedAsset: null,
    });
  },

  redo: () => {
    const { history, future, assets, simulationState, wards } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    const simResult = propagateConsequences(next, simulationState, wards);

    set({
      history: [...history, assets],
      future: newFuture,
      assets: next,
      simulationState: simResult.updatedState,
      wards: simResult.updatedWards,
      selectedPlacedAsset: null,
    });
  },

  setVisualMode: (mode) => set({ visualMode: mode }),
  setTimeOfDay: (time) => set({ timeOfDay: time }),
  setWeather: (weather) => {
    const { disaster } = get();
    let effectiveDisaster = disaster;
    if (weather === 'HEAVY_RAIN' && disaster === 'NONE') effectiveDisaster = 'FLOOD';
    set({ weather, disaster: effectiveDisaster });
  },

  triggerDisaster: (disaster) => {
    const { simulationState, roadSegments } = get();
    const impact = simulateDisaster(disaster, 1.2, simulationState, roadSegments);
    set({
      disaster,
      disasterImpact: impact,
      weather: disaster === 'FLOOD' || disaster === 'EXTREME_RAINFALL' || disaster === 'CYCLONE' ? 'HEAVY_RAIN' : 'CLEAR',
      visualMode: disaster !== 'NONE' ? 'DISASTER' : 'CITY',
    });
  },

  setSimYear: (year) => {
    const { assets, simulationState, wards } = get();
    const multiplier = 1 + (year - 2026) * 0.08;
    const simResult = propagateConsequences(assets, simulationState, wards, multiplier);
    set({
      simYear: year,
      simulationState: simResult.updatedState,
      wards: simResult.updatedWards,
      causalEffects: simResult.causalEffects,
    });
  },

  toggleSimulation: () => set((state) => ({ isSimulating: !state.isSimulating })),
  setFps: (fps) => set({ fps }),

  saveScenario: (slot) => {
    const { assets, simulationState, scenarios } = get();
    const costSpent = 10000 - simulationState.municipalBudgetRemainingCrore;
    set({
      scenarios: {
        ...scenarios,
        [slot]: {
          ...scenarios[slot],
          assets: [...assets],
          state: { ...simulationState },
          budgetSpentCrore: costSpent,
        },
      },
    });
  },

  loadScenario: (slot) => {
    const { scenarios } = get();
    const target = scenarios[slot];
    set({
      activeScenarioId: slot,
      assets: [...target.assets],
      simulationState: { ...target.state },
      selectedPlacedAsset: null,
      activeAssetTemplate: null,
      ghostPosition: null,
    });
  },

  setModalState: (modal, isOpen) => set({ [modal]: isOpen } as any),

  openWhyModal: (type) => set({ isWhyModalOpen: true, activeWhyType: type }),

  togglePresentationMode: () => set((state) => ({ isPresentationMode: !state.isPresentationMode })),

  setCameraBookmark: (bookmark, target) =>
    set({
      cameraBookmark: bookmark,
      cameraFocusTarget: target || null,
    }),

  startCinematicDemo: () =>
    set({
      isCinematicDemoRunning: true,
      cinematicStep: 0,
      isPresentationMode: false,
    }),

  stopCinematicDemo: () =>
    set({
      isCinematicDemoRunning: false,
      cinematicStep: 0,
    }),

  setCinematicStep: (step) => set({ cinematicStep: step }),

  resetCity: () => {
    const freshProvider = new SyntheticDataProvider();
    const freshAssets = freshProvider.buildings.getInitialAssets();
    const freshRoads = freshProvider.roadNetwork.getRoadSegments();
    const freshWards = freshProvider.population.getWards();
    const freshState = freshProvider.getBaseState();

    set({
      provider: freshProvider,
      assets: freshAssets,
      history: [],
      future: [],
      roadSegments: freshRoads,
      wards: freshWards,
      simulationState: freshState,
      visualMode: 'CITY',
      timeOfDay: 'MIDDAY',
      weather: 'CLEAR',
      disaster: 'NONE',
      disasterImpact: simulateDisaster('NONE', 1, freshState, freshRoads),
      simYear: 2026,
      activeAssetTemplate: null,
      selectedPlacedAsset: null,
      ghostPosition: null,
      isCinematicDemoRunning: false,
      cinematicStep: 0,
      cameraBookmark: 'default',
    });
  },
}));
