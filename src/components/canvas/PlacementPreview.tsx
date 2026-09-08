// Holographic Placement Preview Cursor for TN NEXUS Digital Twin
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useCityStore } from '../../store/useCityStore';

export const PlacementPreview: React.FC = () => {
  const activeAssetTemplate = useCityStore((state) => state.activeAssetTemplate);
  const ghostPosition = useCityStore((state) => state.ghostPosition);
  const currentNecessity = useCityStore((state) => state.currentNecessity);
  const currentSiteAnalysis = useCityStore((state) => state.currentSiteAnalysis);

  const ringMeshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ringMeshRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.05;
      ringMeshRef.current.scale.set(s, s, 1);
    }
  });

  if (!activeAssetTemplate || !ghostPosition || !currentSiteAnalysis) return null;

  // Determine holographic preview color based on necessity score & conflicts
  const hasCriticalConflict = currentNecessity?.conflicts.some(c => c.severity === 'CRITICAL');
  const score = currentNecessity?.overallScore || 70;

  let previewColor = '#06b6d4'; // default cyan
  if (hasCriticalConflict || score < 50) previewColor = '#ef4444'; // red warning
  else if (score >= 80) previewColor = '#10b981'; // bright emerald
  else previewColor = '#f59e0b'; // amber

  const [w, d] = activeAssetTemplate.defaultFootprint;
  const h = activeAssetTemplate.defaultHeight;

  return (
    <group position={[ghostPosition[0], ghostPosition[1], ghostPosition[2]]}>
      {/* 1. Holographic Volume Extrusion */}
      <mesh position={[0, h * 0.5, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={previewColor}
          transparent
          opacity={0.45}
          wireframe={false}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* 2. Holographic Wireframe Cage */}
      <mesh position={[0, h * 0.5, 0]}>
        <boxGeometry args={[w * 1.01, h * 1.01, d * 1.01]} />
        <meshBasicMaterial
          color={previewColor}
          wireframe
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* 3. Pulsing Footprint Ground Ring */}
      <mesh
        ref={ringMeshRef}
        position={[0, 0.4, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[Math.max(w, d) * 0.6, Math.max(w, d) * 0.65, 32]} />
        <meshBasicMaterial
          color={previewColor}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 4. Catchment Service Radius Perimeter */}
      <mesh
        position={[0, 0.2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry
          args={[
            activeAssetTemplate.serviceRadius * 0.039,
            activeAssetTemplate.serviceRadius * 0.041,
            64
          ]}
        />
        <meshBasicMaterial
          color={previewColor}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
