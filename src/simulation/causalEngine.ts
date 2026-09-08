// Cross-Sector Consequence Engine & Second-Order Causal Propagation for TN NEXUS
import {
  CityAsset,
  CitySimulationState,
  CausalEffect,
  WardMetric
} from '../types/city';

export interface SimulationStepResult {
  updatedState: CitySimulationState;
  updatedWards: WardMetric[];
  causalEffects: CausalEffect[];
  whyCongestion: { reason: string; contributionPct: number }[];
  whyWaterStress: { reason: string; contributionPct: number }[];
  whyAQI: { reason: string; contributionPct: number }[];
}

export function propagateConsequences(
  currentAssets: CityAsset[],
  baseState: CitySimulationState,
  baseWards: WardMetric[],
  timeMultiplier: number = 1.0 // for future year projections (2026-2040)
): SimulationStepResult {
  // Aggregate primary inputs from all active assets
  let totalNewJobs = 0;
  let totalNewWaterKLD = 0;
  let totalNewEnergyMW = 0;
  let totalNewWasteTPD = 0;
  let totalNewTrafficHourly = 0;
  let totalHealthcareBeds = 0;
  let totalGreenCoverDeltaM2 = 0;
  let totalCostCrore = 0;

  for (const a of currentAssets) {
    totalNewJobs += a.jobsCreated;
    totalNewWaterKLD += a.waterDemandKLD;
    totalNewEnergyMW += a.energyDemandMW;
    totalNewWasteTPD += a.wasteGenerationTPD;
    totalNewTrafficHourly += a.trafficGeneratedPerHour;
    if (a.category === 'healthcare') totalHealthcareBeds += a.capacity;
    if (a.category === 'recreation') totalGreenCoverDeltaM2 += a.footprint[0] * a.footprint[1] * 2;
    if (a.status !== 'EXISTING') totalCostCrore += a.constructionCostCrore;
  }

  // Second-order causal chain propagation:
  // 1. JOBS -> IN-MIGRATION & POPULATION GROWTH
  const inducedPopulation = Math.round(totalNewJobs * 2.6 * timeMultiplier);
  const totalPop = baseState.totalPopulation + inducedPopulation;

  // 2. POPULATION + JOBS -> HOUSING PRESSURE & COMMUTE TRIPS
  const housingShortageUnits = Math.max(0, Math.round(inducedPopulation / 4.2 - 2500));
  const newCommuteTrips = Math.round(inducedPopulation * 0.38 + totalNewTrafficHourly);

  // 3. COMMUTE TRIPS + FREIGHT -> TRAFFIC CONGESTION & SPEED
  const trafficImpactRatio = (newCommuteTrips) / 25000;
  const networkCongestionIndex = Math.min(98, Math.max(20, Math.round(baseState.networkCongestionIndex + (trafficImpactRatio * 14))));
  const averageTravelSpeedKmh = Math.max(12, Math.round((baseState.averageTravelSpeedKmh - (trafficImpactRatio * 4.5)) * 10) / 10);

  // 4. TRAFFIC + INDUSTRIAL ACTIVITY -> AIR QUALITY (PM2.5 & NOx)
  const industrialFactor = currentAssets.filter(a => a.category === 'industrial').length * 1.8;
  const trafficPollution = (networkCongestionIndex - 50) * 0.35;
  const greenCoverMitigation = (totalGreenCoverDeltaM2 / 50000) * 2.5;
  const averageAQIPM25 = Math.min(220, Math.max(25, Math.round(baseState.averageAQIPM25 + industrialFactor + trafficPollution - greenCoverMitigation)));

  // 5. POPULATION + INDUSTRY -> WATER & POWER STRESS
  const totalWaterDemandMLD = Math.round(baseState.waterDailyDemandMLD + (totalNewWaterKLD / 1000) + (inducedPopulation * 0.000135));
  const waterStressIndex = Math.min(100, Math.max(15, Math.round((totalWaterDemandMLD / baseState.waterSupplyCapacityMLD) * 75)));

  const totalPowerDemandMW = Math.round(baseState.powerPeakDemandMW + totalNewEnergyMW + (inducedPopulation * 0.00045));

  // 6. POPULATION + POLLUTION -> HEALTHCARE BURDEN
  const totalBedsAvailable = baseState.overallHealthcareCapacityBeds + totalHealthcareBeds;
  const bedsPer1000 = Math.round((totalBedsAvailable / (totalPop / 1000)) * 10) / 10;
  const healthcareCoveragePct = Math.min(99, Math.max(40, Math.round((bedsPer1000 / 3.5) * 85)));

  // 7. GREEN COVER & BUDGET
  const cityGreenCoverPct = Math.min(45, Math.max(10, Math.round((baseState.cityGreenCoverPct + (totalGreenCoverDeltaM2 / 1000000)) * 10) / 10));
  const municipalBudgetRemainingCrore = Math.max(0, baseState.municipalBudgetRemainingCrore - totalCostCrore);

  // Disaster resilience composite
  let disasterResilienceIndex = baseState.disasterResilienceIndex;
  if (waterStressIndex > 80) disasterResilienceIndex -= 6;
  if (networkCongestionIndex > 80) disasterResilienceIndex -= 8;
  if (healthcareCoveragePct > 80) disasterResilienceIndex += 7;
  disasterResilienceIndex = Math.min(98, Math.max(25, Math.round(disasterResilienceIndex)));

  const updatedState: CitySimulationState = {
    ...baseState,
    totalPopulation: totalPop,
    totalJobs: baseState.totalJobs + totalNewJobs,
    averageTravelSpeedKmh,
    networkCongestionIndex,
    overallHealthcareCapacityBeds: totalBedsAvailable,
    healthcareCoveragePct,
    waterDailyDemandMLD: totalWaterDemandMLD,
    waterStressIndex,
    powerPeakDemandMW: totalPowerDemandMW,
    solidWasteTPD: Math.round(baseState.solidWasteTPD + (totalNewWasteTPD) + (inducedPopulation * 0.00045)),
    averageAQIPM25,
    cityGreenCoverPct,
    municipalBudgetRemainingCrore,
    disasterResilienceIndex,
  };

  // Causal Chains for Explainability UI
  const causalEffects: CausalEffect[] = [
    {
      driver: 'Industrial & Infrastructure Investment',
      metric: 'Citywide Employment',
      delta: `+${totalNewJobs.toLocaleString()} jobs`,
      direction: 'UP',
      chain: ['Capital Deployment', 'Industrial SEZ Expansion', 'Direct & Indirect Vendor Employment'],
      explanation: 'Factory and tech cluster expansions directly generate operational workforce jobs and service sector multipliers.',
    },
    {
      driver: 'Job Creation Multiplier',
      metric: 'In-Migration & Population Growth',
      delta: `+${inducedPopulation.toLocaleString()} residents`,
      direction: 'UP',
      chain: ['Jobs Created', 'Inter-district Labor Migration', 'Family Influx', 'Housing Footprint Expansion'],
      explanation: 'Each 1,000 formal technical and industrial jobs attracts ~2,600 indirect residents seeking housing and municipal services.',
    },
    {
      driver: 'Population Growth & Industrial Freight',
      metric: 'Arterial Traffic Congestion',
      delta: `${networkCongestionIndex > baseState.networkCongestionIndex ? '+' : ''}${networkCongestionIndex - baseState.networkCongestionIndex}% index`,
      direction: networkCongestionIndex > baseState.networkCongestionIndex ? 'UP' : 'DOWN',
      chain: ['Population Migration', 'Peak Commute Volume', 'Freight Haulage', 'Corridor Bottle-necking'],
      explanation: 'Vehicle trip generation increases on radial radials (Avinashi & Trichy Roads) without matching mass transit capacity.',
    },
    {
      driver: 'Traffic Queuing & Factory Energy Consumption',
      metric: 'Ambient Air Quality (PM2.5)',
      delta: `${averageAQIPM25 > baseState.averageAQIPM25 ? '+' : ''}${averageAQIPM25 - baseState.averageAQIPM25} AQI`,
      direction: averageAQIPM25 > baseState.averageAQIPM25 ? 'UP' : 'DOWN',
      chain: ['Stop-and-go Traffic', 'Tailpipe Idling', 'Industrial Thermal Boiler Emissions', 'Particulate Dispersion'],
      explanation: 'Slow vehicular speeds and increased industrial diesel generators elevate airborne fine particulates.',
    },
    {
      driver: 'Demographic Expansion & Manufacturing Load',
      metric: 'Municipal Bulk Water Stress',
      delta: `+${totalWaterDemandMLD - baseState.waterDailyDemandMLD} MLD`,
      direction: 'UP',
      chain: ['Household Consumption', 'Industrial Wet-Processing', 'Municipal Reservoir Drawdown', 'Groundwater Depletion'],
      explanation: 'Increased municipal demand tightens the margin of Siruvani and Pillur bulk supply reservoirs.',
    }
  ];

  // Quantitative attribution breakdowns for "WHY?" panels
  const whyCongestion = [
    { reason: 'Industrial Freight & Logistics Haulage', contributionPct: 42 },
    { reason: 'Induced Worker Commuter Peak Trips', contributionPct: 34 },
    { reason: 'Commercial & Retail Customer Movement', contributionPct: 24 },
  ];

  const whyWaterStress = [
    { reason: 'Textile & Manufacturing Wet Processing', contributionPct: 48 },
    { reason: 'New Residential Household Domestic Demand', contributionPct: 36 },
    { reason: 'Distribution Pumping Pipeline Head Losses', contributionPct: 16 },
  ];

  const whyAQI = [
    { reason: 'Tailpipe Emissions from Congested Radial Roads', contributionPct: 52 },
    { reason: 'Industrial Casting & Thermal Boiler Exhaust', contributionPct: 32 },
    { reason: 'Construction Site Dust & Secondary Particulates', contributionPct: 16 },
  ];

  // Update synthetic ward metrics dynamically
  const updatedWards = baseWards.map(w => {
    let popMultiplier = 1.0;
    if (w.zone === 'industrial_tech') popMultiplier = 1.06;
    if (w.zone === 'industrial_heavy') popMultiplier = 1.03;
    if (w.zone === 'residential_dense') popMultiplier = 1.04;

    const newPop = Math.round(w.population * popMultiplier);
    return {
      ...w,
      population: newPop,
      hospitalBedsPer1k: Math.round((totalBedsAvailable / (totalPop / 1000)) * 10) / 10,
      trafficCongestionIndex: Math.min(99, Math.round(w.trafficCongestionIndex + (networkCongestionIndex - baseState.networkCongestionIndex) * 0.7)),
      waterStressIndex: Math.min(100, Math.round(w.waterStressIndex + (waterStressIndex - baseState.waterStressIndex) * 0.8)),
      airQualityIndex: Math.min(200, Math.round(w.airQualityIndex + (averageAQIPM25 - baseState.averageAQIPM25) * 0.7)),
    };
  });

  return {
    updatedState,
    updatedWards,
    causalEffects,
    whyCongestion,
    whyWaterStress,
    whyAQI,
  };
}
