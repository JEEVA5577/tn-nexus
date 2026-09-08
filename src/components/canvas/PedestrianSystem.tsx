// Instanced Lightweight Pedestrian Agents for TN NEXUS Digital Twin
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useCityStore } from '../../store/useCityStore';

interface PedestrianAgent {
  basePos: [number, number, number];
  radius: number;
  angle: number;
  speed: number;
  height: number;
}

export const PedestrianSystem: React.FC = () => {
  const isSimulating = useCityStore((state) => state.isSimulating);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Generate pedestrian clusters around high-activity civic hubs
  const pedestrians = useMemo(() => {
    const list: PedestrianAgent[] = [];
    const hubs: [number, number, number][] = [
      [-10, 0.5, -70],   // Gandhipuram bus terminal
      [-60, 0.5, 50],    // Coimbatore Junction railway
      [-45, 0.5, 15],    // Government tertiary hospital
      [-95, 0.5, 115],   // Valankulam lakefront promenade
      [280, 0.5, -260],  // Saravanampatti IT plaza
      [0, 0.5, 0],       // Town Hall / Core commercial street
    ];

    for (const hub of hubs) {
      const count = 45;
      for (let i = 0; i < count; i++) {
        list.push({
          basePos: hub,
          radius: 4 + Math.random() * 22,
          angle: Math.random() * Math.PI * 2,
          speed: 0.008 + Math.random() * 0.012,
          height: 1.6 + Math.random() * 0.3,
        });
      }
    }

    return list;
  }, []);

  useFrame(() => {
    if (!meshRef.current || !isSimulating) return;

    const dummy = new THREE.Object3D();

    for (let i = 0; i < pedestrians.length; i++) {
      const p = pedestrians[i];
      p.angle += p.speed;

      const px = p.basePos[0] + Math.cos(p.angle) * p.radius;
      const pz = p.basePos[2] + Math.sin(p.angle) * p.radius;
      const py = p.basePos[1] + p.height * 0.5;

      dummy.position.set(px, py, pz);
      dummy.scale.set(0.6, p.height, 0.6);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, pedestrians.length]}
      castShadow
    >
      <capsuleGeometry args={[0.3, 1, 4, 8]} />
      <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
    </instancedMesh>
  );
};
