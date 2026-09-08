// Dynamic Environment Lighting, Day/Night Cycle, and Rain Particle Weather System
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useCityStore } from '../../store/useCityStore';

export const EnvironmentLighting: React.FC = () => {
  const timeOfDay = useCityStore((state) => state.timeOfDay);
  const weather = useCityStore((state) => state.weather);

  const rainPointsRef = useRef<THREE.Points>(null);

  // Configure lighting parameters based on time of day
  const { sunPosition, sunColor, sunIntensity, ambientColor, ambientIntensity, fogColor, fogDensity } = useMemo(() => {
    switch (timeOfDay) {
      case 'DAWN':
        return {
          sunPosition: [-250, 60, -150] as [number, number, number],
          sunColor: '#f59e0b',
          sunIntensity: 1.4,
          ambientColor: '#4338ca',
          ambientIntensity: 0.65,
          fogColor: '#1e1b4b',
          fogDensity: 0.0018,
        };
      case 'MORNING_PEAK':
        return {
          sunPosition: [-120, 180, -100] as [number, number, number],
          sunColor: '#fffbeb',
          sunIntensity: 2.2,
          ambientColor: '#cbd5e1',
          ambientIntensity: 0.85,
          fogColor: '#0f172a',
          fogDensity: 0.0012,
        };
      case 'MIDDAY':
        return {
          sunPosition: [20, 300, 30] as [number, number, number],
          sunColor: '#ffffff',
          sunIntensity: 2.5,
          ambientColor: '#f1f5f9',
          ambientIntensity: 0.95,
          fogColor: '#090d16',
          fogDensity: 0.0010,
        };
      case 'EVENING_PEAK':
        return {
          sunPosition: [240, 70, 150] as [number, number, number],
          sunColor: '#ea580c',
          sunIntensity: 1.8,
          ambientColor: '#7c2d12',
          ambientIntensity: 0.7,
          fogColor: '#271206',
          fogDensity: 0.0016,
        };
      case 'NIGHT':
        return {
          sunPosition: [0, 80, 0] as [number, number, number],
          sunColor: '#38bdf8',
          sunIntensity: 0.25,
          ambientColor: '#0f172a',
          ambientIntensity: 0.35,
          fogColor: '#020617',
          fogDensity: 0.0022,
        };
    }
  }, [timeOfDay]);

  // Rain particle system (1,200 falling droplets)
  const { rainGeometry } = useMemo(() => {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 600;
      positions[i * 3 + 1] = Math.random() * 120;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 600;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return { rainGeometry: geo };
  }, []);

  const isRaining = weather === 'RAIN' || weather === 'HEAVY_RAIN';

  useFrame((_, delta) => {
    if (!rainPointsRef.current || !isRaining) return;

    const pos = rainPointsRef.current.geometry.attributes.position;
    const speed = weather === 'HEAVY_RAIN' ? 180 : 110;

    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      y -= speed * delta;
      if (y < 0) y = 120;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <>
      <fogExp2 attach="fog" args={[fogColor, fogDensity]} />
      <ambientLight color={ambientColor} intensity={ambientIntensity} />
      <directionalLight
        position={sunPosition}
        color={sunColor}
        intensity={sunIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-400}
        shadow-camera-right={400}
        shadow-camera-top={400}
        shadow-camera-bottom={-400}
        shadow-camera-near={10}
        shadow-camera-far={600}
        shadow-bias={-0.0005}
      />

      {/* Rain Particles during rain or flood */}
      {isRaining && (
        <points ref={rainPointsRef} geometry={rainGeometry}>
          <pointsMaterial
            color="#93c5fd"
            size={1.4}
            transparent
            opacity={weather === 'HEAVY_RAIN' ? 0.75 : 0.45}
          />
        </points>
      )}
    </>
  );
};
