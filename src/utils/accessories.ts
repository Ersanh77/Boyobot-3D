import * as THREE from 'three';

export function createCrown(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'crown_accessory';

  const goldCol = colors?.crown || '#facc15';
  const mat = new THREE.MeshStandardMaterial({ 
    color: goldCol, 
    roughness: 0.2, 
    metalness: 0.8,
    name: 'crown'
  });

  const baseGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 32);
  const base = new THREE.Mesh(baseGeo, mat);
  base.name = 'crown';
  group.add(base);

  const spikeCount = 5;
  for (let i = 0; i < spikeCount; i++) {
    const spikeGeo = new THREE.ConeGeometry(0.08, 0.25, 8);
    const spike = new THREE.Mesh(spikeGeo, mat);
    const angle = (i * Math.PI * 2) / spikeCount;
    spike.position.set(Math.cos(angle) * 0.32, 0.18, Math.sin(angle) * 0.32);
    spike.rotation.x = 0.1;
    spike.name = 'crown';
    group.add(spike);

    const gemGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const gemMat = new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#ef4444', emissiveIntensity: 0.5 });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.set(Math.cos(angle) * 0.32, 0.32, Math.sin(angle) * 0.32);
    group.add(gem);
  }

  return group;
}

export function createBow(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'bow_accessory';

  const pinkCol = colors?.bow || '#ec4899';
  const mat = new THREE.MeshStandardMaterial({ color: pinkCol, roughness: 0.4, name: 'bow' });

  const loopGeo = new THREE.SphereGeometry(0.2, 16, 16);
  loopGeo.scale(1.2, 1, 0.5);

  const loopL = new THREE.Mesh(loopGeo, mat);
  loopL.position.set(-0.18, 0, 0);
  loopL.rotation.z = 0.3;
  loopL.name = 'bow';
  group.add(loopL);

  const loopR = new THREE.Mesh(loopGeo, mat);
  loopR.position.set(0.18, 0, 0);
  loopR.rotation.z = -0.3;
  loopR.name = 'bow';
  group.add(loopR);

  const centerGeo = new THREE.SphereGeometry(0.1, 12, 12);
  const center = new THREE.Mesh(centerGeo, mat);
  center.name = 'bow';
  group.add(center);

  return group;
}

export function createGlasses(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'glasses_accessory';

  const blackCol = colors?.glasses || '#1e293b';
  const frameMat = new THREE.MeshStandardMaterial({ color: blackCol, roughness: 0.2, metalness: 0.5, name: 'glasses' });
  const lensMat = new THREE.MeshStandardMaterial({ 
    color: '#94a3b8', 
    transparent: true, 
    opacity: 0.4, 
    roughness: 0,
    metalness: 0.1
  });

  for (let side = -1; side <= 1; side += 2) {
    const frameGeo = new THREE.TorusGeometry(0.18, 0.025, 12, 32);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(side * 0.22, 0, 0);
    frame.name = 'glasses';
    group.add(frame);

    const lensGeo = new THREE.CircleGeometry(0.16, 32);
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(side * 0.22, 0, 0.01);
    group.add(lens);

    const handleGeo = new THREE.BoxGeometry(0.02, 0.02, 0.5);
    const handle = new THREE.Mesh(handleGeo, frameMat);
    handle.position.set(side * 0.4, 0, -0.25);
    handle.name = 'glasses';
    group.add(handle);
  }

  const bridgeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8);
  bridgeGeo.rotateZ(Math.PI / 2);
  const bridge = new THREE.Mesh(bridgeGeo, frameMat);
  bridge.name = 'glasses';
  group.add(bridge);

  return group;
}

export function createWings(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'wings_accessory';

  const wingCol = colors?.wings || '#bae1ff';
  const mat = new THREE.MeshStandardMaterial({ 
    color: wingCol, 
    transparent: true, 
    opacity: 0.8, 
    roughness: 0.3,
    name: 'wings'
  });

  for (let side = -1; side <= 1; side += 2) {
    const wingGeo = new THREE.SphereGeometry(0.8, 16, 16);
    wingGeo.scale(1, 0.1, 0.6);
    const wing = new THREE.Mesh(wingGeo, mat);
    wing.position.set(side * 0.6, 0.2, -0.4);
    wing.rotation.y = side * 0.8;
    wing.rotation.z = side * 0.4;
    wing.name = 'wings';
    group.add(wing);
  }

  return group;
}
