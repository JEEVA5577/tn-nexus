// Procedural Terrain with Elevation Gradient and Interactive Raycasting for TN NEXUS
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { useCityStore } from '../../store/useCityStore';

export const Terrain: React.FC = () => {
  const provider = useCityStore((state) => state.provider);
  const activeAssetTemplate = useCityStore((state) => state.activeAssetTemplate);
  const updateGhostPosition = useCityStore((state) => state.updateGhostPosition);
  const placeActiveAsset = useCityStore((state) => state.placeActiveAsset);
  const selectExistingAsset = useCityStore((state) => state.selectExistingAsset);

  // Generate terrain geometry: 1200x1200m area with 128x128 subdivisions
  const { geometry, colors } = useMemo(() => {
    const size = 1200;
    const segments = 128;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colorArr: number[] = [];

    const cWestHills = new THREE.Color('#2d4030');     // Western Ghats foothills dark forest green
    const cAgriGreen = new THREE.Color('#385e38');     // Thondamuthur agricultural green
    const cAgriDry = new THREE.Color('#4d543b');       // Cultivated cotton/fringe soil
    const cUrbanCore = new THREE.Color('#1a2333');     // Urban asphalt/concrete dark base
    const cRiverSand = new THREE.Color('#253545');     // Riverbed sandy sediment
    const cIndustrial = new THREE.Color('#222c3d');    // Industrial estate pavement

    const tempColor = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Query deterministic elevation
      const y = provider.environment.getElevationAt(x, z);
      pos.setY(i, y);

      // Color mapping by zone and elevation
      const distToCenter = Math.hypot(x, z);
      const riverDist = Math.abs(z - (-40 + Math.sin(x * 0.01) * 30));

      if (riverDist < 28) {
        tempColor.copy(cRiverSand);
      } else if (x < -200) {
        // Western agricultural and hill fringe
        if (y > 15) {
          tempColor.lerpColors(cAgriGreen, cWestHills, Math.min(1, (y - 15) / 25));
        } else {
          tempColor.lerpColors(cAgriGreen, cAgriDry, (Math.sin(x * 0.05) + 1) * 0.5);
        }
      } else if (x > 140 && z > 20) {
        tempColor.copy(cIndustrial);
      } else if (distToCenter < 140) {
        tempColor.copy(cUrbanCore);
      } else {
        // Suburban transition
        tempColor.lerpColors(cUrbanCore, cAgriGreen, 0.25);
      }

      colorArr.push(tempColor.r, tempColor.g, tempColor.b);
    }

    geo.computeVertexNormals();
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colorArr, 3));
    return { geometry: geo, colors: colorArr };
  }, [provider]);

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!activeAssetTemplate) return;
    e.stopPropagation();
    const point = e.point;
    updateGhostPosition([point.x, point.y, point.z]);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (activeAssetTemplate) {
      placeActiveAsset();
    } else {
      selectExistingAsset(null);
    }
  };

  return (
    <mesh
      geometry={geometry}
      receiveShadow
      onPointerMove={handlePointerMove}
      onClick={handleClick}
    >
      <meshStandardMaterial
        vertexColors
        roughness={0.88}
        metalness={0.12}
        flatShading={false}
      />
    </mesh>
  );
};
