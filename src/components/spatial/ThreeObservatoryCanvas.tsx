import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CameraMode, CoordinateFrame, ScaleMode, SpatialMeasurement, SpatialObject3D, Vector3D, ViewportSubMode } from '@/types/spatial';
import { SpatialEngine } from '@/services/spatialEngine';
import { WebXRManager } from '@/services/webxrManager';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Maximize2,
  Minimize2,
  Eye,
  Crosshair,
  Compass,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  Glasses,
  Info,
  Layers2,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

interface ThreeObservatoryCanvasProps {
  subMode: ViewportSubMode;
  scaleMode: ScaleMode;
  cameraMode: CameraMode;
  coordinateFrame: CoordinateFrame;
  simDays: number;
  simSpeed: number;
  isPlaying: boolean;
  selectedObjectId: string | null;
  onSelectObject: (object: SpatialObject3D | null) => void;
  onCameraModeChange: (mode: CameraMode) => void;
  onScaleModeChange: (mode: ScaleMode) => void;
  onCoordinateFrameChange: (frame: CoordinateFrame) => void;
  activeMeasurement: SpatialMeasurement | null;
  showOrbits: boolean;
  showGrid: boolean;
  showLabels: boolean;
}

export const ThreeObservatoryCanvas: React.FC<ThreeObservatoryCanvasProps> = ({
  subMode,
  scaleMode,
  cameraMode,
  coordinateFrame,
  simDays,
  simSpeed,
  isPlaying,
  selectedObjectId,
  onSelectObject,
  onCameraModeChange,
  onScaleModeChange,
  onCoordinateFrameChange,
  activeMeasurement,
  showOrbits,
  showGrid,
  showLabels,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const objectsMapRef = useRef<Map<string, { mesh: THREE.Object3D; data: SpatialObject3D }>>(new Map());
  const orbitsGroupRef = useRef<THREE.Group | null>(null);
  const gridGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Mouse & Orbit state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraSphericalRef = useRef({ radius: 85, theta: Math.PI / 4, phi: Math.PI / 3 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));

  const [hoveredObject, setHoveredObject] = useState<SpatialObject3D | null>(null);
  const [xrStatus, setXrStatus] = useState(WebXRManager.getCachedStatus());
  const [isXrActive, setIsXrActive] = useState(false);
  const [xrModalOpen, setXrModalOpen] = useState(false);

  // Check WebXR
  useEffect(() => {
    WebXRManager.checkXRSupport().then(setXrStatus);
  }, []);

  // Helper to generate dynamic procedural planetary textures
  const createPlanetTexture = useCallback((type: string, baseColorHex: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = baseColorHex;
    ctx.fillRect(0, 0, 512, 256);

    // Add atmospheric or surface banding
    if (type === 'gas_giant' || type === 'Planet') {
      const gradient = ctx.createLinearGradient(0, 0, 0, 256);
      gradient.addColorStop(0, '#1E293B');
      gradient.addColorStop(0.2, baseColorHex);
      gradient.addColorStop(0.4, '#FBBF24');
      gradient.addColorStop(0.6, baseColorHex);
      gradient.addColorStop(0.8, '#D97706');
      gradient.addColorStop(1, '#0F172A');
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.45;
      ctx.fillRect(0, 0, 512, 256);

      // Horizontal subtle cloud bands
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 20; i++) {
        ctx.globalAlpha = 0.05 + Math.random() * 0.08;
        const y = Math.random() * 256;
        const h = 4 + Math.random() * 12;
        ctx.fillRect(0, y, 512, h);
      }
    } else if (type === 'rocky' || type === 'terrestrial') {
      // Craters and surface noise
      ctx.fillStyle = '#000000';
      for (let i = 0; i < 40; i++) {
        ctx.globalAlpha = 0.12;
        const cx = Math.random() * 512;
        const cy = Math.random() * 256;
        const r = 2 + Math.random() * 10;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712); // Deep Space Near-Black
    scene.fog = new THREE.FogExp2(0x030712, 0.0012);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 5000);
    cameraRef.current = camera;

    // 3. Renderer with high visual fidelity and real WebXR support
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.xr.enabled = true; // Enable Three.js WebXR
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // User VR Rig to support smooth VR locomotion & orientation
    const userRig = new THREE.Group();
    userRig.position.set(0, 0, 0);
    userRig.add(camera);
    scene.add(userRig);

    // WebXR Controllers Setup
    const buildController = (index: number) => {
      const controller = renderer.xr.getController(index);
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -20),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.7,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      controller.add(line);

      // Controller Ray Selection handler
      controller.addEventListener('select', (e: any) => {
        const c = e.target;
        const tempMatrix = new THREE.Matrix4();
        tempMatrix.identity().extractRotation(c.matrixWorld);
        const raycaster = new THREE.Raycaster();
        raycaster.ray.origin.setFromMatrixPosition(c.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

        const meshes: THREE.Object3D[] = [];
        objectsMapRef.current.forEach(({ mesh }) => meshes.push(mesh));
        const intersects = raycaster.intersectObjects(meshes, true);
        if (intersects.length > 0) {
          const top = intersects[0].object;
          objectsMapRef.current.forEach(({ mesh, data }) => {
            if (mesh === top || mesh.children.includes(top)) {
              onSelectObject(data);
            }
          });
        }
      });

      return controller;
    };

    const controller0 = buildController(0);
    const controller1 = buildController(1);
    scene.add(controller0);
    scene.add(controller1);

    // 4. Lighting (Central Sun PointLight + Ambient Space Luminescence)
    const sunLight = new THREE.PointLight(0xfffdf0, 2.5, 3000, 0.4);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x334155, 0.85);
    scene.add(ambientLight);

    // 5. Deep Space Procedural Starfield (2,500 catalog stars with spectral temperatures)
    const starCount = 3000;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const spectralPalette = [
      new THREE.Color(0x93c5fd), // O/B Blue
      new THREE.Color(0xf8fafc), // A/F White
      new THREE.Color(0xfef08a), // G Yellow
      new THREE.Color(0xfdba74), // K Orange
      new THREE.Color(0xfca5a5), // M Red
    ];

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1200 + Math.random() * 800;

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const color = spectralPalette[Math.floor(Math.random() * spectralPalette.length)];
      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 6. Coordinate Grid & Ecliptic Plane
    const gridGroup = new THREE.Group();
    const polarGrid = new THREE.PolarGridHelper(100, 16, 8, 64, 0x1e293b, 0x0f172a);
    polarGrid.position.y = -0.1;
    gridGroup.add(polarGrid);

    // Reference Coordinate Axes (X=Vernal Equinox/Red, Y=North/Green, Z=Blue)
    const axesHelper = new THREE.AxesHelper(30);
    gridGroup.add(axesHelper);
    scene.add(gridGroup);
    gridGroupRef.current = gridGroup;

    // Groups for orbits and markers
    const orbitsGroup = new THREE.Group();
    scene.add(orbitsGroup);
    orbitsGroupRef.current = orbitsGroup;

    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // Mouse Listeners for OrbitControls-like behavior
    const dom = renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      // Raycasting for hover detection
      const rect = dom.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const meshes: THREE.Object3D[] = [];
      objectsMapRef.current.forEach(({ mesh }) => meshes.push(mesh));
      const intersects = raycaster.intersectObjects(meshes, true);

      if (intersects.length > 0) {
        const top = intersects[0].object;
        let found: SpatialObject3D | null = null;
        objectsMapRef.current.forEach(({ mesh, data }) => {
          if (mesh === top || mesh.children.includes(top)) {
            found = data;
          }
        });
        setHoveredObject(found);
      } else {
        setHoveredObject(null);
      }

      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      cameraSphericalRef.current.theta -= deltaX * 0.006;
      cameraSphericalRef.current.phi = Math.max(
        0.05,
        Math.min(Math.PI - 0.05, cameraSphericalRef.current.phi - deltaY * 0.006)
      );

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraSphericalRef.current.radius = Math.max(
        5,
        Math.min(450, cameraSphericalRef.current.radius + e.deltaY * 0.08)
      );
    };

    const onClick = (e: MouseEvent) => {
      const rect = dom.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const meshes: THREE.Object3D[] = [];
      objectsMapRef.current.forEach(({ mesh }) => meshes.push(mesh));
      const intersects = raycaster.intersectObjects(meshes, true);

      if (intersects.length > 0) {
        const top = intersects[0].object;
        objectsMapRef.current.forEach(({ mesh, data }) => {
          if (mesh === top || mesh.children.includes(top)) {
            onSelectObject(data);
          }
        });
      }
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('click', onClick);

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Render Loop using setAnimationLoop for native WebXR stereo headset support
    const renderLoop = () => {
      // Camera Positioning based on Spherical Coordinates and Target (Desktop mode)
      if (!renderer.xr.isPresenting) {
        const { radius, theta, phi } = cameraSphericalRef.current;
        const target = cameraTargetRef.current;

        const camX = target.x + radius * Math.sin(phi) * Math.sin(theta);
        const camY = target.y + radius * Math.cos(phi);
        const camZ = target.z + radius * Math.sin(phi) * Math.cos(theta);

        camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.1);
        camera.lookAt(target);
      }

      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(renderLoop);

    return () => {
      renderer.setAnimationLoop(null);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);

      if (renderer.domElement && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onSelectObject]);

  // Update Scene Meshes when subMode, scaleMode, or simDays change
  useEffect(() => {
    const scene = sceneRef.current;
    const orbitsGroup = orbitsGroupRef.current;
    if (!scene || !orbitsGroup) return;

    // Clear existing objects
    objectsMapRef.current.forEach(({ mesh }) => {
      scene.remove(mesh);
    });
    objectsMapRef.current.clear();

    while (orbitsGroup.children.length > 0) {
      orbitsGroup.remove(orbitsGroup.children[0]);
    }

    let rawObjects: SpatialObject3D[] = [];

    if (subMode === 'solar-system') {
      rawObjects = SpatialEngine.getSolarSystemObjects(simDays, scaleMode);
    } else if (subMode === 'deep-space') {
      rawObjects = SpatialEngine.getDeepSpaceObjects();
    } else if (subMode === 'exoplanets') {
      const systems = SpatialEngine.getExoplanetSystems(simDays);
      systems.forEach((sys) => {
        rawObjects.push(sys.hostStar);
        rawObjects.push(...sys.planets);
      });
    } else if (subMode === 'celestial-sphere') {
      rawObjects = SpatialEngine.getDeepSpaceObjects();
    } else if (subMode === 'orbit-lab') {
      // Orbit lab default test bodies
      rawObjects = SpatialEngine.getSolarSystemObjects(simDays, scaleMode).filter(
        (b) => b.id === 'sun' || b.id === 'earth' || b.id === 'mars'
      );
    }

    // Build 3D Three.js Meshes
    rawObjects.forEach((obj) => {
      const objGroup = new THREE.Group();

      // Transformed 3D position
      const pos3D =
        subMode === 'solar-system' || subMode === 'orbit-lab'
          ? SpatialEngine.transformPositionByScale(obj.position, scaleMode)
          : { x: obj.position.x, y: obj.position.y, z: obj.position.z };

      objGroup.position.set(pos3D.x, pos3D.y, pos3D.z);

      // Create Body Sphere Mesh
      let geom: THREE.BufferGeometry = new THREE.SphereGeometry(obj.displayRadius, 32, 32);
      let mat: THREE.Material;

      if (obj.type === 'Sun' || (obj.type === 'Star' && obj.position.x === 0 && obj.position.y === 0)) {
        mat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(obj.color || 0xffaa00),
        });

        // Sun Corona / Atmosphere Glow Sprite
        const glowMat = new THREE.SpriteMaterial({
          color: new THREE.Color(0xfbbf24),
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending,
        });
        const glowSprite = new THREE.Sprite(glowMat);
        glowSprite.scale.set(obj.displayRadius * 3.5, obj.displayRadius * 3.5, 1);
        objGroup.add(glowSprite);
      } else {
        const texture = createPlanetTexture(obj.type, obj.color);
        mat = new THREE.MeshStandardMaterial({
          map: texture,
          color: new THREE.Color(obj.color || 0x38bdf8),
          roughness: 0.7,
          metalness: 0.1,
          emissive: new THREE.Color(obj.color).multiplyScalar(0.08),
        });
      }

      const sphereMesh = new THREE.Mesh(geom, mat);
      objGroup.add(sphereMesh);

      // Add Rings if Saturn
      if (obj.hasRings && obj.ringInnerRadius && obj.ringOuterRadius) {
        const ringGeom = new THREE.RingGeometry(obj.ringInnerRadius, obj.ringOuterRadius, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(obj.ringColor || 0xd97706),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2.3;
        objGroup.add(ringMesh);
      }

      // Add Habitable Zone Shell for Exoplanet Host Stars
      if (obj.type === 'Star' && subMode === 'exoplanets') {
        const hzInner = 0.8 * 25;
        const hzOuter = 1.6 * 25;
        const hzGeom = new THREE.RingGeometry(hzInner, hzOuter, 64);
        const hzMat = new THREE.MeshBasicMaterial({
          color: 0x10b981,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.15,
        });
        const hzMesh = new THREE.Mesh(hzGeom, hzMat);
        hzMesh.rotation.x = Math.PI / 2;
        objGroup.add(hzMesh);
      }

      scene.add(objGroup);
      objectsMapRef.current.set(obj.id, { mesh: objGroup, data: obj });

      // Build 3D Orbit Path Curve if available
      if (obj.orbitPath && obj.orbitPath.length > 0 && showOrbits) {
        const orbitPoints3D: THREE.Vector3[] = obj.orbitPath.map((p) => {
          const tp = SpatialEngine.transformPositionByScale(p, scaleMode);
          return new THREE.Vector3(tp.x, tp.y, tp.z);
        });

        const orbitGeom = new THREE.BufferGeometry().setFromPoints(orbitPoints3D);
        const orbitMat = new THREE.LineBasicMaterial({
          color: obj.id === selectedObjectId ? 0x06b6d4 : 0x334155,
          transparent: true,
          opacity: obj.id === selectedObjectId ? 0.9 : 0.45,
          linewidth: 1.5,
        });
        const orbitLine = new THREE.LineLoop(orbitGeom, orbitMat);
        orbitsGroup.add(orbitLine);
      }
    });
  }, [subMode, scaleMode, simDays, selectedObjectId, showOrbits, createPlanetTexture]);

  // Update Grid and Helper visibility
  useEffect(() => {
    if (gridGroupRef.current) {
      gridGroupRef.current.visible = showGrid;
    }
    if (orbitsGroupRef.current) {
      orbitsGroupRef.current.visible = showOrbits;
    }
  }, [showGrid, showOrbits]);

  // Focus Camera on Selected Object
  useEffect(() => {
    if (!selectedObjectId) {
      cameraTargetRef.current.set(0, 0, 0);
      return;
    }

    const entry = objectsMapRef.current.get(selectedObjectId);
    if (entry) {
      const pos = entry.mesh.position;
      cameraTargetRef.current.set(pos.x, pos.y, pos.z);

      if (cameraMode === 'Focus') {
        cameraSphericalRef.current.radius = Math.max(6, entry.data.displayRadius * 4.5);
      } else if (cameraMode === 'System Overview') {
        cameraSphericalRef.current.radius = 120;
        cameraSphericalRef.current.phi = Math.PI / 4;
      }
    }
  }, [selectedObjectId, cameraMode]);

  // Handle Measurement rendering
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !activeMeasurement) return;

    const entryA = objectsMapRef.current.get(activeMeasurement.sourceObjectId);
    const entryB = objectsMapRef.current.get(activeMeasurement.targetObjectId);

    if (entryA && entryB) {
      const pA = entryA.mesh.position;
      const pB = entryB.mesh.position;

      const lineGeom = new THREE.BufferGeometry().setFromPoints([pA, pB]);
      const lineMat = new THREE.LineDashedMaterial({
        color: 0x06b6d4,
        dashSize: 1,
        gapSize: 0.5,
      });
      const measLine = new THREE.Line(lineGeom, lineMat);
      measLine.computeLineDistances();
      scene.add(measLine);

      return () => {
        scene.remove(measLine);
      };
    }
  }, [activeMeasurement]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950 font-sans" ref={mountRef}>
      {/* HUD Overlay: Top Scale Mode & Warning */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        <Badge
          variant="outline"
          className="bg-slate-900/90 border-slate-700 text-cyan-400 font-mono text-[11px] px-2.5 py-1 backdrop-blur-md shadow-lg"
        >
          <Compass className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
          FRAME: {coordinateFrame}
        </Badge>

        <Badge
          variant="outline"
          className="bg-slate-900/90 border-slate-700 text-indigo-300 font-mono text-[11px] px-2.5 py-1 backdrop-blur-md shadow-lg"
        >
          <Layers2 className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
          SCALE: {scaleMode.toUpperCase()}
        </Badge>

        {scaleMode !== 'Physical' && (
          <Badge
            variant="outline"
            className="bg-amber-950/80 border-amber-600/60 text-amber-300 font-mono text-[11px] px-2.5 py-1 backdrop-blur-md animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" />
            DISTANCES NOT TO SCALE
          </Badge>
        )}
      </div>

      {/* Top Right Quick Controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 pointer-events-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (xrStatus.vrSupported && rendererRef.current) {
                    toast.info('Requesting WebXR immersive-vr session...');
                    const res = await WebXRManager.requestVRSession(rendererRef.current, () => {
                      setIsXrActive(false);
                      setXrStatus(WebXRManager.getCachedStatus());
                      toast.info('WebXR VR session ended.');
                    });
                    if (res.success) {
                      setIsXrActive(true);
                      toast.success('WebXR VR Immersive Session Active!');
                    } else {
                      toast.error(res.error || 'VR session request failed.');
                      setXrModalOpen(true);
                    }
                  } else {
                    setXrModalOpen(true);
                  }
                }}
                className={`h-8 px-2.5 text-xs font-mono backdrop-blur-md ${
                  isXrActive
                    ? 'bg-emerald-600 text-white border-emerald-400 animate-pulse'
                    : xrStatus.vrSupported
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/80'
                    : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Glasses className="w-4 h-4 mr-1.5" />
                {isXrActive ? 'EXIT VR' : xrStatus.vrSupported ? 'ENTER VR' : 'VR UNAVAILABLE'}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 text-slate-200 border-slate-700 text-xs">
              {isXrActive
                ? 'Active WebXR VR session. Click to exit.'
                : xrStatus.vrSupported
                ? 'Launch WebXR Immersive Stereo VR Environment'
                : 'VR Mode Unavailable - Click for hardware & browser diagnostics'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            cameraSphericalRef.current = { radius: 85, theta: Math.PI / 4, phi: Math.PI / 3 };
            cameraTargetRef.current.set(0, 0, 0);
          }}
          className="h-8 px-2.5 bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white text-xs font-mono backdrop-blur-md"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          RESET VIEW
        </Button>
      </div>

      {/* Hover Object Card Tooltip */}
      {hoveredObject && (
        <div className="absolute bottom-16 left-4 z-20 pointer-events-none bg-slate-900/95 border border-cyan-500/50 p-3 rounded-lg backdrop-blur-md shadow-2xl max-w-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredObject.color }} />
              {hoveredObject.name}
            </span>
            <Badge
              variant="outline"
              className={`text-[9px] px-1.5 py-0 font-mono uppercase ${
                hoveredObject.evidenceStatus === 'OBSERVED'
                  ? 'border-emerald-500/50 text-emerald-300'
                  : 'border-blue-500/50 text-blue-300'
              }`}
            >
              {hoveredObject.evidenceStatus}
            </Badge>
          </div>
          <p className="text-slate-400 text-xs line-clamp-2">{hoveredObject.description}</p>
          <div className="mt-2 text-[10px] text-cyan-400/90 font-mono">
            Click to open authoritative inspector
          </div>
        </div>
      )}

      {/* WebXR Modal */}
      {xrModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Glasses className="w-5 h-5 text-indigo-400" />
                WebXR Spatial Laboratory Mode
              </h3>
              <Button size="sm" variant="ghost" onClick={() => setXrModalOpen(false)} className="h-7 w-7 p-0 text-slate-400">
                ✕
              </Button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span>WebXR API:</span>
                  <span className={xrStatus.supported ? 'text-emerald-400' : 'text-amber-400'}>
                    {xrStatus.supported ? 'DETECTED & READY' : 'UNAVAILABLE'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Immersive VR:</span>
                  <span className={xrStatus.vrSupported ? 'text-emerald-400' : 'text-slate-500'}>
                    {xrStatus.vrSupported ? 'SUPPORTED' : 'NOT DETECTED'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Immersive AR:</span>
                  <span className={xrStatus.arSupported ? 'text-emerald-400' : 'text-slate-500'}>
                    {xrStatus.arSupported ? 'SUPPORTED' : 'NOT DETECTED'}
                  </span>
                </div>
              </div>

              {xrStatus.errorMessage && (
                <div className="p-3 bg-slate-950/90 border border-amber-500/30 rounded-lg text-amber-200/90 space-y-1">
                  <span className="font-semibold block text-amber-300">Hardware Status Note:</span>
                  <p className="text-[11px] leading-relaxed">{xrStatus.errorMessage}</p>
                </div>
              )}

              <p className="text-slate-400 text-[11px]">
                ASTRO enforces strict scientific rendering standards. When no physical XR headset (Meta Quest, Apple Vision Pro via WebXR, HTC Vive) is connected, ASTRO provides full 6-DoF desktop spatial controls without faking VR hardware capability.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setXrModalOpen(false)} className="border-slate-700 text-xs">
                Close
              </Button>
              {xrStatus.vrSupported ? (
                <Button
                  size="sm"
                  onClick={async () => {
                    if (rendererRef.current) {
                      setXrModalOpen(false);
                      toast.info('Starting WebXR Immersive VR Session...');
                      const res = await WebXRManager.requestVRSession(rendererRef.current, () => {
                        setIsXrActive(false);
                        setXrStatus(WebXRManager.getCachedStatus());
                        toast.info('WebXR VR session ended.');
                      });
                      if (res.success) {
                        setIsXrActive(true);
                        toast.success('WebXR VR Immersive Session Active!');
                      } else {
                        toast.error(res.error || 'VR session request failed.');
                      }
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono"
                >
                  <Glasses className="w-3.5 h-3.5 mr-1.5" />
                  CONNECT VR HEADSET
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toast.info('No WebXR headset runtime detected. Desktop 3D mode is fully functional.');
                  }}
                  className="bg-slate-800/80 text-slate-400 border border-slate-700 text-xs font-mono hover:bg-slate-800"
                >
                  VR MODE UNAVAILABLE
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
