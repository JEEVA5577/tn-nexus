// Instanced & Specialized Building Renderer for TN NEXUS Digital Twin
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useCityStore } from '../../store/useCityStore';
import { CityAsset, VisualMode, ZoneType } from '../../types/city';

export const BuildingInstances: React.FC = () => {
  const assets = useCityStore((state) => state.assets);
  const visualMode = useCityStore((state) => state.visualMode);
  const timeOfDay = useCityStore((state) => state.timeOfDay);
  const selectedPlacedAsset = useCityStore((state) => state.selectedPlacedAsset);
  const selectExistingAsset = useCityStore((state) => state.selectExistingAsset);

  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);

  // Separate background generic buildings (for instancing) from landmark/proposed assets
  const { backgroundAssets, prominentAssets } = useMemo(() => {
    const bg: CityAsset[] = [];
    const prom: CityAsset[] = [];

    for (const a of assets) {
      if (a.status !== 'EXISTING' || a.id.startsWith('cmch_') || a.id.startsWith('saravanampatti_') ||
          a.id.startsWith('peelamedu_') || a.id.startsWith('gandhipuram_') || a.id.startsWith('coimbatore_junction') ||
          a.id.startsWith('valankulam_') || a.id.startsWith('siruvani_')) {
        prom.push(a);
      } else {
        bg.push(a);
      }
    }
    return { backgroundAssets: bg, prominentAssets: prom };
  }, [assets]);

  // Color generator based on visual mode & zone
  const getAssetColor = (asset: CityAsset, mode: VisualMode, isNight: boolean): THREE.Color => {
    if (mode === 'HEALTH') {
      if (asset.category === 'healthcare') return new THREE.Color('#10b981'); // Emerald
      return new THREE.Color('#1e293b'); // Subdued dark slate
    }

    if (mode === 'WATER') {
      if (asset.category === 'utilities' || asset.waterDemandKLD > 150) return new THREE.Color('#06b6d4'); // Cyan
      return new THREE.Color('#1e293b');
    }

    if (mode === 'ENERGY') {
      if (asset.energyDemandMW > 4.0 || asset.category === 'industrial') return new THREE.Color('#f59e0b'); // Amber
      return new THREE.Color('#1e293b');
    }

    if (mode === 'ENVIRONMENT') {
      if (asset.category === 'recreation') return new THREE.Color('#10b981'); // Green
      if (asset.category === 'industrial') return new THREE.Color('#f43f5e'); // Rose high emission
      return new THREE.Color('#334155');
    }

    if (mode === 'LAND_USE') {
      switch (asset.zone) {
        case 'urban_core': return new THREE.Color('#ef4444');
        case 'commercial_high': return new THREE.Color('#f97316');
        case 'industrial_heavy': return new THREE.Color('#8b5cf6');
        case 'industrial_tech': return new THREE.Color('#3b82f6');
        case 'residential_dense': return new THREE.Color('#eab308');
        case 'residential_suburban': return new THREE.Color('#fde047');
        case 'agricultural': return new THREE.Color('#84cc16');
        case 'green_conservation': return new THREE.Color('#10b981');
        default: return new THREE.Color('#64748b');
      }
    }

    if (mode === 'ECONOMY') {
      if (asset.jobsCreated > 1000) return new THREE.Color('#eab308'); // High economic anchor
      if (asset.jobsCreated > 200) return new THREE.Color('#38bdf8');
      return new THREE.Color('#1e293b');
    }

    // Default CITY mode
    if (isNight) {
      // Warm illuminated window night tones
      return new THREE.Color('#334155');
    }

    switch (asset.category) {
      case 'healthcare': return new THREE.Color('#0ea5e9');
      case 'education': return new THREE.Color('#f59e0b');
      case 'commercial': return new THREE.Color('#3b82f6');
      case 'industrial': return new THREE.Color('#64748b');
      case 'residential': return new THREE.Color('#94a3b8');
      case 'recreation': return new THREE.Color('#22c55e');
      case 'utilities': return new THREE.Color('#06b6d4');
      case 'government': return new THREE.Color('#8b5cf6');
      case 'emergency': return new THREE.Color('#ef4444');
      default: return new THREE.Color('#475569');
    }
  };

  // Update InstancedMesh transformations and colors
  useFrame(() => {
    if (!instancedMeshRef.current) return;
    const mesh = instancedMeshRef.current;
    const isNight = timeOfDay === 'NIGHT';

    const dummy = new THREE.Object3D();
    const tempColor = new THREE.Color();

    for (let i = 0; i < backgroundAssets.length; i++) {
      const a = backgroundAssets[i];
      dummy.position.set(a.position[0], a.position[1] + a.height * 0.5, a.position[2]);
      dummy.scale.set(a.footprint[0], a.height, a.footprint[1]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      tempColor.copy(getAssetColor(a, visualMode, isNight));
      mesh.setColorAt(i, tempColor);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      {/* 1. Instanced Generic Background Buildings */}
      {backgroundAssets.length > 0 && (
        <instancedMesh
          ref={instancedMeshRef}
          args={[undefined, undefined, backgroundAssets.length]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            roughness={0.7}
            metalness={0.2}
          />
        </instancedMesh>
      )}

      {/* 2. Prominent Anchor Assets & Proposed / Optimized Projects */}
      {prominentAssets.map((asset) => {
        const isSelected = selectedPlacedAsset?.id === asset.id;
        const isProposed = asset.status === 'PROPOSED';
        const isOptimized = asset.status === 'OPTIMIZED';
        const isNight = timeOfDay === 'NIGHT';
        const baseCol = getAssetColor(asset, visualMode, isNight);

        return (
          <group
            key={asset.id}
            position={[asset.position[0], asset.position[1] + asset.height * 0.5, asset.position[2]]}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              selectExistingAsset(asset);
            }}
          >
            {/* Main Building Volume */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[asset.footprint[0], asset.height, asset.footprint[1]]} />
              <meshStandardMaterial
                color={isSelected ? '#06b6d4' : baseCol}
                roughness={0.5}
                metalness={0.3}
                emissive={isSelected ? '#06b6d4' : isOptimized ? '#10b981' : isProposed ? '#f59e0b' : '#000000'}
                emissiveIntensity={isSelected ? 0.45 : isOptimized || isProposed ? 0.35 : 0}
              />
            </mesh>

            {/* Architectural Roof Detail */}
            <mesh position={[0, asset.height * 0.5 + 1.5, 0]} castShadow>
              <boxGeometry args={[asset.footprint[0] * 0.75, 3, asset.footprint[1] * 0.75]} />
              <meshStandardMaterial color="#1e293b" roughness={0.6} />
            </mesh>

            {/* Floating Holographic Status Beacon for Proposed/Optimized/Selected Assets */}
            {(isProposed || isOptimized || isSelected) && (
              <group position={[0, asset.height * 0.5 + 8, 0]}>
                <mesh>
                  <sphereGeometry args={[2.2, 16, 16]} />
                  <meshBasicMaterial
                    color={isOptimized ? '#10b981' : isProposed ? '#f59e0b' : '#06b6d4'}
                  />
                </mesh>
                {/* Pulsing indicator ring */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[3, 4, 24]} />
                  <meshBasicMaterial
                    color={isOptimized ? '#10b981' : isProposed ? '#f59e0b' : '#06b6d4'}
                    transparent
                    opacity={0.8}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </group>
            )}

            {/* Isochrone / Service Catchment Radius Ring in HEALTH/EMERGENCY visual mode */}
            {(visualMode === 'HEALTH' || visualMode === 'EMERGENCY') && (
              <mesh
                position={[0, -asset.height * 0.5 + 0.8, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <ringGeometry args={[asset.serviceRadius * 0.038, asset.serviceRadius * 0.04, 48]} />
                <meshBasicMaterial
                  color={asset.category === 'healthcare' ? '#10b981' : '#ef4444'}
                  transparent
                  opacity={0.5}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};
