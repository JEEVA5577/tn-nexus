// Policy Conflict Detection Engine for TN NEXUS
import { PolicyConflict, AssetTemplate, SiteAnalysis, CityAsset } from '../types/city';

export function detectPolicyConflicts(
  template: AssetTemplate,
  site: SiteAnalysis,
  _allAssets: CityAsset[]
): PolicyConflict[] {
  const conflicts: PolicyConflict[] = [];

  // 1. Farmland vs Linear Highway / Industry Conflict
  if (site.zoneType === 'agricultural' && (template.category === 'transport' || template.category === 'industrial')) {
    conflicts.push({
      id: 'conflict_agri_severance',
      title: 'Agricultural Land Severance & Topsoil Loss',
      severity: 'CRITICAL',
      reason: `Proposed ${template.name} traverses classified fertile agricultural zone (Thondamuthur / Western cotton & coconut belt).`,
      consequences: 'Irreversible loss of high-yield cultivable soil, disruption of natural irrigation canal feeders, and farm parcel fragmentation.',
      suggestedAlternative: 'Shift alignment along degraded scrub boundary or elevate section on viaduct piers with minimal ground footprint.',
    });
  }

  // 2. High Flood Vulnerability Conflict (Housing, Hospital, School)
  if ((site.floodRiskLevel === 'HIGH' || site.floodRiskLevel === 'EXTREME') &&
      (template.category === 'healthcare' || template.category === 'residential' || template.category === 'education')) {
    conflicts.push({
      id: 'conflict_flood_inundation',
      title: 'Critical Infrastructure Flood Inundation Vulnerability',
      severity: 'CRITICAL',
      reason: `Site sits in lowland depression / Noyyal basin flood zone at ${site.elevation}m elevation.`,
      consequences: 'High risk of emergency isolation during monsoon inundation, basement generator submersion, and evacuation gridlock.',
      suggestedAlternative: 'Relocate to higher ground (+3.5m contour) or incorporate 2.5m raised plinth foundation with sponge wetland retention ponds.',
    });
  }

  // 3. Heavy Industry Proximity to Residential / Water Body
  if (template.category === 'industrial' && (site.zoneType === 'residential_dense' || site.environmentalSensitivity === 'CRITICAL')) {
    conflicts.push({
      id: 'conflict_industrial_proximity',
      title: 'Industrial Buffer & Environmental Encroachment Conflict',
      severity: 'CRITICAL',
      reason: 'Heavy industrial manufacturing or logistics situated immediately adjacent to dense residential clusters or protected wetland buffers.',
      consequences: 'Degradation of ambient air quality (particulate PM2.5/PM10 spikes), heavy vehicle street conflict, and effluent contamination risk.',
      suggestedAlternative: 'Designate a mandatory 250m green eco-buffer strip or relocate to the notified Peelamedu or SIDCO industrial estates.',
    });
  }

  // 4. Hospital with Inadequate Road Access
  if (template.category === 'healthcare' && (site.roadAccessQuality === 'POOR' || site.roadAccessQuality === 'FAIR')) {
    conflicts.push({
      id: 'conflict_hospital_emergency_access',
      title: 'Sub-standard Emergency Ambulance Arterial Access',
      severity: 'WARNING',
      reason: `Distance to nearest 4-lane arterial road is ${site.distanceToNearestRoad}m, currently reliant on narrow 2-lane local streets.`,
      consequences: 'Critical 4 to 8-minute delay in golden-hour trauma response; bottlenecking during emergency peak admissions.',
      suggestedAlternative: 'Couple hospital approval with municipal widening of the approach feeder road to a 4-lane segregated ambulance corridor.',
    });
  }

  // 5. Protected Green Zone Encroachment
  if (site.zoneType === 'green_conservation' && template.category !== 'recreation') {
    conflicts.push({
      id: 'conflict_wetland_encroachment',
      title: 'Wetland Ecological Buffer Zone Encroachment',
      severity: 'CRITICAL',
      reason: 'Construction proposed within statutory lake catchment conservation boundary (Valankulam / Singanallur lake basin).',
      consequences: 'Reduction in storm runoff absorption capacity, increased urban heat island effect, and disruption of wetland avian ecology.',
      suggestedAlternative: 'Maintain a minimum 150m setback boundary from full tank level (FTL) and limit construction to eco-permeable recreational boardwalks.',
    });
  }

  // 6. High Traffic Generator on Constrained Network
  if (template.baseTrafficHourly > 400 && site.roadAccessQuality === 'FAIR') {
    conflicts.push({
      id: 'conflict_traffic_saturation',
      title: 'Local Road Network Capacity Saturation',
      severity: 'WARNING',
      reason: `Proposed facility generates ~${template.baseTrafficHourly} vehicle trips/hour on a collector road operating near design capacity.`,
      consequences: 'Localized intersection Level-of-Service degradation from LoS C to LoS E/F; spillover queuing into neighborhood streets.',
      suggestedAlternative: 'Incorporate dedicated public feeder transit bays and a mandatory Traffic Impact Assessment (TIA) junction redesign.',
    });
  }

  // 7. Water Stress Conflict for High Consumption Utility / Industry
  if ((template.baseWaterKLD > 200 || template.type === 'textile_machinery_park') && site.waterAccessReadiness === 'DEFICIENT') {
    conflicts.push({
      id: 'conflict_water_supply_deficit',
      title: 'Severe Municipal Water Grid Deficit',
      severity: 'WARNING',
      reason: `Asset demands ${template.baseWaterKLD} KLD in a zone with limited piped bulk supply infrastructure.`,
      consequences: 'Over-extraction of deep groundwater aquifers and potential depletion of neighborhood municipal pressure.',
      suggestedAlternative: 'Mandate zero-liquid-discharge (ZLD) on-site water recycling (STP) and dual rainwater recharge harvesting tanks.',
    });
  }

  return conflicts;
}
