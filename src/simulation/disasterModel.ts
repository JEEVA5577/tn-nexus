// Disaster Simulation & Climate Stress Engine for TN NEXUS
import { DisasterType, CitySimulationState } from '../types/city';
import { RoadSegment } from '../data/providers/ICityDataProvider';

export interface DisasterImpactSummary {
  disasterType: DisasterType;
  floodWaterLevelMeters: number;
  inundatedRoadCount: number;
  blockedRoadIds: string[];
  isolatedFacilitiesCount: number;
  emergencyResponseDelayPct: number;
  affectedPopulationEstimate: number;
  resilienceScore: number;
  mitigationRecommendations: string[];
}

export function simulateDisaster(
  type: DisasterType,
  intensity: number = 1.0, // 0 to 2.0 (e.g. 2x rainfall)
  baseState: CitySimulationState,
  roadSegments: RoadSegment[]
): DisasterImpactSummary {
  if (type === 'NONE') {
    return {
      disasterType: 'NONE',
      floodWaterLevelMeters: 0,
      inundatedRoadCount: 0,
      blockedRoadIds: [],
      isolatedFacilitiesCount: 0,
      emergencyResponseDelayPct: 0,
      affectedPopulationEstimate: 0,
      resilienceScore: baseState.disasterResilienceIndex,
      mitigationRecommendations: [],
    };
  }

  let waterLevel = 0;
  let blockedRoads: string[] = [];
  let responseDelay = 0;
  let affectedPop = 0;
  let resilienceScore = baseState.disasterResilienceIndex;
  const recommendations: string[] = [];

  switch (type) {
    case 'FLOOD':
    case 'EXTREME_RAINFALL': {
      // Water level rise in Noyyal basin and lake catchments
      waterLevel = (type === 'EXTREME_RAINFALL' ? 2.8 : 3.6) * intensity;
      // Roads with elevation < waterLevel or bridge causeways are inundated
      blockedRoads = roadSegments
        .filter(r => r.type === 'bridge' || r.start[1] <= 2.0 || r.id === 'rd_noyyal_bridge')
        .map(r => r.id);

      responseDelay = Math.round(35 * intensity);
      affectedPop = Math.round(45000 * intensity);
      resilienceScore = Math.max(30, Math.round(resilienceScore - (25 * intensity)));

      recommendations.push(
        'Open flood sluice gates along Noyyal river check dams to accelerate gravity drainage.',
        'Activate high-capacity dewatering pump sets at Singanallur lake underpass corridor.',
        'Reroute emergency ambulances via elevated Gandhipuram flyover and northern ring road.'
      );
      break;
    }

    case 'CYCLONE': {
      waterLevel = 1.5 * intensity;
      blockedRoads = ['rd_avinashi_1', 'rd_trichy_1']; // tree falls and power disruptions
      responseDelay = Math.round(45 * intensity);
      affectedPop = Math.round(85000 * intensity);
      resilienceScore = Math.max(28, Math.round(resilienceScore - (28 * intensity)));

      recommendations.push(
        'Deploy State Disaster Response Force (SDRF) rapid tree clearance teams along Avinashi arterial.',
        'Isolate overhead medium-voltage distribution lines and switch critical hospitals to backup microgrids.',
        'Open designated cyclone relief shelters in western educational institutions.'
      );
      break;
    }

    case 'HEAT_WAVE': {
      waterLevel = 0;
      blockedRoads = [];
      responseDelay = 15;
      affectedPop = 140000;
      resilienceScore = Math.max(45, Math.round(resilienceScore - 15));

      recommendations.push(
        'Deploy mobile drinking water kiosks (Aavin / Corporation booths) in high-density wards.',
        'Activate urban misting systems and shade awnings across bus terminus plazas.',
        'Pre-alert tertiary hospitals for heat exhaustion and dehydration admissions.'
      );
      break;
    }

    case 'TRAFFIC_GRIDLOCK': {
      waterLevel = 0;
      blockedRoads = ['rd_avinashi_1', 'rd_trichy_1', 'rd_mtp_1'];
      responseDelay = 80;
      affectedPop = 220000;
      resilienceScore = Math.max(35, Math.round(resilienceScore - 30));

      recommendations.push(
        'Override traffic signal phases with dynamic adaptive green corridors for emergency vehicles.',
        'Implement temporary one-way circulating flow around Gandhipuram core.',
        'Deploy corporation traffic wardens at key railway level crossings.'
      );
      break;
    }
  }

  return {
    disasterType: type,
    floodWaterLevelMeters: Math.round(waterLevel * 10) / 10,
    inundatedRoadCount: blockedRoads.length,
    blockedRoadIds: blockedRoads,
    isolatedFacilitiesCount: Math.round(blockedRoads.length * 1.8),
    emergencyResponseDelayPct: responseDelay,
    affectedPopulationEstimate: affectedPop,
    resilienceScore,
    mitigationRecommendations: recommendations,
  };
}
