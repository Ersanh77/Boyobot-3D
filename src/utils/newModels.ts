import * as THREE from 'three';
import { ModelId } from '../types';
import { addAnimalFace } from './models';

// =============================================================
// 🌺 1. Çeşitli Çiçekler
// =============================================================

// 🌻 Günebakan / Ayçiçeği (Kawaii Smiling & Winking Sunflower with Flying Bee & Butterfly)
export function createSunflower(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'sunflower';

  const petalsCol = colors?.petals || '#fde047'; // Parlak ve yumuşak sarı
  const centerCol = colors?.center || '#854d0e'; // Sıcak zengin kahverengi disk
  const seedsCol = colors?.seeds || '#f59e0b'; // Altın tohum desenleri
  const stemCol = colors?.stem || '#16a34a'; // Taze yeşil sap
  const leavesCol = colors?.leaves || '#22c55e'; // Canlı yeşil yapraklar
  const faceCol = colors?.face || '#1e293b'; // Kömürsü anime gözler & gülümseme
  const blushCol = colors?.blush || '#f472b6'; // Pembe yanak allığı
  const crittersCol = colors?.critters || '#facc15'; // Uçuşan arı & kelebek

  const petalsMat = new THREE.MeshStandardMaterial({ color: petalsCol, roughness: 0.28 });
  const centerMat = new THREE.MeshStandardMaterial({ color: centerCol, roughness: 0.55 });
  const seedsMat = new THREE.MeshStandardMaterial({ color: seedsCol, roughness: 0.35, metalness: 0.15 });
  const stemMat = new THREE.MeshStandardMaterial({ color: stemCol, roughness: 0.45 });
  const leavesMat = new THREE.MeshStandardMaterial({ color: leavesCol, roughness: 0.38 });
  const faceMat = new THREE.MeshStandardMaterial({ color: faceCol, roughness: 0.15 });
  const blushMat = new THREE.MeshStandardMaterial({
    color: blushCol,
    emissive: blushCol,
    emissiveIntensity: 0.5,
    roughness: 0.3,
  });
  const glintMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const crittersMat = new THREE.MeshStandardMaterial({ color: crittersCol, roughness: 0.3 });
  const darkStripesMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4 });
  const wingsMat = new THREE.MeshStandardMaterial({
    color: '#bae6fd',
    emissive: '#bae6fd',
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
  });

  // 1. Zemin Kaidesi & Çim Tepesi (Grass Base Mound)
  const baseMound = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.1, 0.16, 24), leavesMat);
  baseMound.position.y = 0.08;
  baseMound.name = 'leaves';
  baseMound.receiveShadow = true;
  group.add(baseMound);

  // Minik yer çiçekleri
  const baseColors = ['#f472b6', '#facc15', '#ffffff'];
  for (let b = 0; b < 6; b++) {
    const angle = (b / 6) * Math.PI * 2;
    const r = 0.65;
    const bFlower = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 8, 8),
      new THREE.MeshStandardMaterial({ color: baseColors[b % 3], roughness: 0.3 })
    );
    bFlower.position.set(Math.cos(angle) * r, 0.18, Math.sin(angle) * r);
    bFlower.name = 'leaves';
    group.add(bFlower);
  }

  // 2. Hafif Eğri & Rüzgarda Salınan Gövde / Sap (Curved S-Shape Stem)
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.1, 0),
    new THREE.Vector3(0.18, 0.9, 0.05),
    new THREE.Vector3(-0.16, 1.8, -0.04),
    new THREE.Vector3(0.12, 2.7, 0.12),
    new THREE.Vector3(0.06, 3.15, 0.2),
  ]);
  const stemGeo = new THREE.TubeGeometry(stemCurve, 32, 0.15, 16, false);
  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  stemMesh.name = 'stem';
  stemMesh.castShadow = true;
  group.add(stemMesh);

  // 3. Taze Yeşil Yapraklar (Organic Curved Leaves with Veins)
  const leafConfigs = [
    { x: -0.42, y: 1.15, z: 0.02, rotZ: 0.65, rotY: 0.35, scale: 1.1, side: -1 },
    { x: 0.44, y: 1.85, z: 0.08, rotZ: -0.55, rotY: -0.3, scale: 1.25, side: 1 },
    { x: -0.35, y: 2.45, z: 0.04, rotZ: 0.45, rotY: 0.2, scale: 0.95, side: -1 },
  ];

  leafConfigs.forEach((cfg) => {
    const leafGroup = new THREE.Group();
    leafGroup.position.set(cfg.x, cfg.y, cfg.z);
    leafGroup.rotation.set(0.15, cfg.rotY, cfg.rotZ);

    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.35 * cfg.scale, 0.25 * cfg.scale, 0.75 * cfg.scale, 0);
    leafShape.quadraticCurveTo(0.35 * cfg.scale, -0.25 * cfg.scale, 0, 0);

    const leafGeo = new THREE.ExtrudeGeometry(leafShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    });
    const leaf = new THREE.Mesh(leafGeo, leavesMat);
    leaf.rotation.z = cfg.side === -1 ? Math.PI * 0.9 : -Math.PI * 0.1;
    leaf.name = 'leaves';
    leaf.castShadow = true;
    leafGroup.add(leaf);

    // Orta Yaprak Damarı (Midrib Vein)
    const vein = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.7 * cfg.scale, 8),
      stemMat
    );
    vein.position.set(cfg.side * (0.35 * cfg.scale), 0, 0.025);
    vein.rotation.z = cfg.side === -1 ? -Math.PI / 2.2 : Math.PI / 2.2;
    vein.name = 'leaves';
    leafGroup.add(vein);

    group.add(leafGroup);
  });

  // 4. Çiçek Başı Grubu (Flower Head - Rüzgarda salınan animasyonlu baş)
  const headGroup = new THREE.Group();
  headGroup.position.set(0.06, 3.15, 0.2);
  headGroup.rotation.set(0.18, -0.06, 0);
  headGroup.userData.isPlantSway = true; // Rüzgarda hafif sallanma
  headGroup.userData.baseRotX = 0.18;
  headGroup.userData.baseRotZ = 0;

  // Çanak Yapraklar (Yeşil Sepals behind Flower)
  const sepalCount = 12;
  for (let s = 0; s < sepalCount; s++) {
    const sAngle = (s / sepalCount) * Math.PI * 2;
    const sepalGeo = new THREE.ConeGeometry(0.24, 0.75, 8);
    sepalGeo.scale(1, 1, 0.25);
    const sepal = new THREE.Mesh(sepalGeo, leavesMat);
    sepal.position.set(Math.cos(sAngle) * 0.95, Math.sin(sAngle) * 0.95, -0.16);
    sepal.rotation.z = sAngle - Math.PI / 2;
    sepal.rotation.x = -0.22;
    sepal.name = 'leaves';
    headGroup.add(sepal);
  }

  // 5. Çift Katmanlı Parlak & Yumuşak Sarı Yapraklar (24 Double-Layered Petals)
  const petalCount = 24;
  for (let i = 0; i < petalCount; i++) {
    const isBackLayer = i % 2 === 1;
    const angle = (i * Math.PI * 2) / petalCount;
    const petalLen = isBackLayer ? 1.25 : 1.15;
    const petalW = isBackLayer ? 0.38 : 0.34;
    const pZ = isBackLayer ? -0.08 : -0.01;

    const petalGeo = new THREE.ConeGeometry(petalW, petalLen, 14);
    petalGeo.scale(1, 1, 0.22);
    const petalMesh = new THREE.Mesh(petalGeo, petalsMat);

    const dist = isBackLayer ? 1.45 : 1.35;
    petalMesh.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist, pZ);
    petalMesh.rotation.z = angle - Math.PI / 2;
    petalMesh.rotation.x = isBackLayer ? -0.1 : 0.08;
    petalMesh.name = 'petals';
    petalMesh.castShadow = true;
    headGroup.add(petalMesh);
  }

  // 6. Tohum Diski (Kahverengi & Altın Dokulu Merkez)
  const discGeo = new THREE.CylinderGeometry(1.08, 1.08, 0.28, 36);
  discGeo.rotateX(Math.PI / 2);
  const centerMesh = new THREE.Mesh(discGeo, centerMat);
  centerMesh.name = 'center';
  centerMesh.castShadow = true;
  centerMesh.receiveShadow = true;
  headGroup.add(centerMesh);

  // Diskin Çevreleyen Yumuşak Altın Halkası
  const discRim = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.08, 12, 36), seedsMat);
  discRim.position.z = 0.12;
  discRim.name = 'seeds';
  headGroup.add(discRim);

  // Altın Tohum Noktaları (Golden Sunflower Seed Beads - 2 Konsantrik Halka)
  const seedRings = [
    { count: 24, radius: 0.92, size: 0.045 },
    { count: 18, radius: 0.78, size: 0.040 },
  ];
  seedRings.forEach((ring) => {
    for (let j = 0; j < ring.count; j++) {
      const sAngle = (j / ring.count) * Math.PI * 2;
      const seedMesh = new THREE.Mesh(new THREE.SphereGeometry(ring.size, 8, 8), seedsMat);
      seedMesh.position.set(
        Math.cos(sAngle) * ring.radius,
        Math.sin(sAngle) * ring.radius,
        0.15
      );
      seedMesh.name = 'seeds';
      headGroup.add(seedMesh);
    }
  });

  // -------------------------------------------------------------
  // 7. SEVİMLİ KAWAII YÜZ (Anime Gözler, Gülümseme & Allık)
  // -------------------------------------------------------------
  const faceGroup = new THREE.Group();
  faceGroup.position.set(0, 0, 0.16);
  faceGroup.name = 'face';

  // SAĞ GÖZ: Büyük Parlak Anime Gözü (Wide Sparkling Open Eye)
  const rEyeGroup = new THREE.Group();
  rEyeGroup.position.set(0.36, 0.14, 0);

  const pupilGeo = new THREE.SphereGeometry(0.20, 24, 24);
  pupilGeo.scale(1.0, 1.25, 0.2);
  const rPupil = new THREE.Mesh(pupilGeo, faceMat);
  rPupil.name = 'face';
  rEyeGroup.add(rPupil);

  // Anime Işık Parıltıları (Dual Glints)
  const glint1 = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), glintMat);
  glint1.position.set(0.06, 0.10, 0.045);
  rEyeGroup.add(glint1);

  const glint2 = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), glintMat);
  glint2.position.set(-0.06, -0.08, 0.045);
  rEyeGroup.add(glint2);

  // Üst Kirpik Vurgusu
  const rLashGeo = new THREE.TorusGeometry(0.21, 0.026, 6, 16, Math.PI * 0.6);
  rLashGeo.rotateZ(Math.PI * 0.2);
  const rLash = new THREE.Mesh(rLashGeo, faceMat);
  rLash.position.set(0, 0.12, 0.03);
  rLash.name = 'face';
  rEyeGroup.add(rLash);

  faceGroup.add(rEyeGroup);

  // SOL GÖZ: Göz Kırpıyor Gibi İfade 😉 (Cute Cheerful Winking Arc)
  const lEyeGroup = new THREE.Group();
  lEyeGroup.position.set(-0.36, 0.14, 0);

  const winkGeo = new THREE.TorusGeometry(0.19, 0.042, 8, 20, Math.PI * 0.85);
  winkGeo.rotateZ(Math.PI * 0.95);
  const winkMesh = new THREE.Mesh(winkGeo, faceMat);
  winkMesh.name = 'face';
  lEyeGroup.add(winkMesh);

  // Göz Kırpma Kirpikleri
  const lash1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.015, 0.12, 8), faceMat);
  lash1.position.set(-0.16, -0.04, 0.02);
  lash1.rotation.z = 0.55;
  lash1.name = 'face';
  lEyeGroup.add(lash1);

  const lash2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.015, 0.10, 8), faceMat);
  lash2.position.set(-0.12, -0.10, 0.02);
  lash2.rotation.z = 0.95;
  lash2.name = 'face';
  lEyeGroup.add(lash2);

  faceGroup.add(lEyeGroup);

  // MUTLU GÜLÜMSEME 😊 (Happy Smile Curve & Rosy Inner Tongue)
  const smileGeo = new THREE.TorusGeometry(0.18, 0.038, 8, 20, Math.PI);
  smileGeo.rotateZ(Math.PI);
  const smileMesh = new THREE.Mesh(smileGeo, faceMat);
  smileMesh.position.set(0, -0.18, 0.02);
  smileMesh.name = 'face';
  faceGroup.add(smileMesh);

  // Şirin Pembe Dil (Rosy Cute Tongue inside smile)
  const tongueGeo = new THREE.SphereGeometry(0.09, 14, 14);
  tongueGeo.scale(1.1, 0.7, 0.4);
  const tongue = new THREE.Mesh(
    tongueGeo,
    new THREE.MeshStandardMaterial({ color: '#f43f5e', roughness: 0.3 })
  );
  tongue.position.set(0, -0.22, 0.015);
  tongue.name = 'face';
  faceGroup.add(tongue);

  headGroup.add(faceGroup);

  // PEMBE YANAK ALLIKLARI (Glowing Pink Cheek Blush on Both Sides)
  const blushGroup = new THREE.Group();
  blushGroup.position.set(0, 0, 0.16);
  blushGroup.name = 'blush';

  [-0.52, 0.52].forEach((bX) => {
    const blushMesh = new THREE.Mesh(new THREE.CircleGeometry(0.14, 20), blushMat);
    blushMesh.scale.set(1.25, 0.75, 1);
    blushMesh.position.set(bX, -0.05, 0.02);
    blushMesh.name = 'blush';
    blushGroup.add(blushMesh);

    // Allık üzerinde tatlı beyaz ışıltı noktaları
    const blushGlint = new THREE.Mesh(new THREE.CircleGeometry(0.03, 8), glintMat);
    blushGlint.position.set(bX + 0.04, -0.03, 0.025);
    blushGroup.add(blushGlint);
  });
  headGroup.add(blushGroup);

  group.add(headGroup);

  // -------------------------------------------------------------
  // 8. ETRAFINDA UÇUŞAN SEVİMLİ ARI (🐝) & KELEBEK (🦋)
  // -------------------------------------------------------------
  const crittersGroup = new THREE.Group();
  crittersGroup.name = 'critters';

  // 🐝 ŞİRİN CHIBI TOMBUL ARI (Orbiting Chubby Bumblebee)
  const beeGroup = new THREE.Group();
  beeGroup.name = 'critters';
  beeGroup.userData.isBeeOrbit = true;
  beeGroup.userData.speed = 1.35;
  beeGroup.userData.radius = 1.95;
  beeGroup.userData.basePosY = 3.25;
  beeGroup.userData.phase = 0.4;

  // Arı Gövdesi (Sarı & Siyah Çizgili Tombul Kapsül)
  const beeBody = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), crittersMat);
  beeBody.scale.set(1.0, 1.25, 0.95);
  beeBody.rotation.x = Math.PI / 2;
  beeBody.name = 'critters';
  beeBody.castShadow = true;
  beeGroup.add(beeBody);

  // Siyah Şeritler (3 Rings)
  [-0.07, 0.02, 0.10].forEach((sZ) => {
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.182, 0.182, 0.05, 16), darkStripesMat);
    stripe.rotation.x = Math.PI / 2;
    stripe.position.z = sZ;
    stripe.name = 'critters';
    beeGroup.add(stripe);
  });

  // İğne (Cute Tiny Stinger)
  const stinger = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 8), darkStripesMat);
  stinger.rotation.x = -Math.PI / 2;
  stinger.position.set(0, 0, -0.26);
  stinger.name = 'critters';
  beeGroup.add(stinger);

  // Arı Gözleri & Ağız
  [-0.07, 0.07].forEach((eyeX) => {
    const bEye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), faceMat);
    bEye.position.set(eyeX, 0.05, 0.18);
    beeGroup.add(bEye);

    const bGlint = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), glintMat);
    bGlint.position.set(eyeX + 0.012, 0.065, 0.21);
    beeGroup.add(bGlint);
  });

  // Arı Antenleri
  [-0.05, 0.05].forEach((antX) => {
    const antRod = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 6), darkStripesMat);
    antRod.position.set(antX, 0.16, 0.12);
    antRod.rotation.z = antX > 0 ? -0.3 : 0.3;
    beeGroup.add(antRod);

    const antTip = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), crittersMat);
    antTip.position.set(antX * 1.5, 0.22, 0.12);
    antTip.name = 'critters';
    beeGroup.add(antTip);
  });

  // Arı Kanatları (Translucent Shimmering Wings with Wing Flap)
  [-1, 1].forEach((wSide) => {
    const wingGeo = new THREE.SphereGeometry(0.18, 12, 12);
    wingGeo.scale(1.2, 0.6, 0.08);
    const wing = new THREE.Mesh(wingGeo, wingsMat);
    wing.position.set(wSide * 0.14, 0.14, 0);
    wing.rotation.set(0.2, wSide * 0.4, wSide * 0.35);
    wing.userData.isWingFlap = true;
    wing.userData.side = wSide;
    wing.userData.maxFlap = 0.75;
    wing.name = 'critters';
    beeGroup.add(wing);
  });

  crittersGroup.add(beeGroup);

  // 🦋 ŞİRİN MASALSI KELEBEK (Opposite Orbit Fluttering Butterfly)
  const bflyGroup = new THREE.Group();
  bflyGroup.name = 'critters';
  bflyGroup.userData.isBeeOrbit = true;
  bflyGroup.userData.speed = -1.1; // Ters yönde tatlı uçuş
  bflyGroup.userData.radius = 2.15;
  bflyGroup.userData.basePosY = 2.75;
  bflyGroup.userData.phase = 3.14;

  const bflyBody = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.26, 8), darkStripesMat);
  bflyBody.rotation.x = Math.PI / 3;
  bflyBody.name = 'critters';
  bflyGroup.add(bflyBody);

  // Kelebek Baş & Minik Antenler
  const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), darkStripesMat);
  bHead.position.set(0, 0.08, 0.12);
  bflyGroup.add(bHead);

  // Kelebeğin Renkli Kanatları
  const bWingMat = new THREE.MeshStandardMaterial({
    color: '#ec4899',
    roughness: 0.3,
    side: THREE.DoubleSide,
  });
  [-1, 1].forEach((bwSide) => {
    const bWingGroup = new THREE.Group();
    bWingGroup.position.set(bwSide * 0.03, 0.04, 0);
    bWingGroup.userData.isWingFlap = true;
    bWingGroup.userData.side = bwSide;
    bWingGroup.userData.maxFlap = 0.85;

    // Üst Kanat
    const upperGeo = new THREE.SphereGeometry(0.22, 12, 12);
    upperGeo.scale(1.0, 0.7, 0.06);
    const upperWing = new THREE.Mesh(upperGeo, bWingMat);
    upperWing.position.set(bwSide * 0.18, 0.08, 0.04);
    upperWing.rotation.y = bwSide * 0.3;
    upperWing.name = 'critters';
    bWingGroup.add(upperWing);

    // Alt Kanat
    const lowerGeo = new THREE.SphereGeometry(0.14, 12, 12);
    lowerGeo.scale(0.9, 0.7, 0.06);
    const lowerWing = new THREE.Mesh(
      lowerGeo,
      new THREE.MeshStandardMaterial({ color: '#a855f7', side: THREE.DoubleSide })
    );
    lowerWing.position.set(bwSide * 0.12, -0.08, -0.02);
    lowerWing.name = 'critters';
    bWingGroup.add(lowerWing);

    bflyGroup.add(bWingGroup);
  });

  crittersGroup.add(bflyGroup);
  group.add(crittersGroup);

  return group;
}

// 🌹 Kırmızı Gül (Classic 3D Red Rose with Spiral Layered Petals, Thorns & Dew Drops)
export function createRose(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'rose';

  const petalsCol = colors?.petals || '#CC0000'; // Parlak derin kırmızı
  const stemCol = colors?.stem || '#14532d'; // Koyu yeşil gül sapı
  const leavesCol = colors?.leaves || '#16a34a'; // Canlı yeşil yapraklar
  const dewCol = colors?.dew || '#ffffff'; // Çiğ damlaları

  const petalsMat = new THREE.MeshStandardMaterial({
    color: petalsCol,
    roughness: 0.22,
    metalness: 0.1,
  });
  const stemMat = new THREE.MeshStandardMaterial({ color: stemCol, roughness: 0.45, metalness: 0.1 });
  const leavesMat = new THREE.MeshStandardMaterial({ color: leavesCol, roughness: 0.35 });
  const dewMat = new THREE.MeshStandardMaterial({
    color: dewCol,
    roughness: 0.05,
    metalness: 0.9,
    transparent: true,
    opacity: 0.85,
  });

  // 1. Zemin Kaidesi & Çim Örtüsü (Grass Base Mound)
  const baseMound = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 0.14, 24), leavesMat);
  baseMound.position.y = 0.07;
  baseMound.name = 'leaves';
  baseMound.receiveShadow = true;
  group.add(baseMound);

  // 2. Uzun Gerçekçi Gül Sapı (Long Elegant Green Stem with Natural S-Curve)
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.1, 0),
    new THREE.Vector3(0.08, 1.0, -0.04),
    new THREE.Vector3(-0.06, 2.0, 0.05),
    new THREE.Vector3(0.02, 2.9, 0),
  ]);
  const stemGeo = new THREE.TubeGeometry(stemCurve, 28, 0.13, 14, false);
  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  stemMesh.name = 'stem';
  stemMesh.castShadow = true;
  group.add(stemMesh);

  // 3. Küçük Gerçekçi Dikenler (Realistic Thorns on Stem)
  const thornPositions = [
    { y: 0.85, angle: 0 },
    { y: 1.45, angle: Math.PI * 0.9 },
    { y: 2.15, angle: Math.PI * 1.4 },
    { y: 2.65, angle: Math.PI * 0.4 },
  ];
  thornPositions.forEach((tp) => {
    const thornGeo = new THREE.ConeGeometry(0.045, 0.18, 6);
    thornGeo.rotateZ(-Math.PI / 2);
    const thorn = new THREE.Mesh(thornGeo, stemMat);
    thorn.position.set(Math.cos(tp.angle) * 0.11, tp.y, Math.sin(tp.angle) * 0.11);
    thorn.rotation.y = -tp.angle;
    thorn.name = 'stem';
    group.add(thorn);
  });

  // 4. Sap Yanındaki 2-3 Yeşil Yaprak (Side Rose Leaves with Serrated Look)
  const leafConfigs = [
    { x: -0.48, y: 1.25, z: 0.04, rotZ: 0.55, rotY: 0.4, side: -1 },
    { x: 0.52, y: 1.95, z: -0.06, rotZ: -0.48, rotY: -0.35, side: 1 },
    { x: -0.42, y: 2.50, z: 0.02, rotZ: 0.40, rotY: 0.2, side: -1 },
  ];
  leafConfigs.forEach((cfg) => {
    const leafGroup = new THREE.Group();
    leafGroup.position.set(cfg.x, cfg.y, cfg.z);
    leafGroup.rotation.set(0.2, cfg.rotY, cfg.rotZ);

    // Oval-dişli gül yaprağı şekli
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.3, 0.22, 0.65, 0);
    leafShape.quadraticCurveTo(0.3, -0.22, 0, 0);

    const leafGeo = new THREE.ExtrudeGeometry(leafShape, {
      depth: 0.035,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.01,
      bevelThickness: 0.01,
    });
    const leaf = new THREE.Mesh(leafGeo, leavesMat);
    leaf.rotation.z = cfg.side === -1 ? Math.PI * 0.85 : -Math.PI * 0.15;
    leaf.name = 'leaves';
    leaf.castShadow = true;
    leafGroup.add(leaf);

    // Yaprak damarı
    const vein = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.58, 6),
      stemMat
    );
    vein.position.set(cfg.side * 0.3, 0, 0.02);
    vein.rotation.z = cfg.side === -1 ? -Math.PI / 2 : Math.PI / 2;
    vein.name = 'leaves';
    leafGroup.add(vein);

    group.add(leafGroup);
  });

  // 5. Muhteşem Kırmızı Gül Çiçek Başı Grubu (Magnificent Rose Blossom)
  const flowerGroup = new THREE.Group();
  flowerGroup.position.set(0.02, 3.02, 0);
  flowerGroup.rotation.set(0.08, 0, 0);

  // Çanak Yapraklar (Green Calyx Base)
  const calyxCount = 5;
  for (let c = 0; c < calyxCount; c++) {
    const cAngle = (c / calyxCount) * Math.PI * 2;
    const calyxGeo = new THREE.ConeGeometry(0.18, 0.55, 6);
    const calyx = new THREE.Mesh(calyxGeo, stemMat);
    calyx.position.set(Math.cos(cAngle) * 0.32, -0.12, Math.sin(cAngle) * 0.32);
    calyx.rotation.z = cAngle - Math.PI / 2;
    calyx.rotation.x = -0.45;
    calyx.name = 'stem';
    flowerGroup.add(calyx);
  }

  // Ortası Kapalı Tomurcuk (Tight Center Bud)
  const centerBudGeo = new THREE.SphereGeometry(0.32, 16, 16);
  centerBudGeo.scale(0.85, 1.25, 0.85);
  const centerBud = new THREE.Mesh(centerBudGeo, petalsMat);
  centerBud.position.y = 0.05;
  centerBud.name = 'petals';
  centerBud.castShadow = true;
  flowerGroup.add(centerBud);

  // Spiral Sarılmış Katmanlı Yapraklar (3-4 Layers of Spiral Opening Petals)
  const layers = [
    { count: 5, radius: 0.32, yOffset: -0.04, scale: 0.85, rotX: 0.35 },
    { count: 7, radius: 0.55, yOffset: -0.12, scale: 1.1, rotX: 0.55 },
    { count: 9, radius: 0.80, yOffset: -0.22, scale: 1.35, rotX: 0.75 },
    { count: 11, radius: 1.05, yOffset: -0.34, scale: 1.6, rotX: 0.95 },
  ];

  layers.forEach((layer, lIdx) => {
    for (let i = 0; i < layer.count; i++) {
      const angle = (i * Math.PI * 2) / layer.count + lIdx * 0.45;
      const petalGeo = new THREE.SphereGeometry(0.48 * layer.scale, 16, 16);
      petalGeo.scale(0.72, 1.15, 0.22);
      const petal = new THREE.Mesh(petalGeo, petalsMat);

      petal.position.set(
        Math.cos(angle) * layer.radius,
        layer.yOffset,
        Math.sin(angle) * layer.radius
      );
      petal.rotation.y = angle - Math.PI / 2;
      petal.rotation.x = layer.rotX;
      petal.rotation.z = (i % 2 === 0 ? 0.1 : -0.1);
      petal.name = 'petals';
      petal.castShadow = true;
      flowerGroup.add(petal);

      // ✨ Çiğ Damlası Efekti (Dew Drops on outer petals)
      if (lIdx >= 2 && i % 2 === 0) {
        const dewGeo = new THREE.SphereGeometry(0.045, 10, 10);
        dewGeo.scale(1, 0.6, 1);
        const dew = new THREE.Mesh(dewGeo, dewMat);
        dew.position.set(
          Math.cos(angle) * (layer.radius * 1.05),
          layer.yOffset + 0.08,
          Math.sin(angle) * (layer.radius * 1.05)
        );
        dew.name = 'petals';
        flowerGroup.add(dew);
      }
    }
  });

  group.add(flowerGroup);
  return group;
}

// 🌼 Papatya
export function createDaisy(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'daisy';

  const petalsCol = colors?.petals || '#ffffff';
  const centerCol = colors?.center || '#facc15';
  const stemCol = colors?.stem || '#22c55e';

  const petalsMat = new THREE.MeshStandardMaterial({ color: petalsCol, roughness: 0.3 });
  const centerMat = new THREE.MeshStandardMaterial({ color: centerCol, roughness: 0.4 });
  const stemMat = new THREE.MeshStandardMaterial({ color: stemCol, roughness: 0.5 });

  // Stem
  const stemGeo = new THREE.CylinderGeometry(0.1, 0.12, 2.6, 12);
  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  stemMesh.position.y = 1.3;
  stemMesh.name = 'stem';
  group.add(stemMesh);

  // Flower Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 2.6, 0);
  headGroup.rotation.x = 0.25;

  // Center button
  const centerGeo = new THREE.SphereGeometry(0.55, 20, 20);
  centerGeo.scale(1, 0.5, 1);
  const centerMesh = new THREE.Mesh(centerGeo, centerMat);
  centerMesh.name = 'center';
  headGroup.add(centerMesh);

  // 14 Oval Petals
  const count = 14;
  for (let i = 0; i < count; i++) {
    const angle = (i * Math.PI * 2) / count;
    const petalGeo = new THREE.SphereGeometry(0.35, 12, 12);
    petalGeo.scale(0.55, 0.12, 1.4);
    const petalMesh = new THREE.Mesh(petalGeo, petalsMat);
    petalMesh.position.set(Math.cos(angle) * 1.0, 0, Math.sin(angle) * 1.0);
    petalMesh.rotation.y = -angle + Math.PI / 2;
    petalMesh.name = 'petals';
    petalMesh.castShadow = true;
    headGroup.add(petalMesh);
  }

  group.add(headGroup);
  return group;
}

// 🌷 Tam Açık Lale (Fully Open Star-shaped Tulip with Pointed Curved Petals & Stamen Center)
export function createTulip(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'tulip';

  const petalsCol = colors?.petals || '#CC0000'; // Parlak Kırmızı / Lila / Turuncu / Sarı
  const stemCol = colors?.stem || '#16a34a'; // Taze yeşil sap
  const stamenCol = colors?.stamen || '#facc15'; // Sarı ercik başları
  const filamentCol = colors?.filament || '#ffffff'; // Beyaz filament sapları

  const petalsMat = new THREE.MeshStandardMaterial({
    color: petalsCol,
    roughness: 0.55, // Kadifemsi/mat görünüm (Velvety matte finish)
    metalness: 0.05,
  });
  const stemMat = new THREE.MeshStandardMaterial({ color: stemCol, roughness: 0.45 });
  const stamenMat = new THREE.MeshStandardMaterial({ color: stamenCol, roughness: 0.3 });
  const filamentMat = new THREE.MeshStandardMaterial({ color: filamentCol, roughness: 0.4 });

  // 1. Zemin Kaidesi & Çim Örtüsü (Grass Base Mound)
  const baseMound = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.95, 0.14, 24), stemMat);
  baseMound.position.y = 0.07;
  baseMound.name = 'leaves';
  baseMound.receiveShadow = true;
  group.add(baseMound);

  // 2. Uzun İnce Yeşil Sap (Long Slender Green Stem)
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.1, 0),
    new THREE.Vector3(0.04, 1.0, 0.02),
    new THREE.Vector3(-0.03, 1.9, -0.02),
    new THREE.Vector3(0, 2.7, 0),
  ]);
  const stemGeo = new THREE.TubeGeometry(stemCurve, 24, 0.11, 14, false);
  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  stemMesh.name = 'stem';
  stemMesh.castShadow = true;
  group.add(stemMesh);

  // 3. Sapın Ortasında 2 Uzun Şerit Lale Yaprağı (2 Tall Ribbon-like Tulip Leaves)
  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? 1 : -1;
    const leafGroup = new THREE.Group();
    leafGroup.position.set(side * 0.32, 1.1 + i * 0.4, 0);
    leafGroup.rotation.z = side * 0.35;
    leafGroup.rotation.y = side * 0.2;

    // Uzun ince lale yaprağı şekli (Long slender ribbon leaf)
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.22, 0.7, 0.08, 1.6);
    leafShape.quadraticCurveTo(-0.08, 0.7, 0, 0);

    const leafGeo = new THREE.ExtrudeGeometry(leafShape, {
      depth: 0.025,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.008,
      bevelThickness: 0.008,
    });
    const leafMesh = new THREE.Mesh(leafGeo, stemMat);
    leafMesh.name = 'leaves';
    leafMesh.castShadow = true;
    leafGroup.add(leafMesh);

    group.add(leafGroup);
  }

  // 4. Tam Açık Çiçek Başı Grubu (Fully Open Star-shaped Tulip Blossom)
  const flowerGroup = new THREE.Group();
  flowerGroup.position.set(0, 2.75, 0);
  flowerGroup.rotation.x = 0.12;

  // Merkez Siyah/Sarı Taban (Dark Center receptacle)
  const receptacleGeo = new THREE.SphereGeometry(0.22, 16, 16);
  receptacleGeo.scale(1, 0.6, 1);
  const receptacle = new THREE.Mesh(receptacleGeo, new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.5 }));
  receptacle.position.y = -0.04;
  receptacle.name = 'petals';
  flowerGroup.add(receptacle);

  // Sarı/Turuncu Ercik Noktaları & Filamentler (Stamen & Anthers in center)
  const stamenCount = 6;
  for (let s = 0; s < stamenCount; s++) {
    const sAngle = (s / stamenCount) * Math.PI * 2;
    
    // Filament
    const filGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.28, 6);
    const filament = new THREE.Mesh(filGeo, filamentMat);
    filament.position.set(Math.cos(sAngle) * 0.14, 0.08, Math.sin(sAngle) * 0.14);
    filament.rotation.z = Math.cos(sAngle) * 0.25;
    filament.rotation.x = -Math.sin(sAngle) * 0.25;
    filament.name = 'petals';
    flowerGroup.add(filament);

    // Anther (Ercik Başı)
    const antherGeo = new THREE.SphereGeometry(0.05, 8, 8);
    antherGeo.scale(0.8, 1.5, 0.8);
    const anther = new THREE.Mesh(antherGeo, stamenMat);
    anther.position.set(Math.cos(sAngle) * 0.22, 0.22, Math.sin(sAngle) * 0.22);
    anther.name = 'petals';
    flowerGroup.add(anther);
  }

  // 5. 6 Adet Tamamen Dışa Açılmış Yıldız Şeklinde Yaprak (6 Fully Flaring Star-like Petals)
  const petalCount = 6;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i * Math.PI * 2) / petalCount;
    
    // Sivri ve zarif lale yaprağı (Pointed elegant tulip petal geometry)
    const petalGeo = new THREE.SphereGeometry(0.75, 20, 20);
    petalGeo.scale(0.72, 1.45, 0.22);
    const petalMesh = new THREE.Mesh(petalGeo, petalsMat);

    // Dışa doğru tamamen açılmış ve hafif geriye eğik pozisyon (Flaring outward & gracefully curved back)
    petalMesh.position.set(Math.cos(angle) * 0.65, 0.15, Math.sin(angle) * 0.65);
    petalMesh.rotation.y = angle - Math.PI / 2;
    petalMesh.rotation.x = 0.75; // Geriye doğru eğik (Curved back)
    petalMesh.rotation.z = (i % 2 === 0 ? 0.05 : -0.05);
    petalMesh.name = 'petals';
    petalMesh.castShadow = true;
    flowerGroup.add(petalMesh);
  }

  group.add(flowerGroup);
  return group;
}

// =============================================================
// 🦁 2. Çeşitli Hayvanlar
// =============================================================

// 🦁 Sevimli Aslan
export function createLion(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'lion';

  const bodyCol = colors?.body || '#f59e0b';
  const maneCol = colors?.mane || '#b45309';
  const bellyCol = colors?.belly || '#fef3c7';

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.4 });
  const maneMat = new THREE.MeshStandardMaterial({ color: maneCol, roughness: 0.6 });
  const bellyMat = new THREE.MeshStandardMaterial({ color: bellyCol, roughness: 0.4 });

  // Body
  const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(1.1, 32, 32), bodyMat);
  bodyMesh.scale.set(1, 1.15, 1.1);
  bodyMesh.position.y = 1.25;
  bodyMesh.name = 'body';
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Belly
  const bellyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.8, 24, 24), bellyMat);
  bellyMesh.scale.set(0.85, 1.0, 0.4);
  bellyMesh.position.set(0, 1.15, 0.9);
  bellyMesh.name = 'belly';
  group.add(bellyMesh);

  // Head
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 32), bodyMat.clone());
  headMesh.position.set(0, 2.5, 0.4);
  headMesh.name = 'head';
  headMesh.castShadow = true;
  if (colors?.head) (headMesh.material as THREE.MeshStandardMaterial).color.set(colors.head);
  group.add(headMesh);

  // 3D Face
  addAnimalFace(group, headMesh, 0.85, 0, 0.95, colors);

  // Mane
  const manePuffs = 14;
  for (let i = 0; i < manePuffs; i++) {
    const angle = (i * Math.PI * 2) / manePuffs;
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), maneMat);
    puff.position.set(Math.cos(angle) * 1.1, 2.5 + Math.sin(angle) * 1.1, 0.15);
    puff.name = 'mane';
    group.add(puff);
  }

  // Snout
  const snoutMesh = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), bellyMat);
  snoutMesh.scale.set(1.2, 0.8, 0.8);
  snoutMesh.position.set(0, 2.2, 1.1);
  snoutMesh.name = 'snout';
  group.add(snoutMesh);

  // Ears
  for (let side = -1; side <= 1; side += 2) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), bodyMat);
    ear.position.set(side * 0.7, 3.2, 0.45);
    ear.name = 'ears';
    group.add(ear);
  }

  // Legs
  const legPositions = [
    { x: -0.55, z: 0.55, name: 'leg_FL' },
    { x: 0.55, z: 0.55, name: 'leg_FR' },
    { x: -0.6, z: -0.4, name: 'leg_BL' },
    { x: 0.6, z: -0.4, name: 'leg_BR' },
  ];
  legPositions.forEach((pos) => {
    const thigh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), bodyMat);
    thigh.scale.set(1, 1.2, 1);
    thigh.position.set(pos.x, 0.7, pos.z);
    thigh.name = pos.name;
    group.add(thigh);

    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.6, 16), bodyMat);
    leg.position.set(pos.x, 0.35, pos.z);
    leg.name = pos.name;
    group.add(leg);

    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), bodyMat);
    paw.scale.set(1, 0.65, 1.4);
    paw.position.set(pos.x, 0.15, pos.z + 0.1);
    paw.name = 'paws';
    group.add(paw);
  });

  // Tail
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.4, 12), bodyMat);
  tail.position.set(0, 1.1, -1.0);
  tail.rotation.x = -1.1;
  tail.name = 'tail';
  group.add(tail);

  const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), maneMat);
  tuft.position.set(0, 1.8, -1.75);
  tuft.name = 'mane_tip';
  group.add(tuft);

  return group;
}

// 🐶 2. Sevimli Köpek (Cute Chibi Puppy)
export function createDog(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'dog';

  const bodyCol = colors?.body || '#f59e0b'; // Sıcak sevimli altın sarısı
  const headCol = colors?.head || bodyCol;
  const bellyCol = colors?.belly || '#fef3c7'; // Krem göğüs
  const earsCol = colors?.ears || '#b45309'; // Tatlı kahverengi sarkan kulaklar
  const snoutCol = colors?.snout || '#ffffff'; // Beyaz ağızlık
  const pawsCol = colors?.paws || '#ffffff';

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.45 });
  const headMat = new THREE.MeshStandardMaterial({ color: headCol, roughness: 0.45 });
  const bellyMat = new THREE.MeshStandardMaterial({ color: bellyCol, roughness: 0.45 });
  const earsMat = new THREE.MeshStandardMaterial({ color: earsCol, roughness: 0.4 });
  const snoutMat = new THREE.MeshStandardMaterial({ color: snoutCol, roughness: 0.35 });
  const pawsMat = new THREE.MeshStandardMaterial({ color: pawsCol, roughness: 0.4 });
  const noseMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.15 }); // Parlak siyah burun
  const tongueMat = new THREE.MeshStandardMaterial({ color: '#fb7185', roughness: 0.3 }); // Pembe dil
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.1 });
  const glintMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

  // 1. Tombul Pofuduk Oturan Gövde
  const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 32), bodyMat);
  bodyMesh.scale.set(1.0, 1.08, 1.15);
  bodyMesh.position.set(0, 1.15, 0);
  bodyMesh.name = 'body';
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Göğüsteki Krem Pufudukluk (Karın)
  const bellyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 24), bellyMat);
  bellyMesh.scale.set(0.85, 1.05, 0.4);
  bellyMesh.position.set(0, 1.15, 0.85);
  bellyMesh.name = 'belly';
  group.add(bellyMesh);

  // 2. Kafa
  const headGroup = new THREE.Group();
  headGroup.name = 'head';
  headGroup.position.set(0, 2.25, 0.35);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.8, 24, 24), headMat);
  headMesh.scale.set(1.08, 0.95, 1.05);
  headMesh.name = 'head';
  headGroup.add(headMesh);

  // Beyaz Sevimli Ağızlık (Snout)
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 20), snoutMat);
  snout.scale.set(1.15, 0.8, 1.1);
  snout.position.set(0, -0.15, 0.72);
  snout.name = 'snout';
  headGroup.add(snout);

  // Parlak Siyah Düğme Burun (Nose)
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), noseMat);
  nose.scale.set(1.2, 0.85, 0.9);
  nose.position.set(0, -0.05, 1.08);
  nose.name = 'nose';
  headGroup.add(nose);

  // Dışarı Sarkan Tatlı Pembe Dil (Tongue)
  const tongue = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 14), tongueMat);
  tongue.scale.set(1.0, 0.4, 1.4);
  tongue.position.set(0.04, -0.28, 1.02);
  tongue.rotation.x = 0.25;
  tongue.name = 'tongue';
  headGroup.add(tongue);

  // Yanak Allıkları (Blush)
  const blushMat = new THREE.MeshBasicMaterial({ color: '#ff94a8', transparent: true, opacity: 0.65 });
  for (let s = -1; s <= 1; s += 2) {
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), blushMat);
    blush.scale.set(1.1, 0.6, 0.2);
    blush.position.set(s * 0.55, -0.12, 0.68);
    blush.name = s === -1 ? 'blush_L' : 'blush_R';
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
    g1.name = 'glint';
    eyePivot.add(g1);

    const g2 = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), glintMat);
    g2.position.set(s * -0.03, -0.03, 0.06);
    g2.name = 'glint';
    eyePivot.add(g2);

    headGroup.add(eyePivot);
  }

  // 4. İKİ YANA SARKAN POFUDUK KÖPEK KULAKLARI (🐶 Simgesindeki Gibi Sarkan Kulaklar!)
  for (let s = -1; s <= 1; s += 2) {
    const earGroup = new THREE.Group();
    earGroup.position.set(s * 0.78, 0.15, 0.15); // Yanakların yanından aşağı sarksın
    earGroup.rotation.z = s * -0.2;
    earGroup.rotation.x = 0.1;

    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), earsMat);
    ear.scale.set(0.65, 1.8, 0.45);
    ear.position.y = -0.15;
    ear.name = 'ears';
    earGroup.add(ear);

    headGroup.add(earGroup);
  }
  group.add(headGroup);

  // 5. Sevimli Beyaz Ön Patiler
  for (let s = -1; s <= 1; s += 2) {
    const frontPaw = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 14), pawsMat);
    frontPaw.scale.set(0.9, 0.7, 1.3);
    frontPaw.position.set(s * 0.35, 0.14, 0.9);
    frontPaw.name = 'paws';
    group.add(frontPaw);
  }

  // Arka Patiler
  for (let s = -1; s <= 1; s += 2) {
    const backPaw = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), pawsMat);
    backPaw.scale.set(1.0, 0.65, 1.4);
    backPaw.position.set(s * 0.65, 0.16, 0.3);
    backPaw.name = 'legs';
    group.add(backPaw);
  }

  // 6. Neşeyle Sallanan Pofuduk Köpek Kuyruğu
  const tailGroup = new THREE.Group();
  tailGroup.name = 'tail';
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.65, 12), bodyMat);
  tail.position.set(0, 0.95, -1.05);
  tail.rotation.x = -0.75;
  tailGroup.add(tail);

  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), pawsMat);
  tailTip.position.set(0, 1.25, -1.25);
  tailGroup.add(tailTip);
  group.add(tailGroup);

  return group;
}

// 🐰 3. Minik Tavşan (Kawaii Chibi Bunny)
export function createRabbit(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'rabbit';

  const bodyCol = colors?.body || '#ffffff';
  const headCol = colors?.head || bodyCol;
  const earsCol = colors?.ears || '#fbcfe8';
  const noseCol = colors?.snout || '#f472b6';

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.45 });
  const headMat = new THREE.MeshStandardMaterial({ color: headCol, roughness: 0.45 });
  const earsMat = new THREE.MeshStandardMaterial({ color: earsCol, roughness: 0.35 });
  const noseMat = new THREE.MeshStandardMaterial({ color: noseCol, roughness: 0.3 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.1 });
  const glintMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

  // 1. Pofuduk Gövde
  const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.95, 32, 32), bodyMat);
  bodyMesh.scale.set(1.0, 1.05, 1.15);
  bodyMesh.position.set(0, 1.15, 0);
  bodyMesh.name = 'body';
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Karın
  const bellyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 24), new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.5 }));
  bellyMesh.scale.set(0.85, 1.0, 0.35);
  bellyMesh.position.set(0, 1.15, 0.85);
  bellyMesh.name = 'belly';
  group.add(bellyMesh);

  // 2. Kafa
  const headGroup = new THREE.Group();
  headGroup.name = 'head';
  headGroup.position.set(0, 2.25, 0.35);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 24), headMat);
  headMesh.scale.set(1.05, 0.95, 1.0);
  headGroup.add(headMesh);

  // 3. İRİ PARILTILI GÖZLER (En Önde ve Net Görünsün!)
  for (let s = -1; s <= 1; s += 2) {
    const eyePivot = new THREE.Group();
    eyePivot.position.set(s * 0.32, 0.08, 0.72); // Gözleri öne aldık

    const eyeOrb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), eyeMat);
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

  // 4. Minik Tatlı Pembe Burun
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), noseMat);
  nose.scale.set(1.2, 0.85, 0.8);
  nose.position.set(0, -0.08, 0.82);
  nose.name = 'snout';
  headGroup.add(nose);

  // Tatlı Yanak Allıkları
  const blushMat = new THREE.MeshBasicMaterial({ color: '#ff94a8', transparent: true, opacity: 0.65 });
  for (let s = -1; s <= 1; s += 2) {
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), blushMat);
    blush.scale.set(1.1, 0.6, 0.2);
    blush.position.set(s * 0.52, -0.1, 0.65);
    headGroup.add(blush);
  }

  // 5. Kavisli Kulaklar
  for (let s = -1; s <= 1; s += 2) {
    const earPivot = new THREE.Group();
    earPivot.position.set(s * 0.3, 0.65, 0);
    earPivot.rotation.z = s * -0.18;
    earPivot.rotation.x = -0.22;

    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), bodyMat);
    ear.scale.set(0.65, 2.3, 0.28);
    ear.position.y = 0.72;
    ear.name = 'ears';
    earPivot.add(ear);

    const inner = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), earsMat);
    inner.scale.set(0.58, 2.0, 0.18);
    inner.position.set(0, 0.7, 0.08);
    inner.name = 'inner_ears';
    earPivot.add(inner);

    headGroup.add(earPivot);
  }
  group.add(headGroup);

  // 6. Arka Patiler
  for (let s = -1; s <= 1; s += 2) {
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), bodyMat);
    foot.scale.set(0.9, 0.55, 1.4);
    foot.position.set(s * 0.55, 0.15, 0.35);
    foot.name = 'legs';
    group.add(foot);
  }

  // 7. Pofuduk Pamuk Kuyruk
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.6 }));
  tail.position.set(0, 0.65, -1.05);
  tail.name = 'tail';
  group.add(tail);

  return group;
}

// 🐮 4. Sütçü İnek (Chibi Cow)
export function createCow(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'cow';

  const bodyCol = colors?.body || '#ffffff';
  const headCol = colors?.head || bodyCol;
  const spotsCol = colors?.spots || '#1e293b';
  const snoutCol = colors?.snout || '#fbcfe8';
  const hornsCol = colors?.horns || '#facc15';
  const hoovesCol = colors?.hooves || '#1e293b';

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.4 });
  const headMat = new THREE.MeshStandardMaterial({ color: headCol, roughness: 0.4 });
  const spotsMat = new THREE.MeshStandardMaterial({ color: spotsCol, roughness: 0.35 });
  const snoutMat = new THREE.MeshStandardMaterial({ color: snoutCol, roughness: 0.3 });
  const hornsMat = new THREE.MeshStandardMaterial({ color: hornsCol, roughness: 0.25 });
  const hoovesMat = new THREE.MeshStandardMaterial({ color: hoovesCol, roughness: 0.3 });

  // 1. Chubby Puffy Body
  const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 32), bodyMat);
  bodyMesh.scale.set(1.0, 0.95, 1.35);
  bodyMesh.position.set(0, 1.25, 0);
  bodyMesh.name = 'body';
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // 2. Cute Rounded Black Spots on Body
  const spotConfigs = [
    { pos: [0.45, 1.65, -0.3], scale: [0.65, 0.35, 0.65], rot: [0.2, 0.3, -0.2] },
    { pos: [-0.65, 1.25, 0.2], scale: [0.55, 0.45, 0.55], rot: [0, 0, 0.4] },
    { pos: [0.6, 1.35, 0.5], scale: [0.5, 0.4, 0.5], rot: [0, -0.2, -0.3] },
    { pos: [-0.45, 1.55, -0.65], scale: [0.6, 0.35, 0.6], rot: [-0.2, -0.2, 0.2] },
  ];
  spotConfigs.forEach((cfg) => {
    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), spotsMat);
    spot.scale.set(cfg.scale[0], cfg.scale[1], cfg.scale[2]);
    spot.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
    spot.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
    spot.name = 'spots';
    spot.castShadow = true;
    group.add(spot);
  });

  // 3. Cute Round Head & Eye Spot
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.75, 32, 32), headMat);
  headMesh.scale.set(1.05, 1.0, 1.05);
  headMesh.position.set(0, 2.2, 0.65);
  headMesh.name = 'head';
  headMesh.castShadow = true;
  group.add(headMesh);

  // Eye Spot Patch on Left Eye
  const eyeSpot = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), spotsMat);
  eyeSpot.scale.set(1.1, 1.1, 0.25);
  eyeSpot.position.set(-0.3, 2.35, 1.12);
  eyeSpot.rotation.y = -0.25;
  eyeSpot.name = 'spots';
  group.add(eyeSpot);

  // 4. Soft Baby Pink Snout
  const snoutMesh = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 20), snoutMat);
  snoutMesh.scale.set(1.15, 0.68, 0.75);
  snoutMesh.position.set(0, 1.9, 1.25);
  snoutMesh.name = 'snout';
  snoutMesh.castShadow = true;
  group.add(snoutMesh);

  // Nostril Dots
  for (let side = -1; side <= 1; side += 2) {
    const nostril = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 12, 12),
      new THREE.MeshStandardMaterial({ color: '#db2777', roughness: 0.3 })
    );
    nostril.scale.set(1, 1.2, 0.4);
    nostril.position.set(side * 0.16, 1.92, 1.58);
    nostril.name = 'snout';
    group.add(nostril);
  }

  // 5. Floppy Ears
  for (let side = -1; side <= 1; side += 2) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), bodyMat);
    ear.scale.set(1.2, 0.4, 0.5);
    ear.position.set(side * 0.72, 2.3, 0.65);
    ear.rotation.z = side * -0.3;
    ear.rotation.y = side * -0.2;
    ear.name = 'ears';
    ear.castShadow = true;
    group.add(ear);

    // Horns
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.42, 16), hornsMat);
    horn.position.set(side * 0.35, 2.82, 0.6);
    horn.rotation.z = side * -0.28;
    horn.rotation.x = -0.1;
    horn.name = 'horns';
    horn.castShadow = true;
    group.add(horn);
  }

  // 6. 4 Chubby Legs & Hooves
  const legPositions = [
    { x: -0.5, z: 0.6, name: 'leg_FL' },
    { x: 0.5, z: 0.6, name: 'leg_FR' },
    { x: -0.5, z: -0.6, name: 'leg_BL' },
    { x: 0.5, z: -0.6, name: 'leg_BR' },
  ];
  legPositions.forEach((pos) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.7, 16), bodyMat);
    leg.position.set(pos.x, 0.5, pos.z);
    leg.name = 'legs';
    leg.castShadow = true;
    group.add(leg);

    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.27, 0.25, 16), hoovesMat);
    hoof.position.set(pos.x, 0.125, pos.z);
    hoof.name = 'hooves';
    hoof.castShadow = true;
    group.add(hoof);
  });

  // 7. Cute Tail & Fluffy Tuft
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.45, -1.05),
    new THREE.Vector3(0, 1.1, -1.25),
    new THREE.Vector3(0, 0.7, -1.35),
  ]);
  const tailGeo = new THREE.TubeGeometry(tailCurve, 12, 0.06, 12, false);
  const tailMesh = new THREE.Mesh(tailGeo, bodyMat);
  tailMesh.name = 'tail';
  tailMesh.castShadow = true;
  group.add(tailMesh);

  const tailTuft = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), spotsMat);
  tailTuft.position.set(0, 0.65, -1.38);
  tailTuft.name = 'spots';
  tailTuft.castShadow = true;
  group.add(tailTuft);

  // 8. Kawaii Face (Sparkling Eyes, Blush, Mouth)
  addAnimalFace(group, headMesh, 0.62, -0.05, 0.85, colors);

  return group;
}

// 🐑 5. Sevimli Pamuk Kuzu (Cute Fluffy Lamb)
export function createSheep(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'sheep';

  const bodyCol = colors?.body || '#ffffff';
  const headCol = colors?.head || '#334155';
  const noseCol = colors?.snout || '#f472b6';
  const legsCol = colors?.legs || '#1e293b';

  const woolMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.8 });
  const headMat = new THREE.MeshStandardMaterial({ color: headCol, roughness: 0.4 });
  const noseMat = new THREE.MeshStandardMaterial({ color: noseCol, roughness: 0.3 });
  const legsMat = new THREE.MeshStandardMaterial({ color: legsCol, roughness: 0.4 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.1 });
  const glintMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

  // 1. Gövde - Pofuduk Pamuk Bulut (Fluffy Cloud Body)
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'body';

  const mainBody = new THREE.Mesh(new THREE.SphereGeometry(0.95, 24, 24), woolMat);
  mainBody.scale.set(1.0, 1.0, 1.25);
  mainBody.position.set(0, 1.25, 0);
  mainBody.name = 'body';
  bodyGroup.add(mainBody);

  // Cloud puffs surrounding the body smoothly
  const puffPositions = [
    { pos: [0, 1.5, 0.3], s: 0.55 },
    { pos: [0, 1.5, -0.3], s: 0.55 },
    { pos: [0.5, 1.35, 0.4], s: 0.5 },
    { pos: [-0.5, 1.35, 0.4], s: 0.5 },
    { pos: [0.55, 1.3, -0.2], s: 0.5 },
    { pos: [-0.55, 1.3, -0.2], s: 0.5 },
    { pos: [0.4, 1.0, 0.6], s: 0.45 },
    { pos: [-0.4, 1.0, 0.6], s: 0.45 },
    { pos: [0, 1.2, -0.75], s: 0.55 },
    { pos: [0, 1.6, 0], s: 0.6 },
  ];

  puffPositions.forEach(p => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(p.s, 16, 16), woolMat);
    puff.position.set(p.pos[0], p.pos[1], p.pos[2]);
    puff.name = 'body';
    bodyGroup.add(puff);
  });
  group.add(bodyGroup);

  // 2. Kafa (Dark Head)
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.65, 24, 24), headMat);
  headMesh.scale.set(1.0, 1.05, 1.15);
  headMesh.position.set(0, 1.9, 0.9);
  headMesh.name = 'head';
  headMesh.castShadow = true;
  group.add(headMesh);

  // 3. Yün Tacı / Perçem (Wool Crown)
  const crownGroup = new THREE.Group();
  crownGroup.name = 'wool_crown';
  const crownPuffs = [
    { pos: [0, 2.5, 0.85], s: 0.35 },
    { pos: [-0.18, 2.45, 0.9], s: 0.28 },
    { pos: [0.18, 2.45, 0.9], s: 0.28 },
    { pos: [0, 2.48, 1.05], s: 0.25 },
  ];
  crownPuffs.forEach(cp => {
    const p = new THREE.Mesh(new THREE.SphereGeometry(cp.s, 16, 16), woolMat);
    p.position.set(cp.pos[0], cp.pos[1], cp.pos[2]);
    p.name = 'wool_crown';
    crownGroup.add(p);
  });
  group.add(crownGroup);

  // 4. Sarkık Sevimli Kulaklar (Droopy Ears)
  for (let side = -1; side <= 1; side += 2) {
    const earGroup = new THREE.Group();
    earGroup.position.set(side * 0.55, 2.1, 0.85);
    earGroup.rotation.z = side * -0.6;
    earGroup.rotation.x = 0.2;

    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), headMat);
    ear.scale.set(1.2, 0.45, 0.5);
    ear.name = 'ears';
    earGroup.add(ear);

    const innerEar = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), noseMat);
    innerEar.scale.set(1.1, 0.35, 0.4);
    innerEar.position.set(0, -0.02, 0.05);
    innerEar.name = 'ears';
    earGroup.add(innerEar);

    group.add(earGroup);
  }

  // 5. Sevimli Pembe Burun (Pink Nose)
  const snoutMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), noseMat);
  snoutMesh.scale.set(1.1, 0.75, 0.7);
  snoutMesh.position.set(0, 1.75, 1.5);
  snoutMesh.name = 'snout';
  group.add(snoutMesh);

  // 6. İri Parıltılı Anime Gözleri (Anime Eyes)
  const eyeNames = ['eye_iris_L', 'eye_iris_R'];
  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? -1 : 1;
    const eyePivot = new THREE.Group();
    eyePivot.position.set(side * 0.32, 2.02, 1.38);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), pupilMat);
    pupil.scale.set(1.0, 1.15, 0.35);
    pupil.name = eyeNames[i];
    eyePivot.add(pupil);

    const g1 = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), glintMat);
    g1.position.set(side * 0.04, 0.05, 0.06);
    eyePivot.add(g1);

    const g2 = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), glintMat);
    g2.position.set(side * -0.035, -0.035, 0.06);
    eyePivot.add(g2);

    group.add(eyePivot);
  }

  // 7. 4 Adet İnce Sevimli Kuzu Bacağı ve Toynaklar (4 Legs & Hooves)
  const legPositions = [
    { x: -0.4, z: 0.45, name: 'leg_FL' },
    { x: 0.4, z: 0.45, name: 'leg_FR' },
    { x: -0.4, z: -0.45, name: 'leg_BL' },
    { x: 0.4, z: -0.45, name: 'leg_BR' },
  ];

  legPositions.forEach(p => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.7, 16), legsMat);
    leg.position.set(p.x, 0.45, p.z);
    leg.name = p.name;
    group.add(leg);

    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.15, 16), legsMat);
    hoof.position.set(p.x, 0.08, p.z);
    hoof.name = 'hooves';
    group.add(hoof);
  });

  return group;
}

export function createHorse(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'horse';

  const bodyCol = colors?.body || '#d97706';
  const headCol = colors?.head || bodyCol;
  const maneCol = colors?.mane || '#451a03';
  const snoutCol = colors?.snout || '#fde68a';
  const hoovesCol = colors?.hooves || '#1e293b';

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.38 });
  const headMat = new THREE.MeshStandardMaterial({ color: headCol, roughness: 0.38 });
  const maneMat = new THREE.MeshStandardMaterial({ color: maneCol, roughness: 0.35 });
  const snoutMat = new THREE.MeshStandardMaterial({ color: snoutCol, roughness: 0.3 });
  const hoovesMat = new THREE.MeshStandardMaterial({ color: hoovesCol, roughness: 0.25 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.1 });
  const glintMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

  // 1. Gövde (Göğüs + Sırt + Kalça)
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'body';
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 24), bodyMat);
  chest.scale.set(1.0, 1.1, 1.0);
  chest.position.set(0, 1.5, 0.65);
  bodyGroup.add(chest);

  const mid = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.7, 1.3, 24), bodyMat);
  mid.rotateX(Math.PI / 2);
  mid.position.set(0, 1.45, 0);
  bodyGroup.add(mid);

  const rump = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 24), bodyMat);
  rump.scale.set(1.0, 1.05, 1.0);
  rump.position.set(0, 1.48, -0.65);
  bodyGroup.add(rump);
  group.add(bodyGroup);

  // 2. Asil Boyun
  const neckGroup = new THREE.Group();
  neckGroup.name = 'neck';
  const neckGeo = new THREE.CylinderGeometry(0.38, 0.62, 1.35, 24);
  neckGeo.scale(0.85, 1.0, 1.25);
  const neckMesh = new THREE.Mesh(neckGeo, bodyMat);
  neckMesh.position.set(0, 2.25, 0.82);
  neckMesh.rotation.x = -0.45;
  neckGroup.add(neckMesh);
  group.add(neckGroup);

  // 3. Kafa ve Burun
  const headGroup = new THREE.Group();
  headGroup.name = 'head';
  headGroup.position.set(0, 2.85, 1.2);
  headGroup.rotation.x = 0.25;

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), headMat);
  headMesh.scale.set(0.9, 1.1, 1.2);
  headGroup.add(headMesh);

  // Burun (Snout)
  const snoutMesh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 20, 20), snoutMat);
  snoutMesh.scale.set(0.85, 0.8, 1.2);
  snoutMesh.position.set(0, -0.22, 0.58);
  snoutMesh.name = 'snout';
  headGroup.add(snoutMesh);

  // Burun Delikleri
  const nostrilMat = new THREE.MeshBasicMaterial({ color: '#451a03' });
  for (let s = -1; s <= 1; s += 2) {
    const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), nostrilMat);
    nostril.position.set(s * 0.12, -0.22, 0.98);
    headGroup.add(nostril);
  }

  // 4. İRİ PARILTILI GÖZLER (Kesinlikle Eklensin!)
  for (let s = -1; s <= 1; s += 2) {
    const eyePivot = new THREE.Group();
    eyePivot.position.set(s * 0.38, 0.08, 0.32);
    eyePivot.rotation.y = s * 0.35;

    const eyeOrb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), eyeMat);
    eyeOrb.scale.set(1.0, 1.1, 0.4);
    eyeOrb.name = s === -1 ? 'eye_iris_L' : 'eye_iris_R';
    eyePivot.add(eyeOrb);

    const g1 = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), glintMat);
    g1.position.set(s * 0.03, 0.05, 0.07);
    eyePivot.add(g1);

    const g2 = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), glintMat);
    g2.position.set(s * -0.04, -0.04, 0.07);
    eyePivot.add(g2);

    headGroup.add(eyePivot);
  }

  // 5. Kulaklar
  const earMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.35 });
  for (let s = -1; s <= 1; s += 2) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.42, 16), earMat);
    ear.position.set(s * 0.28, 0.62, -0.05);
    ear.rotation.z = s * -0.15;
    ear.rotation.x = -0.1;
    ear.name = 'ears';
    headGroup.add(ear);
  }
  group.add(headGroup);

  // 6. ÇİZİMDEKİ GİBİ UZUN VE DÖKÜMLÜ YELE (MANE)
  const maneGroup = new THREE.Group();
  maneGroup.name = 'mane';

  // Alın Perçemi (Forelock)
  const forelock = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 16), maneMat);
  forelock.position.set(0, 3.15, 1.45);
  forelock.rotation.set(0.6, 0.1, -0.2);
  forelock.name = 'mane';
  maneGroup.add(forelock);

  // Boyun Yelesi Dalgaları (Mane Waves)
  const maneWaves = [
    { pos: [0.15, 2.85, 1.0], scale: [0.45, 0.5, 0.4], rot: [0.4, 0.1, -0.15] },
    { pos: [0.22, 2.55, 0.85], scale: [0.5, 0.55, 0.45], rot: [0.35, 0.15, -0.2] },
    { pos: [0.25, 2.2, 0.7], scale: [0.55, 0.6, 0.5], rot: [0.25, 0.15, -0.25] },
    { pos: [0.28, 1.85, 0.6], scale: [0.5, 0.65, 0.5], rot: [0.15, 0.1, -0.25] },
    { pos: [0.25, 1.5, 0.55], scale: [0.45, 0.6, 0.45], rot: [0.05, 0.05, -0.2] },
  ];
  maneWaves.forEach(w => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), maneMat);
    m.scale.set(w.scale[0], w.scale[1], w.scale[2]);
    m.position.set(w.pos[0], w.pos[1], w.pos[2]);
    m.rotation.set(w.rot[0], w.rot[1], w.rot[2]);
    m.name = 'mane';
    maneGroup.add(m);
  });
  group.add(maneGroup);

  // 7. ÇİZİMDEKİ GİBİ YERE KADAR SÜZÜLEN ASİL AT KUYRUĞU (TAIL)
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.75, -1.05),
    new THREE.Vector3(0.05, 1.6, -1.35),
    new THREE.Vector3(0.1, 1.1, -1.3),
    new THREE.Vector3(0.08, 0.6, -1.15),
    new THREE.Vector3(0.05, 0.25, -1.05),
  ]);
  const tailGeo = new THREE.TubeGeometry(tailCurve, 24, 0.18, 16, false);
  const tailMesh = new THREE.Mesh(tailGeo, maneMat);
  tailMesh.name = 'tail';
  tailMesh.castShadow = true;
  group.add(tailMesh);

  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), maneMat);
  tailTip.scale.set(0.9, 1.4, 0.9);
  tailTip.position.set(0.05, 0.25, -1.05);
  tailTip.name = 'tail';
  group.add(tailTip);

  // 8. 4 Tane Boylu Poslu Bacak ve Toynaklar
  const legPositions = [
    { x: -0.42, z: 0.65, name: 'leg_FL' },
    { x: 0.42, z: 0.65, name: 'leg_FR' },
    { x: -0.42, z: -0.65, name: 'leg_BL' },
    { x: 0.42, z: -0.65, name: 'leg_BR' },
  ];
  legPositions.forEach(p => {
    const legGroup = new THREE.Group();
    legGroup.position.set(p.x, 0, p.z);
    legGroup.name = 'legs';

    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.65, 16), bodyMat);
    upper.position.y = 0.85;
    legGroup.add(upper);

    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.6, 16), bodyMat);
    lower.position.y = 0.35;
    legGroup.add(lower);

    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.16, 16), hoovesMat);
    hoof.position.y = 0.08;
    hoof.name = 'hooves';
    legGroup.add(hoof);

    group.add(legGroup);
  });

  return group;
}

// 🦜 7. Yetişkin Muhabbet Kuşu & Papağan (Adult Budgerigar / Parrot on Perch)
export function createChick(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'chick';

  // Default Palette: Classic vibrant Green & Yellow Budgerigar / Parrot with blue tail accents
  const bodyCol = colors?.body || '#22c55e'; // Canlı zümrüt yeşili
  const headCol = colors?.head || '#facc15'; // Güneş sarısı baş & maske
  const bellyCol = colors?.belly || '#4ade80'; // Açık yeşil/sarı göğüs
  const wingsCol = colors?.wings || '#16a34a'; // Koyu yeşil ve mavi kanatlar
  const tailCol = colors?.tail || '#0284c7'; // Uzun parlak mavi kuyruk tüyleri
  const beakCol = colors?.beak || '#f59e0b'; // Sarı/kehribar kıvrık gaga
  const feetCol = colors?.feet || '#fb923c'; // Pençeler
  const blushCol = colors?.blush || '#818cf8'; // Muhabbet kuşu menekşe yanak lekesi
  const perchCol = colors?.perch || '#a16207'; // Sıcak ahşap tünek
  const pupilCol = colors?.eyes || '#0f172a';

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.35 });
  const headMat = new THREE.MeshStandardMaterial({ color: headCol, roughness: 0.35 });
  const bellyMat = new THREE.MeshStandardMaterial({ color: bellyCol, roughness: 0.35 });
  const wingsMat = new THREE.MeshStandardMaterial({ color: wingsCol, roughness: 0.32 });
  const tailMat = new THREE.MeshStandardMaterial({ color: tailCol, roughness: 0.28 });
  const beakMat = new THREE.MeshStandardMaterial({ color: beakCol, roughness: 0.25 });
  const cereMat = new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.3 }); // Mavi burun kemeri (cere)
  const feetMat = new THREE.MeshStandardMaterial({ color: feetCol, roughness: 0.4 });
  const perchMat = new THREE.MeshStandardMaterial({ color: perchCol, roughness: 0.6 });
  const blushMat = new THREE.MeshBasicMaterial({ color: blushCol, transparent: true, opacity: 0.85 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: pupilCol, roughness: 0.08 });
  const glintMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

  // 1. Ahşap Tünek Düzeneği (Wooden Perch Stand)
  const perchGroup = new THREE.Group();
  perchGroup.name = 'perch';

  // Yatay Ahşap Dal / Tünek Barı
  const perchBarGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.6, 16);
  perchBarGeo.rotateZ(Math.PI / 2);
  const perchBar = new THREE.Mesh(perchBarGeo, perchMat);
  perchBar.position.set(0, 1.15, 0);
  perchBar.name = 'perch';
  perchBar.castShadow = true;
  perchBar.receiveShadow = true;
  perchGroup.add(perchBar);

  // Dalın iki ucundaki ahşap kapaklar
  for (let s = -1; s <= 1; s += 2) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 16), perchMat);
    cap.rotateZ(Math.PI / 2);
    cap.position.set(s * 1.32, 1.15, 0);
    cap.name = 'perch';
    perchGroup.add(cap);

    // Dikey ahşap destek direkleri (podiuma inen)
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.15, 12), perchMat);
    post.position.set(s * 0.95, 0.58, 0);
    post.name = 'perch';
    post.castShadow = true;
    perchGroup.add(post);
  }
  group.add(perchGroup);

  // 2. Tüneği Kavrayan Pençeler (Zygodactyl Parrot Claws on Perch)
  for (let s = -1; s <= 1; s += 2) {
    const footGroup = new THREE.Group();
    footGroup.position.set(s * 0.22, 1.15, 0);
    footGroup.name = 'feet';

    // Ön 2 parmak (önden dalı saran kıvrık tırnaklar)
    for (let j = -1; j <= 1; j += 2) {
      const frontClaw = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), feetMat);
      frontClaw.scale.set(0.8, 0.6, 1.4);
      frontClaw.position.set(j * 0.05, 0.09, 0.08);
      frontClaw.rotation.x = Math.PI / 3;
      frontClaw.name = 'feet';
      frontClaw.castShadow = true;
      footGroup.add(frontClaw);
    }

    // Arka parmak (arkadan dalı kavrayan)
    const backClaw = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), feetMat);
    backClaw.scale.set(0.9, 0.6, 1.3);
    backClaw.position.set(0, 0.07, -0.09);
    backClaw.rotation.x = -Math.PI / 3;
    backClaw.name = 'feet';
    footGroup.add(backClaw);

    group.add(footGroup);
  }

  // 3. Yetişkin Kuş Gövdesi (Sleek Upright Adult Bird Torso)
  // Dik ve asil duruş, tünekten yukarı doğru yükselen pürüzsüz hat
  const bodyGeo = new THREE.SphereGeometry(0.62, 32, 32);
  bodyGeo.scale(0.88, 1.35, 0.85);
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.set(0, 1.82, -0.02);
  bodyMesh.rotation.x = 0.16; // Asil hafif öne doğru oturma açısı
  bodyMesh.name = 'body';
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // 4. Canlı Göğüs (Vibrant Puffed Chest / Belly)
  const bellyGeo = new THREE.SphereGeometry(0.52, 28, 28);
  bellyGeo.scale(0.85, 1.15, 0.45);
  const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat);
  bellyMesh.position.set(0, 1.82, 0.32);
  bellyMesh.rotation.x = 0.16;
  bellyMesh.name = 'belly';
  bellyMesh.castShadow = true;
  group.add(bellyMesh);

  // 5. Baş & Sarı Maske (Proud Head with Yellow Mask)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 2.62, 0.16);
  headGroup.name = 'head';

  const headGeo = new THREE.SphereGeometry(0.54, 32, 32);
  headGeo.scale(0.96, 1.05, 1.02);
  const headMesh = new THREE.Mesh(headGeo, headMat);
  headMesh.name = 'head';
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Gösterişli Tepe Tüyleri / Papağan İbiği (Majestic Feather Crest / Crown)
  for (let i = 0; i < 4; i++) {
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.065 - i * 0.008, 0.38 + i * 0.08, 12), headMat);
    crest.position.set(0, 0.54 + i * 0.06, -0.08 - i * 0.08);
    crest.rotation.x = -0.35 - i * 0.18;
    crest.name = 'head';
    crest.castShadow = true;
    headGroup.add(crest);
  }

  // 6. Kıvrık Papağan Gagası & Burun Kemeri (Curved Hook Beak & Cere)
  // Üst kıvrık gaga
  const upperBeakGeo = new THREE.ConeGeometry(0.18, 0.44, 16);
  upperBeakGeo.rotateX(Math.PI / 1.75); // Aşağı doğru güçlü kavis
  const upperBeak = new THREE.Mesh(upperBeakGeo, beakMat);
  upperBeak.position.set(0, -0.05, 0.58);
  upperBeak.name = 'beak';
  upperBeak.castShadow = true;
  headGroup.add(upperBeak);

  // Alt gaga
  const lowerBeak = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 12), beakMat);
  lowerBeak.rotateX(Math.PI / 2.2);
  lowerBeak.position.set(0, -0.16, 0.52);
  lowerBeak.name = 'beak';
  headGroup.add(lowerBeak);

  // Mavi Burun Kemeri (Cere)
  const cere = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 14), cereMat);
  cere.scale.set(1.2, 0.65, 0.5);
  cere.position.set(0, 0.08, 0.54);
  cere.name = 'beak';
  headGroup.add(cere);

  // 7. Parlak Anime Gözleri & Yanak Lekeleri (Eyes & Violet Budgie Patches)
  for (let s = -1; s <= 1; s += 2) {
    const eyePivot = new THREE.Group();
    eyePivot.name = 'eyes';
    eyePivot.position.set(s * 0.44, 0.12, 0.32);
    eyePivot.rotation.set(-0.05, s * 0.42, 0);

    // Deep dark pupil
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 20), pupilMat);
    pupil.scale.set(1, 1.1, 0.35);
    pupil.name = 'eyes';
    eyePivot.add(pupil);

    // Beyaz parlak iris halkası
    const irisRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.08, 0.015, 6, 16, Math.PI * 0.8),
      glintMat
    );
    irisRim.position.set(0, -0.02, 0.04);
    eyePivot.add(irisRim);

    // Büyük parıltı (Glint)
    const g1 = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 12), glintMat);
    g1.position.set(s * 0.025, 0.038, 0.045);
    eyePivot.add(g1);

    // Küçük sevimli parıltı
    const g2 = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 10), glintMat);
    g2.position.set(s * -0.025, -0.025, 0.045);
    eyePivot.add(g2);

    headGroup.add(eyePivot);

    // Yanak Allığı / Muhabbet Kuşu Menekşe Lekesi (Violet Cheek Patch)
    const cheekPatch = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 14), blushMat);
    cheekPatch.scale.set(1.1, 0.6, 0.2);
    cheekPatch.position.set(s * 0.48, -0.15, 0.28);
    cheekPatch.rotation.set(-0.06, s * 0.45, s * -0.15);
    cheekPatch.name = 'blush';
    headGroup.add(cheekPatch);
  }
  group.add(headGroup);

  // 8. Belirgin ve Açılıp Kapanabilen Kanatlar (Wings with Distinct Flight Feathers)
  // Kanatlar omuz pivotundan hareket eder: userData.isWingFlap ile animasyonda açılıp kapanır!
  for (let s = -1; s <= 1; s += 2) {
    const wingPivot = new THREE.Group();
    wingPivot.position.set(s * 0.58, 2.15, -0.02);
    wingPivot.rotation.set(0.18, s * 0.12, s * -0.15); // Kapalıyken gövdeyi saran açı
    wingPivot.name = 'wings';

    // Animation tags: ThreeCanvas loop opens and closes the wings smoothly!
    wingPivot.userData.isWingFlap = true;
    wingPivot.userData.side = s;
    wingPivot.userData.baseRotZ = s * -0.15;
    wingPivot.userData.baseRotY = s * 0.12;
    wingPivot.userData.maxFlap = 0.72;

    // Kanat Omuz Örtü Tüyleri (Covert feathers plate)
    const shoulderGeo = new THREE.SphereGeometry(0.35, 18, 18);
    shoulderGeo.scale(0.35, 0.85, 0.65);
    const shoulderMesh = new THREE.Mesh(shoulderGeo, wingsMat);
    shoulderMesh.name = 'wings';
    shoulderMesh.castShadow = true;
    wingPivot.add(shoulderMesh);

    // 5 Katmanlı Uzun Uçuş Telekleri (Primary & Secondary Flight Feathers)
    for (let f = 0; f < 5; f++) {
      const featherGeo = new THREE.ConeGeometry(0.11, 0.75 + f * 0.08, 12);
      featherGeo.scale(0.35, 1, 0.85);
      const featherMesh = new THREE.Mesh(featherGeo, wingsMat);
      featherMesh.position.set(s * (0.04 + f * 0.02), -0.5 - f * 0.12, -0.15 - f * 0.08);
      featherMesh.rotation.set(0.35 + f * 0.06, 0, s * -0.1);
      featherMesh.name = 'wings';
      featherMesh.castShadow = true;
      wingPivot.add(featherMesh);

      // Kanat teleklerinin ucunda sarı/mavi kontrast süs
      const tipMesh = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 10), headMat);
      tipMesh.scale.set(0.35, 1, 0.85);
      tipMesh.position.set(s * (0.04 + f * 0.02), -0.85 - f * 0.14, -0.22 - f * 0.09);
      tipMesh.rotation.set(0.35 + f * 0.06, 0, s * -0.1);
      tipMesh.name = 'wings';
      wingPivot.add(tipMesh);
    }

    group.add(wingPivot);
  }

  // 9. Uzun Renkli ve Gösterişli Kuyruk Tüyleri (Long Gorgeous Tail Feathers)
  // Tüneğin arkasından aşağı doğru dökülen 1.3 birim uzunluğunda görkemli kuyruk!
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 1.45, -0.38);
  tailGroup.name = 'tail';
  tailGroup.userData.isTailSway = true;
  tailGroup.userData.baseRotX = -0.18;

  // En uzun 2 orta kuyruk tüyü (Central royal blue rectrices)
  for (let s = -1; s <= 1; s += 2) {
    const mainFeather = new THREE.Mesh(new THREE.ConeGeometry(0.11, 1.45, 16), tailMat);
    mainFeather.scale.set(0.35, 1.0, 1.0);
    mainFeather.position.set(s * 0.04, -0.72, -0.12);
    mainFeather.rotation.set(-0.22, 0, s * 0.04);
    mainFeather.name = 'tail';
    mainFeather.castShadow = true;
    tailGroup.add(mainFeather);
  }

  // Yanlardaki kademeli renkli kuyruk tüyleri (Tiered side feathers in turquoise & yellow)
  for (let s = -1; s <= 1; s += 2) {
    const sideFeather = new THREE.Mesh(new THREE.ConeGeometry(0.09, 1.05, 12), bodyMat);
    sideFeather.scale.set(0.35, 1.0, 1.0);
    sideFeather.position.set(s * 0.12, -0.52, -0.06);
    sideFeather.rotation.set(-0.25, 0, s * 0.12);
    sideFeather.name = 'tail';
    sideFeather.castShadow = true;
    tailGroup.add(sideFeather);

    // En dış sarı kuyruk örtüleri
    const outerFeather = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.7, 12), headMat);
    outerFeather.scale.set(0.35, 1.0, 1.0);
    outerFeather.position.set(s * 0.18, -0.35, 0.02);
    outerFeather.rotation.set(-0.28, 0, s * 0.18);
    outerFeather.name = 'tail';
    tailGroup.add(outerFeather);
  }

  group.add(tailGroup);

  return group;
}


// 🐧 8. Pofuduk Penguen
export function createPenguin(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'penguin';

  const bodyCol = colors?.body || '#1e293b';
  const bellyCol = colors?.belly || '#ffffff';
  const beakCol = colors?.beak || '#f97316';

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.3 });
  const bellyMat = new THREE.MeshStandardMaterial({ color: bellyCol, roughness: 0.4 });
  const beakMat = new THREE.MeshStandardMaterial({ color: beakCol, roughness: 0.3 });

  // Body
  const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 32), bodyMat);
  bodyMesh.scale.set(1.0, 1.3, 0.95);
  bodyMesh.position.y = 1.3;
  bodyMesh.name = 'body';
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Belly
  const bellyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 24), bellyMat);
  bellyMesh.scale.set(0.85, 1.15, 0.45);
  bellyMesh.position.set(0, 1.2, 0.7);
  bellyMesh.name = 'belly';
  group.add(bellyMesh);

  // Head area (part of body but for face placement)
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 2.2, 0.2);
  group.add(headPivot);

  // 3D Face (Kawaii)
  addAnimalFace(group, headPivot, 0.72, -0.05, 0.85, colors, true);

  // Beak
  const beakMesh = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.55, 12), beakMat);
  beakMesh.rotateX(Math.PI / 2);
  beakMesh.position.set(0, 2.1, 0.95);
  beakMesh.name = 'beak';
  group.add(beakMesh);

  // Wings
  for (let side = -1; side <= 1; side += 2) {
    const wing = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), bodyMat);
    wing.scale.set(0.22, 1.3, 0.8);
    wing.position.set(side * 1.15, 1.3, 0.1);
    wing.rotation.z = side * -0.35;
    wing.name = 'wings';
    group.add(wing);
  }

  // Feet
  for (let side = -1; side <= 1; side += 2) {
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.1, 0.65), beakMat);
    foot.position.set(side * 0.45, 0.08, 0.35);
    foot.name = 'feet';
    group.add(foot);
  }

  return group;
}

// 🦕 9. Sevimli Dinozor
export function createDino(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'dino';

  const bodyCol = colors?.body || '#10b981';
  const bellyCol = colors?.belly || '#fef08a';
  const platesCol = colors?.plates || '#3b82f6';

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.4 });
  const bellyMat = new THREE.MeshStandardMaterial({ color: bellyCol, roughness: 0.4 });
  const platesMat = new THREE.MeshStandardMaterial({ color: platesCol, roughness: 0.3 });

  // Body
  const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), bodyMat);
  bodyMesh.scale.set(1.05, 1.25, 1.1);
  bodyMesh.position.y = 1.35;
  bodyMesh.name = 'body';
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Belly
  const bellyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 24), bellyMat);
  bellyMesh.scale.set(0.85, 1.1, 0.45);
  bellyMesh.position.set(0, 1.2, 0.88);
  bellyMesh.name = 'belly';
  group.add(bellyMesh);

  // Head
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 24), bodyMat.clone());
  headMesh.scale.set(1.15, 0.95, 1.15);
  headMesh.position.set(0, 2.7, 0.4);
  headMesh.name = 'head';
  headMesh.castShadow = true;
  if (colors?.head) (headMesh.material as THREE.MeshStandardMaterial).color.set(colors.head);
  group.add(headMesh);

  // 3D Face
  addAnimalFace(group, headMesh, 0.92, 0.05, 1.0, colors);

  // Snout (Sevimli Yoshi Tarzı Ağızlık)
  const snoutMesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), bodyMat);
  snoutMesh.scale.set(1.05, 0.6, 0.85);
  snoutMesh.position.set(0, 2.38, 1.05);
  snoutMesh.name = 'snout';
  group.add(snoutMesh);

  // Burun Delikleri (Nostrils)
  const nostrilMat = new THREE.MeshStandardMaterial({ color: '#065f46', roughness: 0.3 });
  for (let s = -1; s <= 1; s += 2) {
    const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), nostrilMat);
    nostril.position.set(s * 0.12, 2.52, 1.5);
    nostril.name = 'snout';
    group.add(nostril);
  }

  // Spikes (Yumuşak Üçgen Sırt Plakaları)
  for (let i = 0; i < 7; i++) {
    const plateGeo = new THREE.SphereGeometry(0.3, 12, 12);
    plateGeo.scale(0.2, 1.0, 0.8);
    const plate = new THREE.Mesh(plateGeo, platesMat);
    plate.position.set(0, 3.4 - i * 0.42, 0.25 - i * 0.4);
    plate.rotation.x = -0.55;
    plate.name = 'spikes';
    group.add(plate);
  }

  // Legs
  const legPositions = [
    { x: -0.65, z: 0.55, name: 'leg_FL' },
    { x: 0.65, z: 0.55, name: 'leg_FR' },
    { x: -0.7, z: -0.4, name: 'leg_BL' },
    { x: 0.7, z: -0.4, name: 'leg_BR' },
  ];
  legPositions.forEach((pos) => {
    const thigh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), bodyMat);
    thigh.scale.set(1, 1.3, 1);
    thigh.position.set(pos.x, 0.7, pos.z);
    thigh.name = 'body'; // Simplified to body for Dino
    group.add(thigh);

    const leg = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), bodyMat);
    leg.scale.set(0.9, 0.65, 1.35);
    leg.position.set(pos.x, 0.25, pos.z + 0.1);
    leg.name = 'body';
    group.add(leg);
  });

  // Tail (Sevimli Kıvrık Dino Kuyruğu)
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.1, -1.05),
    new THREE.Vector3(0, 0.6, -1.9),
    new THREE.Vector3(0.5, 1.1, -2.4),
    new THREE.Vector3(0.8, 1.6, -2.2),
  ]);
  const tailMesh = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 24, 0.24, 12, false), bodyMat);
  tailMesh.name = 'tail';
  group.add(tailMesh);

  return group;
}

// 🐢 10. Sevimli Çizgi Film Deniz Kaplumbağası
export function createTurtle(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'turtle';

  const shellCol = colors?.shell || '#059669';
  const spotsCol = colors?.spots || '#facc15';
  const skinCol = colors?.head || '#34d399';
  const bellyCol = colors?.belly || '#fef08a';

  const shellMat = new THREE.MeshStandardMaterial({ color: shellCol, roughness: 0.3 });
  const spotsMat = new THREE.MeshStandardMaterial({ color: spotsCol, roughness: 0.3 });
  const skinMat = new THREE.MeshStandardMaterial({ color: skinCol, roughness: 0.45 });
  const bellyMat = new THREE.MeshStandardMaterial({ color: bellyCol, roughness: 0.4 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.1 });
  const glintMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

  // 1. Üst Kabuk (Shell Dome)
  const shellGroup = new THREE.Group();
  shellGroup.name = 'shell';
  shellGroup.position.y = 0.8;

  const domeGeo = new THREE.SphereGeometry(1.6, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const dome = new THREE.Mesh(domeGeo, shellMat);
  dome.scale.set(1, 0.65, 1.15);
  dome.name = 'shell';
  dome.castShadow = true;
  shellGroup.add(dome);

  // Kabuk Kenarlığı (Skirt/Rim)
  const rimGeo = new THREE.TorusGeometry(1.58, 0.1, 12, 32);
  const rim = new THREE.Mesh(rimGeo, shellMat);
  rim.rotation.x = Math.PI / 2;
  rim.scale.set(1, 1.15, 1);
  rim.name = 'shell';
  shellGroup.add(rim);

  // 2. Kabuk Desenleri (Spots/Plates)
  const spotConfigs = [
    { pos: [0, 0.95, 0], s: [1.2, 0.2, 1.2], r: [0, 0, 0] },
    { pos: [0.7, 0.75, 0.8], s: [0.6, 0.15, 0.6], r: [0.4, 0.4, 0] },
    { pos: [-0.7, 0.75, 0.8], s: [0.6, 0.15, 0.6], r: [0.4, -0.4, 0] },
    { pos: [0.8, 0.75, -0.8], s: [0.6, 0.15, 0.6], r: [-0.4, 0.5, 0] },
    { pos: [-0.8, 0.75, -0.8], s: [0.6, 0.15, 0.6], r: [-0.4, -0.5, 0] },
    { pos: [0, 0.85, -1.1], s: [0.7, 0.15, 0.7], r: [-0.3, 0, 0] },
    { pos: [0, 0.85, 1.1], s: [0.7, 0.15, 0.7], r: [0.3, 0, 0] },
  ];
  spotConfigs.forEach(cfg => {
    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12), spotsMat);
    spot.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
    spot.scale.set(cfg.s[0], cfg.s[1], cfg.s[2]);
    spot.rotation.set(cfg.r[0], cfg.r[1], cfg.r[2]);
    spot.name = 'spots';
    shellGroup.add(spot);
  });
  group.add(shellGroup);

  // 3. Karın (Belly)
  const bellyMesh = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 24, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5), bellyMat);
  bellyMesh.scale.set(1.05, 0.15, 1.2);
  bellyMesh.position.y = 0.8;
  bellyMesh.name = 'belly';
  group.add(bellyMesh);

  // 4. Kafa (Head)
  const headGroup = new THREE.Group();
  headGroup.name = 'head';
  headGroup.position.set(0, 1.0, 1.85);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 24), skinMat);
  headMesh.scale.set(1.1, 0.9, 1.1);
  headGroup.add(headMesh);

  // İri Anime Gözleri
  for (let s = -1; s <= 1; s += 2) {
    const eyePivot = new THREE.Group();
    eyePivot.position.set(s * 0.35, 0.1, 0.55);
    
    const eyeOrb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 20), eyeMat);
    eyeOrb.scale.set(1, 1.15, 0.4);
    eyeOrb.name = s === -1 ? 'eye_iris_L' : 'eye_iris_R';
    eyePivot.add(eyeOrb);

    const g1 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), glintMat);
    g1.position.set(s * 0.05, 0.06, 0.08);
    eyePivot.add(g1);

    const g2 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), glintMat);
    g2.position.set(s * -0.04, -0.04, 0.08);
    eyePivot.add(g2);

    headGroup.add(eyePivot);
  }
  group.add(headGroup);

  // 5. Yüzme Yüzgeçleri (Flippers)
  const flipperData = [
    { x: -1.4, z: 0.9, ry: 0.8, s: [1.8, 0.15, 0.9], name: 'flippers' }, // Front L
    { x: 1.4, z: 0.9, ry: -0.8, s: [1.8, 0.15, 0.9], name: 'flippers' }, // Front R
    { x: -1.1, z: -1.2, ry: -0.5, s: [1.2, 0.12, 0.7], name: 'flippers' }, // Back L
    { x: 1.1, z: -1.2, ry: 0.5, s: [1.2, 0.12, 0.7], name: 'flippers' }, // Back R
  ];
  flipperData.forEach(f => {
    const flipper = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), skinMat);
    flipper.scale.set(f.s[0], f.s[1], f.s[2]);
    flipper.position.set(f.x, 0.65, f.z);
    flipper.rotation.y = f.ry;
    flipper.name = 'flippers';
    flipper.castShadow = true;
    group.add(flipper);
  });

  // 6. Minik Kuyruk (Tail)
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.5, 12), skinMat);
  tail.rotateX(-Math.PI / 1.6);
  tail.position.set(0, 0.7, -1.8);
  tail.name = 'tail';
  group.add(tail);

  return group;
}


// 🦄 11. Tek Boynuzlu At
export function createUnicorn(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'unicorn';

  const bodyCol = colors?.body || '#ffffff';
  const headCol = colors?.head || bodyCol;
  const maneCol = colors?.mane || '#fbcfe8'; // Pastel pink
  const hornCol = colors?.horn || '#fef08a'; // Soft yellow

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.3 });
  const headMat = new THREE.MeshStandardMaterial({ color: headCol, roughness: 0.3 });
  const maneMat = new THREE.MeshStandardMaterial({ color: maneCol, roughness: 0.4 });
  const hornMat = new THREE.MeshStandardMaterial({ color: hornCol, roughness: 0.1, metalness: 0.4 });
  const blushMat = new THREE.MeshStandardMaterial({ color: '#ff94a8', roughness: 0.4 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.1 });
  const glintMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

  // 1. Chubby Puffy Body
  const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 32), bodyMat);
  bodyMesh.scale.set(1.05, 1.15, 1.4);
  bodyMesh.position.y = 1.25;
  bodyMesh.name = 'body';
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // 2. Noble Puffy Neck
  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 1.2, 24), bodyMat);
  neckMesh.position.set(0, 2.1, 0.85);
  neckMesh.rotation.x = -0.45;
  neckMesh.name = 'neck';
  group.add(neckMesh);

  // 3. Cute Rounded Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 2.75, 1.25);
  headGroup.rotation.x = 0.2;
  
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), headMat);
  headMesh.scale.set(1.1, 1.0, 1.15);
  headMesh.name = 'head';
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Snout (Muzzle)
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20), bodyMat);
  snout.scale.set(1.0, 0.85, 1.1);
  snout.position.set(0, -0.25, 0.75);
  snout.name = 'head';
  headGroup.add(snout);

  // Anime Eyes
  for (let s = -1; s <= 1; s += 2) {
    const eyePivot = new THREE.Group();
    eyePivot.position.set(s * 0.38, 0.15, 0.75);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 20), eyeMat); // Bigger eyes
    pupil.scale.set(1, 1.25, 0.3);
    pupil.name = s === -1 ? 'eye_iris_L' : 'eye_iris_R';
    eyePivot.add(pupil);

    // Eyelashes (3 simple curved lines)
    for (let i = 0; i < 4; i++) { // More eyelashes
      const lash = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.006, 0.22, 8), eyeMat);
      lash.position.set(s * 0.18, 0.2 + i * 0.05, 0.02);
      lash.rotation.z = s * (Math.PI / 3.5 + i * 0.25);
      eyePivot.add(lash);
    }

    // Extra Highlights (Glints)
    const g1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), glintMat); // Larger main glint
    g1.position.set(s * 0.06, 0.09, 0.06);
    eyePivot.add(g1);

    const g2 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), glintMat);
    g2.position.set(s * -0.05, -0.06, 0.06);
    eyePivot.add(g2);

    const g3 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), glintMat);
    g3.position.set(s * 0.08, -0.02, 0.06);
    eyePivot.add(g3);

    headGroup.add(eyePivot);

    // Blush
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), blushMat);
    blush.scale.set(1.1, 0.6, 0.2);
    blush.position.set(s * 0.65, -0.15, 0.65);
    headGroup.add(blush);
  }

  // Smile
  const smileCurve = new THREE.TorusGeometry(0.15, 0.03, 8, 16, Math.PI);
  smileCurve.rotateX(Math.PI);
  const smile = new THREE.Mesh(smileCurve, new THREE.MeshStandardMaterial({ color: '#555555' }));
  smile.position.set(0, -0.38, 1.1);
  headGroup.add(smile);

  // Horn (Magical & Tapered)
  const horn = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.2, 16), hornMat);
  horn.position.set(0, 0.85, 0.25);
  horn.rotation.x = -0.3;
  horn.name = 'horn';
  headGroup.add(horn);

  // Mane (Fluffy layers)
  for (let i = 0; i < 5; i++) {
    const manePuff = new THREE.Mesh(new THREE.SphereGeometry(0.35 + i * 0.05, 16, 16), maneMat);
    manePuff.position.set(0, 0.5 - i * 0.45, -0.5 - i * 0.1);
    manePuff.name = 'mane';
    headGroup.add(manePuff);
  }

  group.add(headGroup);

  // 4. Sturdy Puffy Legs
  const legPositions = [
    { x: -0.5, z: 0.7, name: 'leg_FL' },
    { x: 0.5, z: 0.7, name: 'leg_FR' },
    { x: -0.5, z: -0.7, name: 'leg_BL' },
    { x: 0.5, z: -0.7, name: 'leg_BR' },
  ];
  legPositions.forEach((pos) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.8, 16), bodyMat);
    leg.position.set(pos.x, 0.5, pos.z);
    leg.name = pos.name;
    group.add(leg);

    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.18, 16), hornMat);
    hoof.position.set(pos.x, 0.1, pos.z);
    hoof.name = 'hooves';
    group.add(hoof);
  });

  // 5. Long Flowing Tail
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.5, -1.2),
    new THREE.Vector3(0.1, 1.0, -1.6),
    new THREE.Vector3(0.2, 0.4, -1.5),
    new THREE.Vector3(0.1, 0.15, -1.3),
  ]);
  const tailGeo = new THREE.TubeGeometry(tailCurve, 20, 0.16, 12, false);
  const tailMesh = new THREE.Mesh(tailGeo, maneMat);
  tailMesh.name = 'tail';
  group.add(tailMesh);

  return group;
}

// 🦋 12. Renkli Kelebek (Kawaii Butterfly)
export function createButterfly(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'butterfly';
  group.userData.isFlying = true; // Flag for ThreeCanvas animation

  const bodyCol = colors?.body || '#fbcfe8'; // Light Pink
  const headCol = colors?.head || bodyCol;
  const wingsCol = colors?.wings || '#ffffff'; // Base for rainbow
  const spotsCol = colors?.spots || '#facc15'; // Glowing stars

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.4 });
  const headMat = new THREE.MeshStandardMaterial({ color: headCol, roughness: 0.4 });
  const wingsMat = new THREE.MeshStandardMaterial({ 
    color: wingsCol, 
    roughness: 0.2, 
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
    vertexColors: true 
  });
  const spotsMat = new THREE.MeshStandardMaterial({ 
    color: spotsCol, 
    roughness: 0.1, 
    emissive: spotsCol, 
    emissiveIntensity: 0.5 
  });

  // 1. Chubby Body (Segmented)
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'body';
  const parts = [
    { radius: 0.22, y: 0.4, z: 0.1, name: 'head' },
    { radius: 0.28, y: 0, z: 0, name: 'body' },
    { radius: 0.24, y: -0.4, z: -0.1, name: 'body' },
    { radius: 0.18, y: -0.7, z: -0.2, name: 'body' },
  ];
  parts.forEach((p) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.radius, 16, 16), p.name === 'head' ? headMat : bodyMat);
    mesh.position.set(0, p.y + 1.8, p.z);
    mesh.name = p.name;
    mesh.castShadow = true;
    bodyGroup.add(mesh);
  });
  group.add(bodyGroup);

  // 2. Anime Eyes & Smile
  const headMesh = bodyGroup.children.find(c => c.name === 'head') as THREE.Mesh;
  if (headMesh) {
    addAnimalFace(group, headMesh, 0.22, 0, 0.4, colors);
  }

  // 3. Heart-tipped Antennas
  for (let side = -1; side <= 1; side += 2) {
    const antennaCurve = new THREE.CatmullRomCurve3([
       new THREE.Vector3(side * 0.08, 2.3, 0.1),
       new THREE.Vector3(side * 0.25, 2.7, 0.2),
       new THREE.Vector3(side * 0.4, 3.0, 0.1),
    ]);
    const antennaMesh = new THREE.Mesh(new THREE.TubeGeometry(antennaCurve, 12, 0.02, 8, false), bodyMat);
    antennaMesh.name = 'body';
    group.add(antennaMesh);

    // Heart Tip
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(-0.1, -0.1, -0.2, 0.06, 0, 0.2);
    heartShape.bezierCurveTo(0.2, 0.06, 0.1, -0.1, 0, 0);
    
    const heartGeo = new THREE.ShapeGeometry(heartShape);
    const heartTip = new THREE.Mesh(heartGeo, spotsMat);
    heartTip.position.set(side * 0.4, 3.0, 0.1);
    heartTip.scale.set(0.6, 0.6, 0.6);
    heartTip.rotation.z = side * -0.3;
    heartTip.name = 'spots';
    group.add(heartTip);
  }

  // 4. MASSIVE RAINBOW WINGS
  const wingGroup = new THREE.Group();
  wingGroup.name = 'wings';
  
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.bezierCurveTo(0.5, 1.5, 2.5, 1.5, 2.5, 0.5);
  wingShape.bezierCurveTo(2.5, -0.5, 1.5, -1.0, 0.5, -0.5);
  wingShape.bezierCurveTo(0.3, -0.3, 0.1, -0.1, 0, 0);

  for (let side = -1; side <= 1; side += 2) {
    const wingGeo = new THREE.ShapeGeometry(wingShape);
    
    // Gradient vertex colors (Pink -> Purple -> Blue)
    const count = wingGeo.attributes.position.count;
    const colorsArr = new Float32Array(count * 3);
    const posAttr = wingGeo.attributes.position;
    
    for (let i = 0; i < count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      // Normalized distance from origin for gradient
      const dist = Math.sqrt(x * x + y * y) / 2.5;
      
      const c1 = new THREE.Color('#ff94a8'); // Pink
      const c2 = new THREE.Color('#a855f7'); // Purple
      const c3 = new THREE.Color('#38bdf8'); // Blue
      
      const finalCol = new THREE.Color();
      if (dist < 0.5) {
        finalCol.lerpColors(c1, c2, dist * 2);
      } else {
        finalCol.lerpColors(c2, c3, (dist - 0.5) * 2);
      }
      
      colorsArr[i * 3] = finalCol.r;
      colorsArr[i * 3 + 1] = finalCol.g;
      colorsArr[i * 3 + 2] = finalCol.b;
    }
    wingGeo.setAttribute('color', new THREE.BufferAttribute(colorsArr, 3));

    const wing = new THREE.Mesh(wingGeo, wingsMat);
    wing.position.set(side * 0.1, 1.8, 0);
    wing.scale.set(side, 1, 1);
    wing.rotation.y = side * 0.4;
    wing.userData.isPulsing = true;
    wing.userData.baseRotationY = side * 0.4;
    wing.name = 'wings';
    wingGroup.add(wing);

    // Glowing Stars on Wings
    for (let i = 0; i < 3; i++) {
      const starGeo = new THREE.SphereGeometry(0.12, 5, 2);
      const star = new THREE.Mesh(starGeo, spotsMat);
      const starX = 0.8 + i * 0.5;
      const starY = 0.2 + (i % 2 === 0 ? 0.4 : -0.4);
      star.position.set(side * starX, 1.8 + starY, 0.1);
      star.name = 'spots';
      group.add(star);
    }
  }
  group.add(wingGroup);

  return group;
}


// 🐬 Sevimli Chibi Yunus Balığı (Kawaii 3D Dolphin)
export function createDolphin(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'dolphin';
  group.userData.isLeaping = true; // Floating leaping wave animation in ThreeCanvas

  // Colors: Pastel blue upper body, white belly, light pastel snout, ocean blue fins & tail
  const bodyCol = colors?.body || '#38bdf8';
  const bellyCol = colors?.belly || '#ffffff';
  const snoutCol = colors?.snout || '#bae6fd';
  const dorsalCol = colors?.dorsal_fin || '#0284c7';
  const flippersCol = colors?.flippers || '#38bdf8';
  const tailCol = colors?.tail || '#0284c7';
  const blushCol = colors?.blush || '#f472b6';
  const eyeCol = colors?.eyes || '#0f172a';

  // Glossy plastic / wet toy 3D materials (roughness: 0.12, metalness: 0.06)
  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.12, metalness: 0.06 });
  const bellyMat = new THREE.MeshStandardMaterial({ color: bellyCol, roughness: 0.12, metalness: 0.05 });
  const snoutMat = new THREE.MeshStandardMaterial({ color: snoutCol, roughness: 0.14, metalness: 0.05 });
  const dorsalMat = new THREE.MeshStandardMaterial({ color: dorsalCol, roughness: 0.12, metalness: 0.06 });
  const flippersMat = new THREE.MeshStandardMaterial({ color: flippersCol, roughness: 0.12, metalness: 0.06 });
  const tailMat = new THREE.MeshStandardMaterial({ color: tailCol, roughness: 0.12, metalness: 0.06 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: eyeCol, roughness: 0.05 });
  const glintMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const blushMat = new THREE.MeshStandardMaterial({ color: blushCol, roughness: 0.35, transparent: true, opacity: 0.85 });
  const mouthMat = new THREE.MeshBasicMaterial({ color: '#1e293b' });

  // 1. Aerodinamik Kavisli Yunus Vücudu (Aerodynamic Leaping Torso)
  // Constructed via smooth lofted spline curve with variable ellipse radii
  const spinePoints = [
    new THREE.Vector3(0, 1.48, 1.75),   // Snout base / mouth area
    new THREE.Vector3(0, 1.82, 1.25),   // Cranium / melon
    new THREE.Vector3(0, 2.15, 0.45),   // Arched dorsal crest peak
    new THREE.Vector3(0, 2.05, -0.45),  // Mid-back downward slope
    new THREE.Vector3(0, 1.72, -1.25),  // Lower rear torso
    new THREE.Vector3(0, 1.45, -1.95),  // Tail peduncle
  ];
  const spine = new THREE.CatmullRomCurve3(spinePoints);

  const radialSegments = 28;
  const lengthSegments = 38;

  // Custom function to generate streamlined dolphin body BufferGeometry
  const generateDolphinGeometry = (radiusScaleX: number, radiusScaleY: number, yOffset: number = 0) => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const getRadius = (t: number) => {
      // t: 0 (tail peduncle) to 1 (front melon/snout)
      let rx = 0.22;
      let ry = 0.18;
      if (t < 0.25) {
        const u = t / 0.25;
        rx = 0.22 + u * 0.46;
        ry = 0.18 + u * 0.42;
      } else if (t < 0.65) {
        const u = (t - 0.25) / 0.4;
        rx = 0.68 + Math.sin(u * Math.PI) * 0.32;
        ry = 0.60 + Math.sin(u * Math.PI) * 0.34;
      } else {
        const u = (t - 0.65) / 0.35;
        rx = 0.82 - u * 0.48;
        ry = 0.74 - u * 0.44;
      }
      return { rx: rx * radiusScaleX, ry: ry * radiusScaleY };
    };

    // Build rings along spine
    for (let i = 0; i <= lengthSegments; i++) {
      const t = i / lengthSegments;
      const pt = spine.getPoint(t);
      const tangent = spine.getTangent(t).normalize();
      
      // Compute normal & binormal frames along spine
      const up = new THREE.Vector3(0, 1, 0);
      const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
      if (normal.lengthSq() < 0.001) normal.set(1, 0, 0);
      const binormal = new THREE.Vector3().crossVectors(normal, tangent).normalize();

      const { rx, ry } = getRadius(t);

      for (let j = 0; j <= radialSegments; j++) {
        const theta = (j / radialSegments) * Math.PI * 2;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);

        const vx = pt.x + (normal.x * cos * rx + binormal.x * sin * ry);
        const vy = pt.y + yOffset + (normal.y * cos * rx + binormal.y * sin * ry);
        const vz = pt.z + (normal.z * cos * rx + binormal.z * sin * ry);

        positions.push(vx, vy, vz);
        uvs.push(j / radialSegments, t);
      }
    }

    // Grid triangles
    for (let i = 0; i < lengthSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const a = i * (radialSegments + 1) + j;
        const b = (i + 1) * (radialSegments + 1) + j;
        const c = (i + 1) * (radialSegments + 1) + (j + 1);
        const d = i * (radialSegments + 1) + (j + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  // Main Aerodynamic Body Mesh
  const bodyGeo = generateDolphinGeometry(1.0, 1.0, 0);
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.name = 'body';
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Forehead / Melon Head Anchor (Named 'head' for accessories like Crown, Bow, Glasses)
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.78, 24, 24), bodyMat);
  headMesh.scale.set(1.05, 0.95, 1.08);
  headMesh.position.set(0, 1.84, 1.15);
  headMesh.name = 'head';
  headMesh.castShadow = true;
  group.add(headMesh);

  // Subtle cute blowhole on top of forehead
  const blowhole = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), dorsalMat);
  blowhole.scale.set(1.4, 0.25, 0.9);
  blowhole.position.set(0, 2.22, 0.88);
  blowhole.rotation.x = -0.3;
  group.add(blowhole);

  // 2. Karın Altı Beyaz Göbek (Glossy White Chibi Belly Plate)
  // Hugs the underside from throat to abdomen with clean smooth counter-shading
  const bellyGroup = new THREE.Group();
  bellyGroup.name = 'belly';

  // Front throat & chest belly bulge
  const bellyChest = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 20), bellyMat);
  bellyChest.scale.set(0.92, 0.65, 1.35);
  bellyChest.position.set(0, 1.58, 0.82);
  bellyChest.rotation.x = 0.22;
  bellyChest.name = 'belly';
  bellyGroup.add(bellyChest);

  // Mid & lower abdomen belly plate
  const bellyMid = new THREE.Mesh(new THREE.SphereGeometry(0.82, 24, 20), bellyMat);
  bellyMid.scale.set(0.85, 0.58, 1.25);
  bellyMid.position.set(0, 1.62, -0.15);
  bellyMid.rotation.x = -0.15;
  bellyMid.name = 'belly';
  bellyGroup.add(bellyMid);

  // Tapered underside trailing towards tail peduncle
  const bellyRear = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 16), bellyMat);
  bellyRear.scale.set(0.68, 0.42, 1.1);
  bellyRear.position.set(0, 1.48, -0.95);
  bellyRear.rotation.x = -0.28;
  bellyRear.name = 'belly';
  bellyGroup.add(bellyRear);

  group.add(bellyGroup);

  // 3. Sevimli Gülen Yunus Burnu (Kawaii Snout / Rostrum)
  const snoutGroup = new THREE.Group();
  snoutGroup.name = 'snout';
  snoutGroup.position.set(0, 1.55, 1.82);

  // Rounded bottle-nose rostrum
  const snoutGeo = new THREE.SphereGeometry(0.38, 24, 20);
  snoutGeo.scale(1.05, 0.72, 1.35);
  const snoutMesh = new THREE.Mesh(snoutGeo, snoutMat);
  snoutMesh.name = 'snout';
  snoutMesh.castShadow = true;
  snoutGroup.add(snoutMesh);

  // White underside of snout for natural cute coloration
  const snoutUnder = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), bellyMat);
  snoutUnder.scale.set(0.95, 0.5, 1.2);
  snoutUnder.position.set(0, -0.1, 0.05);
  snoutUnder.name = 'belly';
  snoutGroup.add(snoutUnder);

  // Sırıtkan Mutlu Ağız İfadesi (Happy Beaming Grin on both sides)
  for (let s = -1; s <= 1; s += 2) {
    const smileArc = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.022, 8, 16, Math.PI * 0.75),
      mouthMat
    );
    smileArc.position.set(s * 0.28, -0.06, 0.02);
    smileArc.rotation.set(0.15, s * 0.4, s * 0.25);
    snoutGroup.add(smileArc);
  }

  group.add(snoutGroup);

  // 4. Belirgin Sırt Yüzgeci (Curved Sleek Dorsal Fin)
  const dorsalShape = new THREE.Shape();
  dorsalShape.moveTo(0, 0); // Front base
  dorsalShape.quadraticCurveTo(0.1, 0.55, -0.25, 0.95); // Leading curved edge
  dorsalShape.quadraticCurveTo(-0.18, 0.65, -0.75, 0.05); // Concave trailing edge
  dorsalShape.closePath();

  const dorsalGeo = new THREE.ExtrudeGeometry(dorsalShape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.03,
    bevelSegments: 4,
  });
  dorsalGeo.center();

  const dorsalFin = new THREE.Mesh(dorsalGeo, dorsalMat);
  dorsalFin.position.set(0, 2.48, 0.25);
  dorsalFin.rotation.x = -0.22;
  dorsalFin.name = 'dorsal_fin';
  dorsalFin.castShadow = true;
  group.add(dorsalFin);

  // 5. Küçük ve Şirin İki Yan Yüzgeç (Cute Chibi Pectoral Flippers)
  const flipperShape = new THREE.Shape();
  flipperShape.moveTo(0, 0);
  flipperShape.quadraticCurveTo(0.25, -0.28, 0.7, -0.62); // Smooth curved leading edge
  flipperShape.quadraticCurveTo(0.48, -0.65, 0.15, -0.22); // Trailing edge
  flipperShape.closePath();

  const flipperGeo = new THREE.ExtrudeGeometry(flipperShape, {
    depth: 0.07,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 3,
  });
  flipperGeo.center();

  for (let s = -1; s <= 1; s += 2) {
    const flipper = new THREE.Mesh(flipperGeo, flippersMat);
    flipper.scale.set(s * 1.05, 1.05, 1.05);
    flipper.position.set(s * 0.82, 1.48, 0.72);
    flipper.rotation.set(0.35, s * 0.45, s * -0.75);
    flipper.name = 'flippers';
    flipper.castShadow = true;
    group.add(flipper);
  }

  // 6. Açık ve Net İkili Yatay Kuyruk Yüzgeci (Horizontal Dual-Lobed Tail Fluke)
  const flukeShape = new THREE.Shape();
  flukeShape.moveTo(0, 0.18); // Center notch front
  flukeShape.quadraticCurveTo(0.45, 0.24, 0.95, 0.02); // Right lobe leading edge
  flukeShape.quadraticCurveTo(0.9, -0.26, 0.45, -0.32); // Right lobe tip & trailing edge
  flukeShape.quadraticCurveTo(0.16, -0.24, 0.0, -0.06); // Center notch indentation
  flukeShape.quadraticCurveTo(-0.16, -0.24, -0.45, -0.32); // Left lobe indent & trailing edge
  flukeShape.quadraticCurveTo(-0.9, -0.26, -0.95, 0.02); // Left lobe tip
  flukeShape.quadraticCurveTo(-0.45, 0.24, 0, 0.18); // Left lobe leading edge
  flukeShape.closePath();

  const flukeGeo = new THREE.ExtrudeGeometry(flukeShape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.025,
    bevelSegments: 3,
  });
  flukeGeo.center();

  const tailFluke = new THREE.Mesh(flukeGeo, tailMat);
  tailFluke.position.set(0, 1.36, -2.18);
  tailFluke.rotation.x = -0.24; // Slight energetic upward flick
  tailFluke.name = 'tail';
  tailFluke.castShadow = true;
  tailFluke.userData.isTailSway = true;
  tailFluke.userData.baseRotX = -0.24;
  group.add(tailFluke);

  // 7. İri Kawaii Anime Gözleri (Large Sparkling Eyes with Highlights)
  for (let s = -1; s <= 1; s += 2) {
    const eyePivot = new THREE.Group();
    eyePivot.name = 'eyes';
    eyePivot.position.set(s * 0.72, 1.84, 1.25);
    eyePivot.rotation.set(-0.06, s * 0.52, s * -0.08);

    // Deep glossy dark pupil
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), eyeMat);
    pupil.scale.set(1, 1.18, 0.35);
    pupil.name = 'eyes';
    eyePivot.add(pupil);

    // Cyan iris sparkle ring
    const irisRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.11, 0.022, 8, 20, Math.PI * 0.8),
      new THREE.MeshBasicMaterial({ color: '#38bdf8' })
    );
    irisRing.position.set(0, -0.02, 0.05);
    irisRing.rotation.z = s > 0 ? 0.3 : -0.3;
    eyePivot.add(irisRing);

    // Big bright white primary specular glint
    const g1 = new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 14), glintMat);
    g1.position.set(s * 0.04, 0.06, 0.07);
    eyePivot.add(g1);

    // Secondary smaller glint
    const g2 = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 12), glintMat);
    g2.position.set(s * -0.04, -0.045, 0.07);
    eyePivot.add(g2);

    // Tertiary micro sparkle dot
    const g3 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), glintMat);
    g3.position.set(s * 0.05, -0.015, 0.07);
    eyePivot.add(g3);

    // Sweet tiny upper eyelash line
    const lash = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.018, 6, 16, Math.PI * 0.5),
      mouthMat
    );
    lash.position.set(0, 0.08, 0.05);
    lash.rotation.z = s > 0 ? -0.2 : 0.2;
    eyePivot.add(lash);

    group.add(eyePivot);

    // 8. Pembe Yanak Allığı (Cute Pink Blush Cheeks)
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), blushMat);
    blush.scale.set(1.15, 0.58, 0.25);
    blush.position.set(s * 0.76, 1.62, 1.12);
    blush.rotation.set(-0.08, s * 0.55, s * -0.1);
    blush.name = 'blush';
    group.add(blush);
  }

  // 9. Kawaii Okyanus Teması: Parlak Su Kabarcıkları (Floating Water Bubbles)
  const bubbleMat = new THREE.MeshStandardMaterial({
    color: '#bae6fd',
    roughness: 0.05,
    metalness: 0.1,
    transparent: true,
    opacity: 0.65,
  });

  const bubbleData = [
    { x: -1.25, y: 2.35, z: 0.8, r: 0.22, speed: 1.2, phase: 0 },
    { x: 1.35, y: 2.55, z: -0.3, r: 0.18, speed: 1.5, phase: 1.2 },
    { x: -1.45, y: 1.65, z: -0.9, r: 0.26, speed: 1.0, phase: 2.4 },
    { x: 1.45, y: 1.75, z: 1.1, r: 0.2, speed: 1.3, phase: 3.6 },
    { x: -0.85, y: 2.85, z: -0.2, r: 0.15, speed: 1.7, phase: 4.8 },
    { x: 1.15, y: 1.15, z: -1.6, r: 0.24, speed: 1.1, phase: 5.5 },
    { x: 0.35, y: 3.05, z: 0.5, r: 0.17, speed: 1.4, phase: 0.8 },
  ];

  bubbleData.forEach((b) => {
    const bubbleGroup = new THREE.Group();
    bubbleGroup.position.set(b.x, b.y, b.z);

    const bubbleSphere = new THREE.Mesh(new THREE.SphereGeometry(b.r, 16, 16), bubbleMat);
    bubbleGroup.add(bubbleSphere);

    // Inner bright white glint highlight on bubble surface
    const bGlint = new THREE.Mesh(new THREE.SphereGeometry(b.r * 0.25, 8, 8), glintMat);
    bGlint.position.set(b.r * 0.45, b.r * 0.45, b.r * 0.55);
    bubbleGroup.add(bGlint);

    bubbleGroup.userData.isFloating = true;
    bubbleGroup.userData.speed = b.speed;
    bubbleGroup.userData.phase = b.phase;
    bubbleGroup.name = 'decoration';
    group.add(bubbleGroup);
  });

  // 10. Sevimli Deniz Yıldızları (Cute Chibi Starfish on Ground/Podium)
  const starPositions = [
    { x: 1.85, y: 0.08, z: 1.15, rotY: 0.4, scale: 0.42 },
    { x: -1.75, y: 0.08, z: 1.35, rotY: -0.6, scale: 0.38 },
  ];

  const starfishMat = new THREE.MeshStandardMaterial({
    color: '#facc15',
    roughness: 0.25,
    metalness: 0.05,
  });

  starPositions.forEach((sp) => {
    const starGroup = new THREE.Group();
    starGroup.position.set(sp.x, sp.y, sp.z);
    starGroup.rotation.y = sp.rotY;
    starGroup.rotation.x = -0.15; // Tilted slightly towards camera
    starGroup.scale.setScalar(sp.scale);

    // 5 rounded arms
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const arm = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.95, 12), starfishMat);
      arm.rotation.z = angle - Math.PI / 2;
      arm.position.set(Math.cos(angle) * 0.45, Math.sin(angle) * 0.45, 0);
      starGroup.add(arm);
    }
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), starfishMat);
    center.scale.set(1, 1, 0.5);
    starGroup.add(center);

    // Cute smiling dots on starfish
    for (let s = -1; s <= 1; s += 2) {
      const sEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), mouthMat);
      sEye.position.set(s * 0.1, 0.06, 0.18);
      starGroup.add(sEye);
    }
    const sSmile = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 6, 10, Math.PI), mouthMat);
    sSmile.position.set(0, -0.04, 0.18);
    starGroup.add(sSmile);

    starGroup.name = 'decoration';
    group.add(starGroup);
  });

  return group;
}


// 🐼 Sevimli Chibi Panda (Kawaii Chibi Panda)
export function createPanda(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'panda';

  // Colors: Soft charcoal gray instead of harsh black, pure white body & belly, cute pink nose & blush
  const bodyCol = colors?.body || '#ffffff';
  const headCol = colors?.head || bodyCol;
  const bellyCol = colors?.belly || '#ffffff'; // Göbek bembeyaz
  const charcoalCol = colors?.charcoal_parts || '#374151'; // Yumuşak Kömürsü Gri
  const earsCol = colors?.ears || charcoalCol;
  const armsCol = colors?.arms || charcoalCol;
  const legsCol = colors?.legs || charcoalCol;
  const patchesCol = colors?.eye_patches || charcoalCol;
  const snoutCol = colors?.snout || '#f472b6'; // Minik pembe burun
  const blushCol = colors?.blush || '#ff94a8'; // Pembe yanak allığı
  const eyeCol = colors?.eyes || '#0f172a';

  // Smooth materials
  const whiteMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.32 });
  const headMat = new THREE.MeshStandardMaterial({ color: headCol, roughness: 0.32 });
  const bellyMat = new THREE.MeshStandardMaterial({ color: bellyCol, roughness: 0.32 });
  const earsMat = new THREE.MeshStandardMaterial({ color: earsCol, roughness: 0.38 });
  const armsMat = new THREE.MeshStandardMaterial({ color: armsCol, roughness: 0.38 });
  const legsMat = new THREE.MeshStandardMaterial({ color: legsCol, roughness: 0.38 });
  const patchesMat = new THREE.MeshStandardMaterial({ color: patchesCol, roughness: 0.35 });
  const snoutMat = new THREE.MeshStandardMaterial({ color: snoutCol, roughness: 0.22 });
  const blushMat = new THREE.MeshBasicMaterial({ color: blushCol, transparent: true, opacity: 0.72 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: eyeCol, roughness: 0.05 });
  const glintMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const mouthMat = new THREE.MeshBasicMaterial({ color: '#1e293b' });

  // 1. Tombul Şirin Gövde (Chubby Chibi Body)
  const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.92, 32, 32), whiteMat);
  bodyMesh.scale.set(1.0, 1.05, 0.95);
  bodyMesh.position.set(0, 1.15, 0);
  bodyMesh.name = 'body';
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Bembeyaz Pürüzsüz Göbek (Pure White Smooth Belly Plate)
  const bellyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.72, 28, 28), bellyMat);
  bellyMesh.scale.set(0.92, 1.02, 0.45);
  bellyMesh.position.set(0, 1.12, 0.62);
  bellyMesh.name = 'belly';
  group.add(bellyMesh);

  // Minik pofuduk beyaz kuyruk (Fluffy white tail)
  const tailMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), whiteMat);
  tailMesh.position.set(0, 0.85, -0.88);
  tailMesh.name = 'body';
  group.add(tailMesh);

  // 2. Büyük Sevimli Baş (Big Rounded Kawaii Head)
  const headGroup = new THREE.Group();
  headGroup.name = 'head';
  headGroup.position.set(0, 2.18, 0.15);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.82, 32, 32), headMat);
  headMesh.scale.set(1.15, 0.98, 1.05);
  headMesh.name = 'head';
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Yuvarlak Kömürsü Panda Kulakları (Soft Charcoal Round Ears)
  for (let s = -1; s <= 1; s += 2) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 20), earsMat);
    ear.scale.set(1.0, 1.05, 0.6);
    ear.position.set(s * 0.68, 0.72, -0.05);
    ear.rotation.set(-0.15, 0, s * -0.32);
    ear.name = 'ears';
    ear.castShadow = true;
    headGroup.add(ear);
  }

  // 3. Oval Kömürsü Göz Lekeleri & Büyük Yuvarlak Kawaii Gözler
  for (let s = -1; s <= 1; s += 2) {
    // Klasik oval panda göz lekesi (Oval charcoal eye patch)
    const patch = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 20), patchesMat);
    patch.scale.set(0.95, 1.25, 0.25);
    patch.position.set(s * 0.35, 0.08, 0.72);
    patch.rotation.set(-0.08, s * 0.28, s * 0.32); // Slightly tilted outward
    patch.name = 'eye_patches';
    headGroup.add(patch);

    // Büyük, Yuvarlak, Parlak Kawaii Göz (Big Round Sparkling Anime Eye)
    const eyePivot = new THREE.Group();
    eyePivot.name = 'eyes';
    eyePivot.position.set(s * 0.35, 0.08, 0.76);
    eyePivot.rotation.set(-0.06, s * 0.28, 0);

    // Glossy round dark eye pupil
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 24), eyeMat);
    pupil.scale.set(1.0, 1.05, 0.35);
    pupil.name = 'eyes';
    eyePivot.add(pupil);

    // Sparkle cyan rim
    const irisArc = new THREE.Mesh(
      new THREE.TorusGeometry(0.085, 0.018, 6, 16, Math.PI * 0.7),
      new THREE.MeshBasicMaterial({ color: '#38bdf8' })
    );
    irisArc.position.set(0, -0.02, 0.04);
    irisArc.rotation.z = s > 0 ? 0.3 : -0.3;
    eyePivot.add(irisArc);

    // Büyük Beyaz Highlight (Primary Glint)
    const g1 = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 12), glintMat);
    g1.position.set(s * 0.03, 0.045, 0.05);
    eyePivot.add(g1);

    // İkinci Küçük Highlight (Secondary Glint)
    const g2 = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 10), glintMat);
    g2.position.set(s * -0.03, -0.035, 0.05);
    eyePivot.add(g2);

    headGroup.add(eyePivot);

    // Pembe Yanak Allığı (Cute Pink Blush Cheeks)
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 14), blushMat);
    blush.scale.set(1.15, 0.55, 0.2);
    blush.position.set(s * 0.62, -0.16, 0.58);
    blush.rotation.set(-0.08, s * 0.45, s * -0.1);
    blush.name = 'blush';
    headGroup.add(blush);
  }

  // 4. Küçük Pembe Burun & Mutlu Gülümseme (Pink Nose & Sweet Smile)
  // Sevimli ters üçgen/oval pembe burun
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), snoutMat);
  nose.scale.set(1.25, 0.82, 0.75);
  nose.position.set(0, -0.06, 0.88);
  nose.name = 'snout';
  headGroup.add(nose);

  // Mutlu Kedi/Ayıcık Gülümsemesi (Happy Smile Arcs)
  for (let s = -1; s <= 1; s += 2) {
    const smile = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.016, 6, 14, Math.PI * 0.8),
      mouthMat
    );
    smile.position.set(s * 0.075, -0.16, 0.84);
    smile.rotation.set(0.12, s * 0.1, Math.PI + (s * -0.1));
    headGroup.add(smile);
  }

  group.add(headGroup);

  // 5. Kolları Yukarı Kaldırmış Sevimli Poz (Arms Raised Up Joyfully "Yay! / Hug me!")
  for (let s = -1; s <= 1; s += 2) {
    const armGroup = new THREE.Group();
    armGroup.position.set(s * 0.68, 1.45, 0.15);
    armGroup.rotation.set(0.2, s * -0.25, s * 0.88); // Arms raised up high!
    armGroup.name = 'arms';

    // Rounded shoulder
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), armsMat);
    shoulder.name = 'arms';
    armGroup.add(shoulder);

    // Arm cylinder
    const armLimb = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.55, 16), armsMat);
    armLimb.position.y = 0.32;
    armLimb.name = 'arms';
    armGroup.add(armLimb);

    // Chubby raised paw
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), armsMat);
    paw.scale.set(1.0, 1.1, 1.15);
    paw.position.y = 0.62;
    paw.name = 'arms';
    armGroup.add(paw);

    // Soft pink paw pad detail
    const pad = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), snoutMat);
    pad.scale.set(1.0, 0.3, 1.0);
    pad.position.set(0, 0.65, 0.16);
    pad.rotation.x = Math.PI / 2.5;
    pad.name = 'snout';
    armGroup.add(pad);

    armGroup.castShadow = true;
    group.add(armGroup);
  }

  // 6. Oturan Sevimli Kömürsü Bacaklar (Seated Chibi Legs)
  const legPositions = [
    { x: -0.52, z: 0.35, rotY: 0.35 },
    { x: 0.52, z: 0.35, rotY: -0.35 },
  ];
  legPositions.forEach((pos) => {
    const legGroup = new THREE.Group();
    legGroup.position.set(pos.x, 0.42, pos.z);
    legGroup.rotation.y = pos.rotY;
    legGroup.name = 'legs';

    // Chubby rounded thigh
    const thigh = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), legsMat);
    thigh.scale.set(1.0, 1.15, 1.1);
    thigh.name = 'legs';
    legGroup.add(thigh);

    // Chubby front foot / paw
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), legsMat);
    foot.scale.set(0.95, 0.75, 1.35);
    foot.position.set(0, -0.16, 0.22);
    foot.name = 'legs';
    legGroup.add(foot);

    // Cute pink sole pad
    const sole = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), snoutMat);
    sole.scale.set(1.0, 0.2, 1.2);
    sole.position.set(0, -0.12, 0.36);
    sole.rotation.x = Math.PI / 3;
    sole.name = 'snout';
    legGroup.add(sole);

    legGroup.castShadow = true;
    group.add(legGroup);
  });

  // 7. Sevimli Yeşil Bambu Dalı (Cute Fresh Green Bamboo Decoration)
  const bambooGroup = new THREE.Group();
  bambooGroup.position.set(1.35, 0, 0.65);
  bambooGroup.rotation.y = -0.4;
  bambooGroup.name = 'decoration';

  const bambooMat = new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.3 });
  for (let i = 0; i < 3; i++) {
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.6, 12), bambooMat);
    stalk.position.y = 0.3 + i * 0.62;
    bambooGroup.add(stalk);

    const joint = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.02, 6, 12), bambooMat);
    joint.rotation.x = Math.PI / 2;
    joint.position.y = 0.6 + i * 0.62;
    bambooGroup.add(joint);
  }

  // Bamboo leaves
  for (let i = 0; i < 3; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 6), bambooMat);
    leaf.scale.set(1.2, 1, 0.2);
    leaf.position.set(0.12, 1.2 + i * 0.3, 0);
    leaf.rotation.z = -0.7 - i * 0.2;
    bambooGroup.add(leaf);
  }
  group.add(bambooGroup);

  return group;
}

// =============================================================
// 🍎 3. Çeşitli Meyveler
// =============================================================

// 🍎 Ayrık İki Parça Elma Kompozisyonu (Right: Full Glossy Red Apple / Left: Half Sliced Apple with Kawaii Face & Core)
export function createApple(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'apple';

  const bodyCol = colors?.body || '#DD1122'; // Parlak kırmızı elma kabuğu
  const fleshCol = colors?.flesh || '#FFFDF0'; // Beyaz/açık krem taze elma eti
  const coreCol = colors?.core || '#F3E5C8'; // Tohum yuvası (açık şeftali/krem)
  const seedsCol = colors?.seeds || '#4A230C'; // Kahverengi elma çekirdekleri
  const stemCol = colors?.stem || '#653818'; // Kahverengi sap
  const leafCol = colors?.leaf || '#22c55e'; // Yeşil yaprak
  const veinCol = colors?.veins || '#14532d'; // Yaprak damarları
  const faceCol = colors?.face || '#0f172a'; // Yuvarlak siyah gözler & "u" gülümseme
  const blushCol = colors?.blush || '#ff94a8'; // Pembe yanak allığı
  const floatCol = colors?.decorations || '#f43f5e';

  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyCol,
    roughness: 0.15, // Glossy finish
    metalness: 0.08,
  });
  const fleshMat = new THREE.MeshStandardMaterial({
    color: fleshCol,
    roughness: 0.28,
    metalness: 0.02,
  });
  const coreMat = new THREE.MeshStandardMaterial({
    color: coreCol,
    roughness: 0.4,
  });
  const seedsMat = new THREE.MeshStandardMaterial({
    color: seedsCol,
    roughness: 0.25,
    metalness: 0.1,
  });
  const stemMat = new THREE.MeshStandardMaterial({ color: stemCol, roughness: 0.45 });
  const leafMat = new THREE.MeshStandardMaterial({ color: leafCol, roughness: 0.32 });
  const veinMat = new THREE.MeshStandardMaterial({ color: veinCol, roughness: 0.4 });
  const faceMat = new THREE.MeshStandardMaterial({ color: faceCol, roughness: 0.1 });
  const blushMat = new THREE.MeshBasicMaterial({ color: blushCol, transparent: true, opacity: 0.82 });
  const glintMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const waterDropMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.05,
    metalness: 0.9,
    transparent: true,
    opacity: 0.85,
  });

  // -------------------------------------------------------------
  // 1. HER BİRİ İÇİN AYRI ZEMİN KAİDESİ (Independent Base Mounds)
  // -------------------------------------------------------------
  // Sağdaki Tam Elma Kaidesi
  const baseRight = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, 0.12, 24), leafMat);
  baseRight.position.set(1.15, 0.06, 0);
  baseRight.name = 'leaf';
  baseRight.receiveShadow = true;
  group.add(baseRight);

  // Soldaki Yarım Elma Kaidesi
  const baseLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, 0.12, 24), leafMat);
  baseLeft.position.set(-1.15, 0.06, 0);
  baseLeft.name = 'leaf';
  baseLeft.receiveShadow = true;
  group.add(baseLeft);

  // -------------------------------------------------------------
  // 2. TAM ELMA (SAĞDA — Bağımsız, Glossy Red, Water Droplets, Stem & Leaf)
  // -------------------------------------------------------------
  const fullAppleGroup = new THREE.Group();
  fullAppleGroup.position.set(1.15, 1.18, 0);
  fullAppleGroup.name = 'body';

  // Gövde Küresi
  const fullAppleBody = new THREE.Mesh(new THREE.SphereGeometry(0.98, 32, 32), bodyMat);
  fullAppleBody.scale.set(1.12, 1.0, 1.12);
  fullAppleBody.name = 'body';
  fullAppleBody.castShadow = true;
  fullAppleBody.receiveShadow = true;
  fullAppleGroup.add(fullAppleBody);

  // Alt İki Lob Çıkıntısı
  [-0.30, 0.30].forEach((lX) => {
    const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.48, 20, 20), bodyMat);
    lobe.position.set(lX, -0.52, 0);
    lobe.scale.set(0.9, 0.72, 0.9);
    lobe.name = 'body';
    fullAppleGroup.add(lobe);
  });

  // Üst Çöküntü Çukuru
  const topCavity = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.30, 16),
    new THREE.MeshStandardMaterial({ color: '#b91c1c', roughness: 0.3 })
  );
  topCavity.rotation.x = Math.PI;
  topCavity.position.set(0, 0.82, 0);
  topCavity.name = 'body';
  fullAppleGroup.add(topCavity);

  // Parlak Çizgi Film Highlight
  const highlightMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.75, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.52 })
  );
  highlightMesh.scale.set(0.3, 0.78, 0.12);
  highlightMesh.position.set(0.44, 0.22, 0.62);
  highlightMesh.rotation.z = -0.25;
  highlightMesh.name = 'body';
  fullAppleGroup.add(highlightMesh);

  // 💧 Su Damlacıkları (Real Fresh Water Drops on Full Apple Surface)
  const dropCoords = [
    { x: -0.32, y: 0.42, z: 0.78, r: 0.045 },
    { x: -0.58, y: 0.10, z: 0.65, r: 0.036 },
    { x: 0.20, y: 0.58, z: 0.68, r: 0.048 },
    { x: 0.52, y: -0.12, z: 0.72, r: 0.040 },
  ];
  dropCoords.forEach((dc) => {
    const drop = new THREE.Mesh(new THREE.SphereGeometry(dc.r, 12, 12), waterDropMat);
    drop.scale.set(1.1, 0.5, 1.1);
    drop.position.set(dc.x, dc.y, dc.z);
    drop.name = 'decorations';
    fullAppleGroup.add(drop);
  });

  // Sap (Brown Stem)
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.82, 0),
    new THREE.Vector3(0.03, 1.08, 0.03),
    new THREE.Vector3(0.10, 1.30, 0.01),
  ]);
  const stemMesh = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 10, 0.065, 10, false), stemMat);
  stemMesh.name = 'stem';
  stemMesh.castShadow = true;
  fullAppleGroup.add(stemMesh);

  // Yeşil Yaprak ve Damarları
  const leafGroup = new THREE.Group();
  leafGroup.position.set(0.06, 1.20, 0);
  leafGroup.rotation.set(0.18, 0.35, 0.52);
  leafGroup.name = 'leaf';

  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.quadraticCurveTo(0.36, 0.24, 0.72, 0.05);
  leafShape.quadraticCurveTo(0.36, -0.18, 0, 0);

  const leafMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(leafShape, { depth: 0.032, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01 }),
    leafMat
  );
  leafMesh.name = 'leaf';
  leafMesh.castShadow = true;
  leafGroup.add(leafMesh);

  // Yaprak Damarı
  const mainVein = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.62, 8), veinMat);
  mainVein.position.set(0.32, 0, 0.02);
  mainVein.rotation.z = -Math.PI / 2.15;
  mainVein.name = 'leaf';
  leafGroup.add(mainVein);

  fullAppleGroup.add(leafGroup);
  group.add(fullAppleGroup);

  // -------------------------------------------------------------
  // 3. YARIM KESİLMİŞ ELMA (SOLDA — Bağımsız, Kesit Öne Bakan, Beyaz İç Eti & Kawaii Yüz)
  // -------------------------------------------------------------
  const halfAppleGroup = new THREE.Group();
  halfAppleGroup.position.set(-1.15, 1.10, 0);
  halfAppleGroup.rotation.set(0.05, 0.08, -0.05); // Kesit tam öne baksın
  halfAppleGroup.name = 'body';

  // Arka Kırmızı Dış Kabuk (Hemisphere Back Red Shell)
  const halfShellGeo = new THREE.SphereGeometry(0.92, 32, 32, 0, Math.PI, 0, Math.PI);
  halfShellGeo.rotateY(Math.PI / 2);
  halfShellGeo.scale(1.08, 0.95, 0.95);
  const halfShellMesh = new THREE.Mesh(halfShellGeo, bodyMat);
  halfShellMesh.name = 'body';
  halfShellMesh.castShadow = true;
  halfAppleGroup.add(halfShellMesh);

  // Kırmızı Kabuk Kenarı / Rind Rim
  const rindRim = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.042, 12, 36), bodyMat);
  rindRim.scale.set(1.08, 0.95, 0.5);
  rindRim.position.z = 0.01;
  rindRim.name = 'body';
  halfAppleGroup.add(rindRim);

  // Öne Bakan Düz Kesit Et Yüzeyi (Flat Cream Interior Cut Face)
  const cutFaceShape = new THREE.Shape();
  const radX = 1.02;
  const radY = 0.90;
  cutFaceShape.moveTo(0, radY);
  cutFaceShape.bezierCurveTo(radX * 0.8, radY * 0.9, radX, radY * 0.3, radX, -radY * 0.2);
  cutFaceShape.bezierCurveTo(radX, -radY * 0.8, radX * 0.4, -radY * 1.05, 0, -radY * 0.88);
  cutFaceShape.bezierCurveTo(-radX * 0.4, -radY * 1.05, -radX, -radY * 0.8, -radX, -radY * 0.2);
  cutFaceShape.bezierCurveTo(-radX, radY * 0.3, -radX * 0.8, radY * 0.9, 0, radY);

  const cutFaceGeo = new THREE.ShapeGeometry(cutFaceShape, 32);
  const cutFaceMesh = new THREE.Mesh(cutFaceGeo, fleshMat);
  cutFaceMesh.position.z = 0.02;
  cutFaceMesh.name = 'flesh';
  halfAppleGroup.add(cutFaceMesh);

  // ✨ Sulu Taze Yansıma Efekti
  const sheenMesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.38, 20),
    new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35 })
  );
  sheenMesh.scale.set(1.3, 0.55, 1);
  sheenMesh.position.set(-0.22, 0.30, 0.028);
  sheenMesh.rotation.z = -0.3;
  halfAppleGroup.add(sheenMesh);

  // -------------------------------------------------------------
  // 4. TOHUM YUVASI VE KAWAII YÜZ (Yarım Elma Kesit Yüzeyinde)
  // • Yuvarlak Siyah Gözler
  // • Pembe Yanak Allığı
  // • "∪" Gülümseme
  // • Tohum Yuvası & Çekirdekler
  // -------------------------------------------------------------
  const starCoreGroup = new THREE.Group();
  starCoreGroup.position.set(0, -0.22, 0.025);
  starCoreGroup.name = 'core';

  // Yıldız Tohum Odacığı (Star Core Cavity)
  const starCoreShape = new THREE.Shape();
  const starCount = 5;
  const outerR = 0.28;
  const innerR = 0.12;
  for (let s = 0; s < starCount * 2; s++) {
    const angle = (s * Math.PI) / starCount - Math.PI / 2;
    const r = s % 2 === 0 ? outerR : innerR;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (s === 0) starCoreShape.moveTo(x, y);
    else starCoreShape.lineTo(x, y);
  }
  starCoreShape.closePath();

  const starCoreMesh = new THREE.Mesh(new THREE.ShapeGeometry(starCoreShape, 20), coreMat);
  starCoreMesh.name = 'core';
  starCoreGroup.add(starCoreMesh);

  // Kahverengi Çekirdekler
  const seedPositions = [
    { x: -0.09, y: 0.06, rotZ: 0.45 },
    { x: 0.09, y: 0.06, rotZ: -0.45 },
    { x: 0, y: -0.12, rotZ: 0 },
  ];
  seedPositions.forEach((sp) => {
    const seedMesh = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 12), seedsMat);
    seedMesh.scale.set(0.65, 1.25, 0.3);
    seedMesh.position.set(sp.x, sp.y, 0.015);
    seedMesh.rotation.z = sp.rotZ;
    seedMesh.name = 'seeds';
    starCoreGroup.add(seedMesh);
  });
  halfAppleGroup.add(starCoreGroup);

  // KAWAII YÜZ (Yarım Elma Kesit Yüzeyinde)
  const faceGroup = new THREE.Group();
  faceGroup.position.set(0, 0.22, 0.035);
  faceGroup.name = 'face';

  // • Yuvarlak Siyah Gözler (Sol & Sağ Üst)
  [-0.24, 0.24].forEach((eX) => {
    const eyeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.068, 16, 16), faceMat);
    eyeMesh.scale.set(1.0, 1.05, 0.35);
    eyeMesh.position.set(eX, 0.08, 0.01);
    eyeMesh.name = 'face';
    faceGroup.add(eyeMesh);

    // Göz parıltısı
    const eyeGlint = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), glintMat);
    eyeGlint.position.set(eX + 0.02, 0.10, 0.025);
    faceGroup.add(eyeGlint);

    // • Pembe Yanak Allığı (Gözlerin altında)
    const blushMesh = new THREE.Mesh(new THREE.CircleGeometry(0.062, 16), blushMat);
    blushMesh.position.set(eX, -0.08, 0.012);
    blushMesh.name = 'blush';
    faceGroup.add(blushMesh);
  });

  // • Küçük "∪" Gülümseme (Alt Orta)
  const smileGeo = new THREE.TorusGeometry(0.08, 0.018, 8, 16, Math.PI);
  smileGeo.rotateZ(Math.PI);
  const smileMesh = new THREE.Mesh(smileGeo, faceMat);
  smileMesh.position.set(0, -0.12, 0.01);
  smileMesh.name = 'face';
  faceGroup.add(smileMesh);

  halfAppleGroup.add(faceGroup);

  // Yarım Elma Minik Sapı
  const halfStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, 0.32, 8),
    stemMat
  );
  halfStem.position.set(0, 0.95, 0);
  halfStem.rotation.z = -0.2;
  halfStem.name = 'stem';
  halfAppleGroup.add(halfStem);

  group.add(halfAppleGroup);

  // -------------------------------------------------------------
  // 5. ETRAFINDA UÇUŞAN BÜYÜLÜ SPARKLE, KALP VE YILDIZLAR
  // -------------------------------------------------------------
  const floatingGroup = new THREE.Group();
  floatingGroup.name = 'decorations';

  const floatHeartShape = new THREE.Shape();
  const hp = 0.12;
  floatHeartShape.moveTo(0, hp * 0.35);
  floatHeartShape.bezierCurveTo(hp * 0.35, hp * 0.85, hp * 0.95, hp * 0.6, hp * 0.95, 0);
  floatHeartShape.bezierCurveTo(hp * 0.95, -hp * 0.45, 0, -hp * 0.85, 0, -hp * 1.15);
  floatHeartShape.bezierCurveTo(0, -hp * 0.85, -hp * 0.95, -hp * 0.45, -hp * 0.95, 0);
  floatHeartShape.bezierCurveTo(-hp * 0.95, hp * 0.6, -hp * 0.35, hp * 0.85, 0, hp * 0.35);

  const floatHeartGeo = new THREE.ExtrudeGeometry(floatHeartShape, {
    depth: 0.035,
    bevelEnabled: true,
    bevelSize: 0.01,
    bevelThickness: 0.01,
  });

  const floatMat = new THREE.MeshStandardMaterial({
    color: floatCol,
    roughness: 0.25,
    emissive: floatCol,
    emissiveIntensity: 0.4,
  });
  const starMat = new THREE.MeshStandardMaterial({
    color: '#facc15',
    roughness: 0.2,
    emissive: '#facc15',
    emissiveIntensity: 0.6,
  });

  // Sparkle efektleri ikisinin etrafına dengeli dağıtıldı
  const starCoords = [
    { x: -2.1, y: 1.8, z: 0.2, type: 'star', scale: 0.8, speed: 1.6, phase: 0 },
    { x: -1.2, y: 2.2, z: 0.3, type: 'heart', scale: 1.0, speed: 1.8, phase: 1.2 },
    { x: 0, y: 1.6, z: 0.5, type: 'star', scale: 1.1, speed: 2.1, phase: 2.4 },
    { x: 1.2, y: 2.2, z: 0.2, type: 'star', scale: 0.9, speed: 1.5, phase: 3.6 },
    { x: 2.1, y: 1.7, z: 0.3, type: 'heart', scale: 1.0, speed: 1.9, phase: 4.8 },
  ];

  starCoords.forEach((sc) => {
    const itemMesh = new THREE.Mesh(
      sc.type === 'heart' ? floatHeartGeo : new THREE.SphereGeometry(0.10, 8, 4),
      sc.type === 'heart' ? floatMat : starMat
    );
    itemMesh.position.set(sc.x, sc.y, sc.z);
    itemMesh.scale.setScalar(sc.scale);
    itemMesh.name = 'decorations';
    itemMesh.userData.isFloating = true;
    itemMesh.userData.basePosY = sc.y;
    itemMesh.userData.speed = sc.speed;
    itemMesh.userData.phase = sc.phase;
    floatingGroup.add(itemMesh);
  });

  group.add(floatingGroup);

  return group;
}

// 🍌 Muz
export function createBanana(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'banana';

  const bodyCol = colors?.body || '#facc15';
  const stemCol = colors?.stem || '#65a30d';
  const tipCol = colors?.tip || '#5c2c16';

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.3, flatShading: true });
  const stemMat = new THREE.MeshStandardMaterial({ color: stemCol, roughness: 0.4 });
  const tipMat = new THREE.MeshStandardMaterial({ color: tipCol, roughness: 0.5 });

  // 1. Banana Body - Crescent shape with facets
  const points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.2, 0.4, 0),
    new THREE.Vector3(0.5, 1.2, 0),
    new THREE.Vector3(0.3, 2.0, 0),
    new THREE.Vector3(0, 2.5, 0),
  ];
  const curve = new THREE.CatmullRomCurve3(points);
  
  const segmentCount = 10;
  for (let i = 0; i < segmentCount; i++) {
    const t1 = i / segmentCount;
    const t2 = (i + 1) / segmentCount;
    
    const p1 = curve.getPoint(t1);
    const p2 = curve.getPoint(t2);
    
    // Vary radius for chubby middle
    const r1 = 0.18 + Math.sin(t1 * Math.PI) * 0.28;
    const r2 = 0.18 + Math.sin(t2 * Math.PI) * 0.28;
    
    const segmentHeight = p1.distanceTo(p2);
    const geo = new THREE.CylinderGeometry(r2, r1, segmentHeight, 7);
    const mesh = new THREE.Mesh(geo, bodyMat);
    
    mesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
    mesh.lookAt(p2);
    mesh.rotateX(Math.PI / 2);
    mesh.name = 'body';
    mesh.castShadow = true;
    group.add(mesh);
  }

  // 2. Banana Tip (Bottom)
  const tipGeo = new THREE.SphereGeometry(0.18, 7, 8);
  const tipMesh = new THREE.Mesh(tipGeo, tipMat);
  tipMesh.position.copy(points[0]);
  tipMesh.name = 'tip';
  tipMesh.castShadow = true;
  group.add(tipMesh);

  // 3. Banana Stem (Top)
  const stemCurve = new THREE.CatmullRomCurve3([
    points[points.length - 1],
    points[points.length - 1].clone().add(new THREE.Vector3(-0.15, 0.25, 0)),
    points[points.length - 1].clone().add(new THREE.Vector3(-0.3, 0.35, 0)),
  ]);
  const stemGeo = new THREE.TubeGeometry(stemCurve, 8, 0.08, 8, false);
  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  stemMesh.name = 'stem';
  stemMesh.castShadow = true;
  group.add(stemMesh);

  return group;
}

// 🍓 Sulu Çilek
export function createStrawberry(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'strawberry';

  const bodyCol = colors?.body || '#e11d48';
  const leavesCol = colors?.leaves || '#16a34a';
  const stemCol = colors?.stem || '#78350f';
  const seedsCol = colors?.seeds || '#facc15';

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.35 });
  const leavesMat = new THREE.MeshStandardMaterial({ color: leavesCol, roughness: 0.4 });
  const stemMat = new THREE.MeshStandardMaterial({ color: stemCol, roughness: 0.5 });
  const seedsMat = new THREE.MeshStandardMaterial({ color: seedsCol, roughness: 0.2 });

  // 1. Body - Chubby Tapered Profile using Spline + Lathe
  const curve = new THREE.SplineCurve([
    new THREE.Vector2(0, 0.12),    // Bottom center (rounded start)
    new THREE.Vector2(0.35, 0.22), // Tapering out
    new THREE.Vector2(0.72, 0.55), // Mid-lower
    new THREE.Vector2(1.15, 1.1),  // Mid
    new THREE.Vector2(1.28, 1.55), // Widest/upper part
    new THREE.Vector2(1.1, 2.0),   // Closing in
    new THREE.Vector2(0.4, 2.15),  // Near center top
    new THREE.Vector2(0, 2.1)      // Top center (slight indentation)
  ]);
  
  const points = curve.getPoints(32);
  const bodyGeo = new THREE.LatheGeometry(points, 32);
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.name = 'body';
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // 2. Seeds - Scattered on the surface using the curve
  for (let i = 0; i < 45; i++) {
    const t = Math.random() * 0.8 + 0.1; // avoid extreme tip/top
    const p = curve.getPoint(t);
    const phi = Math.random() * Math.PI * 2;
    
    const r = p.x * 0.98;
    const y = p.y;
    
    const seed = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), seedsMat);
    seed.scale.set(0.6, 1.2, 0.4);
    seed.position.set(Math.cos(phi) * r, y, Math.sin(phi) * r);
    
    // Face the seed outward
    seed.lookAt(new THREE.Vector3(Math.cos(phi) * (r + 1), y, Math.sin(phi) * (r + 1)));
    seed.name = 'seeds';
    group.add(seed);
  }

  // 3. Leaves - 6-leaf crown
  const leafGroup = new THREE.Group();
  leafGroup.position.y = 2.1;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const leafGeo = new THREE.SphereGeometry(0.35, 12, 12);
    leafGeo.scale(1.3, 0.1, 0.6);
    const leaf = new THREE.Mesh(leafGeo, leavesMat);
    leaf.position.set(Math.cos(angle) * 0.35, 0.05, Math.sin(angle) * 0.35);
    leaf.rotation.y = -angle;
    leaf.rotation.z = 0.35;
    leaf.name = 'leaves';
    leafGroup.add(leaf);
  }
  group.add(leafGroup);

  // 4. Stem
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.5, 8), stemMat);
  stem.position.y = 2.3;
  stem.rotation.z = 0.1;
  stem.name = 'stem';
  group.add(stem);

  return group;
}

// 🍉 Karpuz Dilimi
export function createWatermelon(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'watermelon';

  const bodyCol = colors?.body || '#ef4444';
  const rindCol = colors?.rind || '#15803d';
  const innerRindCol = colors?.inner_rind || '#f8fafc';
  const seedsCol = colors?.seeds || '#1e293b';

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.3 });
  const rindMat = new THREE.MeshStandardMaterial({ color: rindCol, roughness: 0.4 });
  const innerRindMat = new THREE.MeshStandardMaterial({ color: innerRindCol, roughness: 0.4 });
  const seedsMat = new THREE.MeshStandardMaterial({ color: seedsCol, roughness: 0.2 });

  const radius = 1.6;
  const arcAngle = Math.PI * 0.24; // ~43 degrees each side

  // 1. Flesh (Body) - Red triangle with curved bottom
  const fleshShape = new THREE.Shape();
  fleshShape.moveTo(0, 0);
  fleshShape.absarc(0, 0, radius * 0.88, Math.PI * 1.5 - arcAngle, Math.PI * 1.5 + arcAngle, false);
  fleshShape.lineTo(0, 0);

  const fleshGeo = new THREE.ExtrudeGeometry(fleshShape, { 
    depth: 0.35, 
    bevelEnabled: true, 
    bevelThickness: 0.04, 
    bevelSize: 0.04, 
    bevelSegments: 4 
  });
  const fleshMesh = new THREE.Mesh(fleshGeo, bodyMat);
  fleshMesh.name = 'body';
  fleshMesh.position.y = 1.85; // Tip at top
  fleshMesh.castShadow = true;
  group.add(fleshMesh);

  // 2. Inner Rind - Thin light layer
  const innerShape = new THREE.Shape();
  innerShape.absarc(0, 0, radius * 0.94, Math.PI * 1.5 - arcAngle, Math.PI * 1.5 + arcAngle, false);
  innerShape.absarc(0, 0, radius * 0.88, Math.PI * 1.5 + arcAngle, Math.PI * 1.5 - arcAngle, true);
  
  const innerGeo = new THREE.ExtrudeGeometry(innerShape, { depth: 0.36, bevelEnabled: false });
  const innerMesh = new THREE.Mesh(innerGeo, innerRindMat);
  innerMesh.name = 'inner_rind';
  innerMesh.position.y = 1.85;
  innerMesh.castShadow = true;
  group.add(innerMesh);

  // 3. Outer Rind - Green bottom
  const outerShape = new THREE.Shape();
  outerShape.absarc(0, 0, radius, Math.PI * 1.5 - arcAngle, Math.PI * 1.5 + arcAngle, false);
  outerShape.absarc(0, 0, radius * 0.94, Math.PI * 1.5 + arcAngle, Math.PI * 1.5 - arcAngle, true);

  const outerGeo = new THREE.ExtrudeGeometry(outerShape, { depth: 0.38, bevelEnabled: false });
  const outerMesh = new THREE.Mesh(outerGeo, rindMat);
  outerMesh.name = 'rind';
  outerMesh.position.y = 1.85;
  outerMesh.castShadow = true;
  group.add(outerMesh);

  // 4. Seeds - Fixed to surfaces (front and back) in a structured pattern
  const seedConfigs = [
    { r: 0.35, a: 0 },
    { r: 0.58, a: -0.16 },
    { r: 0.58, a: 0.16 },
    { r: 0.78, a: -0.22 },
    { r: 0.78, a: 0 },
    { r: 0.78, a: 0.22 },
  ];

  const zPositions = [0.39, -0.04]; 
  
  seedConfigs.forEach(cfg => {
    const r = radius * cfg.r;
    const baseAngle = Math.PI * 1.5;
    const angle = baseAngle + cfg.a;

    zPositions.forEach(z => {
      const seedGeo = new THREE.SphereGeometry(0.065, 8, 8);
      seedGeo.scale(0.7, 1.25, 0.35);
      const seed = new THREE.Mesh(seedGeo, seedsMat);
      
      seed.position.set(Math.cos(angle) * r, 1.85 + Math.sin(angle) * r, z);
      seed.rotation.z = angle + Math.PI / 2;
      seed.name = 'seeds';
      group.add(seed);
    });
  });

  return group;
}

// =============================================================
// 🥕 4. Çeşitli Sebzeler
// =============================================================

// 🥕 Kawaii Sevimli Havuç Karakteri (Chubby Curved Carrot with Winking Face, Bushy Leaves, Ridge Lines, Flower Meadow & Little Bunny Companion)
export function createCarrot(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'carrot';

  const bodyCol = colors?.body || '#f97316'; // Parlak canlı turuncu havuç
  const grooveCol = colors?.grooves || '#ea580c'; // Yatay havuç çizgi dokusu
  const leavesCol = colors?.leaves || '#16a34a'; // Koyu canlı yeşil yapraklar
  const faceCol = colors?.face || '#0f172a'; // Siyah gözler & gülümseme
  const blushCol = colors?.blush || '#ff94a8'; // Pembe yanak allığı
  const bunnyCol = colors?.bunny || '#ffffff'; // Sevimli beyaz tavşan
  const starCol = colors?.decorations || '#facc15';

  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyCol,
    roughness: 0.28,
    metalness: 0.05,
  });
  const grooveMat = new THREE.MeshStandardMaterial({
    color: grooveCol,
    roughness: 0.4,
  });
  const leavesMat = new THREE.MeshStandardMaterial({
    color: leavesCol,
    roughness: 0.38,
  });
  const faceMat = new THREE.MeshStandardMaterial({ color: faceCol, roughness: 0.1 });
  const blushMat = new THREE.MeshBasicMaterial({ color: blushCol, transparent: true, opacity: 0.85 });
  const glintMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const bunnyMat = new THREE.MeshStandardMaterial({ color: bunnyCol, roughness: 0.45 });
  const bunnyEarMat = new THREE.MeshStandardMaterial({ color: '#fbcfe8', roughness: 0.35 });
  const flowerYellowMat = new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.3 });
  const flowerPinkMat = new THREE.MeshStandardMaterial({ color: '#f472b6', roughness: 0.3 });
  const starMat = new THREE.MeshStandardMaterial({
    color: starCol,
    roughness: 0.2,
    emissive: starCol,
    emissiveIntensity: 0.6,
  });

  // 1. ZEMİN (Çiçekli Yeşil Çimen Tarlası Base Mound)
  const baseMound = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.45, 0.14, 28), leavesMat);
  baseMound.position.y = 0.07;
  baseMound.name = 'leaves';
  baseMound.receiveShadow = true;
  group.add(baseMound);

  // Zemin Çiçekleri (Little meadow flowers)
  const flowerAngles = [0, 1.2, 2.4, 3.6, 4.8];
  flowerAngles.forEach((ang, idx) => {
    const fR = 1.05;
    const fX = Math.cos(ang) * fR;
    const fZ = Math.sin(ang) * fR;

    const flowerCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      idx % 2 === 0 ? flowerYellowMat : flowerPinkMat
    );
    flowerCore.position.set(fX, 0.18, fZ);
    flowerCore.name = 'decorations';
    group.add(flowerCore);
  });

  // -------------------------------------------------------------
  // 2. CHUBBY CURVED CARROT BODY (Tombul Yuvarlak & Kavisli Havuç Gövde)
  // -------------------------------------------------------------
  const carrotGroup = new THREE.Group();
  carrotGroup.position.set(-0.15, 0.14, 0);
  carrotGroup.name = 'body';

  // Spline ile neşeli kavisli tombul havuç profili (Lathe Profile)
  const carrotCurve = new THREE.SplineCurve([
    new THREE.Vector2(0.0, 0.1),    // Alt uç yuvarlak
    new THREE.Vector2(0.28, 0.35),  // Aşağı kıvrım
    new THREE.Vector2(0.58, 0.95),  // Alt-orta genişleme
    new THREE.Vector2(0.88, 1.65),  // Tombul gövde
    new THREE.Vector2(0.96, 2.25),  // Üst tombul kısım (Yüz alanı)
    new THREE.Vector2(0.82, 2.75),  // Üste doğru daralma
    new THREE.Vector2(0.35, 2.95),  // Tepe oyuk çukuru
    new THREE.Vector2(0.0, 2.90),
  ]);

  const points = carrotCurve.getPoints(32);
  const carrotGeo = new THREE.LatheGeometry(points, 32);
  const carrotMesh = new THREE.Mesh(carrotGeo, bodyMat);
  carrotMesh.name = 'body';
  carrotMesh.castShadow = true;
  carrotMesh.receiveShadow = true;
  carrotGroup.add(carrotMesh);

  // ✨ YATAY ÇİZGİ DOKUSU (Horizontal Natural Carrot Ridge Rings)
  const ridgeLevels = [
    { y: 0.55, scaleR: 0.42 },
    { y: 0.98, scaleR: 0.62 },
    { y: 1.42, scaleR: 0.82 },
    { y: 1.88, scaleR: 0.92 },
    { y: 2.45, scaleR: 0.88 },
  ];
  ridgeLevels.forEach((rl) => {
    const ridgeMesh = new THREE.Mesh(
      new THREE.TorusGeometry(rl.scaleR, 0.022, 8, 28),
      grooveMat
    );
    ridgeMesh.rotation.x = Math.PI / 2;
    ridgeMesh.position.set(0, rl.y, 0);
    ridgeMesh.name = 'grooves';
    carrotGroup.add(ridgeMesh);
  });

  // -------------------------------------------------------------
  // 3. KAWAII YÜZ (Üst Gövdede Büyük Gözler, Winking Expression, Smile, Blush)
  // -------------------------------------------------------------
  const faceGroup = new THREE.Group();
  faceGroup.position.set(0, 2.15, 0.88);
  faceGroup.rotation.x = -0.08;
  faceGroup.name = 'face';

  // SAĞ GÖZ: Büyük Açık Parlak Göz (Wide Sparkling Open Eye)
  const eyeR = new THREE.Group();
  eyeR.position.set(0.30, 0.12, 0);

  const pupilR = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 20), faceMat);
  pupilR.scale.set(1.0, 1.15, 0.3);
  pupilR.name = 'face';
  eyeR.add(pupilR);

  // Sparkle Glints
  const g1R = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), glintMat);
  g1R.position.set(0.03, 0.05, 0.04);
  eyeR.add(g1R);

  const g2R = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), glintMat);
  g2R.position.set(-0.03, -0.04, 0.04);
  eyeR.add(g2R);

  faceGroup.add(eyeR);

  // SOL GÖZ: Göz Kırpan Neşeli İfade 😉 (Cute Winking Arc Eye)
  const eyeL = new THREE.Group();
  eyeL.position.set(-0.30, 0.12, 0);

  const winkGeo = new THREE.TorusGeometry(0.13, 0.028, 8, 18, Math.PI * 0.85);
  winkGeo.rotateZ(Math.PI * 0.95);
  const winkMesh = new THREE.Mesh(winkGeo, faceMat);
  winkMesh.name = 'face';
  eyeL.add(winkMesh);

  // Kirpikle göz kırpma vurgusu
  const lash1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.008, 0.08, 6), faceMat);
  lash1.position.set(-0.11, -0.03, 0.015);
  lash1.rotation.z = 0.5;
  lash1.name = 'face';
  eyeL.add(lash1);

  faceGroup.add(eyeL);

  // MUTLU GÜLÜMSEME 😊 (Sweet Happy Smile with Pink Tongue)
  const smileGeo = new THREE.TorusGeometry(0.12, 0.024, 8, 18, Math.PI);
  smileGeo.rotateZ(Math.PI);
  const smileMesh = new THREE.Mesh(smileGeo, faceMat);
  smileMesh.position.set(0, -0.12, 0.01);
  smileMesh.name = 'face';
  faceGroup.add(smileMesh);

  const tongueGeo = new THREE.SphereGeometry(0.06, 10, 10);
  tongueGeo.scale(1.1, 0.6, 0.3);
  const tongueMesh = new THREE.Mesh(
    tongueGeo,
    new THREE.MeshStandardMaterial({ color: '#f43f5e', roughness: 0.3 })
  );
  tongueMesh.position.set(0, -0.15, 0.012);
  tongueMesh.name = 'face';
  faceGroup.add(tongueMesh);

  // PEMBE YANAK ALLIĞI (Pink Cheek Blush Dots)
  [-0.42, 0.42].forEach((bX) => {
    const blushMesh = new THREE.Mesh(new THREE.CircleGeometry(0.09, 18), blushMat);
    blushMesh.position.set(bX, -0.02, 0.012);
    blushMesh.name = 'blush';
    faceGroup.add(blushMesh);
  });

  carrotGroup.add(faceGroup);

  // -------------------------------------------------------------
  // 4. GÜR VE DOLGUN YEŞİL YAPRAKLAR (Bushy Top Fronds Spread Out)
  // -------------------------------------------------------------
  const leavesGroup = new THREE.Group();
  leavesGroup.position.set(0, 2.92, 0);
  leavesGroup.name = 'leaves';

  // 8 adet farklı yönlere açılmış gür yaprak dalı
  const leafCount = 8;
  for (let l = 0; l < leafCount; l++) {
    const angle = (l / leafCount) * Math.PI * 2;
    const leafFrondGroup = new THREE.Group();
    leafFrondGroup.rotation.y = angle;
    leafFrondGroup.rotation.z = 0.35 + (l % 2 === 0 ? 0.15 : -0.1);

    // Ana yaprak sapı
    const frondCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.18, 0.4, 0),
      new THREE.Vector3(0.42, 0.85, 0),
      new THREE.Vector3(0.68, 1.15, 0),
    ]);
    const frondTube = new THREE.Mesh(
      new THREE.TubeGeometry(frondCurve, 12, 0.045, 8, false),
      leavesMat
    );
    frondTube.name = 'leaves';
    leafFrondGroup.add(frondTube);

    // Dal yaprak pırtıkları (Tufted leafy foliage blobs along frond)
    [0.35, 0.65, 0.95].forEach((fY, fIdx) => {
      const pLoc = frondCurve.getPoint(fY / 1.15);
      const leafPuff = new THREE.Mesh(
        new THREE.SphereGeometry(0.12 - fIdx * 0.02, 10, 10),
        leavesMat
      );
      leafPuff.scale.set(1.4, 0.6, 0.8);
      leafPuff.position.copy(pLoc);
      leafPuff.rotation.z = 0.4;
      leafPuff.name = 'leaves';
      leafFrondGroup.add(leafPuff);
    });

    leavesGroup.add(leafFrondGroup);
  }
  carrotGroup.add(leavesGroup);
  group.add(carrotGroup);

  // -------------------------------------------------------------
  // 5. YANINDA KÜÇÜK TAVŞAN SİLÜETİ / FİGÜRÜ (Little Chubby Bunny 🐰)
  // -------------------------------------------------------------
  const bunnyGroup = new THREE.Group();
  bunnyGroup.position.set(0.95, 0.58, 0.25);
  bunnyGroup.rotation.y = -0.52;
  bunnyGroup.name = 'bunny';

  // Tavşan Gövdesi
  const bunnyBody = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), bunnyMat);
  bunnyBody.scale.set(1.0, 1.1, 1.15);
  bunnyBody.name = 'bunny';
  bunnyBody.castShadow = true;
  bunnyGroup.add(bunnyBody);

  // Tavşan Kafası
  const bunnyHead = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), bunnyMat);
  bunnyHead.position.set(0, 0.35, 0.12);
  bunnyHead.name = 'bunny';
  bunnyGroup.add(bunnyHead);

  // Minik Siyah Gözler
  [-0.09, 0.09].forEach((bX) => {
    const bEye = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), faceMat);
    bEye.position.set(bX, 0.38, 0.32);
    bunnyGroup.add(bEye);
  });

  // Minik Pembe Burun
  const bNose = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), bunnyEarMat);
  bNose.position.set(0, 0.34, 0.35);
  bunnyGroup.add(bNose);

  // Tavşan Uzun Kulakları
  [-0.09, 0.09].forEach((eX) => {
    const earGroup = new THREE.Group();
    earGroup.position.set(eX, 0.55, 0.08);
    earGroup.rotation.z = eX > 0 ? -0.22 : 0.22;

    const outerEar = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), bunnyMat);
    outerEar.scale.set(0.55, 2.2, 0.3);
    outerEar.name = 'bunny';
    earGroup.add(outerEar);

    const innerEar = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), bunnyEarMat);
    innerEar.scale.set(0.48, 1.8, 0.2);
    innerEar.position.z = 0.02;
    innerEar.name = 'bunny';
    earGroup.add(innerEar);

    bunnyGroup.add(earGroup);
  });

  // Minik Pofuduk Kuyruk
  const bunnyTail = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), bunnyMat);
  bunnyTail.position.set(0, 0.12, -0.32);
  bunnyGroup.add(bunnyTail);

  group.add(bunnyGroup);

  // -------------------------------------------------------------
  // 6. ETRAFINDA UÇUŞAN YILDIZLAR VE İŞILTILAR (Floating Sparkle Stars)
  // -------------------------------------------------------------
  const floatingGroup = new THREE.Group();
  floatingGroup.name = 'decorations';

  const starCoords = [
    { x: -1.2, y: 2.4, z: 0.3, scale: 1.0, speed: 1.6, phase: 0 },
    { x: 1.1, y: 2.8, z: 0.2, scale: 0.9, speed: 2.0, phase: 1.5 },
    { x: -0.9, y: 1.2, z: 0.8, scale: 0.8, speed: 1.3, phase: 3.0 },
    { x: 1.3, y: 1.5, z: 0.6, scale: 1.1, speed: 1.8, phase: 4.2 },
  ];

  starCoords.forEach((sc) => {
    const starMesh = new THREE.Mesh(new THREE.SphereGeometry(0.10, 8, 4), starMat);
    starMesh.position.set(sc.x, sc.y, sc.z);
    starMesh.scale.setScalar(sc.scale);
    starMesh.name = 'decorations';
    starMesh.userData.isFloating = true;
    starMesh.userData.basePosY = sc.y;
    starMesh.userData.speed = sc.speed;
    starMesh.userData.phase = sc.phase;
    floatingGroup.add(starMesh);
  });

  group.add(floatingGroup);

  return group;
}

// 🥦 Brokoli
export function createBroccoli(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'broccoli';

  const stalkCol = colors?.stalk || '#86efac';
  const crownCol = colors?.body || '#15803d';

  const stalkMat = new THREE.MeshStandardMaterial({ color: stalkCol, roughness: 0.5 });
  const crownMat = new THREE.MeshStandardMaterial({ color: crownCol, roughness: 0.8 });

  // 1. Ana Sap (Stalk)
  const stalkGeo = new THREE.CylinderGeometry(0.45, 0.65, 1.6, 16);
  const stalk = new THREE.Mesh(stalkGeo, stalkMat);
  stalk.position.y = 0.8;
  stalk.name = 'stalk';
  stalk.castShadow = true;
  group.add(stalk);

  // 2. Brokoli Başı (Crown - Fluffy Cloud Style)
  const crownGroup = new THREE.Group();
  crownGroup.position.y = 1.8;
  crownGroup.name = 'body';

  // Merkezi büyük parça
  const mainCrown = new THREE.Mesh(new THREE.SphereGeometry(0.85, 20, 20), crownMat);
  mainCrown.scale.set(1.1, 0.9, 1.1);
  mainCrown.name = 'body';
  crownGroup.add(mainCrown);

  // Etrafına 6 tane tombul pırtık (Puffs)
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), crownMat);
    puff.position.set(Math.cos(angle) * 0.7, 0.2, Math.sin(angle) * 0.7);
    puff.name = 'body';
    puff.castShadow = true;
    crownGroup.add(puff);
  }

  // Tepeye 3 minik pırtık daha
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const miniPuff = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12), crownMat);
    miniPuff.position.set(Math.cos(angle) * 0.4, 0.6, Math.sin(angle) * 0.4);
    miniPuff.name = 'body';
    crownGroup.add(miniPuff);
  }

  group.add(crownGroup);
  return group;
}

// 🍅 Domates
export function createTomato(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'tomato';

  const bodyCol = colors?.body || '#dc2626';
  const stemCol = colors?.stem || '#16a34a';

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.25 });
  const stemMat = new THREE.MeshStandardMaterial({ color: stemCol, roughness: 0.4 });

  // 1. Tombul Domates Gövdesi
  // Hafifçe basık bir küre
  const bodyGeo = new THREE.SphereGeometry(1.2, 32, 32);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.scale.set(1.2, 1.05, 1.2);
  body.position.y = 1.15;
  body.name = 'body';
  body.castShadow = true;
  group.add(body);

  // Üstteki hafif çukur etkisi için minik bir gölge/detay yerine sapı oraya oturtacağız
  
  // 2. Yeşil Yıldız Sap (Stem / Leaves)
  const stemGroup = new THREE.Group();
  stemGroup.position.set(0, 2.2, 0);
  stemGroup.name = 'stem';

  // Yıldız yapraklar (6 tane)
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const leafGeo = new THREE.ConeGeometry(0.2, 0.8, 8);
    leafGeo.rotateX(Math.PI / 2.2); // Yaprakları yatır
    const leaf = new THREE.Mesh(leafGeo, stemMat);
    leaf.position.set(Math.cos(angle) * 0.4, 0, Math.sin(angle) * 0.4);
    leaf.rotation.y = -angle;
    leaf.name = 'stem';
    stemGroup.add(leaf);
  }

  // Ortadaki dik sap ucu
  const stub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.4, 12), stemMat);
  stub.position.y = 0.2;
  stub.rotation.z = 0.1;
  stub.name = 'stem';
  stemGroup.add(stub);

  group.add(stemGroup);
  return group;
}

// 🌽 Kawaii Sevimli Mısır Karakteri (Chubby Golden Corn with Puffy Kernel Texture, Tassel Silk Hair, Hugging Open Husks, Cute Face & Stars)
export function createCorn(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'corn';

  const bodyCol = colors?.body || '#facc15'; // Bright golden yellow kernels
  const husksCol = colors?.leaves || '#86efac'; // Fresh light green open husks
  const silkCol = colors?.silk || '#fef08a'; // Light yellow tassel silk hair
  const stemCol = colors?.stem || '#15803d'; // Green stem/base
  const faceCol = colors?.face || '#0f172a'; // Black anime eyes
  const blushCol = colors?.blush || '#ff94a8'; // Pink cheek blush
  const starCol = colors?.decorations || '#fde047';

  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyCol,
    roughness: 0.22,
    metalness: 0.08,
  });
  const kernelMat = new THREE.MeshStandardMaterial({
    color: bodyCol,
    roughness: 0.18,
    metalness: 0.08,
  });
  const husksMat = new THREE.MeshStandardMaterial({
    color: husksCol,
    roughness: 0.38,
  });
  const silkMat = new THREE.MeshStandardMaterial({
    color: silkCol,
    roughness: 0.3,
  });
  const stemMat = new THREE.MeshStandardMaterial({ color: stemCol, roughness: 0.4 });
  const faceMat = new THREE.MeshStandardMaterial({ color: faceCol, roughness: 0.1 });
  const blushMat = new THREE.MeshBasicMaterial({ color: blushCol, transparent: true, opacity: 0.85 });
  const glintMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const tongueMat = new THREE.MeshStandardMaterial({ color: '#f43f5e', roughness: 0.3 });
  const starMat = new THREE.MeshStandardMaterial({
    color: starCol,
    roughness: 0.2,
    emissive: starCol,
    emissiveIntensity: 0.6,
  });

  // 1. Zemin Kaidesi (Green Grass Base Mound)
  const baseMound = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.25, 0.14, 28), stemMat);
  baseMound.position.y = 0.07;
  baseMound.name = 'leaves';
  baseMound.receiveShadow = true;
  group.add(baseMound);

  // Alt Sap (Short Green Stem Base)
  const stemBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.45, 14), stemMat);
  stemBase.position.y = 0.25;
  stemBase.name = 'stem';
  group.add(stemBase);

  // -------------------------------------------------------------
  // 2. MISIR KOÇANI VE YUVARLAK BUBBLE TANELERİ (Corn Cob & Puffy Kernel Grid)
  // -------------------------------------------------------------
  const cobGroup = new THREE.Group();
  cobGroup.position.set(0, 1.45, 0);
  cobGroup.name = 'body';

  // Ana Koçan Gövde Silindiri (Inner Cob Core)
  const cobCore = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.85, 1.85, 24), bodyMat);
  cobCore.name = 'body';
  cobCore.castShadow = true;
  cobGroup.add(cobCore);

  // Yuvarlatılmış Tepe Küresi (Rounded Top Cap)
  const cobTopCap = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 16), bodyMat);
  cobTopCap.scale.set(1.0, 0.75, 1.0);
  cobTopCap.position.y = 0.92;
  cobTopCap.name = 'body';
  cobGroup.add(cobTopCap);

  // ✨ PUF PUF YUVARLAK MISIR TANELERİ (Bubble Kernel Grid Layered around Cob)
  const kernelRows = 8;
  const kernelsPerRow = 12;
  for (let r = 0; r < kernelRows; r++) {
    const yPos = -0.75 + r * 0.22;
    const rowRadius = 0.73 - (r > 5 ? (r - 5) * 0.05 : 0); // taper slightly near top

    for (let k = 0; k < kernelsPerRow; k++) {
      const angle = (k / kernelsPerRow) * Math.PI * 2;
      const kX = Math.cos(angle) * rowRadius;
      const kZ = Math.sin(angle) * rowRadius;

      const kernelGeo = new THREE.SphereGeometry(0.125, 10, 10);
      kernelGeo.scale(1.0, 0.85, 0.9);
      const kernelMesh = new THREE.Mesh(kernelGeo, kernelMat);
      kernelMesh.position.set(kX, yPos, kZ);
      kernelMesh.name = 'body';
      cobGroup.add(kernelMesh);
    }
  }

  // -------------------------------------------------------------
  // 3. AÇIK AÇILMIŞ CANLI YEŞİL KABUKLAR (Open Curved Husks Hugging Sides)
  // -------------------------------------------------------------
  const husksGroup = new THREE.Group();
  husksGroup.position.set(0, 0.55, 0);
  husksGroup.name = 'leaves';

  // 4 Tane Açılan Yeşil Yaprak / Kabuk (4 Side Husks opening out like a jacket)
  const huskAngles = [
    { angle: -0.85, rotZ: 0.42, scaleY: 1.15, posZ: 0.1 },  // Left open husk
    { angle: 0.85, rotZ: -0.42, scaleY: 1.15, posZ: 0.1 },  // Right open husk
    { angle: 3.14, rotZ: 0, rotX: -0.38, scaleY: 1.1, posZ: 0 }, // Back husk
    { angle: 0, rotZ: 0, rotX: 0.45, scaleY: 0.85, posZ: 0.15 }, // Lower front open collar
  ];

  huskAngles.forEach((hCfg) => {
    const huskPivot = new THREE.Group();
    huskPivot.rotation.y = hCfg.angle;

    const huskShape = new THREE.Shape();
    huskShape.moveTo(0, 0);
    huskShape.quadraticCurveTo(0.48, 0.8, 0.35, 1.8 * hCfg.scaleY);
    huskShape.quadraticCurveTo(0, 2.1 * hCfg.scaleY, -0.35, 1.8 * hCfg.scaleY);
    huskShape.quadraticCurveTo(-0.48, 0.8, 0, 0);

    const huskGeo = new THREE.ExtrudeGeometry(huskShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });

    const huskMesh = new THREE.Mesh(huskGeo, husksMat);
    huskMesh.position.set(0, 0, 0.72 + hCfg.posZ);
    if (hCfg.rotZ) huskMesh.rotation.z = hCfg.rotZ;
    if (hCfg.rotX) huskMesh.rotation.x = hCfg.rotX;
    huskMesh.name = 'leaves';
    huskMesh.castShadow = true;
    huskPivot.add(huskMesh);

    husksGroup.add(huskPivot);
  });
  group.add(husksGroup);

  // -------------------------------------------------------------
  // 4. AÇIK SARI PÜSKÜL SAÇLAR (Corn Silk Tassel Hair on Top)
  // -------------------------------------------------------------
  const silkGroup = new THREE.Group();
  silkGroup.position.set(0, 2.75, 0);
  silkGroup.name = 'silk';

  const strandCount = 14;
  for (let s = 0; s < strandCount; s++) {
    const sAngle = (s / strandCount) * Math.PI * 2;
    const strandCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.cos(sAngle) * 0.18, 0.22, Math.sin(sAngle) * 0.18),
      new THREE.Vector3(Math.cos(sAngle) * 0.38, 0.42 + (s % 3) * 0.08, Math.sin(sAngle) * 0.38),
      new THREE.Vector3(Math.cos(sAngle) * 0.48, 0.25, Math.sin(sAngle) * 0.48),
    ]);

    const strandTube = new THREE.Mesh(
      new THREE.TubeGeometry(strandCurve, 10, 0.028, 6, false),
      silkMat
    );
    strandTube.name = 'silk';
    silkGroup.add(strandTube);
  }
  cobGroup.add(silkGroup);

  // -------------------------------------------------------------
  // 5. KAWAII YÜZ (Parlak Anime Gözler, Dilli Neşeli Gülümseme & Allık)
  // -------------------------------------------------------------
  const faceGroup = new THREE.Group();
  faceGroup.position.set(0, 1.52, 0.88);
  faceGroup.name = 'face';

  // Parlak Anime Gözler (Sol & Sağ)
  [-0.32, 0.32].forEach((eX) => {
    const eyeOrb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), faceMat);
    eyeOrb.scale.set(1.0, 1.18, 0.32);
    eyeOrb.position.set(eX, 0.10, 0.01);
    eyeOrb.name = 'face';
    faceGroup.add(eyeOrb);

    // Çift Işıltı Glints
    const g1 = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), glintMat);
    g1.position.set(eX + 0.035, 0.15, 0.05);
    faceGroup.add(g1);

    const g2 = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), glintMat);
    g2.position.set(eX - 0.035, 0.05, 0.05);
    faceGroup.add(g2);

    // Pembe Yanak Allığı (Gözlerin altında)
    const blushMesh = new THREE.Mesh(new THREE.CircleGeometry(0.095, 18), blushMat);
    blushMesh.position.set(eX * 1.35, -0.06, 0.012);
    blushMesh.name = 'blush';
    faceGroup.add(blushMesh);
  });

  // Neşeli Gülümseme (Cute Smile Curve with Pink Tongue :P)
  const smileGeo = new THREE.TorusGeometry(0.14, 0.026, 8, 18, Math.PI);
  smileGeo.rotateZ(Math.PI);
  const smileMesh = new THREE.Mesh(smileGeo, faceMat);
  smileMesh.position.set(0, -0.14, 0.01);
  smileMesh.name = 'face';
  faceGroup.add(smileMesh);

  // Minik Dilli Gülümseme (Cute Rosy Inner Tongue)
  const tongueGeo = new THREE.SphereGeometry(0.075, 12, 12);
  tongueGeo.scale(1.1, 0.65, 0.3);
  const tongueMesh = new THREE.Mesh(tongueGeo, tongueMat);
  tongueMesh.position.set(0, -0.18, 0.012);
  tongueMesh.name = 'face';
  faceGroup.add(tongueMesh);

  group.add(cobGroup);

  // -------------------------------------------------------------
  // 6. ETRAFINDA UÇUŞAN YILDIZLAR VE İŞILTILAR (Floating Sparkle Stars)
  // -------------------------------------------------------------
  const floatingGroup = new THREE.Group();
  floatingGroup.name = 'decorations';

  const starCoords = [
    { x: -1.25, y: 2.5, z: 0.3, scale: 1.0, speed: 1.6, phase: 0 },
    { x: 1.25, y: 2.7, z: 0.2, scale: 0.9, speed: 2.0, phase: 1.5 },
    { x: -1.0, y: 1.2, z: 0.8, scale: 0.8, speed: 1.3, phase: 3.0 },
    { x: 1.15, y: 1.4, z: 0.6, scale: 1.1, speed: 1.8, phase: 4.2 },
  ];

  starCoords.forEach((sc) => {
    const starMesh = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 4), starMat);
    starMesh.position.set(sc.x, sc.y, sc.z);
    starMesh.scale.setScalar(sc.scale);
    starMesh.name = 'decorations';
    starMesh.userData.isFloating = true;
    starMesh.userData.basePosY = sc.y;
    starMesh.userData.speed = sc.speed;
    starMesh.userData.phase = sc.phase;
    floatingGroup.add(starMesh);
  });

  group.add(floatingGroup);

  return group;
}

// =============================================================
// 🏡 5. Ev ve Yaşam Alanları
// =============================================================

export function createCottage(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'cottage';
  const wallsMat = new THREE.MeshStandardMaterial({ color: colors?.body || '#fed7aa' });
  const roofMat = new THREE.MeshStandardMaterial({ color: colors?.roof || '#dc2626' });
  const walls = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.6, 1.8), wallsMat);
  walls.position.y = 0.9;
  walls.name = 'body';
  group.add(walls);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.0, 1.4, 4), roofMat);
  roof.rotateY(Math.PI / 4);
  roof.position.y = 2.4;
  roof.name = 'roof';
  group.add(roof);
  return group;
}

export function createMushroomHouse(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'mushroom_house';
  const stemMat = new THREE.MeshStandardMaterial({ color: colors?.body || '#fef08a' });
  const capMat = new THREE.MeshStandardMaterial({ color: colors?.roof || '#e11d48' });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.3, 1.8, 24), stemMat);
  stem.position.y = 1.0;
  stem.name = 'body';
  group.add(stem);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(1.8, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.5), capMat);
  cap.position.y = 1.9;
  cap.name = 'roof';
  group.add(cap);
  return group;
}

export function createTreehouse(colors?: Record<string, string>): THREE.Group {
  const group = new THREE.Group();
  group.name = 'treehouse';
  const trunkMat = new THREE.MeshStandardMaterial({ color: colors?.trunk || '#78350f' });
  const cabinMat = new THREE.MeshStandardMaterial({ color: colors?.body || '#d97706' });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.75, 2.2, 16), trunkMat);
  trunk.position.y = 1.1;
  trunk.name = 'trunk';
  group.add(trunk);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 1.4), cabinMat);
  cabin.position.set(0, 2.65, 0);
  cabin.name = 'body';
  group.add(cabin);
  return group;
}
