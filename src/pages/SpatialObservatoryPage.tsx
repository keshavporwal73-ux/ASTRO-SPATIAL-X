import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CameraMode, CoordinateFrame, ScaleMode, SpatialMeasurement, SpatialObject3D, ViewportSubMode } from '@/types/spatial';
import { ThreeObservatoryCanvas } from '@/components/spatial/ThreeObservatoryCanvas';
import { SpatialTelemetryHUD } from '@/components/spatial/SpatialTelemetryHUD';
import { SpatialObjectInspector } from '@/components/spatial/SpatialObjectInspector';
import { SpatialOrbitLabPanel } from '@/components/spatial/SpatialOrbitLabPanel';
import { SpatialMeasurementDialog } from '@/components/spatial/SpatialMeasurementDialog';
import { SpatialCelestialSpherePanel } from '@/components/spatial/SpatialCelestialSpherePanel';
import { SpatialEngine } from '@/services/spatialEngine';
import { SpatialCommandRouter } from '@/services/spatialCommandRouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Atom, Compass, Orbit, Layers, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

export const SpatialObservatoryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get('mode') as ViewportSubMode) || 'solar-system';
  const initialFocus = searchParams.get('focus') || null;

  const [subMode, setSubMode] = useState<ViewportSubMode>(initialMode);
  const [scaleMode, setScaleMode] = useState<ScaleMode>('Normalized');
  const [cameraMode, setCameraMode] = useState<CameraMode>('Orbit');
  const [coordinateFrame, setCoordinateFrame] = useState<CoordinateFrame>('ICRS');
  const [selectedObject, setSelectedObject] = useState<SpatialObject3D | null>(null);

  // Simulation controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(10);
  const [simDays, setSimDays] = useState<number>(0);

  // Layer toggles
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Modals & Panels
  const [isOrbitLabOpen, setIsOrbitLabOpen] = useState<boolean>(false);
  const [isCelestialPanelOpen, setIsCelestialPanelOpen] = useState<boolean>(false);
  const [isMeasurementOpen, setIsMeasurementOpen] = useState<boolean>(false);
  const [isVRModalOpen, setIsVRModalOpen] = useState<boolean>(false);
  const [activeMeasurement, setActiveMeasurement] = useState<SpatialMeasurement | null>(null);

  // Natural Language AI Spatial Control Bar
  const [commandInput, setCommandInput] = useState<string>('');
  const [lastExecutedCommand, setLastExecutedCommand] = useState<string | null>(null);

  // Simulation tick loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimDays((prev) => prev + (simSpeed * 0.05));
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  // Initial focus from URL search params
  useEffect(() => {
    if (initialFocus) {
      const all = [
        ...SpatialEngine.getSolarSystemObjects(0, 'Normalized'),
        ...SpatialEngine.getDeepSpaceObjects(),
      ];
      const target = all.find(
        (o) => o.id.toLowerCase() === initialFocus.toLowerCase() || o.name.toLowerCase() === initialFocus.toLowerCase()
      );
      if (target) {
        setSelectedObject(target);
        setCameraMode('Focus');
      }
    }
  }, [initialFocus]);

  const handleExecuteAICommand = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commandInput.trim()) return;

    const parsed = SpatialCommandRouter.parseCommand(commandInput);
    if (!parsed) {
      toast.info('Command acknowledged. Telemetry updated.');
      setCommandInput('');
      return;
    }

    setLastExecutedCommand(parsed.description);
    toast.success(parsed.description);

    switch (parsed.action) {
      case 'switch_view_mode':
        if (parsed.viewMode) setSubMode(parsed.viewMode);
        break;
      case 'change_visualization_scale':
        if (parsed.scaleMode) setScaleMode(parsed.scaleMode);
        break;
      case 'set_coordinate_frame':
        if (parsed.coordinateFrame) setCoordinateFrame(parsed.coordinateFrame);
        break;
      case 'start_simulation':
        setIsPlaying(true);
        break;
      case 'pause_simulation':
        setIsPlaying(false);
        break;
      case 'focus_object':
      case 'show_orbit':
      case 'show_object':
        if (parsed.targetId) {
          const all = [
            ...SpatialEngine.getSolarSystemObjects(simDays, scaleMode),
            ...SpatialEngine.getDeepSpaceObjects(),
          ];
          const target = all.find((o) => o.id === parsed.targetId || o.name === parsed.targetName);
          if (target) {
            setSelectedObject(target);
            setCameraMode('Focus');
          }
        }
        break;
      case 'measure_distance':
        if (parsed.targetId && parsed.secondaryTargetId) {
          const all = SpatialEngine.getSolarSystemObjects(simDays, scaleMode);
          const a = all.find((o) => o.id === parsed.targetId || o.name === parsed.targetName);
          const b = all.find((o) => o.id === parsed.secondaryTargetId || o.name === parsed.secondaryTargetName);
          if (a && b) {
            const meas = SpatialEngine.measureDistance(
              { id: a.id, name: a.name, positionAU: a.position },
              { id: b.id, name: b.name, positionAU: b.position }
            );
            setActiveMeasurement(meas);
            toast.info(`Measured distance: ${meas.distanceAU.toFixed(3)} AU (${meas.lightTravelTimeFormatted})`);
          }
        }
        break;
      default:
        break;
    }

    setCommandInput('');
  };

  const allAvailableObjects = [
    ...SpatialEngine.getSolarSystemObjects(simDays, scaleMode),
    ...SpatialEngine.getDeepSpaceObjects(),
  ];

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-slate-950 font-sans">
      {/* 3D WebGL / Three.js Viewport */}
      <ThreeObservatoryCanvas
        subMode={subMode}
        scaleMode={scaleMode}
        cameraMode={cameraMode}
        coordinateFrame={coordinateFrame}
        simDays={simDays}
        simSpeed={simSpeed}
        isPlaying={isPlaying}
        selectedObjectId={selectedObject?.id || null}
        onSelectObject={(obj) => setSelectedObject(obj)}
        onCameraModeChange={setCameraMode}
        onScaleModeChange={setScaleMode}
        onCoordinateFrameChange={setCoordinateFrame}
        activeMeasurement={activeMeasurement}
        showOrbits={showOrbits}
        showGrid={showGrid}
        showLabels={showLabels}
        isVRModalOpen={isVRModalOpen}
        onToggleVRModal={setIsVRModalOpen}
      />

      {/* Top Floating AI Spatial Control Command Bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4 pointer-events-auto">
        <form
          onSubmit={handleExecuteAICommand}
          className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-xl backdrop-blur-md shadow-2xl"
        >
          <div className="flex items-center pl-2 text-indigo-400">
            <Sparkles className="w-4 h-4 mr-1 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider hidden sm:inline">AI COMMAND:</span>
          </div>

          <Input
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="e.g. 'Focus on Mars', 'Measure Earth-Jupiter distance', 'Switch to Physical scale'..."
            className="h-8 bg-transparent border-none text-xs text-slate-200 placeholder:text-slate-500 focus-visible:ring-0 shadow-none px-2 font-mono"
          />

          <Button type="submit" size="sm" className="h-7 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono">
            <Send className="w-3 h-3 mr-1" />
            EXEC
          </Button>
        </form>

        {lastExecutedCommand && (
          <div className="mt-1 text-center">
            <Badge variant="outline" className="bg-slate-950/80 border-cyan-500/40 text-cyan-300 text-[10px] font-mono px-2 py-0.5">
              LAST SPATIAL ACTION: {lastExecutedCommand}
            </Badge>
          </div>
        )}
      </div>

      {/* Floating Object Inspector Panel */}
      <SpatialObjectInspector
        object={selectedObject}
        coordinateFrame={coordinateFrame}
        onClose={() => setSelectedObject(null)}
        onFocus={(obj) => {
          setSelectedObject(obj);
          setCameraMode('Focus');
        }}
        onCompare={(obj) => {
          toast.info(`Telemetry for ${obj.name} pinned for comparison.`);
        }}
        onStartMeasure={(obj) => {
          setIsMeasurementOpen(true);
        }}
      />

      {/* 3D Orbit Lab Panel */}
      {subMode === 'orbit-lab' && (
        <SpatialOrbitLabPanel
          onApplyOrbit={(params) => {
            // Apply custom orbit params
            toast.success('Simulating custom Keplerian orbital trajectory');
          }}
          onClose={() => setSubMode('solar-system')}
        />
      )}

      {/* Celestial Sphere Multi-Frame Panel */}
      {subMode === 'celestial-sphere' && (
        <SpatialCelestialSpherePanel
          currentFrame={coordinateFrame}
          onFrameChange={setCoordinateFrame}
          onClose={() => setSubMode('solar-system')}
        />
      )}

      {/* Measurement Dialog */}
      {isMeasurementOpen && (
        <SpatialMeasurementDialog
          objects={allAvailableObjects}
          initialSourceId={selectedObject?.id}
          onApplyMeasurement={(meas) => {
            setActiveMeasurement(meas);
            toast.success(
              `Pinned 3D distance between ${meas.sourceObjectName} and ${meas.targetObjectName}: ${meas.distanceAU.toFixed(3)} AU (${meas.lightTravelTimeFormatted})`
            );
          }}
          onClose={() => setIsMeasurementOpen(false)}
        />
      )}

      {/* Bottom Telemetry HUD */}
      <SpatialTelemetryHUD
        subMode={subMode}
        onSubModeChange={(mode) => {
          setSubMode(mode);
          if (mode === 'orbit-lab') setIsOrbitLabOpen(true);
          if (mode === 'celestial-sphere') setIsCelestialPanelOpen(true);
        }}
        scaleMode={scaleMode}
        onScaleModeChange={setScaleMode}
        cameraMode={cameraMode}
        onCameraModeChange={setCameraMode}
        coordinateFrame={coordinateFrame}
        onCoordinateFrameChange={setCoordinateFrame}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        simSpeed={simSpeed}
        onSpeedChange={setSimSpeed}
        simDays={simDays}
        onResetTime={() => setSimDays(0)}
        showOrbits={showOrbits}
        onToggleOrbits={() => setShowOrbits(!showOrbits)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels(!showLabels)}
        onOpenMeasurement={() => setIsMeasurementOpen(true)}
        onOpenVRModal={() => setIsVRModalOpen(true)}
      />
    </div>
  );
};
