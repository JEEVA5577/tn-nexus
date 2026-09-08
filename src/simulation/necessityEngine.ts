// Signature Necessity Engine for TN NEXUS
import {
  NecessityAnalysisResult,
  NecessityFactor,
  NecessityVerdict,
  AssetTemplate,
  SiteAnalysis,
  CityAsset
} from '../types/city';
import { evaluateRedundancy } from './redundancyEngine';
import { detectPolicyConflicts } from './conflictEngine';
import { RoadSegment } from '../data/providers/ICityDataProvider';

export function calculateNecessity(
  template: AssetTemplate,
  site: SiteAnalysis,
  allAssets: CityAsset[],
  roadSegments: RoadSegment[],
  selectedSpecialty?: string
): NecessityAnalysisResult {
  const redundancy = evaluateRedundancy(template, site.position, allAssets, selectedSpecialty);
  const conflicts = detectPolicyConflicts(template, site, allAssets);

  // 1. Demand & Catchment Gap Score (0 - 100)
  // Evaluates population size within catchment vs existing capacity
  let demandScore = 70;
  if (site.nearbyPopulation3km > 120000) demandScore += 18;
  else if (site.nearbyPopulation3km > 60000) demandScore += 8;
  else if (site.nearbyPopulation3km < 25000) demandScore -= 15;
  demandScore = Math.max(20, Math.min(98, demandScore));

  // 2. Accessibility & Spatial Coverage Score (0 - 100)
  let accessibilityScore = 65;
  if (site.roadAccessQuality === 'EXCELLENT') accessibilityScore += 25;
  else if (site.roadAccessQuality === 'GOOD') accessibilityScore += 15;
  else if (site.roadAccessQuality === 'FAIR') accessibilityScore += 0;
  else accessibilityScore -= 25; // Poor road access
  accessibilityScore = Math.max(15, Math.min(98, accessibilityScore));

  // 3. Specialty Differentiation Score (0 - 100)
  let specialtyDifferentiationScore = 75;
  let specialtyInsight = '';
  if (template.category === 'healthcare') {
    if (redundancy.unmetSpecialtyIdentified) {
      specialtyDifferentiationScore = 94;
      specialtyInsight = `High Specialty Differentiation: Catchment has general/ENT facilities, but acute unserved demand for ${selectedSpecialty || template.name}.`;
    } else if (redundancy.isRedundant) {
      specialtyDifferentiationScore = 32;
      specialtyInsight = `Duplicate Specialty: Existing facilities within 3km already deliver identical ${selectedSpecialty || template.name} services with surplus bed margins.`;
    } else {
      specialtyDifferentiationScore = 78;
      specialtyInsight = `Balanced Specialty: Complements regional public health infrastructure.`;
    }
  } else {
    specialtyDifferentiationScore = Math.round(redundancy.incrementalPublicValuePct * 0.9);
    specialtyInsight = redundancy.explanation;
  }

  // 4. Infrastructure Readiness Score (0 - 100)
  let infrastructureReadinessScore = 70;
  if (site.powerAccessReadiness === 'SURPLUS') infrastructureReadinessScore += 10;
  else if (site.powerAccessReadiness === 'CONSTRAINED') infrastructureReadinessScore -= 20;

  if (site.waterAccessReadiness === 'IMMEDIATE') infrastructureReadinessScore += 10;
  else if (site.waterAccessReadiness === 'DEFICIENT') infrastructureReadinessScore -= 25;

  if (site.sewerAccessReadiness === 'AVAILABLE') infrastructureReadinessScore += 8;
  else if (site.sewerAccessReadiness === 'UNSERVICED') infrastructureReadinessScore -= 12;
  infrastructureReadinessScore = Math.max(20, Math.min(98, infrastructureReadinessScore));

  // 5. Environmental & Land Compatibility Score (0 - 100)
  let environmentalScore = 80;
  if (site.agriculturalImpact === 'SEVERE_LOSS') environmentalScore -= 38;
  else if (site.agriculturalImpact === 'MODERATE') environmentalScore -= 20;

  if (site.environmentalSensitivity === 'CRITICAL') environmentalScore -= 35;
  else if (site.environmentalSensitivity === 'HIGH') environmentalScore -= 18;
  environmentalScore = Math.max(10, Math.min(95, environmentalScore));

  // 6. Disaster Resilience Score (0 - 100)
  let resilienceScore = 85;
  if (site.floodRiskLevel === 'EXTREME') resilienceScore -= 45;
  else if (site.floodRiskLevel === 'HIGH') resilienceScore -= 25;
  else if (site.floodRiskLevel === 'MODERATE') resilienceScore -= 10;
  resilienceScore = Math.max(15, Math.min(98, resilienceScore));

  // 7. Cost Effectiveness Proxy (0 - 100)
  // Ratio of capacity served & jobs created to base cost
  const publicBenefitProxy = (template.defaultCapacity * 0.4) + (template.baseJobs * 1.2);
  const costRatio = publicBenefitProxy / (template.baseCostCrore || 1);
  let costEffectivenessScore = Math.min(95, Math.max(30, Math.round(costRatio * 18)));

  // Critical Conflicts Penalty
  const criticalConflictCount = conflicts.filter(c => c.severity === 'CRITICAL').length;
  const conflictPenalty = criticalConflictCount * 14;

  // Composite Weighted Score
  const rawScore =
    (demandScore * 0.22) +
    (accessibilityScore * 0.16) +
    (specialtyDifferentiationScore * 0.18) +
    (infrastructureReadinessScore * 0.14) +
    (environmentalScore * 0.12) +
    (resilienceScore * 0.10) +
    (costEffectivenessScore * 0.08) -
    (redundancy.redundancyPenalty * 0.3) -
    conflictPenalty;

  const overallScore = Math.max(15, Math.min(98, Math.round(rawScore)));

  // Verdict Determination
  let verdict: NecessityVerdict = 'JUSTIFIED';
  let verdictDescription = '';

  if (overallScore >= 80) {
    verdict = 'STRONGLY JUSTIFIED';
    verdictDescription = 'Compelling public necessity with high underserved demand, infrastructure alignment, and minimal environmental externalities.';
  } else if (overallScore >= 65) {
    verdict = 'JUSTIFIED';
    verdictDescription = 'Viable municipal proposal demonstrating positive net public value. Feasible to advance to detailed engineering.';
  } else if (overallScore >= 50) {
    verdict = 'JUSTIFIED WITH MODIFICATIONS';
    verdictDescription = 'Demonstrates genuine public need, but requires specific mitigations (site realignment, utility augmentation, or green buffering) before statutory sign-off.';
  } else if (overallScore >= 35) {
    verdict = 'LOW PRIORITY';
    verdictDescription = 'Marginal public necessity under current demographic growth. Alternative civic investments yield superior return on public capital.';
  } else {
    verdict = 'NOT CURRENTLY JUSTIFIED';
    verdictDescription = 'Substantial redundancy or severe environmental/infrastructure conflicts. Unviable under current spatial configuration.';
  }

  // Factor breakdowns for transparency
  const factors: NecessityFactor[] = [
    {
      id: 'f_demand',
      name: 'Catchment Demand & Population Need',
      score: demandScore,
      weight: 0.22,
      impact: demandScore >= 70 ? 'POSITIVE' : 'NEUTRAL',
      summary: `${site.nearbyPopulation3km.toLocaleString()} residents within 3km catchment zone.`,
      details: `Projected 5-year ward growth indicates escalating demand for ${template.category} services.`,
    },
    {
      id: 'f_specialty',
      name: 'Specialty Differentiation & Service Gap',
      score: specialtyDifferentiationScore,
      weight: 0.18,
      impact: specialtyDifferentiationScore >= 75 ? 'POSITIVE' : 'NEGATIVE',
      summary: specialtyInsight,
      details: `Evaluated against ${redundancy.nearbyCount} adjacent facilities to prevent wasteful duplication.`,
    },
    {
      id: 'f_access',
      name: 'Transportation & Emergency Accessibility',
      score: accessibilityScore,
      weight: 0.16,
      impact: accessibilityScore >= 70 ? 'POSITIVE' : 'NEGATIVE',
      summary: `Road quality: ${site.roadAccessQuality} (${site.distanceToNearestRoad}m to nearest arterial).`,
      details: site.roadAccessQuality === 'POOR'
        ? 'Narrow feeder access poses severe bottlenecks for emergency or delivery logistics.'
        : 'Smooth arterial connectivity facilitates rapid golden-hour transit and commuter flow.',
    },
    {
      id: 'f_infra',
      name: 'Infrastructure & Utility Readiness',
      score: infrastructureReadinessScore,
      weight: 0.14,
      impact: infrastructureReadinessScore >= 70 ? 'POSITIVE' : 'NEUTRAL',
      summary: `Power: ${site.powerAccessReadiness}, Water: ${site.waterAccessReadiness}, Sewer: ${site.sewerAccessReadiness}.`,
      details: 'Evaluates distance to high-tension lines, municipal bulk mains, and stormwater trunk lines.',
    },
    {
      id: 'f_environment',
      name: 'Environmental & Agricultural Preservation',
      score: environmentalScore,
      weight: 0.12,
      impact: environmentalScore >= 70 ? 'POSITIVE' : 'NEGATIVE',
      summary: `Agri Impact: ${site.agriculturalImpact}, Sensitivity: ${site.environmentalSensitivity}.`,
      details: site.agriculturalImpact !== 'ZERO'
        ? 'Construction infringes upon fertile soil acreage or wetland drainage catchment.'
        : 'Site maintains statutory setbacks from water bodies and protected green belts.',
    },
    {
      id: 'f_resilience',
      name: 'Disaster Exposure & Climate Resilience',
      score: resilienceScore,
      weight: 0.10,
      impact: resilienceScore >= 70 ? 'POSITIVE' : 'NEGATIVE',
      summary: `Flood risk: ${site.floodRiskLevel} (Ground elevation: ${site.elevation}m).`,
      details: site.floodRiskLevel === 'HIGH' || site.floodRiskLevel === 'EXTREME'
        ? 'Low elevation exposes facility to monsoon inundation and structural backwater pooling.'
        : 'Elevated contours provide natural storm drainage and flood resilience.',
    },
    {
      id: 'f_cost',
      name: 'Demonstration Cost-Effectiveness Proxy',
      score: costEffectivenessScore,
      weight: 0.08,
      impact: 'NEUTRAL',
      summary: `₹${template.baseCostCrore} Cr estimated cost vs ~${template.baseJobs} jobs & ${template.defaultCapacity} ${template.defaultCapacityUnit}.`,
      details: 'Illustrative proxy measuring public utility units generated per Crore of capital expenditure.',
    },
  ];

  // Actionable recommendations
  const recommendedActions: string[] = [];
  if (redundancy.isRedundant) {
    recommendedActions.push('Pivot specialty focus to unserved specialty clusters (e.g. Trauma/Geriatrics) to avoid duplication.');
  }
  if (site.floodRiskLevel === 'HIGH' || site.floodRiskLevel === 'EXTREME') {
    recommendedActions.push('Elevate structural plinth by 2.2m and install on-site retention swales to mitigate flood exposure.');
  }
  if (site.agriculturalImpact !== 'ZERO') {
    recommendedActions.push('Shift footprint onto adjacent non-cultivable parcel to preserve productive agricultural land.');
  }
  if (site.roadAccessQuality === 'FAIR' || site.roadAccessQuality === 'POOR') {
    recommendedActions.push('Package construction with a municipal widening tender for a 4-lane access spur.');
  }

  return {
    overallScore,
    verdict,
    verdictDescription,
    demandScore,
    accessibilityScore,
    capacityGapScore: 100 - redundancy.redundancyPenalty,
    specialtyDifferentiationScore,
    infrastructureReadinessScore,
    costEffectivenessScore,
    redundancyPenalty: redundancy.redundancyPenalty,
    resilienceScore,
    environmentalScore,
    factors,
    redundancyWarning: redundancy.isRedundant ? redundancy.explanation : undefined,
    specialtyInsight,
    conflicts,
    recommendedActions,
  };
}
