// Living Traffic Simulation Engine for TN NEXUS Digital Twin
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useCityStore } from '../../store/useCityStore';
import { RoadSegment } from '../../data/providers/ICityDataProvider';

interface VehicleAgent {
  id: number;
  type: 'car' | 'bus' | 'truck' | 'auto' | 'ambulance';
  roadIndex: number;
  progress: number; // 0 to 1
  speed: number;
  laneOffset: number;
  direction: 1 | -1;
  color: THREE.Color;
}

export const TrafficSystem: React.FC = () => {
  const roadSegments = useCityStore((state) => state.roadSegments);
  const timeOfDay = useCityStore((state) => state.timeOfDay);
  const isSimulating = useCityStore((state) => state.isSimulating);
  const networkCongestion = useCityStore((state) => state.simulationState.networkCongestionIndex);
  const blockedRoads = useCityStore((state) => state.disasterImpact.blockedRoadIds);

  const carMeshRef = useRef<THREE.InstancedMesh>(null);
  const busMeshRef = useRef<THREE.InstancedMesh>(null);
  const autoMeshRef = useRef<THREE.InstancedMesh>(null);

  // Time-of-day traffic speed multiplier
  const timeMultiplier = useMemo(() => {
    switch (timeOfDay) {
      case 'MORNING_PEAK': return 1.4;
      case 'EVENING_PEAK': return 1.5;
      case 'MIDDAY': return 1.0;
      case 'DAWN': return 0.6;
      case 'NIGHT': return 0.4;
      default: return 1.0;
    }
  }, [timeOfDay]);

  // Generate vehicle fleet
  const { cars, buses, autos } = useMemo(() => {
    const carList: VehicleAgent[] = [];
    const busList: VehicleAgent[] = [];
    const autoList: VehicleAgent[] = [];

    const carColors = [
      new THREE.Color('#f8fafc'), // white
      new THREE.Color('#94a3b8'), // silver
      new THREE.Color('#3b82f6'), // civic blue
      new THREE.Color('#dc2626'), // red
      new THREE.Color('#1e293b'), // dark slate
    ];

    const busColor = new THREE.Color('#16a34a'); // TNSTC Green
    const autoColor = new THREE.Color('#eab308'); // Auto Yellow

    let vid = 0;
    for (let rIdx = 0; rIdx < roadSegments.length; rIdx++) {
      const seg = roadSegments[rIdx];
      if (seg.type === 'railway') continue; // railway has trains, not cars

      const count = Math.min(22, Math.max(4, Math.round(seg.lanes * 3.5)));

      for (let i = 0; i < count; i++) {
        vid++;
        const prog = Math.random();
        const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
        const laneOffset = (Math.random() - 0.5) * (seg.lanes * 1.6);

        if (vid % 10 === 0) {
          // TNSTC Bus
          busList.push({
            id: vid,
            type: 'bus',
            roadIndex: rIdx,
            progress: prog,
            speed: 0.0018 + Math.random() * 0.0008,
            laneOffset,
            direction: dir,
            color: busColor,
          });
        } else if (vid % 4 === 0) {
          // Yellow Auto-rickshaw
          autoList.push({
            id: vid,
            type: 'auto',
            roadIndex: rIdx,
            progress: prog,
            speed: 0.0022 + Math.random() * 0.001,
            laneOffset,
            direction: dir,
            color: autoColor,
          });
        } else {
          // Standard Car
          const col = vid % 25 === 0 ? new THREE.Color('#ffffff') : carColors[Math.floor(Math.random() * carColors.length)];
          carList.push({
            id: vid,
            type: vid % 25 === 0 ? 'ambulance' : 'car',
            roadIndex: rIdx,
            progress: prog,
            speed: 0.0028 + Math.random() * 0.0015,
            laneOffset,
            direction: dir,
            color: col,
          });
        }
      }
    }

    return { cars: carList, buses: busList, autos: autoList };
  }, [roadSegments]);

  // Animate vehicles along road segments
  useFrame((_, delta) => {
    if (!isSimulating) return;

    // Congestion dampening factor
    const congestionFactor = Math.max(0.25, 1 - (networkCongestion / 100) * 0.6);
    const stepDelta = Math.min(0.1, delta) * timeMultiplier * congestionFactor;

    const dummy = new THREE.Object3D();

    // 1. Update Cars
    if (carMeshRef.current) {
      for (let i = 0; i < cars.length; i++) {
        const v = cars[i];
        const seg = roadSegments[v.roadIndex];
        const isBlocked = blockedRoads.includes(seg.id);

        if (!isBlocked) {
          v.progress += v.speed * v.direction * stepDelta * 60;
          if (v.progress > 1) v.progress = 0;
          if (v.progress < 0) v.progress = 1;
        }

        const start = new THREE.Vector3(...seg.start);
        const end = new THREE.Vector3(...seg.end);
        const curPos = new THREE.Vector3().lerpVectors(start, end, v.progress);

        // Apply lane lateral offset perpendicular to road direction
        const dir = new THREE.Vector3().subVectors(end, start).normalize();
        const perp = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(v.laneOffset);
        curPos.add(perp);
        curPos.y += 0.5;

        dummy.position.copy(curPos);
        dummy.rotation.set(0, Math.atan2(dir.x, dir.z) + (v.direction === -1 ? Math.PI : 0), 0);
        dummy.scale.set(1.8, 1.2, 4.2);
        dummy.updateMatrix();

        carMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      carMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Update Buses
    if (busMeshRef.current) {
      for (let i = 0; i < buses.length; i++) {
        const v = buses[i];
        const seg = roadSegments[v.roadIndex];
        const isBlocked = blockedRoads.includes(seg.id);

        if (!isBlocked) {
          v.progress += v.speed * v.direction * stepDelta * 60;
          if (v.progress > 1) v.progress = 0;
          if (v.progress < 0) v.progress = 1;
        }

        const start = new THREE.Vector3(...seg.start);
        const end = new THREE.Vector3(...seg.end);
        const curPos = new THREE.Vector3().lerpVectors(start, end, v.progress);

        const dir = new THREE.Vector3().subVectors(end, start).normalize();
        const perp = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(v.laneOffset);
        curPos.add(perp);
        curPos.y += 1.2;

        dummy.position.copy(curPos);
        dummy.rotation.set(0, Math.atan2(dir.x, dir.z) + (v.direction === -1 ? Math.PI : 0), 0);
        dummy.scale.set(2.4, 2.6, 9.5);
        dummy.updateMatrix();

        busMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      busMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. Update Autos
    if (autoMeshRef.current) {
      for (let i = 0; i < autos.length; i++) {
        const v = autos[i];
        const seg = roadSegments[v.roadIndex];
        const isBlocked = blockedRoads.includes(seg.id);

        if (!isBlocked) {
          v.progress += v.speed * v.direction * stepDelta * 60;
          if (v.progress > 1) v.progress = 0;
          if (v.progress < 0) v.progress = 1;
        }

        const start = new THREE.Vector3(...seg.start);
        const end = new THREE.Vector3(...seg.end);
        const curPos = new THREE.Vector3().lerpVectors(start, end, v.progress);

        const dir = new THREE.Vector3().subVectors(end, start).normalize();
        const perp = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(v.laneOffset);
        curPos.add(perp);
        curPos.y += 0.4;

        dummy.position.copy(curPos);
        dummy.rotation.set(0, Math.atan2(dir.x, dir.z) + (v.direction === -1 ? Math.PI : 0), 0);
        dummy.scale.set(1.4, 1.4, 2.6);
        dummy.updateMatrix();

        autoMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      autoMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Instanced Cars */}
      <instancedMesh
        ref={carMeshRef}
        args={[undefined, undefined, cars.length]}
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.8} />
      </instancedMesh>

      {/* Instanced TNSTC Green Buses */}
      <instancedMesh
        ref={busMeshRef}
        args={[undefined, undefined, buses.length]}
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#16a34a" roughness={0.4} metalness={0.6} />
      </instancedMesh>

      {/* Instanced Yellow Auto-Rickshaws */}
      <instancedMesh
        ref={autoMeshRef}
        args={[undefined, undefined, autos.length]}
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#eab308" roughness={0.4} metalness={0.5} />
      </instancedMesh>
    </group>
  );
};
