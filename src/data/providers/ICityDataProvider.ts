// Data Provider Interfaces for TN NEXUS Digital Twin
// Designed for plug-and-play abstraction: current SyntheticDataProvider -> future GIS/OSM/Municipal APIs

import { CityAsset, WardMetric, CitySimulationState, ZoneType, WeatherCondition } from '../../types/city';

export interface RoadSegment {
  id: string;
  name: string;
  start: [number, number, number];
  end: [number, number, number];
  lanes: number;
  type: 'radial_highway' | 'arterial' | 'collector' | 'bridge' | 'flyover' | 'railway';
  currentCongestionPct: number;
  speedLimitKmh: number;
}

export interface TerrainPoint {
  x: number;
  z: number;
  elevation: number;
  zone: ZoneType;
  soilMoisture: number;
  isWater: boolean;
}

export interface IRoadNetworkProvider {
  getRoadSegments(): RoadSegment[];
  getIntersections(): [number, number, number][];
  calculateShortestPath(start: [number, number, number], end: [number, number, number]): [number, number, number][];
}

export interface IBuildingDataProvider {
  getInitialAssets(): CityAsset[];
}

export interface IPopulationDataProvider {
  getWards(): WardMetric[];
  getTotalPopulation(): number;
}

export interface IEnvironmentalDataProvider {
  getElevationAt(x: number, z: number): number;
  getWaterBodies(): { id: string; name: string; type: 'river' | 'lake' | 'reservoir'; points: [number, number, number][] }[];
  getBaseAQI(): number;
}

export interface IWeatherDataProvider {
  getCurrentCondition(): WeatherCondition;
  getRainfallIntensityMm(): number;
}

export interface ICityDataProvider {
  readonly providerName: string;
  readonly isSynthetic: boolean;
  roadNetwork: IRoadNetworkProvider;
  buildings: IBuildingDataProvider;
  population: IPopulationDataProvider;
  environment: IEnvironmentalDataProvider;
  weather: IWeatherDataProvider;
  getBaseState(): CitySimulationState;
}
