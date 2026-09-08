// TN NEXUS - Urban Digital Twin & Simulation Platform Types

export type AssetCategory =
  | 'healthcare'
  | 'education'
  | 'transport'
  | 'commercial'
  | 'industrial'
  | 'residential'
  | 'utilities'
  | 'recreation'
  | 'agriculture'
  | 'emergency'
  | 'government';

export type ZoneType =
  | 'urban_core'
  | 'commercial_high'
  | 'residential_dense'
  | 'residential_suburban'
  | 'industrial_heavy'
  | 'industrial_tech'
  | 'agricultural'
  | 'green_conservation'
  | 'water_body'
  | 'transport_corridor'
  | 'utilities';

export type AssetStatus = 'EXISTING' | 'PROPOSED' | 'OPTIMIZED' | 'UNDER_CONSTRUCTION';

export type NecessityVerdict =
  | 'STRONGLY JUSTIFIED'
  | 'JUSTIFIED'
  | 'JUSTIFIED WITH MODIFICATIONS'
  | 'LOW PRIORITY'
  | 'NOT CURRENTLY JUSTIFIED';

export type VisualMode =
  | 'CITY'
  | 'TRAFFIC'
  | 'HEALTH'
  | 'WATER'
  | 'ENERGY'
  | 'ENVIRONMENT'
  | 'POPULATION'
  | 'AGRICULTURE'
  | 'ECONOMY'
  | 'DISASTER'
  | 'LAND_USE'
  | 'EMERGENCY';

export type TimeOfDay = 'DAWN' | 'MORNING_PEAK' | 'MIDDAY' | 'EVENING_PEAK' | 'NIGHT';

export type WeatherCondition = 'CLEAR' | 'CLOUDY' | 'RAIN' | 'HEAVY_RAIN';

export type DisasterType = 'NONE' | 'FLOOD' | 'CYCLONE' | 'EXTREME_RAINFALL' | 'HEAT_WAVE' | 'TRAFFIC_GRIDLOCK';

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface CityAsset {
  id: string;
  name: string;
  type: string;
  category: AssetCategory;
  position: [number, number, number];
  rotation?: number; // radians
  footprint: [number, number]; // width (x), depth (z)
  height: number;
  status: AssetStatus;
  zone: ZoneType;

  // Operational Specs
  capacity: number;
  capacityUnit: string;
  currentUtilizationPct: number; // 0 - 100
  specialty?: string; // e.g., 'Orthopaedics', 'ENT', 'Cardiology', 'Multispecialty', 'Textile', 'IT', 'Higher Secondary'
  serviceRadius: number; // in meters (in-sim units)

  // Impacts
  populationServed: number;
  jobsCreated: number;
  trafficGeneratedPerHour: number;
  waterDemandKLD: number; // Kiloliters per day
  energyDemandMW: number; // Megawatts
  wasteGenerationTPD: number; // Tonnes per day
  environmentalScoreDelta: number; // -100 to +100
  economicImpactCrore: number; // in ₹ Crore

  // Financials (Illustrative)
  constructionCostCrore: number; // in ₹ Crore
  annualMaintenanceCrore: number;

  // Technical
  dependencies: string[]; // e.g. ['4_lane_road', 'high_voltage_power', 'potable_water', 'storm_drain']
  yearBuilt?: number;
  notes?: string;
}

export interface AssetTemplate {
  type: string;
  name: string;
  category: AssetCategory;
  description: string;
  typicalFunction: string;
  iconName: string;
  keywords: string[];
  defaultFootprint: [number, number];
  defaultHeight: number;
  defaultCapacity: number;
  defaultCapacityUnit: string;
  defaultSpecialties?: string[];
  serviceRadius: number;

  // Base metrics
  baseJobs: number;
  baseCostCrore: number;
  baseMaintenanceCrore: number;
  baseWaterKLD: number;
  baseEnergyMW: number;
  baseTrafficHourly: number;
  baseWasteTPD: number;

  dependencies: string[];
  recommendedZones: ZoneType[];
}

export interface SiteAnalysis {
  position: [number, number, number];
  elevation: number;
  slope: number;
  landType: string;
  zoneType: ZoneType;
  floodRiskLevel: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  roadAccessQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  distanceToNearestRoad: number;
  waterAccessReadiness: 'IMMEDIATE' | 'NEEDS_EXTENSION' | 'DEFICIENT';
  powerAccessReadiness: 'SURPLUS' | 'ADEQUATE' | 'CONSTRAINED';
  sewerAccessReadiness: 'AVAILABLE' | 'PARTIAL' | 'UNSERVICED';
  nearbyPopulation1km: number;
  nearbyPopulation3km: number;
  distanceToSimilarFacility: number;
  environmentalSensitivity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  agriculturalImpact: 'ZERO' | 'MARGINAL' | 'MODERATE' | 'SEVERE_LOSS';
}

export interface NecessityFactor {
  id: string;
  name: string;
  score: number; // 0 - 100
  weight: number; // 0 - 1
  impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  summary: string;
  details: string;
}

export interface NecessityAnalysisResult {
  overallScore: number; // 0 - 100
  verdict: NecessityVerdict;
  verdictDescription: string;
  demandScore: number;
  accessibilityScore: number;
  capacityGapScore: number;
  specialtyDifferentiationScore: number;
  infrastructureReadinessScore: number;
  costEffectivenessScore: number;
  redundancyPenalty: number;
  resilienceScore: number;
  environmentalScore: number;

  factors: NecessityFactor[];
  redundancyWarning?: string;
  specialtyInsight: string;
  conflicts: PolicyConflict[];
  recommendedActions: string[];
}

export interface PolicyConflict {
  id: string;
  title: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  reason: string;
  consequences: string;
  suggestedAlternative: string;
}

export interface RoadNecessityResult {
  score: number;
  verdict: NecessityVerdict;
  odPressureReliefPct: number;
  travelTimeReductionMins: number;
  freightThroughputBoostPct: number;
  landAcquisitionHectares: number;
  agriculturalLossHectares: number;
  bridgeRequirement: boolean;
  alternativeOptions: {
    name: string;
    description: string;
    score: number;
    costCrore: number;
    recommended?: boolean;
  }[];
}

export interface CausalEffect {
  driver: string;
  metric: string;
  delta: string;
  direction: 'UP' | 'DOWN' | 'STABLE';
  chain: string[];
  explanation: string;
}

export interface WardMetric {
  id: string;
  name: string;
  zone: ZoneType;
  population: number;
  growthRatePct: number;
  avgIncomeLevel: 'LOW' | 'LOWER_MIDDLE' | 'MIDDLE' | 'HIGH';
  hospitalBedsPer1k: number;
  schoolSeatsPer1k: number;
  trafficCongestionIndex: number; // 0-100
  waterStressIndex: number; // 0-100
  airQualityIndex: number; // PM2.5 proxy
  greenSpaceM2PerCapita: number;
  floodVulnerability: number; // 0-100
}

export interface CitySimulationState {
  totalPopulation: number;
  populationGrowthPct: number;
  totalJobs: number;
  averageTravelSpeedKmh: number;
  networkCongestionIndex: number; // 0 - 100
  overallHealthcareCapacityBeds: number;
  healthcareCoveragePct: number;
  waterDailyDemandMLD: number;
  waterSupplyCapacityMLD: number;
  waterStressIndex: number; // 0 - 100
  powerPeakDemandMW: number;
  powerGridCapacityMW: number;
  solidWasteTPD: number;
  averageAQIPM25: number;
  cityGreenCoverPct: number;
  municipalBudgetRemainingCrore: number;
  floodInundatedAreaSqKm: number;
  disasterResilienceIndex: number; // 0 - 100
}

export interface DecisionLogEntry {
  id: string;
  timestamp: string;
  action: 'PROPOSE' | 'MODIFY' | 'RELOCATE' | 'OPTIMIZE' | 'APPROVE' | 'REJECT';
  assetName: string;
  assetType: string;
  location: [number, number, number];
  necessityScore: number;
  verdict: NecessityVerdict;
  costCrore: number;
  userNotes: string;
}

export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  assets: CityAsset[];
  state: CitySimulationState;
  budgetSpentCrore: number;
}
