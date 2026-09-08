// Highway & Arterial Road Necessity Engine for TN NEXUS
import { RoadNecessityResult, NecessityVerdict, SiteAnalysis, AssetTemplate } from '../types/city';
import { RoadSegment } from '../data/providers/ICityDataProvider';

export function evaluateRoadNecessity(
  template: AssetTemplate,
  site: SiteAnalysis,
  roadSegments: RoadSegment[]
): RoadNecessityResult {
  // Aggregate network congestion
  const avgCongestion = roadSegments.reduce((sum, r) => sum + r.currentCongestionPct, 0) / (roadSegments.length || 1);

  // Origin-Destination pressure relief calculation based on location
  const isRadialCorridor = site.zoneType === 'transport_corridor' || site.zoneType === 'industrial_heavy';
  const odPressureReliefPct = isRadialCorridor ? Math.min(38, Math.round(avgCongestion * 0.42)) : 16;
  const travelTimeReductionMins = isRadialCorridor ? 18.5 : 7.0;
  const freightThroughputBoostPct = template.type === 'radial_expressway' ? 44 : 22;

  // Land impact calculation
  const isAgri = site.zoneType === 'agricultural' || site.agriculturalImpact !== 'ZERO';
  const landAcquisitionHectares = template.type === 'radial_expressway' ? 52.4 : 18.0;
  const agriculturalLossHectares = isAgri ? (template.type === 'radial_expressway' ? 38.2 : 12.5) : 0;
  const bridgeRequirement = site.zoneType === 'water_body' || site.floodRiskLevel === 'HIGH' || site.floodRiskLevel === 'EXTREME';

  // Calculate composite Road Necessity Score (0-100)
  let baseScore = 75;

  // Boost for high congestion relief
  if (avgCongestion > 65) baseScore += 12;
  if (isRadialCorridor) baseScore += 8;

  // Penalties for agricultural loss or high flood risks
  if (agriculturalLossHectares > 20) baseScore -= 18;
  if (site.floodRiskLevel === 'HIGH' || site.floodRiskLevel === 'EXTREME') baseScore -= 12;
  if (bridgeRequirement) baseScore -= 5; // Engineering complexity

  const score = Math.max(25, Math.min(95, Math.round(baseScore)));

  let verdict: NecessityVerdict = 'JUSTIFIED';
  if (score >= 80) verdict = 'STRONGLY JUSTIFIED';
  else if (score >= 65) verdict = 'JUSTIFIED';
  else if (score >= 50) verdict = 'JUSTIFIED WITH MODIFICATIONS';
  else if (score >= 35) verdict = 'LOW PRIORITY';
  else verdict = 'NOT CURRENTLY JUSTIFIED';

  // Multi-modal Alternative Analysis
  const alternativeOptions = [
    {
      name: 'Option A: New Green-field Expressway',
      description: 'Original proposal: 6-lane surface expressway with extensive land acquisition.',
      score: score,
      costCrore: template.baseCostCrore,
      recommended: false,
    },
    {
      name: 'Option B: Existing Arterial Widening + Flyover Nodes',
      description: 'Upgrade existing road corridor with targeted grade-separators at high-friction junctions.',
      score: score + 6,
      costCrore: Math.round(template.baseCostCrore * 0.45),
      recommended: false,
    },
    {
      name: 'Option C: Dedicated Bus Rapid Transit (BRT) Corridor',
      description: 'Segregated median electric bus transit lanes moving 18,000 passengers/hour with minimal land take.',
      score: score + 11,
      costCrore: Math.round(template.baseCostCrore * 0.38),
      recommended: false,
    },
    {
      name: 'Option D: Optimized Smart Bypass + Multi-Modal Buffer (Recommended)',
      description: 'Shift alignment by 450m avoiding prime agricultural acreage, add 2 transit express bus bays, culvert storm drains, and native green sound barrier.',
      score: Math.min(96, score + 18),
      costCrore: Math.round(template.baseCostCrore * 0.85),
      recommended: true,
    },
  ];

  return {
    score,
    verdict,
    odPressureReliefPct,
    travelTimeReductionMins,
    freightThroughputBoostPct,
    landAcquisitionHectares,
    agriculturalLossHectares,
    bridgeRequirement,
    alternativeOptions,
  };
}
