// Site Suitability Analysis Engine for TN NEXUS
import { SiteAnalysis, ZoneType, CityAsset } from '../types/city';
import { RoadSegment } from '../data/providers/ICityDataProvider';

export function analyzeSite(
  position: [number, number, number],
  allAssets: CityAsset[],
  roadSegments: RoadSegment[],
  proposedType?: string
): SiteAnalysis {
  const [x, , z] = position;

  // 1. Topography & Elevation
  const westHills = Math.max(0, (-x - 150) * 0.12);
  const riverDist = Math.abs(z - (-40 + Math.sin(x * 0.01) * 30));
  const riverTrough = riverDist < 40 ? -Math.cos((riverDist / 40) * Math.PI * 0.5) * 6 : 0;
  const elevation = Math.max(0.5, westHills + riverTrough + Math.sin(x * 0.02) * Math.cos(z * 0.02) * 2 + 1);

  // Slope calculation via gradient sampling
  const elevDx = Math.max(0, (-(x + 5) - 150) * 0.12) - Math.max(0, (-(x - 5) - 150) * 0.12);
  const slope = Math.min(15, Math.abs(elevDx) * 10);

  // 2. Zone & Land Type Determination
  let zoneType: ZoneType = 'residential_suburban';
  let landType = 'Urban Infill Brownfield';

  const distToCenter = Math.hypot(x, z);
  if (riverDist < 25) {
    zoneType = 'water_body';
    landType = 'Riparian Basin & Floodway';
  } else if (Math.hypot(x - 160, z - 180) < 55 || Math.hypot(x - (-90), z - 110) < 50) {
    zoneType = 'green_conservation';
    landType = 'Wetland Lakefront Ecological Buffer';
  } else if (distToCenter < 120) {
    zoneType = 'urban_core';
    landType = 'Dense Urban Commercial / Mixed Land';
  } else if (x > 140 && z < -140) {
    zoneType = 'industrial_tech';
    landType = 'IT Corridor Commercial Freehold';
  } else if (x > 120 && z > 20) {
    zoneType = 'industrial_heavy';
    landType = 'Manufacturing Industrial Estate Land';
  } else if (x < -180) {
    zoneType = 'agricultural';
    landType = 'Prime Irrigated Farmland (Coconut / Cotton)';
  } else if (z > 220) {
    zoneType = 'residential_dense';
    landType = 'Southern Dense Residential Grid';
  }

  // 3. Flood Risk Assessment
  let floodRiskLevel: SiteAnalysis['floodRiskLevel'] = 'LOW';
  if (riverDist < 35 || Math.hypot(x - 160, z - 180) < 65) {
    floodRiskLevel = elevation < 2.5 ? 'EXTREME' : 'HIGH';
  } else if (elevation < 2.0) {
    floodRiskLevel = 'MODERATE';
  } else if (elevation > 8.0) {
    floodRiskLevel = 'NONE';
  }

  // 4. Road Proximity & Quality
  let minRoadDist = Infinity;
  let nearestRoadLanes = 2;
  for (const r of roadSegments) {
    // Distance to line segment
    const sx = r.start[0], sz = r.start[2];
    const ex = r.end[0], ez = r.end[2];
    const dx = ex - sx, dz = ez - sz;
    const lenSq = dx * dx + dz * dz;
    const t = Math.max(0, Math.min(1, ((x - sx) * dx + (z - sz) * dz) / (lenSq || 1)));
    const projX = sx + t * dx;
    const projZ = sz + t * dz;
    const dist = Math.hypot(x - projX, z - projZ);
    if (dist < minRoadDist) {
      minRoadDist = dist;
      nearestRoadLanes = r.lanes;
    }
  }

  let roadAccessQuality: SiteAnalysis['roadAccessQuality'] = 'POOR';
  if (minRoadDist < 35 && nearestRoadLanes >= 4) roadAccessQuality = 'EXCELLENT';
  else if (minRoadDist < 60) roadAccessQuality = 'GOOD';
  else if (minRoadDist < 120) roadAccessQuality = 'FAIR';

  // 5. Utility Readiness
  const waterAccessReadiness: SiteAnalysis['waterAccessReadiness'] =
    x < -250 || distToCenter < 160 ? 'IMMEDIATE' : distToCenter < 350 ? 'NEEDS_EXTENSION' : 'DEFICIENT';

  const powerAccessReadiness: SiteAnalysis['powerAccessReadiness'] =
    zoneType === 'industrial_heavy' || distToCenter < 180 ? 'SURPLUS' : 'ADEQUATE';

  const sewerAccessReadiness: SiteAnalysis['sewerAccessReadiness'] =
    distToCenter < 150 ? 'AVAILABLE' : distToCenter < 320 ? 'PARTIAL' : 'UNSERVICED';

  // 6. Population Catchment
  let nearbyPop1km = 0;
  let nearbyPop3km = 0;
  for (const a of allAssets) {
    const d = Math.hypot(x - a.position[0], z - a.position[2]);
    if (d <= 50) nearbyPop1km += a.populationServed * 0.15;
    if (d <= 150) nearbyPop3km += a.populationServed * 0.45;
  }
  nearbyPop1km = Math.max(12000, Math.round(nearbyPop1km));
  nearbyPop3km = Math.max(45000, Math.round(nearbyPop3km));

  // 7. Distance to Similar Facility
  let distanceToSimilarFacility = 9999;
  if (proposedType) {
    const isHospital = proposedType.includes('hospital') || proposedType.includes('health');
    const isSchool = proposedType.includes('school') || proposedType.includes('university');
    const isIndustrial = proposedType.includes('textile') || proposedType.includes('industrial') || proposedType.includes('tech');

    for (const a of allAssets) {
      const match =
        a.type === proposedType ||
        (isHospital && (a.category === 'healthcare')) ||
        (isSchool && (a.category === 'education')) ||
        (isIndustrial && (a.category === 'industrial'));

      if (match) {
        const d = Math.hypot(x - a.position[0], z - a.position[2]);
        if (d < distanceToSimilarFacility) {
          distanceToSimilarFacility = Math.round(d);
        }
      }
    }
  }

  // 8. Environmental & Agricultural Impact
  let environmentalSensitivity: SiteAnalysis['environmentalSensitivity'] = 'LOW';
  if (riverDist < 40 || zoneType === 'green_conservation') {
    environmentalSensitivity = 'CRITICAL';
  } else if (distToCenter > 350 || zoneType === 'water_body') {
    environmentalSensitivity = 'HIGH';
  } else if (distToCenter > 200) {
    environmentalSensitivity = 'MODERATE';
  }

  let agriculturalImpact: SiteAnalysis['agriculturalImpact'] = 'ZERO';
  if (zoneType === 'agricultural') {
    agriculturalImpact = x < -250 ? 'SEVERE_LOSS' : 'MODERATE';
  } else if (zoneType === 'residential_suburban' && x < -100) {
    agriculturalImpact = 'MARGINAL';
  }

  return {
    position: [Math.round(x), Math.round(elevation), Math.round(z)],
    elevation: Math.round(elevation * 10) / 10,
    slope: Math.round(slope * 10) / 10,
    landType,
    zoneType,
    floodRiskLevel,
    roadAccessQuality,
    distanceToNearestRoad: Math.round(minRoadDist),
    waterAccessReadiness,
    powerAccessReadiness,
    sewerAccessReadiness,
    nearbyPopulation1km: nearbyPop1km,
    nearbyPopulation3km: nearbyPop3km,
    distanceToSimilarFacility: distanceToSimilarFacility === 9999 ? 4200 : distanceToSimilarFacility,
    environmentalSensitivity,
    agriculturalImpact,
  };
}
