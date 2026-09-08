// Synthetic Data Provider for Coimbatore Digital Twin - Demo
import {
  ICityDataProvider,
  IRoadNetworkProvider,
  IBuildingDataProvider,
  IPopulationDataProvider,
  IEnvironmentalDataProvider,
  IWeatherDataProvider,
  RoadSegment
} from './ICityDataProvider';
import { CityAsset, WardMetric, CitySimulationState, ZoneType, WeatherCondition } from '../../types/city';

// Seeded pseudo-random generator for deterministic consistency
class SeededRandom {
  private s: number;
  constructor(seed: number = 42) {
    this.s = seed % 2147483647;
    if (this.s <= 0) this.s += 2147483646;
  }
  next(): number {
    this.s = (this.s * 16807) % 2147483647;
    return (this.s - 1) / 2147483646;
  }
}

export class SyntheticDataProvider implements ICityDataProvider {
  readonly providerName = 'Synthetic Coimbatore Digital Twin Provider';
  readonly isSynthetic = true;

  roadNetwork: IRoadNetworkProvider;
  buildings: IBuildingDataProvider;
  population: IPopulationDataProvider;
  environment: IEnvironmentalDataProvider;
  weather: IWeatherDataProvider;

  private roadSegments: RoadSegment[] = [];
  private initialAssets: CityAsset[] = [];
  private wards: WardMetric[] = [];

  constructor() {
    this.generateRoadNetwork();
    this.generateInitialAssets();
    this.generateWards();

    const self = this;

    this.roadNetwork = {
      getRoadSegments: () => self.roadSegments,
      getIntersections: () => [
        [0, 0, 0],
        [150, 0, -120],
        [-120, 0, 140],
        [240, 0, 180],
        [-200, 0, -150],
        [320, 0, -260],
        [-300, 0, 280],
      ],
      calculateShortestPath: (start, end) => {
        // Simple waypoint interpolator through nearest nodes
        const mid: [number, number, number] = [
          (start[0] + end[0]) / 2,
          Math.max(start[1], end[1]),
          (start[2] + end[2]) / 2,
        ];
        return [start, mid, end];
      },
    };

    this.buildings = {
      getInitialAssets: () => self.initialAssets,
    };

    this.population = {
      getWards: () => self.wards,
      getTotalPopulation: () => self.wards.reduce((acc, w) => acc + w.population, 0),
    };

    this.environment = {
      getElevationAt: (x: number, z: number) => {
        // Western Ghats foothills elevation rise towards negative X
        const westHills = Math.max(0, (-x - 150) * 0.12);
        // River trough along Z around -40
        const riverDistance = Math.abs(z - (-40 + Math.sin(x * 0.01) * 30));
        const riverTrough = riverDistance < 40 ? -Math.cos((riverDistance / 40) * Math.PI * 0.5) * 6 : 0;
        return Math.max(0, westHills + riverTrough + Math.sin(x * 0.02) * Math.cos(z * 0.02) * 2);
      },
      getWaterBodies: () => [
        {
          id: 'noyyal_river',
          name: 'Noyyal River Corridor',
          type: 'river',
          points: [
            [-550, 0, -70],
            [-350, 0, -50],
            [-150, 0, -25],
            [0, 0, -35],
            [200, 0, -45],
            [400, 0, -30],
            [550, 0, -55],
          ],
        },
        {
          id: 'singanallur_lake',
          name: 'Singanallur Wetland Lake',
          type: 'lake',
          points: [[160, 0, 180]],
        },
        {
          id: 'valankulam_lake',
          name: 'Valankulam Eco Lake',
          type: 'lake',
          points: [[-90, 0, 110]],
        },
        {
          id: 'kurichi_lake',
          name: 'Kurichi Periyakulam Tank',
          type: 'reservoir',
          points: [[-70, 0, -320]],
        },
      ],
      getBaseAQI: () => 68, // Moderate base PM2.5 in industrial cities
    };

    this.weather = {
      getCurrentCondition: () => 'CLEAR',
      getRainfallIntensityMm: () => 0,
    };
  }

  private generateRoadNetwork() {
    // Primary Radial Arterials (Avinashi Rd, Trichy Rd, Mettupalayam Rd, Pollachi Rd, Sathy Rd)
    this.roadSegments = [
      // Avinashi Road Radial (North-East to Peelamedu/Airport)
      {
        id: 'rd_avinashi_1',
        name: 'Avinashi Road Arterial (Inner)',
        start: [0, 1, 0],
        end: [220, 1, -160],
        lanes: 6,
        type: 'radial_highway',
        currentCongestionPct: 78,
        speedLimitKmh: 60,
      },
      {
        id: 'rd_avinashi_2',
        name: 'Avinashi Road Expressway (Outer)',
        start: [220, 1, -160],
        end: [480, 1, -340],
        lanes: 6,
        type: 'radial_highway',
        currentCongestionPct: 62,
        speedLimitKmh: 70,
      },

      // Trichy Road Radial (East to Singanallur)
      {
        id: 'rd_trichy_1',
        name: 'Trichy Road Arterial (Inner)',
        start: [0, 1, 0],
        end: [260, 1, 120],
        lanes: 4,
        type: 'radial_highway',
        currentCongestionPct: 72,
        speedLimitKmh: 50,
      },
      {
        id: 'rd_trichy_2',
        name: 'Trichy Road (Outer Singanallur bypass)',
        start: [260, 1, 120],
        end: [520, 1, 240],
        lanes: 4,
        type: 'radial_highway',
        currentCongestionPct: 55,
        speedLimitKmh: 65,
      },

      // Mettupalayam Road Radial (North)
      {
        id: 'rd_mtp_1',
        name: 'Mettupalayam Road Radial',
        start: [0, 1, 0],
        end: [40, 1, -480],
        lanes: 4,
        type: 'radial_highway',
        currentCongestionPct: 68,
        speedLimitKmh: 55,
      },

      // Pollachi Road Radial (South)
      {
        id: 'rd_pollachi_1',
        name: 'Pollachi Road Radial',
        start: [0, 1, 0],
        end: [-100, 1, 460],
        lanes: 4,
        type: 'radial_highway',
        currentCongestionPct: 58,
        speedLimitKmh: 60,
      },

      // Noyyal River Bridge (Connecting Core to South)
      {
        id: 'rd_noyyal_bridge',
        name: 'Noyyal Basin Cause-way Bridge',
        start: [-30, 4, -45],
        end: [-30, 4, -15],
        lanes: 4,
        type: 'bridge',
        currentCongestionPct: 82,
        speedLimitKmh: 40,
      },

      // Gandhipuram Flyover
      {
        id: 'rd_flyover_gandhipuram',
        name: 'Gandhipuram 2-Tier Flyover',
        start: [-40, 12, -80],
        end: [60, 12, -40],
        lanes: 4,
        type: 'flyover',
        currentCongestionPct: 45,
        speedLimitKmh: 50,
      },

      // East-West Outer Ring Road
      {
        id: 'rd_ring_east',
        name: 'Eastern Bypass Outer Ring Road',
        start: [480, 1, -340],
        end: [520, 1, 240],
        lanes: 4,
        type: 'arterial',
        currentCongestionPct: 42,
        speedLimitKmh: 75,
      },
      {
        id: 'rd_ring_west',
        name: 'Western Agricultural Ring Road',
        start: [-280, 3, -380],
        end: [-320, 4, 320],
        lanes: 2,
        type: 'collector',
        currentCongestionPct: 28,
        speedLimitKmh: 50,
      },

      // Railway Corridor (Mainline tracks through city)
      {
        id: 'rail_mainline',
        name: 'Southern Railway Mainline Corridor',
        start: [-450, 2, 80],
        end: [480, 2, -60],
        lanes: 2,
        type: 'railway',
        currentCongestionPct: 35,
        speedLimitKmh: 90,
      },
    ];
  }

  private generateInitialAssets() {
    // Curated real-world inspired key anchors for Coimbatore Digital Twin
    this.initialAssets = [
      {
        id: 'cmch_govt_hospital',
        name: 'Coimbatore District Government Tertiary Hospital',
        type: 'multispecialty_hospital',
        category: 'healthcare',
        position: [-45, 0, 15],
        footprint: [70, 55],
        height: 30,
        status: 'EXISTING',
        zone: 'urban_core',
        capacity: 1200,
        capacityUnit: 'beds',
        currentUtilizationPct: 94, // Strained!
        specialty: 'Multispecialty & Emergency',
        serviceRadius: 6000,
        populationServed: 450000,
        jobsCreated: 2400,
        trafficGeneratedPerHour: 480,
        waterDemandKLD: 480,
        energyDemandMW: 5.5,
        wasteGenerationTPD: 4.2,
        environmentalScoreDelta: -5,
        economicImpactCrore: 850,
        constructionCostCrore: 580,
        annualMaintenanceCrore: 45,
        dependencies: ['4_lane_road', 'potable_water', 'power_grid'],
        notes: 'Main public tertiary hospital. Currently running over 90% bed occupancy.'
      },
      {
        id: 'ent_specialty_clinic',
        name: 'Kovai ENT & Head-Neck Specialty Hospital',
        type: 'specialty_hospital',
        category: 'healthcare',
        position: [40, 0, -25],
        footprint: [35, 30],
        height: 18,
        status: 'EXISTING',
        zone: 'commercial_high',
        capacity: 80,
        capacityUnit: 'beds',
        currentUtilizationPct: 72,
        specialty: 'ENT',
        serviceRadius: 3500,
        populationServed: 80000,
        jobsCreated: 190,
        trafficGeneratedPerHour: 75,
        waterDemandKLD: 35,
        energyDemandMW: 0.9,
        wasteGenerationTPD: 0.4,
        environmentalScoreDelta: 0,
        economicImpactCrore: 95,
        constructionCostCrore: 85,
        annualMaintenanceCrore: 7.5,
        dependencies: ['2_lane_road', 'power_grid'],
        notes: 'Well-established regional ENT specialty center.'
      },
      {
        id: 'saravanampatti_tech_park',
        name: 'Saravanampatti Tech Zone SEZ',
        type: 'it_tech_park',
        category: 'industrial',
        position: [280, 0, -260],
        footprint: [90, 80],
        height: 52,
        status: 'EXISTING',
        zone: 'industrial_tech',
        capacity: 14000,
        capacityUnit: 'tech workforce',
        currentUtilizationPct: 88,
        specialty: 'IT & Software Export',
        serviceRadius: 8000,
        populationServed: 65000,
        jobsCreated: 13500,
        trafficGeneratedPerHour: 950,
        waterDemandKLD: 380,
        energyDemandMW: 11.2,
        wasteGenerationTPD: 4.8,
        environmentalScoreDelta: -12,
        economicImpactCrore: 2800,
        constructionCostCrore: 720,
        annualMaintenanceCrore: 52,
        dependencies: ['fiber_broadband', 'dual_substation_grid', '4_lane_road'],
        notes: 'Fast-growing IT corridor, high peak-hour commute congestion.'
      },
      {
        id: 'peelamedu_textile_cluster',
        name: 'Peelamedu Textile & Foundries Complex',
        type: 'textile_machinery_park',
        category: 'industrial',
        position: [220, 0, 60],
        footprint: [110, 90],
        height: 18,
        status: 'EXISTING',
        zone: 'industrial_heavy',
        capacity: 6500,
        capacityUnit: 'industrial workforce',
        currentUtilizationPct: 91,
        specialty: 'Textile Machinery & Precision Casting',
        serviceRadius: 7000,
        populationServed: 55000,
        jobsCreated: 6200,
        trafficGeneratedPerHour: 520,
        waterDemandKLD: 580,
        energyDemandMW: 16.5,
        wasteGenerationTPD: 11.0,
        environmentalScoreDelta: -28,
        economicImpactCrore: 1600,
        constructionCostCrore: 510,
        annualMaintenanceCrore: 40,
        dependencies: ['freight_highway', 'effluent_treatment_cetp', 'high_voltage_substation'],
        notes: 'Core legacy manufacturing hub. Heavy power & water demand.'
      },
      {
        id: 'gandhipuram_central_bus_station',
        name: 'Gandhipuram Central Bus Terminus',
        type: 'central_bus_terminal',
        category: 'transport',
        position: [-10, 0, -70],
        footprint: [85, 65],
        height: 18,
        status: 'EXISTING',
        zone: 'urban_core',
        capacity: 150000,
        capacityUnit: 'passengers/day',
        currentUtilizationPct: 96, // Extremely busy!
        specialty: 'Intra-city & Mofussil Transit',
        serviceRadius: 6000,
        populationServed: 320000,
        jobsCreated: 850,
        trafficGeneratedPerHour: 880,
        waterDemandKLD: 95,
        energyDemandMW: 2.4,
        wasteGenerationTPD: 4.5,
        environmentalScoreDelta: -10,
        economicImpactCrore: 220,
        constructionCostCrore: 190,
        annualMaintenanceCrore: 16,
        dependencies: ['4_lane_road', 'feeder_lanes'],
        notes: 'Primary transit nexus. Major pedestrian movement.'
      },
      {
        id: 'coimbatore_junction_rail',
        name: 'Coimbatore Main Junction Railway Terminal',
        type: 'railway_junction_hub',
        category: 'transport',
        position: [-60, 0, 50],
        footprint: [120, 60],
        height: 22,
        status: 'EXISTING',
        zone: 'urban_core',
        capacity: 90000,
        capacityUnit: 'passengers/day',
        currentUtilizationPct: 89,
        specialty: 'Inter-state & Suburban Rail',
        serviceRadius: 9000,
        populationServed: 400000,
        jobsCreated: 920,
        trafficGeneratedPerHour: 720,
        waterDemandKLD: 140,
        energyDemandMW: 3.8,
        wasteGenerationTPD: 5.1,
        environmentalScoreDelta: -8,
        economicImpactCrore: 410,
        constructionCostCrore: 380,
        annualMaintenanceCrore: 30,
        dependencies: ['rail_corridor', 'connecting_arterial'],
        notes: 'Historic junction connecting Kerala, Chennai, and Bangalore.'
      },
      {
        id: 'valankulam_eco_promenade',
        name: 'Valankulam Lakefront Biodiversity Promenade',
        type: 'urban_eco_park',
        category: 'recreation',
        position: [-95, 0, 115],
        footprint: [90, 80],
        height: 5,
        status: 'EXISTING',
        zone: 'green_conservation',
        capacity: 18000,
        capacityUnit: 'visitors/day',
        currentUtilizationPct: 65,
        specialty: 'Urban Wetland Conservation & Walkways',
        serviceRadius: 3500,
        populationServed: 95000,
        jobsCreated: 75,
        trafficGeneratedPerHour: 90,
        waterDemandKLD: 15,
        energyDemandMW: 0.2,
        wasteGenerationTPD: 0.3,
        environmentalScoreDelta: 42, // Positive green asset!
        economicImpactCrore: 45,
        constructionCostCrore: 55,
        annualMaintenanceCrore: 4.8,
        dependencies: ['pedestrian_pathways'],
        notes: 'Restored urban lake wetland absorbing monsoon runoff.'
      },
      {
        id: 'siruvani_water_treatment',
        name: 'Siruvani & Pillur Bulk Water Treatment Works',
        type: 'water_treatment_plant',
        category: 'utilities',
        position: [-380, 0, -60],
        footprint: [85, 75],
        height: 14,
        status: 'EXISTING',
        zone: 'utilities',
        capacity: 120,
        capacityUnit: 'MLD treated',
        currentUtilizationPct: 86,
        specialty: 'Potable Water Purification & Booster Grid',
        serviceRadius: 9000,
        populationServed: 650000,
        jobsCreated: 110,
        trafficGeneratedPerHour: 35,
        waterDemandKLD: 10,
        energyDemandMW: 4.8,
        wasteGenerationTPD: 5.5,
        environmentalScoreDelta: 8,
        economicImpactCrore: 310,
        constructionCostCrore: 260,
        annualMaintenanceCrore: 20,
        dependencies: ['raw_water_gravity_intake', 'dedicated_power_feeder'],
        notes: 'Supplies famed Siruvani sweet water to western and central wards.'
      }
    ];

    // Procedural background urban fabric (hundreds of homes, commercial blocks, schools, clinics)
    const rng = new SeededRandom(108);
    const assetTypes = [
      { type: 'residential_block', cat: 'residential', h: 14, f: [24, 20], z: 'residential_dense' },
      { type: 'suburban_villa', cat: 'residential', h: 8, f: [18, 16], z: 'residential_suburban' },
      { type: 'commercial_retail', cat: 'commercial', h: 20, f: [30, 26], z: 'commercial_high' },
      { type: 'school_neighborhood', cat: 'education', h: 12, f: [36, 30], z: 'residential_dense' },
      { type: 'local_workshop', cat: 'industrial', h: 10, f: [32, 28], z: 'industrial_heavy' },
      { type: 'farmland_homestead', cat: 'agriculture', h: 6, f: [20, 18], z: 'agricultural' },
    ];

    for (let i = 0; i < 280; i++) {
      const angle = rng.next() * Math.PI * 2;
      const dist = 60 + rng.next() * 450;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      // Avoid water bodies
      if (Math.abs(z - (-35)) < 25) continue; // river
      if (Math.hypot(x - 160, z - 180) < 45) continue; // singanallur lake
      if (Math.hypot(x - (-90), z - 110) < 40) continue; // valankulam lake

      const typeChoice = assetTypes[Math.floor(rng.next() * assetTypes.length)];
      this.initialAssets.push({
        id: `synth_bldg_${i}`,
        name: `${typeChoice.z.replace('_', ' ').toUpperCase()} Block #${i + 1}`,
        type: typeChoice.type,
        category: typeChoice.cat as any,
        position: [Math.round(x), 0, Math.round(z)],
        footprint: [typeChoice.f[0] + Math.round(rng.next() * 6), typeChoice.f[1] + Math.round(rng.next() * 6)],
        height: Math.round(typeChoice.h * (0.8 + rng.next() * 0.6)),
        status: 'EXISTING',
        zone: typeChoice.z as ZoneType,
        capacity: 120 + Math.round(rng.next() * 300),
        capacityUnit: 'occupants',
        currentUtilizationPct: 50 + Math.round(rng.next() * 45),
        serviceRadius: 1000,
        populationServed: 400 + Math.round(rng.next() * 800),
        jobsCreated: 15 + Math.round(rng.next() * 40),
        trafficGeneratedPerHour: 20 + Math.round(rng.next() * 30),
        waterDemandKLD: 25 + Math.round(rng.next() * 30),
        energyDemandMW: 0.2 + rng.next() * 0.4,
        wasteGenerationTPD: 0.2 + rng.next() * 0.3,
        environmentalScoreDelta: 0,
        economicImpactCrore: 10 + Math.round(rng.next() * 20),
        constructionCostCrore: 12,
        annualMaintenanceCrore: 0.8,
        dependencies: ['local_street', 'power_grid'],
      });
    }
  }

  private generateWards() {
    this.wards = [
      {
        id: 'ward_core_central',
        name: 'Zone 1: Gandhipuram & Town Hall (Core)',
        zone: 'urban_core',
        population: 340000,
        growthRatePct: 1.8,
        avgIncomeLevel: 'MIDDLE',
        hospitalBedsPer1k: 3.8,
        schoolSeatsPer1k: 88,
        trafficCongestionIndex: 78,
        waterStressIndex: 72,
        airQualityIndex: 82, // Moderate PM2.5
        greenSpaceM2PerCapita: 4.2, // Below WHO 9m2 guideline
        floodVulnerability: 35,
      },
      {
        id: 'ward_east_peelamedu',
        name: 'Zone 2: Peelamedu & Singanallur (Industrial & Transit)',
        zone: 'industrial_heavy',
        population: 290000,
        growthRatePct: 2.4,
        avgIncomeLevel: 'MIDDLE',
        hospitalBedsPer1k: 2.1, // Deficit!
        schoolSeatsPer1k: 72,
        trafficCongestionIndex: 84,
        waterStressIndex: 80,
        airQualityIndex: 94, // Higher industrial emissions
        greenSpaceM2PerCapita: 6.8,
        floodVulnerability: 62, // Singanallur catchment depression
      },
      {
        id: 'ward_north_saravanampatti',
        name: 'Zone 3: Saravanampatti & CHIL SEZ (Tech Corridor)',
        zone: 'industrial_tech',
        population: 230000,
        growthRatePct: 4.8, // High growth!
        avgIncomeLevel: 'HIGH',
        hospitalBedsPer1k: 1.4, // Critical healthcare specialty gap!
        schoolSeatsPer1k: 65,
        trafficCongestionIndex: 76,
        waterStressIndex: 68,
        airQualityIndex: 64,
        greenSpaceM2PerCapita: 8.5,
        floodVulnerability: 28,
      },
      {
        id: 'ward_south_kurichi',
        name: 'Zone 4: Kurichi, Podanur & Kuniyamuthur (Southern Dense)',
        zone: 'residential_dense',
        population: 310000,
        growthRatePct: 2.1,
        avgIncomeLevel: 'LOWER_MIDDLE',
        hospitalBedsPer1k: 1.9,
        schoolSeatsPer1k: 70,
        trafficCongestionIndex: 65,
        waterStressIndex: 74,
        airQualityIndex: 72,
        greenSpaceM2PerCapita: 5.1,
        floodVulnerability: 58, // Kurichi tank backwater risk
      },
      {
        id: 'ward_west_thondamuthur',
        name: 'Zone 5: Thondamuthur & Western Fringe (Agricultural Belt)',
        zone: 'agricultural',
        population: 130000,
        growthRatePct: 1.1,
        avgIncomeLevel: 'LOWER_MIDDLE',
        hospitalBedsPer1k: 1.1, // Low access, relies on long transit to core
        schoolSeatsPer1k: 58,
        trafficCongestionIndex: 22,
        waterStressIndex: 54,
        airQualityIndex: 38, // Clean air near Western Ghats
        greenSpaceM2PerCapita: 34.0, // High agricultural green
        floodVulnerability: 42, // Flash mountain runoff channels
      },
    ];
  }

  getBaseState(): CitySimulationState {
    const totalPop = this.population.getTotalPopulation();
    return {
      totalPopulation: totalPop,
      populationGrowthPct: 2.3,
      totalJobs: Math.round(totalPop * 0.44),
      averageTravelSpeedKmh: 28.5,
      networkCongestionIndex: 68,
      overallHealthcareCapacityBeds: 2800,
      healthcareCoveragePct: 74.5,
      waterDailyDemandMLD: 245,
      waterSupplyCapacityMLD: 270,
      waterStressIndex: 62,
      powerPeakDemandMW: 620,
      powerGridCapacityMW: 750,
      solidWasteTPD: 940,
      averageAQIPM25: 71,
      cityGreenCoverPct: 21.4,
      municipalBudgetRemainingCrore: 10000, // ₹10,000 Crore Illustrative Demo Budget
      floodInundatedAreaSqKm: 0.8,
      disasterResilienceIndex: 72,
    };
  }
}
