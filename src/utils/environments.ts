import * as THREE from 'three';
import { WorldId } from '../types';

export function createEnvironmentWorld(worldId: WorldId | 'studio', podiumColorHex: string = '#fde68a'): THREE.Group {
  const envGroup = new THREE.Group();
  envGroup.name = `env_${worldId}`;

  if (worldId === 'studio') {
    // 3D Round Podium Display Stand (Yuvarlak Podyum Masası)
    const podiumGeo = new THREE.CylinderGeometry(3.2, 3.4, 0.25, 48);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: podiumColorHex,
      roughness: 0.4,
      metalness: 0.05,
    });
    const podium = new THREE.Mesh(podiumGeo, podiumMat);
    podium.position.y = -0.125; // Top surface sits at y: 0 directly under model feet
    podium.receiveShadow = true;
    envGroup.add(podium);

    // Decorative base ring
    const baseGeo = new THREE.CylinderGeometry(3.35, 3.55, 0.1, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.5,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.22;
    base.receiveShadow = true;
    envGroup.add(base);

    return envGroup;
  }

  if (worldId === 'space') {
    // Starfield particles
    const starCount = 300;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 25 + 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      colors[i * 3] = Math.random() * 0.5 + 0.5;
      colors[i * 3 + 1] = Math.random() * 0.5 + 0.5;
      colors[i * 3 + 2] = 1.0;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    envGroup.add(starPoints);

    // Giant Saturn planet in distance
    const saturnGeo = new THREE.SphereGeometry(2.5, 32, 32);
    const saturnMat = new THREE.MeshStandardMaterial({
      color: '#fde047',
      roughness: 0.6,
    });
    const saturn = new THREE.Mesh(saturnGeo, saturnMat);
    saturn.position.set(-8, 9, -14);
    envGroup.add(saturn);

    // Saturn Ring
    const ringGeo = new THREE.RingGeometry(3.2, 5.0, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: '#fef08a',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    ring.position.set(-8, 9, -14);
    envGroup.add(ring);

    // Glowing Neon Floor
    const moonGeo = new THREE.CylinderGeometry(5.0, 5.0, 0.2, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      color: '#312e81',
      roughness: 0.4,
      metalness: 0.3,
    });
    const moonPlatform = new THREE.Mesh(moonGeo, moonMat);
    moonPlatform.position.y = -0.1;
    envGroup.add(moonPlatform);

    return envGroup;
  }

  if (worldId === 'chocolate') {
    // Chocolate ground
    const chocGeo = new THREE.CylinderGeometry(5.5, 5.5, 0.3, 32);
    const chocMat = new THREE.MeshStandardMaterial({
      color: '#582f0e',
      roughness: 0.4,
    });
    const chocGround = new THREE.Mesh(chocGeo, chocMat);
    chocGround.position.y = -0.15;
    envGroup.add(chocGround);

    // Giant Lollipop trees
    const lollipopColors = ['#f43f5e', '#ec4899', '#06b6d4', '#f59e0b'];
    lollipopColors.forEach((color, i) => {
      const stickGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.8, 12);
      const stickMat = new THREE.MeshStandardMaterial({ color: '#ffffff' });
      const stick = new THREE.Mesh(stickGeo, stickMat);

      const candyGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.2, 24);
      candyGeo.rotateX(Math.PI / 2);
      const candyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.2 });
      const candy = new THREE.Mesh(candyGeo, candyMat);
      candy.position.y = 1.4;

      const lolliGroup = new THREE.Group();
      lolliGroup.add(stick);
      lolliGroup.add(candy);

      const angle = (i * Math.PI * 2) / 4 + 0.4;
      lolliGroup.position.set(Math.sin(angle) * 3.8, 1.4, Math.cos(angle) * 3.8);
      envGroup.add(lolliGroup);
    });

    // Marshmallow clouds on floor
    for (let i = 0; i < 6; i++) {
      const puffGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.5, 16);
      const puffMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? '#fce7f3' : '#cffafe',
        roughness: 0.8,
      });
      const puff = new THREE.Mesh(puffGeo, puffMat);
      const angle = (i * Math.PI * 2) / 6;
      puff.position.set(Math.sin(angle) * 2.8, 0.25, Math.cos(angle) * 2.8);
      envGroup.add(puff);
    }

    return envGroup;
  }

  if (worldId === 'clouds') {
    // Cloud island platform
    const platformGeo = new THREE.CylinderGeometry(4.5, 4.0, 0.4, 32);
    const platformMat = new THREE.MeshStandardMaterial({
      color: '#e0f2fe',
      roughness: 0.9,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.2;
    envGroup.add(platform);

    // Rainbow arch in the background
    const rainbowColors = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6'];
    rainbowColors.forEach((color, i) => {
      const radius = 6.5 - i * 0.25;
      const arcGeo = new THREE.TorusGeometry(radius, 0.12, 16, 48, Math.PI);
      const arcMat = new THREE.MeshBasicMaterial({ color });
      const arc = new THREE.Mesh(arcGeo, arcMat);
      arc.position.set(0, 0.5, -4);
      envGroup.add(arc);
    });

    // Fluffy cloud puffs around
    for (let i = 0; i < 10; i++) {
      const puffGeo = new THREE.SphereGeometry(0.6 + (i % 3) * 0.2, 16, 16);
      const puffMat = new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.9,
      });
      const puff = new THREE.Mesh(puffGeo, puffMat);
      const angle = (i * Math.PI * 2) / 10;
      puff.position.set(Math.sin(angle) * 4.2, 0.3, Math.cos(angle) * 4.2);
      envGroup.add(puff);
    }

    return envGroup;
  }

  if (worldId === 'forest') {
    // Mossy grass ground
    const grassGeo = new THREE.CylinderGeometry(5.2, 5.2, 0.25, 32);
    const grassMat = new THREE.MeshStandardMaterial({
      color: '#15803d',
      roughness: 0.8,
    });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.position.y = -0.12;
    envGroup.add(grass);

    // Glowing mushrooms
    for (let i = 0; i < 7; i++) {
      const stemGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.7, 12);
      const stem = new THREE.Mesh(stemGeo, new THREE.MeshStandardMaterial({ color: '#fef08a' }));
      stem.position.y = 0.35;

      const capGeo = new THREE.ConeGeometry(0.45, 0.4, 16);
      const capMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? '#f43f5e' : '#8b5cf6',
        roughness: 0.3,
        emissive: i % 2 === 0 ? '#991b1b' : '#581c87',
        emissiveIntensity: 0.3,
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.75;

      const shroom = new THREE.Group();
      shroom.add(stem);
      shroom.add(cap);

      const angle = (i * Math.PI * 2) / 7 + 0.3;
      shroom.position.set(Math.sin(angle) * 3.6, 0, Math.cos(angle) * 3.6);
      envGroup.add(shroom);
    }

    return envGroup;
  }

  if (worldId === 'dino') {
    // Prehistoric volcanic rock ground
    const groundGeo = new THREE.CylinderGeometry(5.0, 5.0, 0.25, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#78350f',
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.12;
    envGroup.add(ground);

    // Distant mini cartoon volcano
    const volcGeo = new THREE.ConeGeometry(2.5, 3.2, 24, 1, true);
    const volcMat = new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.9 });
    const volc = new THREE.Mesh(volcGeo, volcMat);
    volc.position.set(0, 1.6, -7);
    envGroup.add(volc);

    // Glowing crater
    const lavaGeo = new THREE.CircleGeometry(0.8, 16);
    lavaGeo.rotateX(-Math.PI / 2);
    const lavaMat = new THREE.MeshBasicMaterial({ color: '#ea580c' });
    const lava = new THREE.Mesh(lavaGeo, lavaMat);
    lava.position.set(0, 3.15, -7);
    envGroup.add(lava);

    return envGroup;
  }

  if (worldId === 'kawaii') {
    // 1. Pastel Pink Round Podium
    const platformGeo = new THREE.CylinderGeometry(4.8, 5.0, 0.3, 32);
    const platformMat = new THREE.MeshStandardMaterial({
      color: '#fbcfe8', // Pastel Pink (Updated)
      roughness: 0.3,
      metalness: 0.05,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.15;
    platform.receiveShadow = true;
    envGroup.add(platform);

    // Decorative base ring (White)
    const baseGeo = new THREE.CylinderGeometry(4.9, 5.1, 0.1, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.25;
    envGroup.add(base);

    // 2. Large Kawaii Rainbow Arch
    const rainbowColors = ['#ff94a8', '#ffb3ba', '#ffffba', '#baffc9', '#bae1ff', '#e0baff'];
    rainbowColors.forEach((color, i) => {
      const radius = 8.5 - i * 0.35; // Slightly larger
      const arcGeo = new THREE.TorusGeometry(radius, 0.2, 16, 64, Math.PI);
      const arcMat = new THREE.MeshBasicMaterial({ color });
      const arc = new THREE.Mesh(arcGeo, arcMat);
      arc.position.set(0, -0.5, -6); // Positioned in background
      envGroup.add(arc);
    });

    // 3. Floating Hearts and Glowing Stars
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(-0.5, -0.5, -1, 0.3, 0, 1);
    heartShape.bezierCurveTo(1, 0.3, 0.5, -0.5, 0, 0);

    for (let i = 0; i < 20; i++) {
      const isHeart = Math.random() > 0.4;
      let mesh;
      
      if (isHeart) {
        const heartGeo = new THREE.ExtrudeGeometry(heartShape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05 });
        const heartMat = new THREE.MeshStandardMaterial({ 
          color: i % 2 === 0 ? '#ff94a8' : '#ec4899', 
          roughness: 0.3,
          emissive: i % 2 === 0 ? '#f472b6' : '#db2777',
          emissiveIntensity: 0.2
        });
        mesh = new THREE.Mesh(heartGeo, heartMat);
        mesh.scale.set(0.35, 0.35, 0.35);
      } else {
        // Glowing Star (Low poly sphere with high emission)
        const starGeo = new THREE.SphereGeometry(0.35, 5, 2); 
        const starMat = new THREE.MeshStandardMaterial({ 
          color: '#fef08a', 
          roughness: 0.1, 
          emissive: '#facc15', 
          emissiveIntensity: 0.8 // Glowing
        });
        mesh = new THREE.Mesh(starGeo, starMat);
      }

      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 6;
      mesh.position.set(Math.cos(angle) * radius, 1 + Math.random() * 8, Math.sin(angle) * radius - 2);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      mesh.userData.isFloating = true;
      mesh.userData.speed = 0.5 + Math.random() * 1.5;
      mesh.userData.phase = Math.random() * Math.PI * 2;
      mesh.name = 'decoration';
      envGroup.add(mesh);
    }

    // 4. Ground Flowers
    const flowerColors = ['#ff94a8', '#facc15', '#bae1ff', '#e0baff', '#34d399'];
    for (let i = 0; i < 15; i++) {
      const flowerGroup = new THREE.Group();
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), new THREE.MeshStandardMaterial({ color: '#34d399' }));
      stem.position.y = 0.2;
      flowerGroup.add(stem);

      const petalCount = 5;
      const petalCol = flowerColors[i % flowerColors.length];
      for (let j = 0; j < petalCount; j++) {
        const petal = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: petalCol }));
        const angle = (j / petalCount) * Math.PI * 2;
        petal.position.set(Math.cos(angle) * 0.15, 0.4, Math.sin(angle) * 0.15);
        petal.scale.set(1, 0.3, 1);
        flowerGroup.add(petal);
      }
      const center = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshStandardMaterial({ color: '#facc15' }));
      center.position.y = 0.4;
      flowerGroup.add(center);

      const angle = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 3.0;
      flowerGroup.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      flowerGroup.scale.setScalar(0.6 + Math.random() * 0.6);
      flowerGroup.rotation.y = Math.random() * Math.PI;
      envGroup.add(flowerGroup);
    }

    return envGroup;
  }

  return envGroup;
}
