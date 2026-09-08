// Smooth Camera Controller & Cinematic Flythrough for TN NEXUS Digital Twin
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useCityStore } from '../../store/useCityStore';

export const CameraController: React.FC = () => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const cameraBookmark = useCityStore((state) => state.cameraBookmark);
  const cameraFocusTarget = useCityStore((state) => state.cameraFocusTarget);
  const isCinematicRunning = useCityStore((state) => state.isCinematicDemoRunning);
  const cinematicStep = useCityStore((state) => state.cinematicStep);

  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 180, 260));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Update target when camera bookmark changes
  useEffect(() => {
    if (cameraBookmark === 'default') {
      targetCamPos.current.set(0, 180, 260);
      targetLookAt.current.set(0, 0, 0);
    } else if (cameraBookmark === 'aerial') {
      targetCamPos.current.set(220, 240, 220);
      targetLookAt.current.set(0, 10, 0);
    } else if (cameraBookmark === 'top_down') {
      targetCamPos.current.set(0, 420, 1);
      targetLookAt.current.set(0, 0, 0);
    } else if (cameraBookmark === 'street') {
      targetCamPos.current.set(-10, 12, 35);
      targetLookAt.current.set(-10, 8, -40);
    } else if (cameraBookmark === 'focus' && cameraFocusTarget) {
      targetCamPos.current.set(
        cameraFocusTarget[0] + 60,
        cameraFocusTarget[1] + 55,
        cameraFocusTarget[2] + 75
      );
      targetLookAt.current.set(cameraFocusTarget[0], cameraFocusTarget[1], cameraFocusTarget[2]);
    }
  }, [cameraBookmark, cameraFocusTarget]);

  // Cinematic 90-second automated camera path waypoints
  useEffect(() => {
    if (!isCinematicRunning) return;

    switch (cinematicStep) {
      case 0: // City aerial establishing view
        targetCamPos.current.set(280, 220, 280);
        targetLookAt.current.set(0, 10, 0);
        break;
      case 1: // Focus on Avinashi corridor
        targetCamPos.current.set(160, 90, -80);
        targetLookAt.current.set(220, 10, -160);
        break;
      case 2: // Proposing highway & showing conflicts
        targetCamPos.current.set(-140, 110, 60);
        targetLookAt.current.set(-200, 10, 0);
        break;
      case 3: // Simulation of traffic & environment
        targetCamPos.current.set(0, 160, 140);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 4: // Optimizer recommendation
        targetCamPos.current.set(-60, 80, -20);
        targetLookAt.current.set(0, 10, -40);
        break;
      case 5: // Transformative conclusion
        targetCamPos.current.set(180, 200, 240);
        targetLookAt.current.set(0, 0, 0);
        break;
    }
  }, [isCinematicRunning, cinematicStep]);

  // Smooth lerp camera towards desired position
  useFrame(() => {
    if (controlsRef.current) {
      // Lerp camera position
      camera.position.lerp(targetCamPos.current, 0.04);
      // Lerp orbit control target
      controlsRef.current.target.lerp(targetLookAt.current, 0.04);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      maxPolarAngle={Math.PI / 2 - 0.05} // Don't allow camera to dip beneath ground plane
      minDistance={15}
      maxDistance={650}
      enableDamping
      dampingFactor={0.06}
    />
  );
};
