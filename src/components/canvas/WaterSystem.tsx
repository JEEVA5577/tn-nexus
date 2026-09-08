// Flowing River and Balancing Lakes Simulation for TN NEXUS
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useCityStore } from '../../store/useCityStore';

export const WaterSystem: React.FC = () => {
  const riverMeshRef = useRef<THREE.Mesh>(null);
  const lakesGroupRef = useRef<THREE.Group>(null);
  const floodPlaneRef = useRef<THREE.Mesh>(null);

  const disasterImpact = useCityStore((state) => state.disasterImpact);
  const weather = useCityStore((state) => state.weather);

  // Animate water specular flow and gentle wave ripples
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (riverMeshRef.current) {
      const mat = riverMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.roughness = 0.15 + Math.sin(t * 1.5) * 0.05;
    }

    if (floodPlaneRef.current) {
      // Dynamic flood cresting based on disaster model
      const targetWaterLevel = disasterImpact.floodWaterLevelMeters;
      floodPlaneRef.current.position.y = THREE.MathUtils.lerp(
        floodPlaneRef.current.position.y,
        targetWaterLevel > 0 ? targetWaterLevel : -5,
        0.05
      );
    }
  });

  return (
    <group>
      {/* 1. Noyyal River Meander Mesh */}
      <mesh
        ref={riverMeshRef}
        position={[0, 0.4, -40]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {/* River corridor plane with custom width */}
        <planeGeometry args={[1150, 48, 64, 8]} />
        <meshStandardMaterial
          color="#0ea5e9"
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* 2. Balancing Wetland Lakes (Singanallur, Valankulam, Kurichi) */}
      <group ref={lakesGroupRef}>
        {/* Singanallur Lake */}
        <mesh position={[160, 0.6, 180]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[52, 32]} />
          <meshStandardMaterial
            color="#0284c7"
            roughness={0.18}
            metalness={0.75}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Valankulam Eco Lake */}
        <mesh position={[-90, 0.6, 110]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[44, 32]} />
          <meshStandardMaterial
            color="#0284c7"
            roughness={0.18}
            metalness={0.75}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Kurichi Periyakulam Tank */}
        <mesh position={[-70, 0.6, -320]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[65, 32]} />
          <meshStandardMaterial
            color="#0369a1"
            roughness={0.22}
            metalness={0.7}
            transparent
            opacity={0.88}
          />
        </mesh>
      </group>

      {/* 3. Dynamic Disaster Flood Elevation Plane */}
      <mesh
        ref={floodPlaneRef}
        position={[0, -5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1200, 1200]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={disasterImpact.floodWaterLevelMeters > 0 ? 0.72 : 0}
        />
      </mesh>
    </group>
  );
};
