import * as THREE from 'three';

// Procedural texture generators
export function createGlitterTexture(baseColorHex: string, glitterColorHex: string = '#ffffff'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, 512, 512);

  // Sparkles
  for (let i = 0; i < 700; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const radius = Math.random() * 3 + 1;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = Math.random() > 0.4 ? glitterColorHex : '#ffff88';
    ctx.globalAlpha = Math.random() * 0.8 + 0.2;
    ctx.fill();
  }

  // Large star sparkles
  ctx.globalAlpha = 0.9;
  for (let i = 0; i < 15; i++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    const size = Math.random() * 12 + 8;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.quadraticCurveTo(cx, cy, cx + size, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + size);
    ctx.quadraticCurveTo(cx, cy, cx - size, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - size);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createPatternTexture(type: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  if (type === 'rainbow') {
    const colors = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#38bdf8', '#a855f7'];
    const bandHeight = 512 / colors.length;
    colors.forEach((col, idx) => {
      ctx.fillStyle = col;
      ctx.fillRect(0, idx * bandHeight, 512, bandHeight + 2);
    });
  } else if (type === 'hearts') {
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(0, 0, 512, 512);

    const drawHeart = (cx: number, cy: number, size: number, color: string) => {
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.bezierCurveTo(cx - size / 2, cy - size / 2, cx - size, cy + size / 3, cx, cy + size);
      ctx.bezierCurveTo(cx + size, cy + size / 3, cx + size / 2, cy - size / 2, cx, cy);
      ctx.fill();
      ctx.restore();
    };

    for (let i = 0; i < 35; i++) {
      const x = (i % 6) * 85 + (Math.floor(i / 6) % 2 === 0 ? 0 : 40) + (i % 5) * 2;
      const y = Math.floor(i / 6) * 85 + (i % 7) * 3;
      const color = i % 2 === 0 ? '#e11d48' : '#ffffff';
      drawHeart(x, y, 20 + (i % 3) * 6, color);
    }
  } else if (type === 'stars') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 512);

    const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    for (let i = 0; i < 36; i++) {
      const x = (i % 6) * 85 + 25;
      const y = Math.floor(i / 6) * 85 + 25;
      const size = 12 + (i % 3) * 4;
      const col = i % 3 === 0 ? '#facc15' : '#ffffff';
      drawStar(x, y, 5, size, size / 2, col);
    }
  } else if (type === 'polka_dots') {
    ctx.fillStyle = '#fff1f2';
    ctx.fillRect(0, 0, 512, 512);

    const dotColors = ['#f43f5e', '#0ea5e9', '#eab308', '#10b981', '#8b5cf6', '#ec4899'];
    let colorIdx = 0;
    for (let x = 32; x < 512; x += 64) {
      for (let y = 32; y < 512; y += 64) {
        ctx.fillStyle = dotColors[colorIdx % dotColors.length];
        ctx.beginPath();
        ctx.arc(x + ((y / 64) % 2 === 0 ? 0 : 16), y, 16, 0, Math.PI * 2);
        ctx.fill();
        colorIdx++;
      }
    }
  } else if (type === 'stripes') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 512);

    const stripeColors = ['#ec4899', '#ffffff', '#3b82f6', '#ffffff', '#facc15', '#ffffff'];
    const lineWidth = 32;
    ctx.save();
    ctx.rotate(-Math.PI / 4);
    for (let i = -1024; i < 1024; i += lineWidth) {
      const color = stripeColors[Math.abs(Math.floor(i / lineWidth)) % stripeColors.length];
      ctx.fillStyle = color;
      ctx.fillRect(i, -1024, lineWidth, 2048);
    }
    ctx.restore();
  } else {
    // 'spots' - Dalmatian / Cow spots
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#1e293b';
    for (let i = 0; i < 30; i++) {
      const x = (i % 6) * 85 + 20;
      const y = Math.floor(i / 6) * 85 + 20;
      const rx = 20 + (i % 3) * 6;
      const ry = 18 + (i % 2) * 8;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, (i * 0.4) % Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}



// Helper to add high quality 3D paintable face parts (Kawaii Style)
export function addAnimalFace(group: THREE.Group, headMesh: THREE.Object3D, offsetZ: number = 0.85, offsetY: number = 0, scale: number = 1.0, colors?: Record<string, string>, isBird: boolean = false) {
  const faceGroup = new THREE.Group();
  faceGroup.name = 'face_expression';
  faceGroup.position.set(0, headMesh.position.y + offsetY, headMesh.position.z + offsetZ);

  // Materials
  const pupilMat = new THREE.MeshStandardMaterial({ color: colors?.eye_pupil || '#111827', roughness: 0.1 });
  const noseMat = new THREE.MeshStandardMaterial({ color: colors?.nose || '#a16207', roughness: 0.3 });
  const blushMat = new THREE.MeshStandardMaterial({ color: '#ff94a8', roughness: 0.4 });
  const mouthMat = new THREE.MeshStandardMaterial({ color: colors?.mouth || '#555555', roughness: 0.5 });

  const eyeSpacing = 0.35 * scale;
  const eyeY = 0.15 * scale;
  const eyeRadius = 0.25 * scale;

  // Eyes (Kawaii - Large Black Pupils)
  for (let side = -1; side <= 1; side += 2) {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(side * eyeSpacing, eyeY, 0);

    const pupilGeo = new THREE.SphereGeometry(eyeRadius, 20, 20);
    pupilGeo.scale(1, 1.2, 0.3);
    const pupil = new THREE.Mesh(pupilGeo, pupilMat.clone());
    pupil.name = side === -1 ? 'eye_pupil_L' : 'eye_pupil_R';
    eyeGroup.add(pupil);

    // Glints (2 white spheres - not paintable)
    const glint1 = new THREE.Mesh(new THREE.SphereGeometry(eyeRadius * 0.35, 8, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
    glint1.position.set(side * (eyeRadius * 0.25), eyeRadius * 0.4, 0.1 * scale);
    eyeGroup.add(glint1);

    const glint2 = new THREE.Mesh(new THREE.SphereGeometry(0.08 * scale, 8, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
    glint2.position.set(side * (-eyeRadius * 0.2), -eyeRadius * 0.2, 0.1 * scale);
    eyeGroup.add(glint2);

    faceGroup.add(eyeGroup);

    // Blush
    const blush = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius * 0.7, 16), blushMat.clone());
    blush.position.set(side * eyeSpacing, eyeY - eyeRadius * 0.7, 0.01 * scale);
    blush.name = side === -1 ? 'blush_L' : 'blush_R';
    faceGroup.add(blush);
  }

  // Non-bird features
  if (!isBird) {
    // Tiny Nose (Triangle-like)
    const noseGeo = new THREE.SphereGeometry(0.12 * scale, 8, 8);
    noseGeo.scale(1.2, 0.8, 0.5);
    const nose = new THREE.Mesh(noseGeo, noseMat.clone());
    nose.position.set(0, -0.08 * scale, 0.1 * scale);
    nose.name = 'nose';
    faceGroup.add(nose);

    // Mouth (Simple curve)
    const mouthGeo = new THREE.TorusGeometry(0.15 * scale, 0.05 * scale, 8, 16, Math.PI);
    mouthGeo.rotateX(Math.PI);
    const mouth = new THREE.Mesh(mouthGeo, mouthMat.clone());
    mouth.position.set(0, -0.22 * scale, 0.1 * scale);
    mouth.name = 'mouth';
    faceGroup.add(mouth);
  }

  group.add(faceGroup);
}


// 1. Cute Baby Dragon (Matches 1792265453060.jpg)
export function createBabyDragon(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'dragon';

  const bodyCol = colors?.body || '#48bb78';
  const bellyCol = colors?.belly || '#fef08a';
  const spikesCol = colors?.spikes || '#a855f7';
  const wingsCol = colors?.wings || '#f472b6';
  const hornsCol = colors?.horns || '#facc15';

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.35, metalness: 0.05 });
  const bellyMat = new THREE.MeshStandardMaterial({ color: bellyCol, roughness: 0.4 });
  const spikesMat = new THREE.MeshStandardMaterial({ color: spikesCol, roughness: 0.25 });
  const wingsMat = new THREE.MeshStandardMaterial({ color: wingsCol, roughness: 0.3, side: THREE.DoubleSide });
  const hornsMat = new THREE.MeshStandardMaterial({ color: hornsCol, roughness: 0.2, metalness: 0.2 });

  // Body
  const bodyGeo = new THREE.SphereGeometry(1.2, 32, 32);
  bodyGeo.scale(1.05, 1.2, 1.1);
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 1.3;
  bodyMesh.castShadow = true;
  bodyMesh.name = 'body';
  group.add(bodyMesh);

  // Belly
  const bellyGeo = new THREE.SphereGeometry(0.9, 24, 24);
  bellyGeo.scale(0.85, 1.1, 0.45);
  const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat);
  bellyMesh.position.set(0, 1.25, 0.85);
  bellyMesh.name = 'belly';
  group.add(bellyMesh);

  // Head
  const headGeo = new THREE.SphereGeometry(0.95, 32, 32);
  headGeo.scale(1.15, 0.95, 1.1);
  const headMesh = new THREE.Mesh(headGeo, bodyMat.clone());
  headMesh.position.set(0, 2.7, 0.3);
  headMesh.castShadow = true;
  headMesh.name = 'head';
  if (colors?.head) (headMesh.material as THREE.MeshStandardMaterial).color.set(colors.head);
  group.add(headMesh);

  // 3D Face
  addAnimalFace(group, headMesh, 0.98, 0, 1.05, colors);

  // Snout
  const snoutGeo = new THREE.SphereGeometry(0.55, 24, 24);
  snoutGeo.scale(1.1, 0.65, 0.9);
  const snoutMesh = new THREE.Mesh(snoutGeo, bodyMat);
  snoutMesh.position.set(0, 2.45, 1.0);
  snoutMesh.name = 'snout';
  group.add(snoutMesh);

  // Horns
  const hornGeo = new THREE.ConeGeometry(0.18, 0.6, 16);
  for (let side = -1; side <= 1; side += 2) {
    const horn = new THREE.Mesh(hornGeo, hornsMat);
    horn.position.set(side * 0.55, 3.5, 0.1);
    horn.rotation.z = side * -0.35;
    horn.rotation.x = -0.25;
    horn.name = 'horns';
    group.add(horn);
  }

  // Spikes
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.5, 12), spikesMat);
    s.position.set(0, 3.5 - i * 0.4, 0.1 - i * 0.35);
    s.rotation.x = -0.7;
    s.name = 'spikes';
    group.add(s);
  }

  // Wings
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.quadraticCurveTo(0.6, 1.0, 1.3, 0.8);
  wingShape.quadraticCurveTo(0.9, 0.3, 1.1, -0.2);
  wingShape.quadraticCurveTo(0.6, 0.0, 0, 0);
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02 });
  
  for (let side = -1; side <= 1; side += 2) {
    const wing = new THREE.Mesh(wingGeo, wingsMat);
    wing.position.set(side * 0.8, 1.7, -0.5);
    wing.rotation.set(0.2, side * -0.7, side * -0.2);
    if (side === 1) wing.scale.set(-1, 1, 1);
    wing.name = 'wings';
    group.add(wing);
  }

  // Feet/Legs (Articulated)
  const legPositions = [
    { x: -0.6, z: 0.5, name: 'feet_L' },
    { x: 0.6, z: 0.5, name: 'feet_R' },
  ];
  legPositions.forEach((pos) => {
    const thigh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), bodyMat);
    thigh.scale.set(1, 1.2, 1);
    thigh.position.set(pos.x, 0.7, pos.z);
    thigh.name = pos.name;
    group.add(thigh);

    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), bodyMat);
    foot.scale.set(1.0, 0.6, 1.4);
    foot.position.set(pos.x, 0.25, pos.z + 0.1);
    foot.name = pos.name;
    group.add(foot);
  });

  // Tail
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.8, -1.0),
    new THREE.Vector3(0, 0.5, -1.8),
    new THREE.Vector3(0.4, 1.0, -2.4),
  ]);
  const tailMesh = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 20, 0.2, 12, false), bodyMat);
  tailMesh.name = 'tail';
  group.add(tailMesh);

  const tailTip = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.5, 12), spikesMat);
  tailTip.position.set(0.4, 1.0, -2.4);
  tailTip.rotation.x = 0.5;
  tailTip.name = 'spikes';
  group.add(tailTip);

  return group;
}

// 2. Cartoon Rocket
export function createRocket(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'rocket';

  const bodyCol = colors?.body || '#f1f5f9';
  const noseCol = colors?.nose || '#ef4444';
  const glassCol = colors?.glass || '#38bdf8';
  const trimCol = colors?.trim || '#64748b';

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.25, metalness: 0.1 });
  const noseMat = new THREE.MeshStandardMaterial({ color: noseCol, roughness: 0.2 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: glassCol, transmission: 0.6, thickness: 0.8 });
  const trimMat = new THREE.MeshStandardMaterial({ color: trimCol, metalness: 0.4 });

  const bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.95, 2.2, 32), bodyMat);
  bodyMesh.position.y = 1.8;
  bodyMesh.castShadow = true;
  bodyMesh.name = 'body';
  group.add(bodyMesh);

  const noseMesh = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.4, 32), noseMat);
  noseMesh.position.y = 3.6;
  noseMesh.name = 'nose';
  group.add(noseMesh);

  const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.08, 16, 32), trimMat);
  ringMesh.position.set(0, 2.0, 0.92);
  ringMesh.name = 'trim';
  group.add(ringMesh);

  const glassMesh = new THREE.Mesh(new THREE.CircleGeometry(0.4, 24), glassMat);
  glassMesh.position.set(0, 2.0, 0.94);
  glassMesh.name = 'glass';
  group.add(glassMesh);

  for (let i = 0; i < 3; i++) {
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.quadraticCurveTo(0.6, 0.2, 0.9, -0.6);
    finShape.lineTo(0.9, -0.9);
    finShape.quadraticCurveTo(0.4, -0.7, 0, -0.6);
    finShape.closePath();
    const fin = new THREE.Mesh(new THREE.ExtrudeGeometry(finShape, { depth: 0.1, bevelEnabled: true }), noseMat);
    const angle = (i * Math.PI * 2) / 3;
    fin.rotation.y = angle;
    fin.position.set(Math.sin(angle) * 0.75, 1.2, Math.cos(angle) * 0.75);
    fin.name = 'fins';
    group.add(fin);
  }

  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 0.5, 24), trimMat);
  nozzle.position.y = 0.45;
  nozzle.name = 'nozzle';
  group.add(nozzle);

  return group;
}

// 3. Masal Şatosu / Disney Prenses Şatosu (Fairytale Princess Castle)
export function createCastle(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'castle';

  const wallsCol = colors?.walls || '#fbcfe8'; // Pastel pembe / lila
  const roofsCol = colors?.roofs || '#ec4899'; // Canlı pembe / mor sivri çatılar
  const gateCol = colors?.gate || '#f59e0b'; // Altın masal kapısı
  const bridgeCol = colors?.bridge || '#f8fafc'; // Beyaz taş köprü
  const flagsCol = colors?.flags || '#a855f7'; // Dalgalanan mor / lila bayraklar
  const windowsCol = colors?.windows || '#fef08a'; // Pencerelerden sızan sarı ışık
  const gardenCol = colors?.garden || '#22c55e'; // Çiçek bahçesi & sarmaşıklar
  const decorCol = colors?.decorations || '#fbbf24'; // Büyülü yıldızlar & peri

  const wallsMat = new THREE.MeshStandardMaterial({ color: wallsCol, roughness: 0.45 });
  const roofsMat = new THREE.MeshStandardMaterial({ color: roofsCol, roughness: 0.25 });
  const gateMat = new THREE.MeshStandardMaterial({ color: gateCol, roughness: 0.35, metalness: 0.25 });
  const bridgeMat = new THREE.MeshStandardMaterial({ color: bridgeCol, roughness: 0.5 });
  const flagsMat = new THREE.MeshStandardMaterial({ color: flagsCol, roughness: 0.3, side: THREE.DoubleSide });
  const windowsMat = new THREE.MeshStandardMaterial({
    color: windowsCol,
    emissive: windowsCol,
    emissiveIntensity: 0.85,
    roughness: 0.15,
  });
  const gardenMat = new THREE.MeshStandardMaterial({ color: gardenCol, roughness: 0.5 });
  const goldTrimMat = new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.6, roughness: 0.2 });
  const decorMat = new THREE.MeshStandardMaterial({ color: decorCol, emissive: decorCol, emissiveIntensity: 0.65, roughness: 0.15 });
  const flowerColors = ['#f43f5e', '#ec4899', '#a855f7', '#facc15', '#ffffff'];

  // 1. Çiçek Bahçesi Kaidesi (Surrounding Flower Garden Base)
  const gardenBaseGeo = new THREE.CylinderGeometry(3.3, 3.45, 0.14, 48);
  const gardenBase = new THREE.Mesh(gardenBaseGeo, gardenMat);
  gardenBase.position.y = 0.07;
  gardenBase.name = 'garden';
  gardenBase.receiveShadow = true;
  group.add(gardenBase);

  // Rengarenk Çiçek Kümeleri (Flower bushes around castle)
  for (let i = 0; i < 22; i++) {
    const angle = (i / 22) * Math.PI * 2 + 0.1;
    // Don't place right in front of the bridge (angle ~ Math.PI / 2)
    if (Math.abs(angle - Math.PI / 2) < 0.35) continue;
    const r = 2.4 + (i % 3) * 0.3;
    const bushGeo = new THREE.SphereGeometry(0.22, 12, 12);
    bushGeo.scale(1.2, 0.7, 1.2);
    const bush = new THREE.Mesh(bushGeo, gardenMat);
    bush.position.set(Math.cos(angle) * r, 0.2, Math.sin(angle) * r);
    bush.name = 'garden';
    group.add(bush);

    // Blossom on bush
    const flowerMat = new THREE.MeshStandardMaterial({
      color: flowerColors[i % flowerColors.length],
      roughness: 0.3,
    });
    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), flowerMat);
    flower.position.set(Math.cos(angle) * r, 0.35, Math.sin(angle) * r);
    flower.name = 'garden';
    group.add(flower);
  }

  // 2. Taş Giriş Köprüsü (Arched Entry Bridge / Drawbridge Ramp)
  const bridgeGroup = new THREE.Group();
  bridgeGroup.name = 'bridge';

  // Köprü Yolu Rampası
  const bridgeDeckGeo = new THREE.BoxGeometry(1.0, 0.14, 1.4);
  const bridgeDeck = new THREE.Mesh(bridgeDeckGeo, bridgeMat);
  bridgeDeck.position.set(0, 0.25, 1.55);
  bridgeDeck.rotation.x = 0.12; // Eğimli rampa
  bridgeDeck.name = 'bridge';
  bridgeDeck.castShadow = true;
  bridgeDeck.receiveShadow = true;
  bridgeGroup.add(bridgeDeck);

  // Köprü Yan Korkulukları (Stone Balustrades)
  for (let s = -1; s <= 1; s += 2) {
    const railGeo = new THREE.BoxGeometry(0.12, 0.25, 1.42);
    const rail = new THREE.Mesh(railGeo, bridgeMat);
    rail.position.set(s * 0.52, 0.42, 1.55);
    rail.rotation.x = 0.12;
    rail.name = 'bridge';
    bridgeGroup.add(rail);

    // Altın Fenerli Korkuluk Babaları (Lantern Finials on Bridge)
    for (let p = 0; p < 3; p++) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.4, 8), bridgeMat);
      post.position.set(s * 0.52, 0.45 + p * 0.04, 1.05 + p * 0.5);
      post.name = 'bridge';
      bridgeGroup.add(post);

      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), windowsMat);
      lantern.position.set(s * 0.52, 0.7 + p * 0.04, 1.05 + p * 0.5);
      lantern.name = 'windows';
      bridgeGroup.add(lantern);
    }
  }
  group.add(bridgeGroup);

  // 3. Şato Ana Gövdesi (Central Fortress Walls)
  const fortressWall = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.8, 1.9), wallsMat);
  fortressWall.position.set(0, 1.05, -0.1);
  fortressWall.name = 'walls';
  fortressWall.castShadow = true;
  fortressWall.receiveShadow = true;
  group.add(fortressWall);

  // Duvar Üstü Mazgallar / Burçlar (Crenellations along wall tops)
  for (let s = -1; s <= 1; s += 2) {
    for (let c = 0; c < 4; c++) {
      const merlon = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.18), wallsMat);
      merlon.position.set(s * (0.6 + c * 0.35), 2.05, 0.85);
      merlon.name = 'walls';
      group.add(merlon);
    }
  }

  // 4. Kalp ve Kemerli Masal Kapısı (Grand Heart-Arched Royal Gate)
  const gateGroup = new THREE.Group();
  gateGroup.name = 'gate';
  gateGroup.position.set(0, 0.78, 0.86);

  // Kemerli Kapı Çerçevesi
  const archFrameGeo = new THREE.TorusGeometry(0.55, 0.07, 12, 24, Math.PI);
  const archFrame = new THREE.Mesh(archFrameGeo, goldTrimMat);
  archFrame.position.y = 0.45;
  archFrame.name = 'gate';
  gateGroup.add(archFrame);

  // Yan Kapı Söveleri
  for (let s = -1; s <= 1; s += 2) {
    const jamb = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.95, 12), goldTrimMat);
    jamb.position.set(s * 0.55, 0, 0);
    jamb.name = 'gate';
    gateGroup.add(jamb);
  }

  // Çift Kanatlı Masal Kapısı Paneli
  const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.98, 1.15, 0.08), gateMat);
  doorPanel.position.set(0, 0.08, -0.02);
  doorPanel.name = 'gate';
  gateGroup.add(doorPanel);

  // Kapı Üstünde Büyülü Altın Kalp Kabartması (Royal Heart Crest)
  const heartShape = new THREE.Shape();
  heartShape.moveTo(0, 0.1);
  heartShape.bezierCurveTo(-0.15, 0.25, -0.3, 0.05, 0, -0.28);
  heartShape.bezierCurveTo(0.3, 0.05, 0.15, 0.25, 0, 0.1);
  const heartGeo = new THREE.ExtrudeGeometry(heartShape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
  const heartMesh = new THREE.Mesh(heartGeo, goldTrimMat);
  heartMesh.position.set(0, 0.58, 0.04);
  heartMesh.name = 'gate';
  gateGroup.add(heartMesh);

  // Kapı Kolları (Golden Handles)
  for (let s = -1; s <= 1; s += 2) {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 8, 16), goldTrimMat);
    handle.position.set(s * 0.18, 0.05, 0.05);
    handle.name = 'gate';
    gateGroup.add(handle);
  }
  group.add(gateGroup);

  // 5. Kapı Üstü Gül Pencere (Stained Glass Rose Window with Warm Light)
  const roseFrame = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.045, 12, 24), goldTrimMat);
  roseFrame.position.set(0, 2.32, 0.86);
  roseFrame.name = 'windows';
  group.add(roseFrame);

  const roseGlass = new THREE.Mesh(new THREE.CircleGeometry(0.32, 24), windowsMat);
  roseGlass.position.set(0, 2.32, 0.87);
  roseGlass.name = 'windows';
  group.add(roseGlass);

  for (let i = 0; i < 4; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.64, 0.02), goldTrimMat);
    bar.rotation.z = (i * Math.PI) / 4;
    bar.position.set(0, 2.32, 0.88);
    bar.name = 'windows';
    group.add(bar);
  }

  // 6. 5 KULELİ MASAL MİMARİSİ (5 Fairytale Towers of Harmonious Heights)
  interface TowerConfig {
    x: number;
    y: number;
    z: number;
    height: number;
    radius: number;
    roofHeight: number;
    roofRadius: number;
    hasFlag: boolean;
    hasVines?: boolean;
    windowHeights: number[];
  }

  const towers: TowerConfig[] = [
    // 1. Büyük Merkez Kulesi (Grand Central Palace Keep)
    {
      x: 0,
      y: 2.5,
      z: -0.15,
      height: 3.2,
      radius: 0.75,
      roofHeight: 1.85,
      roofRadius: 0.62,
      hasFlag: true,
      windowHeights: [1.2, 2.2],
    },
    // 2. Ön Sol Kule (Front-Left Tower)
    {
      x: -1.35,
      y: 1.45,
      z: 0.85,
      height: 2.4,
      radius: 0.52,
      roofHeight: 1.4,
      roofRadius: 0.58,
      hasFlag: true,
      hasVines: true,
      windowHeights: [0.6, 1.4],
    },
    // 3. Ön Sağ Kule (Front-Right Tower)
    {
      x: 1.35,
      y: 1.45,
      z: 0.85,
      height: 2.4,
      radius: 0.52,
      roofHeight: 1.4,
      roofRadius: 0.58,
      hasFlag: true,
      hasVines: true,
      windowHeights: [0.6, 1.4],
    },
    // 4. Arka Sol Yüksek Kule (Back-Left High Tower)
    {
      x: -1.3,
      y: 1.85,
      z: -1.1,
      height: 3.1,
      radius: 0.48,
      roofHeight: 1.5,
      roofRadius: 0.54,
      hasFlag: true,
      windowHeights: [0.8, 1.8],
    },
    // 5. Arka Sağ Prenses Kulesi (Back-Right Princess Tower)
    {
      x: 1.3,
      y: 2.05,
      z: -1.1,
      height: 3.4,
      radius: 0.46,
      roofHeight: 1.6,
      roofRadius: 0.52,
      hasFlag: true,
      windowHeights: [0.9, 2.0],
    },
  ];

  towers.forEach((t, idx) => {
    const towerGroup = new THREE.Group();
    towerGroup.position.set(t.x, t.y, t.z);

    // Kule Silindirik Gövdesi (Cylinder Tower Body)
    const towerGeo = new THREE.CylinderGeometry(t.radius * 0.96, t.radius, t.height, 24);
    const towerMesh = new THREE.Mesh(towerGeo, wallsMat);
    towerMesh.name = 'walls';
    towerMesh.castShadow = true;
    towerMesh.receiveShadow = true;
    towerGroup.add(towerMesh);

    // Üst Balkon Halkası & Mazgallar (Corbel Ring & Balcony Crenellations)
    const balconyY = t.height / 2;
    const ringGeo = new THREE.TorusGeometry(t.radius * 1.08, 0.06, 8, 24);
    ringGeo.rotateX(Math.PI / 2);
    const corbelRing = new THREE.Mesh(ringGeo, goldTrimMat);
    corbelRing.position.y = balconyY;
    corbelRing.name = 'walls';
    towerGroup.add(corbelRing);

    // Mazgal taşları (Notched Merlons around balcony)
    const toothCount = 8;
    for (let i = 0; i < toothCount; i++) {
      const angle = (i / toothCount) * Math.PI * 2;
      const merlon = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.1), wallsMat);
      merlon.position.set(
        Math.cos(angle) * (t.radius * 1.05),
        balconyY + 0.08,
        Math.sin(angle) * (t.radius * 1.05)
      );
      merlon.rotation.y = -angle;
      merlon.name = 'walls';
      towerGroup.add(merlon);
    }

    // Sivri Masal Çatısı (Conical Spire Roof)
    const roofGeo = new THREE.ConeGeometry(t.roofRadius, t.roofHeight, 24);
    const roofMesh = new THREE.Mesh(roofGeo, roofsMat);
    const roofY = balconyY + t.roofHeight / 2;
    roofMesh.position.y = roofY;
    roofMesh.name = 'roofs';
    roofMesh.castShadow = true;
    towerGroup.add(roofMesh);

    // Çatı Tepesi Altın Küre (Golden Finial Ball)
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), goldTrimMat);
    const apexY = roofY + t.roofHeight / 2;
    finial.position.y = apexY;
    finial.name = 'roofs';
    towerGroup.add(finial);

    // Bayrak Direği ve Dalgalanan Bayrak (Fluttering Swallowtail Flag)
    if (t.hasFlag) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65, 8), goldTrimMat);
      pole.position.y = apexY + 0.32;
      pole.name = 'flags';
      towerGroup.add(pole);

      // Çift Kuyruklu Kırlangıç Bayrak Şekli (Swallowtail Flag)
      const flagShape = new THREE.Shape();
      flagShape.moveTo(0, 0);
      flagShape.lineTo(0.42, 0.08);
      flagShape.lineTo(0.3, 0);
      flagShape.lineTo(0.42, -0.08);
      flagShape.lineTo(0, -0.16);
      flagShape.closePath();

      const flagGeo = new THREE.ShapeGeometry(flagShape);
      const flag = new THREE.Mesh(flagGeo, flagsMat);
      flag.position.set(0.02, apexY + 0.52, 0);
      flag.name = 'flags';
      flag.userData.isWaving = true;
      flag.userData.baseRotY = 0;
      flag.userData.phase = idx * 1.2;
      towerGroup.add(flag);
    }

    // Pencereler (Warm Glowing Arched Windows)
    t.windowHeights.forEach((wh) => {
      const wY = wh - t.height / 2;
      const winGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.28, 16);
      winGeo.rotateX(Math.PI / 2);
      const winMesh = new THREE.Mesh(winGeo, windowsMat);
      const angle = idx === 1 ? Math.PI / 3 : idx === 2 ? (2 * Math.PI) / 3 : 0;
      winMesh.position.set(
        Math.sin(angle) * (t.radius * 0.95),
        wY,
        Math.cos(angle) * (t.radius * 0.95)
      );
      winMesh.rotation.y = angle;
      winMesh.name = 'windows';
      towerGroup.add(winMesh);

      // Golden window frame trim
      const wFrame = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.025, 8, 16), goldTrimMat);
      wFrame.position.copy(winMesh.position);
      wFrame.rotation.y = angle;
      wFrame.name = 'windows';
      towerGroup.add(wFrame);
    });

    // Kuleye Sarılan Sarmaşık ve Güller (Climbing Vines & Blossoms)
    if (t.hasVines) {
      const vineCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(t.radius * 0.98, -t.height / 2, 0),
        new THREE.Vector3(t.radius * 0.7, -t.height / 4, t.radius * 0.7),
        new THREE.Vector3(0, 0, t.radius * 0.98),
        new THREE.Vector3(-t.radius * 0.7, t.height / 4, t.radius * 0.7),
        new THREE.Vector3(0, t.height / 2 - 0.2, t.radius * 0.98),
      ]);
      const vineGeo = new THREE.TubeGeometry(vineCurve, 20, 0.035, 8, false);
      const vineMesh = new THREE.Mesh(vineGeo, gardenMat);
      vineMesh.name = 'garden';
      towerGroup.add(vineMesh);

      // Sarmaşık Gülleri (Tiny blooming roses)
      for (let r = 0; r < 5; r++) {
        const pt = vineCurve.getPoint(r / 4);
        const roseMat = new THREE.MeshStandardMaterial({
          color: flowerColors[r % flowerColors.length],
          roughness: 0.3,
        });
        const rose = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), roseMat);
        rose.position.set(pt.x * 1.05, pt.y, pt.z * 1.05);
        rose.name = 'garden';
        towerGroup.add(rose);
      }
    }

    group.add(towerGroup);
  });

  // 7. Büyülü Efektler: Uçuşan Peri, Kelebek ve Altın Yıldızlar (Fairy, Butterfly & Stars)
  const decorGroup = new THREE.Group();
  decorGroup.name = 'decorations';

  // Şatodan Saçılan Parlak Altın Yıldızlar (Sparkling Floating Stars)
  const starCoords = [
    { x: -1.8, y: 3.4, z: 1.1, s: 0.16, phase: 0 },
    { x: 1.8, y: 3.8, z: 0.8, s: 0.14, phase: 1.2 },
    { x: 0, y: 5.8, z: 0.6, s: 0.2, phase: 2.4 },
    { x: -0.8, y: 4.6, z: -0.5, s: 0.15, phase: 3.6 },
    { x: 0.9, y: 4.8, z: -0.4, s: 0.17, phase: 4.8 },
    { x: -1.6, y: 2.2, z: -1.2, s: 0.13, phase: 5.5 },
    { x: 1.6, y: 2.5, z: -1.2, s: 0.14, phase: 1.8 },
  ];

  starCoords.forEach((sc) => {
    const starGeo = new THREE.SphereGeometry(sc.s, 5, 2);
    const star = new THREE.Mesh(starGeo, decorMat);
    star.position.set(sc.x, sc.y, sc.z);
    star.name = 'decorations';
    star.userData.isFloating = true;
    star.userData.basePosY = sc.y;
    star.userData.speed = 1.6;
    star.userData.phase = sc.phase;
    decorGroup.add(star);
  });

  // Uçan Büyülü Peri (Floating Magical Fairy)
  const fairyGroup = new THREE.Group();
  fairyGroup.position.set(1.7, 3.4, 0.7);
  fairyGroup.name = 'decorations';
  fairyGroup.userData.isFloating = true;
  fairyGroup.userData.basePosY = 3.4;
  fairyGroup.userData.speed = 2.0;
  fairyGroup.userData.phase = 0.5;

  const fairyBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    new THREE.MeshStandardMaterial({ color: '#fbcfe8', emissive: '#f472b6', emissiveIntensity: 0.9 })
  );
  fairyGroup.add(fairyBody);

  const fairyGlint = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), goldTrimMat);
  fairyGlint.position.set(0, 0.13, 0);
  fairyGroup.add(fairyGlint);

  const fWingMat = new THREE.MeshStandardMaterial({
    color: '#bae6fd',
    emissive: '#bae6fd',
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
  });
  for (let s = -1; s <= 1; s += 2) {
    const fWingGeo = new THREE.SphereGeometry(0.18, 12, 12);
    fWingGeo.scale(1.2, 0.6, 0.1);
    const fWing = new THREE.Mesh(fWingGeo, fWingMat);
    fWing.position.set(s * 0.18, 0.05, -0.06);
    fWing.rotation.set(0.2, s * 0.35, s * 0.3);
    fairyGroup.add(fWing);
  }
  decorGroup.add(fairyGroup);

  // Uçuşan Renkli Kelebek (Fluttering Rainbow Butterfly)
  const butterflyGroup = new THREE.Group();
  butterflyGroup.position.set(-1.7, 2.6, 0.9);
  butterflyGroup.name = 'decorations';
  butterflyGroup.userData.isFloating = true;
  butterflyGroup.userData.basePosY = 2.6;
  butterflyGroup.userData.speed = 2.4;
  butterflyGroup.userData.phase = 2.8;

  const bflyBody = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8), goldTrimMat);
  bflyBody.rotation.x = Math.PI / 4;
  butterflyGroup.add(bflyBody);

  for (let s = -1; s <= 1; s += 2) {
    const bWingGeo = new THREE.SphereGeometry(0.18, 12, 12);
    bWingGeo.scale(1.0, 0.7, 0.08);
    const bWingMat = new THREE.MeshStandardMaterial({ color: s === 1 ? '#ec4899' : '#a855f7', side: THREE.DoubleSide });
    const bWing = new THREE.Mesh(bWingGeo, bWingMat);
    bWing.position.set(s * 0.16, 0.04, 0);
    bWing.rotation.y = s * 0.35;
    butterflyGroup.add(bWing);
  }
  decorGroup.add(butterflyGroup);

  // Gökyüzünde Altın Hilal Ay (Golden Crescent Moon)
  const moonShape = new THREE.Shape();
  moonShape.moveTo(0, -0.45);
  moonShape.quadraticCurveTo(0.45, 0, 0, 0.45);
  moonShape.quadraticCurveTo(0.22, 0, 0, -0.45);
  moonShape.closePath();
  const moonGeo = new THREE.ExtrudeGeometry(moonShape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
  const moonMesh = new THREE.Mesh(moonGeo, decorMat);
  moonMesh.position.set(2.2, 5.2, -1.2);
  moonMesh.rotation.z = -0.3;
  moonMesh.name = 'decorations';
  moonMesh.userData.isFloating = true;
  moonMesh.userData.basePosY = 5.2;
  moonMesh.userData.speed = 1.0;
  moonMesh.userData.phase = 0;
  decorGroup.add(moonMesh);

  group.add(decorGroup);

  return group;
}

// 4. Kawaii Uzay Robotu (Cute Chibi Space Robot)
export function createRobot(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'robot';

  const headCol = colors?.head || '#7dd3fc'; // Pastel açık mavi
  const bodyCol = colors?.body || '#e2e8f0'; // Metalik gümüş şasi
  const armsCol = colors?.arms || '#7dd3fc'; // Pastel mavi kollar
  const legsCol = colors?.legs || '#cbd5e1'; // Kısa tombul bacaklar & tabanlar
  const faceCol = colors?.face_screen || '#0f172a'; // Parlak koyu cam vizör
  const eyesCol = colors?.eyes || '#22d3ee'; // Parlayan neon turkuaz LED
  const blushCol = colors?.blush || '#f472b6'; // Pembe LED allık
  const antennaCol = colors?.antenna || '#facc15'; // Sarı/altın kalpli anten
  const bellyCol = colors?.belly_screen || '#facc15'; // Gövde göstergesi & düğmeler
  const jetpackCol = colors?.jetpack || '#94a3b8'; // Sırt jetpack & iticiler

  const headMat = new THREE.MeshStandardMaterial({ color: headCol, roughness: 0.32, metalness: 0.22 });
  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.28, metalness: 0.42 });
  const armsMat = new THREE.MeshStandardMaterial({ color: armsCol, roughness: 0.32, metalness: 0.25 });
  const legsMat = new THREE.MeshStandardMaterial({ color: legsCol, roughness: 0.30, metalness: 0.35 });
  const faceMat = new THREE.MeshStandardMaterial({ color: faceCol, roughness: 0.12, metalness: 0.15 });
  const eyesMat = new THREE.MeshStandardMaterial({
    color: eyesCol,
    emissive: eyesCol,
    emissiveIntensity: 0.95,
    roughness: 0.1,
  });
  const blushMat = new THREE.MeshStandardMaterial({
    color: blushCol,
    emissive: blushCol,
    emissiveIntensity: 0.85,
    roughness: 0.2,
  });
  const antennaMat = new THREE.MeshStandardMaterial({
    color: antennaCol,
    emissive: antennaCol,
    emissiveIntensity: 0.7,
    roughness: 0.2,
    metalness: 0.3,
  });
  const bellyMat = new THREE.MeshStandardMaterial({ color: bellyCol, roughness: 0.25, metalness: 0.3 });
  const jetpackMat = new THREE.MeshStandardMaterial({ color: jetpackCol, roughness: 0.3, metalness: 0.5 });
  const silverJointMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.22, metalness: 0.6 });
  const goldAccentMat = new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.2, metalness: 0.5 });
  const darkPanelMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.3, metalness: 0.2 });

  // -------------------------------------------------------------
  // 1. AYAKLAR & BACAKLAR (Chunky Short Legs & Wide Rounded Soles)
  // -------------------------------------------------------------
  const legsGroup = new THREE.Group();
  legsGroup.name = 'legs';

  [-0.42, 0.42].forEach((xSide) => {
    // Kalça Küresel Eklem (Hip Ball Joint)
    const hip = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), silverJointMat);
    hip.position.set(xSide, 0.76, 0);
    hip.name = 'legs';
    legsGroup.add(hip);

    // Kısa & Şişman Bacak (Chunky Leg Cylinder)
    const legGeo = new THREE.CylinderGeometry(0.20, 0.22, 0.46, 20);
    const leg = new THREE.Mesh(legGeo, legsMat);
    leg.position.set(xSide, 0.50, 0);
    leg.name = 'legs';
    leg.castShadow = true;
    legsGroup.add(leg);

    // Diz Bileziği (Metallic Knee Ring)
    const kneeRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 8, 20), goldAccentMat);
    kneeRing.rotation.x = Math.PI / 2;
    kneeRing.position.set(xSide, 0.44, 0);
    kneeRing.name = 'legs';
    legsGroup.add(kneeRing);

    // Geniş ve Yuvarlak Ayak Tabanı (Wide Rounded Foot Sole / Boots)
    const footGroup = new THREE.Group();
    footGroup.position.set(xSide, 0.14, 0.06);

    // Ana Taban Kutusu
    const soleBox = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.24, 0.54), legsMat);
    soleBox.name = 'legs';
    soleBox.castShadow = true;
    soleBox.receiveShadow = true;
    footGroup.add(soleBox);

    // Yuvarlak Ön Burun (Rounded Front Toe Cap)
    const toeGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.24, 20, 1, false, 0, Math.PI);
    toeGeo.rotateX(Math.PI / 2);
    const toe = new THREE.Mesh(toeGeo, legsMat);
    toe.position.set(0, 0, 0.27);
    toe.name = 'legs';
    footGroup.add(toe);

    // Yuvarlak Arka Topuk (Rounded Rear Heel)
    const heelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.24, 20, 1, false, 0, Math.PI);
    heelGeo.rotateX(-Math.PI / 2);
    const heel = new THREE.Mesh(heelGeo, legsMat);
    heel.position.set(0, 0, -0.27);
    heel.name = 'legs';
    footGroup.add(heel);

    // Ayak Altı Manyetik Taban / Kaydırmaz Halka (Anti-slip Sole Pad)
    const solePad = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.70), darkPanelMat);
    solePad.position.set(0, -0.12, 0);
    solePad.name = 'legs';
    footGroup.add(solePad);

    legsGroup.add(footGroup);
  });
  group.add(legsGroup);

  // -------------------------------------------------------------
  // 2. GÖVDE (Kare/Dikdörtgen Gövde & Yuvarlak Köşeler)
  // -------------------------------------------------------------
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'body';

  // Alt Bel / Pelvis Paneli
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.22, 0.78), silverJointMat);
  pelvis.position.set(0, 0.85, 0);
  pelvis.name = 'body';
  pelvis.castShadow = true;
  bodyGroup.add(pelvis);

  // Ana Kare/Dikdörtgen Gövde (Main Cuboid Torso)
  const mainTorso = new THREE.Mesh(new THREE.BoxGeometry(1.36, 1.25, 0.96), bodyMat);
  mainTorso.position.set(0, 1.50, 0);
  mainTorso.name = 'body';
  mainTorso.castShadow = true;
  mainTorso.receiveShadow = true;
  bodyGroup.add(mainTorso);

  // Sevimli Yumuşak Köşe Koruyucuları (Chubby Corner Bumpers - Kawaii aesthetic)
  [
    [-0.66, -0.46],
    [0.66, -0.46],
    [-0.66, 0.46],
    [0.66, 0.46],
  ].forEach(([cx, cz]) => {
    const bumper = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.25, 12), silverJointMat);
    bumper.position.set(cx, 1.50, cz);
    bumper.name = 'body';
    bodyGroup.add(bumper);

    const cornerCapTop = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), goldAccentMat);
    cornerCapTop.position.set(cx, 2.125, cz);
    cornerCapTop.name = 'body';
    bodyGroup.add(cornerCapTop);
  });

  // Metalik Akordeon Boyun Boğumu (Neck Joint)
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.18, 20), silverJointMat);
  neck.position.set(0, 2.20, 0);
  neck.name = 'body';
  bodyGroup.add(neck);

  group.add(bodyGroup);

  // -------------------------------------------------------------
  // 3. GÖVDE GÖSTERGESİ & RENKLİ DÜĞMELER (Belly Screen & Buttons)
  // -------------------------------------------------------------
  const bellyScreenGroup = new THREE.Group();
  bellyScreenGroup.name = 'belly_screen';

  // Göğüs Ekranı Çerçevesi (Bezel Screen Bezel)
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.68, 0.06), darkPanelMat);
  bezel.position.set(0, 1.62, 0.49);
  bezel.name = 'belly_screen';
  bellyScreenGroup.add(bezel);

  // İç Dijital Mini Ekran
  const miniScreen = new THREE.Mesh(
    new THREE.BoxGeometry(0.84, 0.32, 0.04),
    new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.1, metalness: 0.1 })
  );
  miniScreen.position.set(0, 1.74, 0.52);
  miniScreen.name = 'belly_screen';
  bellyScreenGroup.add(miniScreen);

  // Batarya / Enerji LED Çubukları (Energy Gauge Bars)
  const barColors = ['#22c55e', '#38bdf8', '#facc15'];
  barColors.forEach((bColor, bIdx) => {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.16, 0.02),
      new THREE.MeshStandardMaterial({ color: bColor, emissive: bColor, emissiveIntensity: 0.95 })
    );
    bar.position.set(-0.24 + bIdx * 0.24, 1.74, 0.545);
    bar.name = 'belly_screen';
    bellyScreenGroup.add(bar);
  });

  // 3 Adet Renkli Şeker Düğme (Tactile Colorful Buttons)
  const btnDefs = [
    { x: -0.26, col: '#f43f5e' }, // Parlak Kırmızı/Mercan Düğme
    { x: 0, col: '#facc15' },     // Güneş Sarısı Düğme
    { x: 0.26, col: '#22c55e' },  // Neon Yeşil Düğme
  ];
  btnDefs.forEach((b) => {
    const btnRim = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 16), silverJointMat);
    btnRim.rotation.x = Math.PI / 2;
    btnRim.position.set(b.x, 1.45, 0.52);
    btnRim.name = 'belly_screen';
    bellyScreenGroup.add(btnRim);

    const btn = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 14, 14),
      new THREE.MeshStandardMaterial({ color: b.col, roughness: 0.25, emissive: b.col, emissiveIntensity: 0.4 })
    );
    btn.scale.set(1, 1, 0.5);
    btn.position.set(b.x, 1.45, 0.54);
    btn.name = 'belly_screen';
    bellyScreenGroup.add(btn);
  });

  // Hoparlör / Havalandırma Çizgileri (Acoustic Speaker Grille)
  for (let g = 0; g < 3; g++) {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.025, 0.02), silverJointMat);
    slot.position.set(0, 1.25 - g * 0.06, 0.495);
    slot.name = 'belly_screen';
    bellyScreenGroup.add(slot);
  }

  group.add(bellyScreenGroup);

  // -------------------------------------------------------------
  // 4. KOLLAR & ELLER (Ball-Jointed Cute Kawaii Arms)
  // -------------------------------------------------------------
  const armsGroup = new THREE.Group();
  armsGroup.name = 'arms';

  [-1, 1].forEach((s) => {
    const armBranch = new THREE.Group();
    armBranch.position.set(s * 0.72, 1.82, 0);

    // Omuz Küresel Mafsal (Shoulder Ball Joint)
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), silverJointMat);
    shoulder.name = 'arms';
    armBranch.add(shoulder);

    // Üst Kol (Upper Arm - Açılı duruş)
    const upperArm = new THREE.Group();
    upperArm.rotation.z = s * -0.38; // Dışa doğru hafif açık sevimli duruş
    upperArm.rotation.x = 0.18; // Hafif öne doğru

    const upperCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.38, 16), armsMat);
    upperCyl.position.set(0, -0.22, 0);
    upperCyl.name = 'arms';
    upperCyl.castShadow = true;
    upperArm.add(upperCyl);

    // Dirsek Küresel Mafsal (Elbow Ball Joint)
    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 14), silverJointMat);
    elbow.position.set(0, -0.42, 0);
    elbow.name = 'arms';
    upperArm.add(elbow);

    // Ön Kol (Forearm)
    const forearm = new THREE.Group();
    forearm.position.set(0, -0.42, 0);
    forearm.rotation.z = s * -0.22;
    forearm.rotation.x = 0.32; // Karşıya selam verir gibi neşeli poz

    const foreCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.36, 16), armsMat);
    foreCyl.position.set(0, -0.20, 0);
    foreCyl.name = 'arms';
    foreCyl.castShadow = true;
    forearm.add(foreCyl);

    // Bilek Halkası (Wrist Cuff)
    const wristCuff = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.03, 8, 16), goldAccentMat);
    wristCuff.rotation.x = Math.PI / 2;
    wristCuff.position.set(0, -0.38, 0);
    wristCuff.name = 'arms';
    forearm.add(wristCuff);

    // Sevimli Yuvarlak El (Chubby Mitten / Clamp Hand)
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), armsMat);
    palm.scale.set(1.0, 1.15, 0.85);
    palm.position.set(0, -0.52, 0);
    palm.name = 'arms';
    palm.castShadow = true;
    forearm.add(palm);

    // Başparmak Yuvarlağı (Cute Thumb Ball)
    const thumb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), silverJointMat);
    thumb.position.set(s * -0.11, -0.48, 0.08);
    thumb.name = 'arms';
    forearm.add(thumb);

    upperArm.add(forearm);
    armBranch.add(upperArm);
    armsGroup.add(armBranch);
  });

  group.add(armsGroup);

  // -------------------------------------------------------------
  // 5. KAFA (Büyük ve Şirin Kare/Dikdörtgen Kafa)
  // -------------------------------------------------------------
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 2.92, 0);
  headGroup.name = 'head';

  // Ana Kafa Kutusu (Main Cuboid Head - Accessories anchor here!)
  const headBox = new THREE.Mesh(new THREE.BoxGeometry(1.72, 1.30, 1.26), headMat);
  headBox.name = 'head';
  headBox.castShadow = true;
  headBox.receiveShadow = true;
  headGroup.add(headBox);

  // Kafa Köşe Yuvarlatma Silindirleri (Soft Bevel Corners)
  [
    [-0.84, -0.61],
    [0.84, -0.61],
    [-0.84, 0.61],
    [0.84, 0.61],
  ].forEach(([hx, hz]) => {
    const hCorner = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.30, 12), silverJointMat);
    hCorner.position.set(hx, 0, hz);
    hCorner.name = 'head';
    headGroup.add(hCorner);
  });

  // Kulak Cıvataları / Ses Kadranları (Ear bolts / Audio Discs)
  [-1, 1].forEach((s) => {
    const earGroup = new THREE.Group();
    earGroup.position.set(s * 0.88, 0, 0);

    const earOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.12, 20), silverJointMat);
    earOuter.rotation.z = Math.PI / 2;
    earOuter.name = 'head';
    earGroup.add(earOuter);

    const earInner = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 20), goldAccentMat);
    earInner.rotation.z = Math.PI / 2;
    earInner.name = 'head';
    earGroup.add(earInner);

    const earCenter = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), headMat);
    earCenter.position.set(s * 0.08, 0, 0);
    earCenter.name = 'head';
    earGroup.add(earCenter);

    headGroup.add(earGroup);
  });

  // -------------------------------------------------------------
  // 6. DİJİTAL YÜZ EKRANI (Face Visor Screen)
  // -------------------------------------------------------------
  const faceScreenGroup = new THREE.Group();
  faceScreenGroup.name = 'face_screen';

  // Siyah Parlak Cam Vizör Paneli (Glossy Dark Face Glass)
  const visor = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.98, 0.08), faceMat);
  visor.position.set(0, 0, 0.63);
  visor.name = 'face_screen';
  faceScreenGroup.add(visor);

  // Vizör Çevre Çerçevesi (Screen Inner Bezel)
  const visorBezel = new THREE.Mesh(new THREE.BoxGeometry(1.54, 1.04, 0.04), silverJointMat);
  visorBezel.position.set(0, 0, 0.61);
  visorBezel.name = 'face_screen';
  faceScreenGroup.add(visorBezel);

  headGroup.add(faceScreenGroup);

  // -------------------------------------------------------------
  // 7. YÜZ DETAYLARI: LED GÖZLER, GÜLÜMSEME, BURUN & ALLIK
  // -------------------------------------------------------------
  const eyesGroup = new THREE.Group();
  eyesGroup.name = 'eyes';

  // İki Büyük Yuvarlak LED Göz (Large Round Glowing Cyan LED Eyes)
  [-0.42, 0.42].forEach((eX) => {
    // LED Taban Diski
    const eyeBase = new THREE.Mesh(new THREE.CircleGeometry(0.22, 24), eyesMat);
    eyeBase.position.set(eX, 0.10, 0.68);
    eyeBase.name = 'eyes';
    eyesGroup.add(eyeBase);

    // İç LED Işık Küresi (Hafif dışa taşan pürüzsüz lens)
    const eyeLens = new THREE.Mesh(new THREE.SphereGeometry(0.20, 20, 20), eyesMat);
    eyeLens.scale.set(1.0, 1.0, 0.18);
    eyeLens.position.set(eX, 0.10, 0.675);
    eyeLens.name = 'eyes';
    eyesGroup.add(eyeLens);

    // Kawaii Göz Parıltıları (Beyaz highlight noktaları)
    const glint1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 10, 10),
      new THREE.MeshBasicMaterial({ color: '#ffffff' })
    );
    glint1.position.set(eX + 0.07, 0.17, 0.695);
    eyesGroup.add(glint1);

    const glint2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 8, 8),
      new THREE.MeshBasicMaterial({ color: '#ffffff' })
    );
    glint2.position.set(eX - 0.07, 0.04, 0.695);
    eyesGroup.add(glint2);
  });

  // Gülümseyen LED Ağız (Digital Pixel / Neon Smile Arc :) )
  const smileShape = new THREE.TorusGeometry(0.18, 0.035, 8, 20, Math.PI);
  smileShape.rotateZ(Math.PI); // Yukarı bakan gülen yay
  const smile = new THREE.Mesh(smileShape, eyesMat);
  smile.position.set(0, -0.22, 0.68);
  smile.name = 'eyes';
  eyesGroup.add(smile);

  headGroup.add(eyesGroup);

  // Küçük Burun Düğmesi (Cute Button Nose)
  const noseBtn = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 14), goldAccentMat);
  noseBtn.scale.set(1, 1, 0.6);
  noseBtn.position.set(0, -0.06, 0.69);
  noseBtn.name = 'head';
  headGroup.add(noseBtn);

  // Pembe Yanak Allığı LED Efekti (Cute Glowing Pink LED Blush)
  const blushGroup = new THREE.Group();
  blushGroup.name = 'blush';

  [-0.50, 0.50].forEach((bX) => {
    const blushMesh = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), blushMat);
    blushMesh.scale.set(1.2, 0.7, 1);
    blushMesh.position.set(bX, -0.08, 0.68);
    blushMesh.name = 'blush';
    blushGroup.add(blushMesh);
  });
  headGroup.add(blushGroup);

  // -------------------------------------------------------------
  // 8. TEPE ANTENİ & KALPLİ BAŞLIK (Antenna with Cute Heart Tip)
  // -------------------------------------------------------------
  const antennaGroup = new THREE.Group();
  antennaGroup.position.set(0, 0.65, 0); // Kafa üstü
  antennaGroup.name = 'antenna';
  antennaGroup.userData.isWaving = true; // Dalgalanan sevimli yay animasyonu
  antennaGroup.userData.speed = 3.5;
  antennaGroup.userData.phase = 0.2;

  // Anten Taban Montaj Boğumu (Antenna Base Mount)
  const antBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 0.10, 16), silverJointMat);
  antBase.position.set(0, 0.05, 0);
  antBase.name = 'antenna';
  antennaGroup.add(antBase);

  // Metalik Yay / Boğumlu Çubuk (Spring Rod)
  const antRod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.48, 12), silverJointMat);
  antRod.position.set(0, 0.32, 0);
  antRod.name = 'antenna';
  antennaGroup.add(antRod);

  // Anten Yay Boğum Halkaları
  for (let r = 0; r < 3; r++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.02, 6, 14), goldAccentMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.18 + r * 0.12, 0);
    ring.name = 'antenna';
    antennaGroup.add(ring);
  }

  // Anten Tepesindeki Kalp Başlığı (Cute 3D Heart Finial!)
  const heartShape = new THREE.Shape();
  const h = 0.15;
  heartShape.moveTo(0, h * 0.35);
  heartShape.bezierCurveTo(h * 0.35, h * 0.85, h * 0.95, h * 0.6, h * 0.95, 0);
  heartShape.bezierCurveTo(h * 0.95, -h * 0.45, 0, -h * 0.85, 0, -h * 1.15);
  heartShape.bezierCurveTo(0, -h * 0.85, -h * 0.95, -h * 0.45, -h * 0.95, 0);
  heartShape.bezierCurveTo(-h * 0.95, h * 0.6, -h * 0.35, h * 0.85, 0, h * 0.35);

  const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
    depth: 0.10,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.03,
    bevelThickness: 0.03,
  });
  const heartMesh = new THREE.Mesh(heartGeo, antennaMat);
  heartMesh.position.set(0, 0.72, -0.05);
  heartMesh.rotation.z = Math.PI; // Düzgün dik kalp yönü
  heartMesh.name = 'antenna';
  heartMesh.castShadow = true;
  antennaGroup.add(heartMesh);

  // Kalbin merkezinde altın parıltı küresi
  const heartCore = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), goldAccentMat);
  heartCore.position.set(0, 0.62, 0);
  heartCore.name = 'antenna';
  antennaGroup.add(heartCore);

  headGroup.add(antennaGroup);
  group.add(headGroup);

  // -------------------------------------------------------------
  // 9. SIRTA MONTE JETPACK & KANATÇIKLAR (Backpack Rocket Thrusters)
  // -------------------------------------------------------------
  const jetpackGroup = new THREE.Group();
  jetpackGroup.position.set(0, 1.50, -0.52);
  jetpackGroup.name = 'jetpack';

  // Sırt Bağlantı Plakası (Mount Plate)
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.86, 0.14), darkPanelMat);
  plate.position.set(0, 0, -0.07);
  plate.name = 'jetpack';
  jetpackGroup.add(plate);

  // Merkez Enerji Çekirdeği (Power Core in Center of Jetpack)
  const coreRim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 20), goldAccentMat);
  coreRim.rotation.x = Math.PI / 2;
  coreRim.position.set(0, 0.08, -0.16);
  coreRim.name = 'jetpack';
  jetpackGroup.add(coreRim);

  const coreGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 0.9 })
  );
  coreGlow.scale.set(1, 1, 0.6);
  coreGlow.position.set(0, 0.08, -0.19);
  coreGlow.name = 'jetpack';
  jetpackGroup.add(coreGlow);

  // İkili Roket İtici Tankları (Twin Rocket Booster Tanks)
  [-0.34, 0.34].forEach((tX) => {
    const booster = new THREE.Group();
    booster.position.set(tX, 0, -0.22);

    // Silindirik Yakıt Tankı
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.84, 20), jetpackMat);
    tank.name = 'jetpack';
    tank.castShadow = true;
    booster.add(tank);

    // Üst Kubbe Başlık (Dome Cap)
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), goldAccentMat);
    dome.position.set(0, 0.42, 0);
    dome.name = 'jetpack';
    booster.add(dome);

    // Alt Roket Egzoz Hunisi (Exhaust Bell Nozzle)
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.20, 0.22, 20), darkPanelMat);
    nozzle.position.set(0, -0.50, 0);
    nozzle.name = 'jetpack';
    booster.add(nozzle);

    // Titreşen Mavi/Turuncu İtici Alevi (Pulsing Rocket Flame Cone)
    const flameGeo = new THREE.ConeGeometry(0.14, 0.34, 16);
    flameGeo.rotateX(Math.PI); // Aşağı doğru alev
    const flameMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#06b6d4',
      emissiveIntensity: 0.95,
      transparent: true,
      opacity: 0.85,
    });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0, -0.74, 0);
    flame.name = 'jetpack';
    flame.userData.isThrusterPulse = true;
    booster.add(flame);

    // Tank Dekoratif Şeritleri
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.02, 6, 20), silverJointMat);
    stripe.rotation.x = Math.PI / 2;
    stripe.position.set(0, 0.15, 0);
    stripe.name = 'jetpack';
    booster.add(stripe);

    jetpackGroup.add(booster);
  });

  // Yan Stabilizasyon Kanatçıkları (Mini Aero-Wings)
  [-1, 1].forEach((wSide) => {
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(0.38, 0.12);
    wingShape.lineTo(0.32, -0.22);
    wingShape.lineTo(0, -0.16);
    wingShape.closePath();

    const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.04, bevelEnabled: true, bevelSize: 0.01 });
    const wing = new THREE.Mesh(wingGeo, jetpackMat);
    wing.position.set(wSide * 0.44, 0.12, -0.22);
    wing.rotation.y = wSide * 0.45;
    wing.rotation.z = wSide * -0.25;
    if (wSide === -1) wing.scale.x = -1;
    wing.name = 'jetpack';
    jetpackGroup.add(wing);
  });

  group.add(jetpackGroup);

  return group;
}

// 5. Cute Toy Kitty (Kawaii Kitty)
export function createKitty(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'kitty';

  const bodyCol = colors?.body || '#f97316'; // Tatlı turuncu tekir kedi
  const headCol = colors?.head || bodyCol;
  const bellyCol = colors?.belly || '#ffffff'; // Beyaz göğüs
  const earsCol = colors?.ears || '#f97316';
  const snoutCol = colors?.snout || '#fbcfe8'; // Pembe burun
  const pawsCol = colors?.paws || '#ffffff';

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.4 });
  const headMat = new THREE.MeshStandardMaterial({ color: headCol, roughness: 0.4 });
  const bellyMat = new THREE.MeshStandardMaterial({ color: bellyCol, roughness: 0.4 });
  const earsMat = new THREE.MeshStandardMaterial({ color: earsCol, roughness: 0.4 });
  const snoutMat = new THREE.MeshStandardMaterial({ color: snoutCol, roughness: 0.3 });
  const pawsMat = new THREE.MeshStandardMaterial({ color: pawsCol, roughness: 0.4 });
  const whiskerMat = new THREE.MeshBasicMaterial({ color: '#1e293b' });
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.1 });
  const glintMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

  // 1. Tombul Gövde
  const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 32), bodyMat);
  bodyMesh.scale.set(1.0, 1.08, 1.05);
  bodyMesh.position.y = 1.15;
  bodyMesh.name = 'body';
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Beyaz Göbek Yaması
  const bellyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 24), bellyMat);
  bellyMesh.scale.set(0.85, 1.05, 0.4);
  bellyMesh.position.set(0, 1.15, 0.78);
  bellyMesh.name = 'belly';
  group.add(bellyMesh);

  // 2. Kafa
  const headGroup = new THREE.Group();
  headGroup.name = 'head';
  headGroup.position.set(0, 2.35, 0.28);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.82, 24, 24), headMat);
  headMesh.scale.set(1.15, 0.95, 1.02);
  headGroup.add(headMesh);

  // Tombul Beyaz Yanaklar (Muzzle)
  for (let s = -1; s <= 1; s += 2) {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), bellyMat);
    cheek.scale.set(1.0, 0.8, 0.85);
    cheek.position.set(s * 0.18, -0.16, 0.72);
    headGroup.add(cheek);
  }

  // Minik Tatlı Pembe Üçgen Kedi Burnu (GRİ HALKA YOK!)
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.08, 3), snoutMat);
  nose.position.set(0, -0.06, 0.84);
  nose.rotation.z = Math.PI; // Ters üçgen kedi burnu
  nose.rotation.x = 0.3;
  nose.name = 'snout';
  headGroup.add(nose);

  // Yanak Allıkları (Blush)
  const blushMat = new THREE.MeshBasicMaterial({ color: '#ff94a8', transparent: true, opacity: 0.65 });
  for (let s = -1; s <= 1; s += 2) {
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), blushMat);
    blush.scale.set(1.1, 0.6, 0.2);
    blush.position.set(s * 0.58, -0.1, 0.6);
    headGroup.add(blush);
  }

  // 3. İRİ PARILTILI ANİME GÖZLERİ
  for (let s = -1; s <= 1; s += 2) {
    const eyePivot = new THREE.Group();
    eyePivot.position.set(s * 0.32, 0.12, 0.72);

    const eyeOrb = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 20), eyeMat);
    eyeOrb.scale.set(1, 1.15, 0.35);
    eyeOrb.name = s === -1 ? 'eye_iris_L' : 'eye_iris_R';
    eyePivot.add(eyeOrb);

    const g1 = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), glintMat);
    g1.position.set(s * 0.03, 0.05, 0.06);
    eyePivot.add(g1);

    const g2 = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), glintMat);
    g2.position.set(s * -0.03, -0.03, 0.06);
    eyePivot.add(g2);

    headGroup.add(eyePivot);
  }

  // 4. Kulaklar (İçi pembe sevimli kedi kulakları)
  for (let s = -1; s <= 1; s += 2) {
    const earGroup = new THREE.Group();
    earGroup.position.set(s * 0.48, 0.65, 0.1);
    earGroup.rotation.z = s * -0.28;

    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.55, 16), earsMat);
    ear.scale.set(1.0, 1.0, 0.45);
    ear.name = 'ears';
    earGroup.add(ear);

    const innerEar = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.42, 12), snoutMat);
    innerEar.scale.set(1.0, 1.0, 0.3);
    innerEar.position.set(0, -0.02, 0.08);
    innerEar.name = 'ears';
    earGroup.add(innerEar);

    headGroup.add(earGroup);
  }

  // 5. Zarif ve Kısa Sevimli Bıyıklar
  for (let s = -1; s <= 1; s += 2) {
    for (let i = -1; i <= 1; i++) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.45, 8), whiskerMat);
      w.position.set(s * 0.52, -0.16 + i * 0.06, 0.65);
      w.rotation.z = Math.PI / 2 + (i * 0.15 * s);
      w.rotation.y = s * 0.35;
      headGroup.add(w);
    }
  }
  group.add(headGroup);

  // 6. Beyaz Patiler (Ön ve Arka)
  for (let s = -1; s <= 1; s += 2) {
    const frontPaw = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), pawsMat);
    frontPaw.scale.set(0.9, 0.65, 1.3);
    frontPaw.position.set(s * 0.32, 0.12, 0.85);
    frontPaw.name = 'paws';
    group.add(frontPaw);

    const backPaw = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 14), pawsMat);
    backPaw.scale.set(0.95, 0.6, 1.4);
    backPaw.position.set(s * 0.62, 0.14, 0.35);
    backPaw.name = 'paws';
    group.add(backPaw);
  }

  // 7. Yukarı Kıvrılan Sevimli Kedi Kuyruğu
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.7, -0.85),
    new THREE.Vector3(0.1, 1.2, -1.15),
    new THREE.Vector3(0.3, 1.8, -1.1),
    new THREE.Vector3(0.45, 2.3, -0.75),
  ]);
  const tailMesh = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 20, 0.12, 12, false), bodyMat);
  tailMesh.name = 'tail';
  group.add(tailMesh);

  // Beyaz Kuyruk Ucu
  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), pawsMat);
  tailTip.position.set(0.45, 2.3, -0.75);
  tailTip.name = 'tail';
  group.add(tailTip);

  return group;
}

// Convert 2D Drawing into 3D (Magic Oven)
export function create3DFromDrawing(canvas: HTMLCanvasElement, materialType: 'pelus' | 'metal' | 'hamur' | 'seker'): THREE.Group {
  const group = new THREE.Group();
  group.name = 'custom_drawing';

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  // Material setup based on type
  const materialProps: THREE.MeshStandardMaterialParameters = { 
    map: texture,
    roughness: 0.5,
    metalness: 0.0
  };

  if (materialType === 'pelus') {
    materialProps.roughness = 0.95;
    materialProps.color = '#ffffff'; // Base tint for texture
  } else if (materialType === 'metal') {
    materialProps.metalness = 0.85;
    materialProps.roughness = 0.15;
    materialProps.color = '#cccccc'; // Silver tint
  } else if (materialType === 'hamur') {
    materialProps.roughness = 0.6;
    materialProps.color = '#fef3c7'; // Dough-like tint
  } else if (materialType === 'seker') {
    materialProps.roughness = 0.05;
    materialProps.transparent = true;
    materialProps.opacity = 0.92;
    materialProps.metalness = 0.1;
  }
  const mat = new THREE.MeshStandardMaterial(materialProps);

  // Rounded cushion geometry (puffy toy shape)
  const shape = new THREE.Shape();
  const width = 2.0;
  const height = 2.0;
  const radius = 0.6; // High radius for puffiness

  shape.moveTo(radius, 0);
  shape.lineTo(width - radius, 0);
  shape.quadraticCurveTo(width, 0, width, radius);
  shape.lineTo(width, height - radius);
  shape.quadraticCurveTo(width, height, width - radius, height);
  shape.lineTo(radius, height);
  shape.quadraticCurveTo(0, height, 0, height - radius);
  shape.lineTo(0, radius);
  shape.quadraticCurveTo(0, 0, radius, 0);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.45,
    bevelEnabled: true,
    bevelThickness: 0.35, // Puffy look
    bevelSize: 0.3,
    bevelSegments: 12,
  });
  geometry.center();

  const mesh = new THREE.Mesh(geometry, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = 'body';
  
  // Presentation: centered at y: 1.4 with a slight "sweet" display angle
  group.position.y = 1.4;
  group.rotation.set(-0.1, 0.2, 0);
  group.add(mesh);

  return group;
}

