// Master 3D WebGL Canvas for TN NEXUS Digital Twin
import React, { useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Terrain } from './Terrain';
import { WaterSystem } from './WaterSystem';
import { RoadNetwork } from './RoadNetwork';
import { BuildingInstances } from './BuildingInstances';
import { TrafficSystem } from './TrafficSystem';
import { PedestrianSystem } from './PedestrianSystem';
import { EnvironmentLighting } from './EnvironmentLighting';
import { PlacementPreview } from './PlacementPreview';
import { CameraController } from './CameraController';
import { useCityStore } from '../../store/useCityStore';

// Lightweight FPS Tracker inside R3F render loop
const FpsTracker: React.FC = () => {
  const setFps = useCityStore((state) => state.setFps);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const interval = setInterval(() => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      const currentFps = Math.round(frameCount / delta);
      setFps(currentFps);
      frameCount = 0;
      lastTime = now;
    }, 1000);

    return () => clearInterval(interval);
  }, [setFps]);

  useFrame(() => {
    // Count frames
  });

  return null;
};

export const CityCanvas: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-nexus-950">
      <Canvas
        shadows
        camera={{ position: [0, 180, 260], fov: 45, near: 1, far: 2000 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        dpr={[1, 2]}
      >
        <CameraController />
        <EnvironmentLighting />
        <Terrain />
        <WaterSystem />
        <RoadNetwork />
        <BuildingInstances />
        <TrafficSystem />
        <PedestrianSystem />
        <PlacementPreview />
        <FpsTracker />
      </Canvas>
    </div>
  );
};
