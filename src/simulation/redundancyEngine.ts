// Redundancy & Specialty Differentiation Engine for TN NEXUS
import { CityAsset, AssetTemplate } from '../types/city';

export interface RedundancyEvaluation {
  isRedundant: boolean;
  redundancyPenalty: number; // 0 to 45
  incrementalPublicValuePct: number; // 0 to 100%
  nearbyCount: number;
  unmetSpecialtyIdentified: boolean;
  specialtyMatchRatio: number; // 0 (completely different) to 1.0 (exact duplicate)
  explanation: string;
  nearbyFacilities: { name: string; distance: number; specialty?: string; capacity: number; utilizationPct: number }[];
}

export function evaluateRedundancy(
  template: AssetTemplate,
  targetPosition: [number, number, number],
  allAssets: CityAsset[],
  selectedSpecialty?: string
): RedundancyEvaluation {
  const [tx, , tz] = targetPosition;
  const radius = template.serviceRadius * 0.04; // scale to sim coordinate units (~160 units)

  const nearby: { name: string; distance: number; specialty?: string; capacity: number; utilizationPct: number }[] = [];

  let duplicateSpecialtyCount = 0;
  let sameCategoryCount = 0;
  let totalNearbyCapacity = 0;
  let avgUtilization = 0;

  for (const asset of allAssets) {
    if (asset.category !== template.category) continue;

    const d = Math.hypot(tx - asset.position[0], tz - asset.position[2]);
    if (d <= radius) {
      sameCategoryCount++;
      totalNearbyCapacity += asset.capacity;
      avgUtilization += asset.currentUtilizationPct;

      nearby.push({
        name: asset.name,
        distance: Math.round(d * 25), // convert back to approx meters
        specialty: asset.specialty,
        capacity: asset.capacity,
        utilizationPct: asset.currentUtilizationPct,
      });

      // Specialty differentiation check
      if (selectedSpecialty && asset.specialty) {
        if (asset.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())) {
          duplicateSpecialtyCount++;
        }
      } else if (asset.type === template.type) {
        duplicateSpecialtyCount++;
      }
    }
  }

  if (sameCategoryCount > 0) {
    avgUtilization /= sameCategoryCount;
  }

  // Facility Specialization Logic:
  // e.g., Existing ENT Hospital, Proposed Orthopaedic Hospital
  const specialty = selectedSpecialty || (template.defaultSpecialties ? template.defaultSpecialties[0] : undefined);
  const isHealthcare = template.category === 'healthcare';

  let unmetSpecialtyIdentified = false;
  let specialtyMatchRatio = 0;

  if (isHealthcare) {
    if (duplicateSpecialtyCount === 0 && sameCategoryCount > 0) {
      // Different specialty from nearby facilities! Unmet need filled!
      unmetSpecialtyIdentified = true;
      specialtyMatchRatio = 0.2;
    } else if (duplicateSpecialtyCount > 0) {
      specialtyMatchRatio = 0.9;
    }
  } else {
    specialtyMatchRatio = duplicateSpecialtyCount > 0 ? 0.85 : 0.4;
  }

  // Calculate incremental public value
  let incrementalPublicValuePct = 100;
  let redundancyPenalty = 0;
  let explanation = '';

  if (sameCategoryCount === 0) {
    incrementalPublicValuePct = 100;
    redundancyPenalty = 0;
    explanation = `Zero existing ${template.category} facilities within ${Math.round(radius * 25)}m catchment. Maximum incremental public benefit.`;
  } else if (unmetSpecialtyIdentified) {
    incrementalPublicValuePct = 88;
    redundancyPenalty = 4; // Minimal penalty because of critical specialty differentiation!
    explanation = `While ${sameCategoryCount} healthcare facility exists nearby (${nearby[0]?.name}), it focuses on ${nearby[0]?.specialty || 'other services'}. Proposed ${specialty || 'specialty'} fills an unserved clinical gap.`;
  } else if (duplicateSpecialtyCount > 0) {
    // Duplicate specialty exists in catchment!
    redundancyPenalty = Math.min(45, 22 * duplicateSpecialtyCount);
    incrementalPublicValuePct = Math.max(15, 100 - redundancyPenalty * 2);
    explanation = `Potential Redundancy Detected: ${duplicateSpecialtyCount} facility already serves ${specialty || template.name} within catchment. Existing capacity appears sufficient under current demonstration assumptions.`;
  } else {
    redundancyPenalty = 12;
    incrementalPublicValuePct = 65;
    explanation = `${sameCategoryCount} general ${template.category} facilities within service zone. Moderate incremental public value generated.`;
  }

  return {
    isRedundant: redundancyPenalty >= 20,
    redundancyPenalty,
    incrementalPublicValuePct,
    nearbyCount: sameCategoryCount,
    unmetSpecialtyIdentified,
    specialtyMatchRatio,
    explanation,
    nearbyFacilities: nearby.sort((a, b) => a.distance - b.distance),
  };
}
