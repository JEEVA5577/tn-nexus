// Road Network, Flyovers, Bridges, and Railway Infrastructure for TN NEXUS
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useCityStore } from '../../store/useCityStore';
import { RoadSegment } from '../../data/providers/ICityDataProvider';

export const RoadNetwork: React.FC = () => {
  const roadSegments = useCityStore((state) => state.roadSegments);
  const visualMode = useCityStore((state) => state.visualMode);
  const disasterImpact = useCityStore((state) => state.disasterImpact);

  // Helper to build a road strip between start and end coordinates
  const renderSegment = (seg: RoadSegment) => {
    const start = new THREE.Vector3(...seg.start);
    const end = new THREE.Vector3(...seg.end);
    const length = start.distanceTo(end);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    // Orientation
    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    const angleY = Math.atan2(dir.x, dir.z);

    const width = seg.type === 'radial_highway' ? 14 : seg.type === 'arterial' ? 11 : seg.type === 'bridge' ? 12 : seg.type === 'flyover' ? 10 : 7;
    const isElevated = seg.type === 'flyover' || seg.type === 'bridge';
    const isBlocked = disasterImpact.blockedRoadIds.includes(seg.id);

    // Dynamic coloring based on visual mode & congestion
    let roadColor = '#2d3748'; // dark slate asphalt
    if (isBlocked) {
      roadColor = '#ef4444'; // Red flooded/blocked
    } else if (visualMode === 'TRAFFIC') {
      if (seg.currentCongestionPct > 75) roadColor = '#dc2626'; // severe red
      else if (seg.currentCongestionPct > 50) roadColor = '#f59e0b'; // moderate amber
      else roadColor = '#10b981'; // free flowing green
    } else if (seg.type === 'flyover') {
      roadColor = '#4a5568';
    } else if (seg.type === 'railway') {
      roadColor = '#718096';
    }

    return (
      <group key={seg.id} position={[mid.x, mid.y + 0.1, mid.z]} rotation={[0, angleY, 0]}>
        {/* Main Road Surface */}
        <mesh receiveShadow>
          <boxGeometry args={[width, 0.4, length]} />
          <meshStandardMaterial
            color={roadColor}
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>

        {/* Center Lane Markings */}
        {seg.type !== 'railway' && (
          <mesh position={[0, 0.22, 0]}>
            <planeGeometry args={[0.4, length]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        )}

        {/* Railway ties & tracks */}
        {seg.type === 'railway' && (
          <group position={[0, 0.25, 0]}>
            <mesh position={[-1.2, 0.05, 0]}>
              <boxGeometry args={[0.2, 0.1, length]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[1.2, 0.05, 0]}>
              <boxGeometry args={[0.2, 0.1, length]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        )}

        {/* Flyover / Bridge Support Piers */}
        {isElevated && (
          <group>
            {[-length * 0.35, 0, length * 0.35].map((pz, idx) => (
              <mesh key={idx} position={[0, -mid.y * 0.5, pz]} castShadow>
                <cylinderGeometry args={[1.2, 1.4, mid.y, 12]} />
                <meshStandardMaterial color="#64748b" roughness={0.7} />
              </mesh>
            ))}
          </group>
        )}
      </group>
    );
  };

  return <group>{roadSegments.map(renderSegment)}</group>;
};
