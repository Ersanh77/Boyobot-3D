import React, { useEffect, useRef, memo } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { AppMode, ModelId, MaterialType, WorldId, PaintTool, PlacedSticker, FineDetailStroke, StudioThemeId, STUDIO_THEMES, AccessoryId } from '../types';
import {
  create3DFromDrawing,
  createGlitterTexture,
  createPatternTexture,
} from '../utils/models';
import { instantiate3DModel } from '../utils/modelRegistry';
import { createEnvironmentWorld } from '../utils/environments';
import { createCrown, createBow, createGlasses, createWings } from '../utils/accessories';
import { playPop, playMagic, playSpray, playBoing } from '../utils/audio';

interface ThreeCanvasProps {
  mode: AppMode;
  currentModel: ModelId;
  drawingCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  drawingMaterial: MaterialType;
  drawingVersion: number;
  activeTool: PaintTool;
  activeColor: string;
  activeColorType: 'solid' | 'glitter' | 'pattern';
  activeStickerEmoji: string;
  modelPartColors: Record<string, string>;
  onModelPartColorChange: (part: string, color: string) => void;
  stickers: PlacedSticker[];
  onAddSticker: (sticker: PlacedSticker) => void;
  fineDetailStrokes: FineDetailStroke[];
  onAddFineDetailStroke: (stroke: FineDetailStroke) => void;
  isAnimating: boolean;
  activeWorld: WorldId;
  animationAction: 'dance' | 'jump' | 'fly' | 'confetti';
  zoomLevel: number;
  rotationOffset: number;
  brushSize: number;
  stickerSize: number;
  studioThemeId: StudioThemeId;
  activeAccessories: AccessoryId[];
}

// Deep disposal helper to eliminate Three.js memory leaks
function disposeObjectTree(root: THREE.Object3D | null) {
  if (!root) return;
  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        const disposeMat = (m: THREE.Material) => {
          const matWithMaps = m as THREE.MeshStandardMaterial;
          if (matWithMaps.map) matWithMaps.map.dispose();
          if (matWithMaps.lightMap) matWithMaps.lightMap.dispose();
          if (matWithMaps.bumpMap) matWithMaps.bumpMap.dispose();
          if (matWithMaps.normalMap) matWithMaps.normalMap.dispose();
          if (matWithMaps.roughnessMap) matWithMaps.roughnessMap.dispose();
          if (matWithMaps.metalnessMap) matWithMaps.metalnessMap.dispose();
          if (matWithMaps.alphaMap) matWithMaps.alphaMap.dispose();
          if (matWithMaps.envMap) matWithMaps.envMap.dispose();
          m.dispose();
        };

        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(disposeMat);
        } else {
          disposeMat(mesh.material);
        }
      }
    }
  });
}

// Helper to paint directly onto dynamic mesh CanvasTexture via hit UV
function paintOnMeshCanvasTexture(
  hitMesh: THREE.Mesh,
  uv: THREE.Vector2,
  tool: PaintTool,
  colorHex: string,
  brushSize: number,
  lastUVRef: React.MutableRefObject<THREE.Vector2 | null>
) {
  const mat = hitMesh.material as THREE.MeshStandardMaterial;
  if (!mat) return;

  // Initialize dynamic canvas for hitMesh if not already created
  if (!hitMesh.userData.canvas) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Fill initial canvas with current material base color
    const baseColor = mat.color ? '#' + mat.color.getHexString() : '#ffffff';
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    if (!mat.userData.isUnique) {
      hitMesh.material = mat.clone();
      hitMesh.material.userData.isUnique = true;
    }
    (hitMesh.material as THREE.MeshStandardMaterial).color.set('#ffffff');
    (hitMesh.material as THREE.MeshStandardMaterial).map = texture;
    (hitMesh.material as THREE.MeshStandardMaterial).needsUpdate = true;

    hitMesh.userData.canvas = canvas;
    hitMesh.userData.ctx = ctx;
    hitMesh.userData.texture = texture;
    hitMesh.userData.baseColor = baseColor;
  }

  const canvas = hitMesh.userData.canvas as HTMLCanvasElement;
  const ctx = hitMesh.userData.ctx as CanvasRenderingContext2D;
  const texture = hitMesh.userData.texture as THREE.CanvasTexture;

  const currentX = uv.x * canvas.width;
  const currentY = (1 - uv.y) * canvas.height;

  const prevUV = lastUVRef.current;
  let isSeamless = true;
  if (prevUV) {
    const duvX = Math.abs(uv.x - prevUV.x);
    const duvY = Math.abs(uv.y - prevUV.y);
    // Ignore line connection if stroke crosses UV seam boundary
    if (duvX > 0.25 || duvY > 0.25) {
      isSeamless = false;
    }
  }

  const prevX = prevUV && isSeamless ? prevUV.x * canvas.width : currentX;
  const prevY = prevUV && isSeamless ? prevUV.y * canvas.height : currentY;

  ctx.save();

  if (tool === 'eraser') {
    ctx.fillStyle = hitMesh.userData.baseColor || '#ffffff';
    ctx.strokeStyle = hitMesh.userData.baseColor || '#ffffff';
    ctx.lineWidth = brushSize * 3.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(currentX, currentY, brushSize * 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (tool === 'spray') {
    ctx.fillStyle = colorHex;
    const radius = brushSize * 2.5;
    for (let i = 0; i < 14; i++) {
      const offsetX = (Math.random() - 0.5) * radius * 2;
      const offsetY = (Math.random() - 0.5) * radius * 2;
      ctx.beginPath();
      ctx.arc(currentX + offsetX, currentY + offsetY, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Standard brush / eyebrow / eyelash / nose / mouth / fine_detail
    ctx.strokeStyle = colorHex;
    ctx.fillStyle = colorHex;
    ctx.lineWidth = Math.max(2, brushSize * 2.0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(currentX, currentY, Math.max(1, brushSize * 1.0), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
  texture.needsUpdate = true;
  lastUVRef.current = uv.clone();
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = memo(({
  mode,
  currentModel,
  drawingCanvasRef,
  drawingMaterial,
  drawingVersion,
  activeTool,
  activeColor,
  activeColorType,
  activeStickerEmoji,
  modelPartColors,
  onModelPartColorChange,
  stickers,
  onAddSticker,
  fineDetailStrokes,
  onAddFineDetailStroke,
  isAnimating,
  activeWorld,
  animationAction,
  zoomLevel,
  rotationOffset,
  brushSize,
  stickerSize,
  studioThemeId,
  activeAccessories,
}) => {
  const activeStudioTheme = STUDIO_THEMES.find((t) => t.id === studioThemeId) || STUDIO_THEMES[0];
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const envGroupRef = useRef<THREE.Group | null>(null);
  const stickersGroupRef = useRef<THREE.Group | null>(null);
  const particlesGroupRef = useRef<THREE.Group | null>(null);
  const fineDetailGroupRef = useRef<THREE.Group | null>(null);
  const accessoriesGroupRef = useRef<THREE.Group | null>(null);

  // Interaction & Orbit control state
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const initialTouchPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const prevPinchDistRef = useRef<number | null>(null);
  const wasMultiTouchRef = useRef(false);
  const cameraOrbitRef = useRef({ theta: 0, phi: 1.35, distance: 7.2 });
  const targetOrbitRef = useRef({ theta: 0, phi: 1.35, distance: 7.2 });
  const isPaintingSurfaceRef = useRef(false);
  const lastUVRef = useRef<THREE.Vector2 | null>(null);
  const lastHitMeshRef = useRef<THREE.Mesh | null>(null);

  // Props ref for continuous rendering without re-binding listeners
  const propsRef = useRef({
    mode,
    activeTool,
    activeColor,
    activeColorType,
    activeStickerEmoji,
    modelPartColors,
    isAnimating,
    animationAction,
    brushSize,
    stickerSize,
  });

  useEffect(() => {
    propsRef.current = {
      mode,
      activeTool,
      activeColor,
      activeColorType,
      activeStickerEmoji,
      modelPartColors,
      isAnimating,
      animationAction,
      brushSize,
      stickerSize,
    };
  }, [mode, activeTool, activeColor, activeColorType, activeStickerEmoji, modelPartColors, isAnimating, animationAction, brushSize, stickerSize]);

  // Adjust camera distance based on zoomLevel & rotationOffset
  useEffect(() => {
    targetOrbitRef.current.distance = Math.max(3.8, 7.2 - zoomLevel * 0.8);
  }, [zoomLevel]);

  useEffect(() => {
    targetOrbitRef.current.theta += rotationOffset * (Math.PI / 8);
  }, [rotationOffset]);

  // Scene initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#f7f9fe');

    // 2. Camera centered directly facing front face
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    camera.position.set(0, 2.2, 7.2);

    // 3. Renderer with ACESFilmicToneMapping & SRGB
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35; // Brighter exposure
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // 4. Studio Environment Lighting
    const pmremGen = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGen.fromScene(new RoomEnvironment(), 0.05).texture;
    pmremGen.dispose();

    // Soft Ambient
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.5);
    scene.add(ambientLight);

    // Key Light: Soft & Warm
    const keyLight = new THREE.DirectionalLight('#fff9f0', 1.8);
    keyLight.position.set(5, 8, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.radius = 4; // Softer shadows
    scene.add(keyLight);

    // Fill Light: Soft Blueish
    const fillLight = new THREE.DirectionalLight('#e0f2fe', 1.0);
    fillLight.position.set(-5, 4, 6);
    scene.add(fillLight);

    // Rim Light: Pop
    const rimLight = new THREE.DirectionalLight('#ffffff', 0.8);
    rimLight.position.set(0, 5, -8);
    scene.add(rimLight);

    // Soft radial contact shadow plane
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(5, 5);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.01;
    scene.add(shadowPlane);

    // Groups for stickers & particles
    const stickersGroup = new THREE.Group();
    stickersGroupRef.current = stickersGroup;
    scene.add(stickersGroup);

    const particlesGroup = new THREE.Group();
    particlesGroupRef.current = particlesGroup;
    scene.add(particlesGroup);

    const fineDetailGroup = new THREE.Group();
    fineDetailGroupRef.current = fineDetailGroup;
    scene.add(fineDetailGroup);

    const accessoriesGroup = new THREE.Group();
    accessoriesGroupRef.current = accessoriesGroup;
    scene.add(accessoriesGroup);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Smooth camera orbit damping
      cameraOrbitRef.current.theta = THREE.MathUtils.damp(
        cameraOrbitRef.current.theta,
        targetOrbitRef.current.theta,
        14,
        delta
      );
      cameraOrbitRef.current.phi = THREE.MathUtils.damp(
        cameraOrbitRef.current.phi,
        targetOrbitRef.current.phi,
        14,
        delta
      );
      cameraOrbitRef.current.distance = THREE.MathUtils.damp(
        cameraOrbitRef.current.distance,
        targetOrbitRef.current.distance,
        14,
        delta
      );

      // Spherical coordinates to camera pos
      const phi = Math.max(0.05, Math.min(Math.PI / 2.05, cameraOrbitRef.current.phi));
      const theta = cameraOrbitRef.current.theta;
      const dist = cameraOrbitRef.current.distance;

      camera.position.x = dist * Math.sin(phi) * Math.sin(theta);
      camera.position.y = dist * Math.cos(phi) + 1.2;
      camera.position.z = dist * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 1.2, 0);

      // Model animation during "Canlandır" mode
      if (modelGroupRef.current) {
        // ALWAYS ON animations (like butterfly hovering, dolphin leaping wave)
        if (modelGroupRef.current.userData.isFlying) {
           const hoverT = elapsed * 2.0;
           // If not in a specific animation mode, apply base hovering
           if (!propsRef.current.isAnimating) {
             modelGroupRef.current.position.y = 0.5 + Math.sin(hoverT) * 0.2;
             modelGroupRef.current.rotation.z = Math.sin(hoverT * 0.5) * 0.05;
           }
        } else if (modelGroupRef.current.userData.isLeaping) {
           const leapT = elapsed * 2.2;
           if (!propsRef.current.isAnimating) {
             modelGroupRef.current.position.y = 0.28 + Math.sin(leapT) * 0.14;
             modelGroupRef.current.rotation.x = Math.sin(leapT * 0.9) * 0.05;
             modelGroupRef.current.rotation.z = Math.cos(leapT * 0.6) * 0.03;
           }
        }

        // Pulse wings, tail sway, or other parts if flagged
        modelGroupRef.current.traverse(child => {
          if (child.userData.isPulsing) {
            const pulseT = elapsed * 8.0;
            child.rotation.y = (child.userData.baseRotationY || 0) + Math.sin(pulseT) * 0.4;
          }
          if (child.userData.isTailSway) {
            const swayT = elapsed * 3.6;
            child.rotation.x = (child.userData.baseRotX || 0) + Math.sin(swayT) * 0.12;
          }
          if (child.userData.isWingFlap) {
            const flapT = elapsed * 2.4;
            // Smooth opening and closing wave (0 = closed against flanks, 1 = opened wide)
            const openFactor = Math.sin(flapT) * 0.5 + 0.5;
            const maxAngle = child.userData.maxFlap || 0.68;
            const side = child.userData.side || 1;
            child.rotation.z = (child.userData.baseRotZ || 0) + side * (-openFactor * maxAngle);
            child.rotation.y = (child.userData.baseRotY || 0) + side * (openFactor * 0.35);
          }
          if (child.userData.isFish) {
            const swimT = elapsed * 4.5 + (child.userData.phase || 0);
            child.rotation.y = (child.userData.baseRotY || 0) + Math.sin(swimT) * 0.16;
            child.position.y = (child.userData.basePosY || child.position.y) + Math.sin(swimT * 0.6) * 0.08;
          }
          if (child.userData.isFloating) {
            const speed = child.userData.speed || 1.4;
            const phase = child.userData.phase || 0;
            if (child.userData.basePosY === undefined) child.userData.basePosY = child.position.y;
            child.position.y = child.userData.basePosY + Math.sin(elapsed * speed + phase) * 0.08;
            child.rotation.y += delta * 0.4;
          }
          if (child.userData.isWaving) {
            const waveT = elapsed * 5.0 + (child.userData.phase || 0);
            child.rotation.y = (child.userData.baseRotY || 0) + Math.sin(waveT) * 0.25;
          }
          if (child.userData.isThrusterPulse) {
            const flameT = elapsed * 14.0;
            const sY = 0.85 + Math.sin(flameT) * 0.25;
            child.scale.set(1, sY, 1);
          }
          if (child.userData.isBeeOrbit) {
            const orbitSpeed = child.userData.speed || 1.2;
            const orbitR = child.userData.radius || 1.8;
            const orbitT = elapsed * orbitSpeed + (child.userData.phase || 0);
            child.position.x = Math.cos(orbitT) * orbitR;
            child.position.z = Math.sin(orbitT) * orbitR;
            child.position.y = (child.userData.basePosY || 3.0) + Math.sin(orbitT * 2.5) * 0.16;
            child.rotation.y = -orbitT + (orbitSpeed > 0 ? Math.PI / 2 : -Math.PI / 2);
          }
          if (child.userData.isPlantSway) {
            const swayT = elapsed * 2.2;
            child.rotation.z = (child.userData.baseRotZ || 0) + Math.sin(swayT) * 0.05;
            child.rotation.x = (child.userData.baseRotX || 0) + Math.cos(swayT * 0.8) * 0.035;
          }
        });

        if (propsRef.current.isAnimating) {
          const action = propsRef.current.animationAction;
          if (action === 'jump') {
            // Cartoon Squash & Stretch Jump Physics
            const jumpPhase = Math.sin(elapsed * 6);
            const jumpHeight = Math.max(0, jumpPhase);
            modelGroupRef.current.position.y = jumpHeight * 1.8;
            modelGroupRef.current.position.x = 0;
            modelGroupRef.current.position.z = 0;

            if (jumpHeight < 0.08) {
              // Squash on ground landing
              modelGroupRef.current.scale.set(1.18, 0.82, 1.18);
              modelGroupRef.current.rotation.set(0, 0, 0);
            } else {
              // Stretch in mid-air
              modelGroupRef.current.scale.set(0.9, 1.18, 0.9);
              modelGroupRef.current.rotation.z = Math.sin(elapsed * 4) * 0.1;
            }
          } else if (action === 'fly') {
            // Flying: 1.5m elevation, Figure-8 gliding path
            const t = elapsed * 2.2;
            modelGroupRef.current.position.y = 1.8 + Math.sin(t * 1.5) * 0.4;
            modelGroupRef.current.position.x = Math.sin(t) * 1.1;
            modelGroupRef.current.position.z = Math.sin(t * 2) * 0.5;

            modelGroupRef.current.scale.set(1, 1, 1);
            modelGroupRef.current.rotation.z = Math.cos(t) * 0.25;
            modelGroupRef.current.rotation.y = Math.sin(t * 0.5) * 0.6;
            modelGroupRef.current.rotation.x = Math.sin(t * 1.5) * 0.15;
          } else if (action === 'confetti') {
            // Confetti: Fast joyful spin & bounce
            modelGroupRef.current.position.y = Math.abs(Math.sin(elapsed * 5)) * 0.35;
            modelGroupRef.current.position.x = 0;
            modelGroupRef.current.position.z = 0;
            modelGroupRef.current.scale.set(1, 1, 1);
            modelGroupRef.current.rotation.y += delta * 4.5;
            modelGroupRef.current.rotation.z = Math.sin(elapsed * 6) * 0.1;

            // Spawn 3D sparkle/confetti particles continuously
            if (particlesGroupRef.current && Math.random() < 0.4) {
              const isKawaii = activeWorld === 'kawaii';
              const pGeo = isKawaii && Math.random() > 0.5 ? new THREE.SphereGeometry(0.1, 4, 2) : new THREE.SphereGeometry(0.08, 8, 8);
              const pColors = ['#ff94a8', '#facc15', '#38bdf8', '#ec4899', '#a855f7', '#34d399'];
              const pMat = new THREE.MeshBasicMaterial({ color: pColors[Math.floor(Math.random() * pColors.length)] });
              const pMesh = new THREE.Mesh(pGeo, pMat);
              pMesh.position.set((Math.random() - 0.5) * 2.5, Math.random() * 2.5 + 0.5, (Math.random() - 0.5) * 2.5);
              particlesGroupRef.current.add(pMesh);
            }
          } else {
            // Dance: Rhythmic sway & springy bounce
            const danceT = elapsed * 5;
            modelGroupRef.current.position.y = Math.abs(Math.sin(danceT)) * 0.38;
            modelGroupRef.current.position.x = Math.sin(danceT * 0.5) * 0.2;
            modelGroupRef.current.position.z = 0;
            modelGroupRef.current.scale.set(1 + Math.sin(danceT) * 0.05, 1 - Math.sin(danceT) * 0.05, 1);
            modelGroupRef.current.rotation.z = Math.sin(danceT) * 0.22;
            modelGroupRef.current.rotation.y = Math.sin(danceT * 0.5) * 0.35;
          }
        } else {
          // Idle peaceful standing pose
          if (propsRef.current.mode === 'draw_3d') {
            modelGroupRef.current.position.set(0, 1.4, 0);
            modelGroupRef.current.rotation.set(-0.1, 0.2, 0);
          } else {
            if (modelGroupRef.current.userData.isFlying || modelGroupRef.current.userData.isLeaping) {
              // Position and tilt dynamically updated in always-on block
            } else {
              modelGroupRef.current.position.set(0, 0, 0);
              modelGroupRef.current.rotation.set(0, 0, 0);
            }
          }
          modelGroupRef.current.scale.set(1, 1, 1);
        }
      }

      // Clean floating particles
      if (particlesGroupRef.current) {
        for (let i = particlesGroupRef.current.children.length - 1; i >= 0; i--) {
          const p = particlesGroupRef.current.children[i];
          p.position.y += delta * 0.5;
          p.scale.multiplyScalar(0.96);
          if (p.scale.x < 0.01) {
            particlesGroupRef.current.remove(p);
          }
        }
      }

      // Animate Environment Decorations (Hearts, Stars)
      if (envGroupRef.current) {
        envGroupRef.current.traverse((child) => {
          if (child.userData.isFloating) {
            const speed = child.userData.speed || 1;
            const phase = child.userData.phase || 0;
            child.position.y += Math.sin(elapsed * speed + phase) * 0.005;
            child.rotation.y += delta * 0.5;
            child.rotation.z += delta * 0.3;
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);

      if (modelGroupRef.current) {
        disposeObjectTree(modelGroupRef.current);
        modelGroupRef.current.clear();
      }
      if (envGroupRef.current) {
        disposeObjectTree(envGroupRef.current);
        envGroupRef.current.clear();
      }
      if (stickersGroupRef.current) {
        disposeObjectTree(stickersGroupRef.current);
        stickersGroupRef.current.clear();
      }
      if (particlesGroupRef.current) {
        disposeObjectTree(particlesGroupRef.current);
        particlesGroupRef.current.clear();
      }
      if (accessoriesGroupRef.current) {
        disposeObjectTree(accessoriesGroupRef.current);
        accessoriesGroupRef.current.clear();
      }
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();

      if (scene.environment) {
        scene.environment.dispose();
      }

      renderer.dispose();
    };
  }, []);

  // 1. Full Model Reload Effect (Only when fundamental identity/source changes)
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (modelGroupRef.current) {
      scene.remove(modelGroupRef.current);
      disposeObjectTree(modelGroupRef.current);
      modelGroupRef.current.clear();
      modelGroupRef.current = null;
    }

    let newModel: THREE.Group;
    if (mode === 'draw_3d' && drawingCanvasRef.current) {
      newModel = create3DFromDrawing(drawingCanvasRef.current, drawingMaterial);
    } else {
      // Pass the colors record to the initial instantiation for consistent start
      newModel = instantiate3DModel(currentModel, modelPartColors);
    }

    modelGroupRef.current = newModel;
    scene.add(newModel);
  }, [mode, currentModel, drawingMaterial, drawingVersion, drawingCanvasRef]);

  // 2. Optimized Part Color Update Effect (Does not recreate model)
  useEffect(() => {
    const group = modelGroupRef.current;
    if (!group) return;

    // Traverse the existing model and update material colors based on the state record
    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name || '';
        const lowerName = name.toLowerCase();
        let color = modelPartColors[name] || modelPartColors[lowerName];
        if (!color && lowerName.startsWith('leg_')) {
          color = modelPartColors['legs'];
        }
        if (!color && lowerName === 'head' && currentModel === 'dolphin') {
          color = modelPartColors['body'];
        }

        if (color && mesh.material && 'color' in mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if ('#' + mat.color.getHexString() !== color.toLowerCase()) {
            mat.color.set(color);
            mat.needsUpdate = true;
          }
        }
      }
    });
  }, [modelPartColors]);

  // Update Environment
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (envGroupRef.current) {
      scene.remove(envGroupRef.current);
      disposeObjectTree(envGroupRef.current);
      envGroupRef.current.clear();
      envGroupRef.current = null;
    }

    const worldToCreate = isAnimating ? activeWorld : (studioThemeId === 'kawaii' ? 'kawaii' : 'studio');
    const newEnv = createEnvironmentWorld(worldToCreate, activeStudioTheme.podiumColor);
    envGroupRef.current = newEnv;
    scene.add(newEnv);

    if (isAnimating) {
      if (activeWorld === 'space') scene.background = new THREE.Color('#090d16');
      else if (activeWorld === 'chocolate') scene.background = new THREE.Color('#ffedd5');
      else if (activeWorld === 'clouds') scene.background = new THREE.Color('#bae6fd');
      else if (activeWorld === 'forest') scene.background = new THREE.Color('#064e3b');
      else if (activeWorld === 'dino') scene.background = new THREE.Color('#fef3c7');
      else if (activeWorld === 'kawaii') scene.background = new THREE.Color('#fbcfe8'); // Updated background
    } else {
      scene.background = new THREE.Color(activeStudioTheme.bgColor);
    }
  }, [isAnimating, activeWorld, studioThemeId, activeStudioTheme]);

  // 3. Accessories Effect
  useEffect(() => {
    const group = modelGroupRef.current;
    if (!group) return;

    // Remove existing accessories first
    for (let i = group.children.length - 1; i >= 0; i--) {
      if (group.children[i].name.endsWith('_accessory')) {
        disposeObjectTree(group.children[i]);
        group.remove(group.children[i]);
      }
    }

    activeAccessories.forEach(accId => {
      let acc;
      if (accId === 'crown') acc = createCrown(propsRef.current.modelPartColors);
      else if (accId === 'bow') acc = createBow(propsRef.current.modelPartColors);
      else if (accId === 'glasses') acc = createGlasses(propsRef.current.modelPartColors);
      else if (accId === 'wings') acc = createWings(propsRef.current.modelPartColors);

      if (acc) {
        // Positioning based on model
        // Find head mesh if exists for positioning crown/glasses/bow
        let headMesh: THREE.Object3D | null = null;
        group.traverse(child => {
          if (child.name === 'head' && child instanceof THREE.Mesh) headMesh = child;
        });

        if (accId === 'wings') {
          acc.position.set(0, currentModel === 'chick' ? 1.85 : 1.2, -0.4);
          if (currentModel === 'chick') acc.scale.setScalar(0.95);
        } else {
          if (headMesh) {
            const head = headMesh as THREE.Mesh;
            const headWorldPos = new THREE.Vector3();
            head.getWorldPosition(headWorldPos);
            // Relative to group
            const relPos = headWorldPos.clone().sub(group.position);
            
            let r = 0.65;
            if (head.geometry) {
              if (!head.geometry.boundingSphere) head.geometry.computeBoundingSphere();
              if (head.geometry.boundingSphere) {
                r = head.geometry.boundingSphere.radius * Math.max(head.scale.x, head.scale.y, head.scale.z);
              }
            }
            const scaleFactor = Math.min(1.1, Math.max(0.65, r / 0.65));
            acc.scale.setScalar(scaleFactor);

            if (accId === 'crown') acc.position.set(relPos.x, relPos.y + r + 0.08, relPos.z);
            else if (accId === 'bow') acc.position.set(relPos.x, relPos.y + r + 0.04, relPos.z - r * 0.25);
            else if (accId === 'glasses') acc.position.set(relPos.x, relPos.y, relPos.z + r + 0.04);
          } else {
            // Fallback for models without a designated "head" mesh
            if (currentModel === 'castle') {
              if (accId === 'crown') acc.position.set(0, 5.75, -0.15);
              else if (accId === 'bow') acc.position.set(0, 3.6, 0.65);
              else if (accId === 'glasses') acc.position.set(0, 2.32, 0.95);
              else if (accId === 'wings') acc.position.set(0, 3.2, -0.6);
            } else {
              if (accId === 'crown') acc.position.set(0, 2.8, 0);
              else if (accId === 'bow') acc.position.set(0, 2.5, 0);
              else if (accId === 'glasses') acc.position.set(0, 2.2, 0.5);
            }
          }
        }
        group.add(acc);
      }
    });
  }, [activeAccessories, currentModel, mode, drawingVersion, modelPartColors]);

  // Render Placed Stickers
  useEffect(() => {
    const group = stickersGroupRef.current;
    if (!group) return;

    disposeObjectTree(group);
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    stickers.forEach((s) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.font = '96px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.emoji, 64, 68);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;

      const geo = new THREE.PlaneGeometry(s.scale, s.scale);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...s.position);

      const normalVec = new THREE.Vector3(...s.normal).normalize();
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normalVec);
      mesh.rotateZ(s.rotation);

      group.add(mesh);
    });
  }, [stickers]);

  // Raycasting helper for UV and mesh hit
  const raycastIntersection = (clientX: number, clientY: number): THREE.Intersection | null => {
    const container = mountRef.current;
    const camera = cameraRef.current;
    const modelGroup = modelGroupRef.current;
    if (!container || !camera || !modelGroup) return null;

    const rect = container.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    const intersects = raycaster.intersectObjects(modelGroup.children, true);
    return intersects.length > 0 ? intersects[0] : null;
  };

  // Touch & Pointer Interaction
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1) {
      initialTouchPosRef.current = { x: e.clientX, y: e.clientY };
      lastUVRef.current = null;

      const surfaceTools: PaintTool[] = [
        'brush',
        'eraser',
        'eyebrow',
        'eyelash',
        'nose',
        'mouth',
        'pattern_brush',
        'fine_detail',
        'spray',
      ];

      if (surfaceTools.includes(propsRef.current.activeTool)) {
        const hit = raycastIntersection(e.clientX, e.clientY);
        if (hit && hit.uv && hit.object instanceof THREE.Mesh) {
          isPaintingSurfaceRef.current = true;
          lastHitMeshRef.current = hit.object;
          paintOnMeshCanvasTexture(
            hit.object,
            hit.uv,
            propsRef.current.activeTool,
            propsRef.current.activeColor,
            propsRef.current.brushSize,
            lastUVRef
          );
        }
      }
    } else if (activePointersRef.current.size >= 2) {
      wasMultiTouchRef.current = true;
      const pts = Array.from(activePointersRef.current.values());
      prevPinchDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activePointersRef.current.has(e.pointerId)) return;

    if (isPaintingSurfaceRef.current) {
      const hit = raycastIntersection(e.clientX, e.clientY);
      if (hit && hit.uv && hit.object instanceof THREE.Mesh) {
        if (lastHitMeshRef.current !== hit.object) {
          lastUVRef.current = null;
          lastHitMeshRef.current = hit.object;
        }
        paintOnMeshCanvasTexture(
          hit.object,
          hit.uv,
          propsRef.current.activeTool,
          propsRef.current.activeColor,
          propsRef.current.brushSize,
          lastUVRef
        );
      }
      return;
    }

    const prev = activePointersRef.current.get(e.pointerId)!;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Multi-touch Pinch to Zoom on Tablet/Mobile
    if (activePointersRef.current.size >= 2) {
      wasMultiTouchRef.current = true;
      const pts = Array.from(activePointersRef.current.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (prevPinchDistRef.current !== null) {
        const distDelta = currentDist - prevPinchDistRef.current;
        targetOrbitRef.current.distance = Math.max(
          3.2,
          Math.min(11.0, targetOrbitRef.current.distance - distDelta * 0.018)
        );
      }
      prevPinchDistRef.current = currentDist;
      return;
    }

    // Single pointer Orbit Rotation
    if (activePointersRef.current.size === 1 && !isPaintingSurfaceRef.current) {
      targetOrbitRef.current.theta -= dx * 0.007;
      targetOrbitRef.current.phi = Math.max(
        0.08,
        Math.min(Math.PI / 2.05, targetOrbitRef.current.phi - dy * 0.007)
      );
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // safe ignore
    }

    const wasPainting = isPaintingSurfaceRef.current;
    isPaintingSurfaceRef.current = false;
    lastUVRef.current = null;
    lastHitMeshRef.current = null;

    const wasSingle = activePointersRef.current.size === 1;
    const hadMulti = wasMultiTouchRef.current;
    activePointersRef.current.delete(e.pointerId);

    if (activePointersRef.current.size < 2) {
      prevPinchDistRef.current = null;
    }

    if (activePointersRef.current.size === 0) {
      wasMultiTouchRef.current = false;
    }

    // Handle single tap for Bucket or Sticker
    if (wasSingle && !hadMulti && !wasPainting) {
      const distFromStart = Math.hypot(
        e.clientX - initialTouchPosRef.current.x,
        e.clientY - initialTouchPosRef.current.y
      );
      const tapThreshold = e.pointerType === 'mouse' ? 8 : 18;
      if (distFromStart < tapThreshold) {
        handleClickModel(e.clientX, e.clientY);
      }
    }
  };

  const handleClickModel = (clientX: number, clientY: number) => {
    const hit = raycastIntersection(clientX, clientY);
    if (!hit) return;

    const hitMesh = hit.object as THREE.Mesh;
    const hitPoint = hit.point;
    const hitNormal = hit.face?.normal || new THREE.Vector3(0, 0, 1);

    const { activeTool, activeColor, activeColorType, activeStickerEmoji } = propsRef.current;

    // Bucket Tool: Recolor target hit mesh
    if (activeTool === 'bucket') {
      const partName = hitMesh.name || 'body';
      playPop();

      if (activeColorType === 'glitter') {
        const glitterTex = createGlitterTexture(activeColor);
        const mat = hitMesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          if (!mat.userData.isUnique) {
            hitMesh.material = mat.clone();
            (hitMesh.material as THREE.MeshStandardMaterial).userData.isUnique = true;
          }
          const newMat = hitMesh.material as THREE.MeshStandardMaterial;
          if (newMat.map) newMat.map.dispose();
          newMat.map = glitterTex;
          newMat.needsUpdate = true;
        }
      } else if (activeColorType === 'pattern') {
        const patternId = activeColor.startsWith('#') ? 'spots' : activeColor;
        const patTex = createPatternTexture(patternId);
        const mat = hitMesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          if (!mat.userData.isUnique) {
            hitMesh.material = mat.clone();
            (hitMesh.material as THREE.MeshStandardMaterial).userData.isUnique = true;
          }
          const newMat = hitMesh.material as THREE.MeshStandardMaterial;
          if (newMat.map) newMat.map.dispose();
          newMat.map = patTex;
          newMat.needsUpdate = true;
        }
      } else {
        const mat = hitMesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          if (!mat.userData.isUnique) {
            hitMesh.material = mat.clone();
            (hitMesh.material as THREE.MeshStandardMaterial).userData.isUnique = true;
          }
          const newMat = hitMesh.material as THREE.MeshStandardMaterial;
          if (newMat.map) {
            newMat.map.dispose();
            newMat.map = null;
          }
          newMat.color.set(activeColor);
          newMat.needsUpdate = true;
        }
      }

      const resolvedPartName = (currentModel === 'dolphin' && partName === 'head') ? 'body' : partName;
      onModelPartColorChange(resolvedPartName, activeColor);
      createSparkleBurst(hitPoint, activeColor);
    }

    else if (activeTool === 'sticker') {
      playBoing();
      const normalWorld = hitNormal.clone().applyQuaternion(hitMesh.getWorldQuaternion(new THREE.Quaternion()));
      const offsetPos = hitPoint.clone().add(normalWorld.clone().multiplyScalar(0.04));

      const uprightFeatures = [
        '👀', '👁️', '🤩', '😍', '😉', '🥹', '🕶️', '👓', '😎', '🥸', '👄', '👑', '🎩', '🎀', '🥳', '🌸', '🧢', '🩹', '🪽', '🦋', '🎈', '🌈', '🍦', '🍓', '🥇', '💎', '⭐'
      ];
      const isUpright = uprightFeatures.includes(activeStickerEmoji);

      const newSticker: PlacedSticker = {
        id: `sticker_${Date.now()}_${Math.random()}`,
        emoji: activeStickerEmoji || '👑',
        position: [offsetPos.x, offsetPos.y, offsetPos.z],
        normal: [normalWorld.x, normalWorld.y, normalWorld.z],
        rotation: isUpright ? 0 : (Math.random() - 0.5) * 0.4,
        scale: propsRef.current.stickerSize,
      };

      onAddSticker(newSticker);
      createSparkleBurst(offsetPos, '#fbbf24'); // Altın sarısı parıltı
    }
  };

  // Sparkle particle burst on 3D click
  const createSparkleBurst = (pos: THREE.Vector3, colorHex: string) => {
    const group = particlesGroupRef.current;
    if (!group) return;

    for (let i = 0; i < 12; i++) {
      const geo = new THREE.SphereGeometry(0.05, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ color: colorHex });
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(pos);
      p.position.x += (Math.random() - 0.5) * 0.2;
      p.position.y += (Math.random() - 0.5) * 0.2;
      p.position.z += (Math.random() - 0.5) * 0.2;
      group.add(p);

      setTimeout(() => {
        if (group) {
          group.remove(p);
          geo.dispose();
          mat.dispose();
        }
      }, 500);
    }
  };

  return (
    <div
      ref={mountRef}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none relative"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
});
