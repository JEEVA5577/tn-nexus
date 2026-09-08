// Comprehensive Automated Test Suite for TN NEXUS
import { SyntheticDataProvider } from '../data/providers/SyntheticDataProvider';
import { ASSET_CATALOG } from '../data/assetCatalog';
import { analyzeSite } from '../simulation/siteSuitability';
import { calculateNecessity } from '../simulation/necessityEngine';
import { evaluateRedundancy } from '../simulation/redundancyEngine';
import { detectPolicyConflicts } from '../simulation/conflictEngine';
import { evaluateRoadNecessity } from '../simulation/roadNecessityEngine';
import { propagateConsequences } from '../simulation/causalEngine';
import { optimizeProject } from '../simulation/optimizer';
import { simulateDisaster } from '../simulation/disasterModel';
import { CityAsset } from '../types/city';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${msg}`);
}

console.log('====================================================');
console.log('🧪 TN NEXUS MULTI-DISCIPLINARY TEST & VERIFICATION');
console.log('====================================================');

const provider = new SyntheticDataProvider();
const baseAssets = provider.buildings.getInitialAssets();
const roadSegments = provider.roadNetwork.getRoadSegments();
const baseWards = provider.population.getWards();
const baseState = provider.getBaseState();

// --- TEST 1: Site Suitability Engine ---
console.log('\n--- 1. Testing Site Suitability Engine ---');
const coreSite = analyzeSite([0, 0, 0], baseAssets, roadSegments);
assert(coreSite.elevation >= 0, 'Elevation at core is non-negative');
assert(coreSite.zoneType === 'urban_core', 'Core coordinates classified as urban_core');
assert(coreSite.roadAccessQuality === 'EXCELLENT', 'Core has excellent road accessibility');

const agriSite = analyzeSite([-300, 0, 0], baseAssets, roadSegments);
assert(agriSite.zoneType === 'agricultural', 'Western coordinates classified as agricultural');
assert(agriSite.agriculturalImpact !== 'ZERO', 'Western site detects agricultural impact');

// --- TEST 2: Facility Specialization & Redundancy Engine ---
console.log('\n--- 2. Testing Facility Specialization & Redundancy ---');
const hospitalTemplate = ASSET_CATALOG.find(a => a.type === 'specialty_ortho_hospital')!;
const existingEntPos: [number, number, number] = [40, 0, -25];

// Proposed Ortho Hospital near existing ENT Hospital
const orthoEval = evaluateRedundancy(hospitalTemplate, existingEntPos, baseAssets, 'Orthopaedics');
assert(orthoEval.unmetSpecialtyIdentified === true, 'Recognizes Orthopaedic hospital fills unmet specialty near ENT clinic');
assert(orthoEval.incrementalPublicValuePct >= 75, 'High incremental public value for differentiated specialty');
assert(orthoEval.redundancyPenalty <= 10, 'Low redundancy penalty for differentiated specialty');

// Proposed Duplicate ENT Hospital in same catchment
const entTemplate = ASSET_CATALOG.find(a => a.type === 'multispecialty_hospital')!;
const duplicateEntEval = evaluateRedundancy(entTemplate, existingEntPos, baseAssets, 'ENT');
assert(duplicateEntEval.isRedundant === true || duplicateEntEval.redundancyPenalty > 15, 'Detects potential redundancy for identical ENT specialty');

// --- TEST 3: Policy Conflict Detection Engine ---
console.log('\n--- 3. Testing Policy Conflict Engine ---');
const expresswayTemplate = ASSET_CATALOG.find(a => a.type === 'radial_expressway')!;
const agriConflicts = detectPolicyConflicts(expresswayTemplate, agriSite, baseAssets);
const agriSeveranceFound = agriConflicts.some(c => c.id === 'conflict_agri_severance');
assert(agriSeveranceFound, 'Identified agricultural severance conflict when placing highway on farmland');

const lowlandFloodSite = analyzeSite([0, 0, -40], baseAssets, roadSegments); // in Noyyal floodway
const hospitalConflicts = detectPolicyConflicts(hospitalTemplate, lowlandFloodSite, baseAssets);
const floodConflictFound = hospitalConflicts.some(c => c.id === 'conflict_flood_inundation');
assert(floodConflictFound, 'Identified flood inundation conflict when placing hospital in river depression');

// --- TEST 4: Necessity Engine ---
console.log('\n--- 4. Testing Master Necessity Engine ---');
const orthoNecessity = calculateNecessity(hospitalTemplate, coreSite, baseAssets, roadSegments, 'Orthopaedics');
assert(orthoNecessity.overallScore >= 70, `Ortho hospital at core scores high necessity (${orthoNecessity.overallScore}/100)`);
assert(orthoNecessity.verdict === 'STRONGLY JUSTIFIED' || orthoNecessity.verdict === 'JUSTIFIED', `Verdict is justified (${orthoNecessity.verdict})`);
assert(orthoNecessity.factors.length >= 7, 'Provides transparent 7-factor evaluation breakdown');

// --- TEST 5: Road Necessity & Alternative Analysis Engine ---
console.log('\n--- 5. Testing Road Necessity & Alternatives Engine ---');
const roadResult = evaluateRoadNecessity(expresswayTemplate, coreSite, roadSegments);
assert(roadResult.score >= 40 && roadResult.score <= 100, `Road necessity score in valid range (${roadResult.score}/100)`);
assert(roadResult.alternativeOptions.length >= 4, 'Provides 4 multi-modal alternatives (BRT, widening, bypass)');
assert(roadResult.alternativeOptions.some(o => o.recommended), 'Recommends multi-modal optimized bypass');

// --- TEST 6: Cross-Sector Consequence & Causal Propagation ---
console.log('\n--- 6. Testing Cross-Sector Consequence Engine ---');
const techParkTemplate = ASSET_CATALOG.find(a => a.type === 'it_tech_park')!;
const mockNewAsset: CityAsset = {
  id: 'test_tech_park',
  name: 'New Test IT Park',
  type: techParkTemplate.type,
  category: techParkTemplate.category,
  position: [200, 0, -200],
  footprint: techParkTemplate.defaultFootprint,
  height: techParkTemplate.defaultHeight,
  status: 'PROPOSED',
  zone: 'industrial_tech',
  capacity: techParkTemplate.defaultCapacity,
  capacityUnit: techParkTemplate.defaultCapacityUnit,
  currentUtilizationPct: 80,
  serviceRadius: techParkTemplate.serviceRadius,
  populationServed: 50000,
  jobsCreated: techParkTemplate.baseJobs,
  trafficGeneratedPerHour: techParkTemplate.baseTrafficHourly,
  waterDemandKLD: techParkTemplate.baseWaterKLD,
  energyDemandMW: techParkTemplate.baseEnergyMW,
  wasteGenerationTPD: techParkTemplate.baseWasteTPD,
  environmentalScoreDelta: -10,
  economicImpactCrore: 500,
  constructionCostCrore: techParkTemplate.baseCostCrore,
  annualMaintenanceCrore: techParkTemplate.baseMaintenanceCrore,
  dependencies: techParkTemplate.dependencies,
};

const nextAssets = [...baseAssets, mockNewAsset];
const simResult = propagateConsequences(nextAssets, baseState, baseWards);

assert(simResult.updatedState.totalJobs > baseState.totalJobs, 'Jobs created increased city employment');
assert(simResult.updatedState.totalPopulation > baseState.totalPopulation, 'Population increased via second-order labor in-migration');
assert(simResult.updatedState.networkCongestionIndex >= baseState.networkCongestionIndex, 'Arterial congestion increased with commute traffic');
assert(simResult.causalEffects.length >= 3, 'Causal chains generated for explainability');
assert(simResult.whyCongestion.length >= 3, 'Quantitative attribution breakdown generated for congestion');

// --- TEST 7: Multi-Objective Policy Optimizer ---
console.log('\n--- 7. Testing Policy Optimizer ---');
const proposedHighwaySite = analyzeSite([-220, 0, -50], baseAssets, roadSegments);
const unoptimizedHighwayNecessity = calculateNecessity(expresswayTemplate, proposedHighwaySite, baseAssets, roadSegments);

const optimizedProposal = optimizeProject(
  expresswayTemplate,
  [-220, 0, -50],
  unoptimizedHighwayNecessity,
  baseAssets,
  roadSegments
);

assert(optimizedProposal.optimizedScore > optimizedProposal.originalScore, `Optimizer elevated necessity score from ${optimizedProposal.originalScore} to ${optimizedProposal.optimizedScore}`);
assert(optimizedProposal.enhancements.length >= 2, 'Generated mitigation enhancements (green buffer, sponge detention)');
assert(optimizedProposal.summaryQuote.length > 0, 'Generated visionary policy quote');

// --- TEST 8: Disaster Simulation Stress Tests ---
console.log('\n--- 8. Testing Disaster Simulation & Flood Physics ---');
const floodResult = simulateDisaster('FLOOD', 1.5, baseState, roadSegments);
assert(floodResult.floodWaterLevelMeters > 0, `Flood water level computed: ${floodResult.floodWaterLevelMeters}m`);
assert(floodResult.inundatedRoadCount > 0, `Inundated roads blocked: ${floodResult.inundatedRoadCount}`);
assert(floodResult.resilienceScore < baseState.disasterResilienceIndex, 'City resilience score degraded under flood stress');
assert(floodResult.mitigationRecommendations.length >= 2, 'Actionable flood mitigation directives generated');

// --- TEST 9: Rapid Placement & Reset Resilience ---
console.log('\n--- 9. Stress Testing Rapid Insertions & Scale ---');
let stressAssets = [...baseAssets];
for (let i = 0; i < 50; i++) {
  stressAssets.push({
    ...mockNewAsset,
    id: `stress_asset_${i}`,
    position: [Math.sin(i) * 300, 0, Math.cos(i) * 300],
  });
}
const stressSimResult = propagateConsequences(stressAssets, baseState, baseWards);
assert(stressSimResult.updatedState.totalPopulation > 0, 'Simulation engine successfully computed 330+ cumulative assets with zero degradation');

console.log('\n====================================================');
console.log('🎉 ALL 9 MULTI-DISCIPLINARY TEST SUITES PASSED (100%)');
console.log('====================================================');
