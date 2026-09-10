import React from 'react';
import { CameraMode, CoordinateFrame, ScaleMode, ViewportSubMode } from '@/types/spatial';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Layers,
  Camera,
  Compass,
  Grid,
  Sparkles,
  Globe,
  Radio,
  Orbit,
  Telescope,
  Atom,
} from 'lucide-react';

interface SpatialTelemetryHUDProps {
  subMode: ViewportSubMode;
  onSubModeChange: (mode: ViewportSubMode) => void;
  scaleMode: ScaleMode;
  onScaleModeChange: (mode: ScaleMode) => void;
  cameraMode: CameraMode;
  onCameraModeChange: (mode: CameraMode) => void;
  coordinateFrame: CoordinateFrame;
  onCoordinateFrameChange: (frame: CoordinateFrame) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  simSpeed: number;
  onSpeedChange: (speed: number) => void;
  simDays: number;
  onResetTime: () => void;
  showOrbits: boolean;
  onToggleOrbits: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  onOpenMeasurement: () => void;
}

export const SpatialTelemetryHUD: React.FC<SpatialTelemetryHUDProps> = ({
  subMode,
  onSubModeChange,
  scaleMode,
  onScaleModeChange,
  cameraMode,
  onCameraModeChange,
  coordinateFrame,
  onCoordinateFrameChange,
  isPlaying,
  onTogglePlay,
  simSpeed,
  onSpeedChange,
  simDays,
  onResetTime,
  showOrbits,
  onToggleOrbits,
  showGrid,
  onToggleGrid,
  showLabels,
  onToggleLabels,
  onOpenMeasurement,
}) => {
  // Format simulation date from base date
  const baseDate = new Date('2026-09-09T00:00:00Z');
  const currentDate = new Date(baseDate.getTime() + simDays * 86400000);
  const formattedDate = currentDate.toISOString().split('T')[0];

  const subModes: { id: ViewportSubMode; label: string; icon: React.ReactNode }[] = [
    { id: 'solar-system', label: 'Solar System 3D', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'deep-space', label: 'Deep Space', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'exoplanets', label: 'Exoplanets', icon: <Telescope className="w-3.5 h-3.5" /> },
    { id: 'celestial-sphere', label: 'Celestial Sphere', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'orbit-lab', label: '3D Orbit Lab', icon: <Orbit className="w-3.5 h-3.5" /> },
  ];

  const cameraModes: CameraMode[] = ['Orbit', 'Fly', 'Follow', 'Focus', 'Observer', 'System Overview'];
  const scaleModes: ScaleMode[] = ['Physical', 'Normalized', 'Logarithmic', 'System Overview'];
  const coordFrames: CoordinateFrame[] = ['ICRS', 'BCRS', 'HCRS', 'GCRS', 'Galactic', 'AltAz', 'Ecliptic'];

  return (
    <div className="absolute inset-x-0 bottom-3 z-30 px-3 pointer-events-none flex flex-col gap-2">
      {/* Top Bar inside HUD: SubMode Tabs */}
      <div className="flex items-center justify-center pointer-events-auto">
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 p-1 rounded-xl backdrop-blur-md shadow-2xl overflow-x-auto max-w-full">
          {subModes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSubModeChange(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                subMode === m.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Bottom HUD Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 bg-slate-900/95 border border-slate-700/80 p-2.5 rounded-xl backdrop-blur-md shadow-2xl pointer-events-auto">
        {/* Left Section: Time Engine Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={onTogglePlay}
            className={`h-8 px-3 font-mono text-xs ${
              isPlaying
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 hover:bg-amber-900'
                : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
            {isPlaying ? 'PAUSE' : 'SIMULATE'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onResetTime}
            className="h-8 px-2.5 bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white text-xs font-mono"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            T0
          </Button>

          {/* Time speed presets */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            {[1, 10, 100, 1000].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => onSpeedChange(spd)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                  simSpeed === spd ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <div className="font-mono text-xs text-slate-300 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800">
            <span className="text-cyan-400 font-semibold mr-1.5">EPOCH:</span>
            {formattedDate} <span className="text-slate-500">({simDays.toFixed(1)}d)</span>
          </div>
        </div>

        {/* Center: Camera & Scale Mode Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Camera Mode */}
          <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <Camera className="w-3.5 h-3.5 text-indigo-400 mr-1" />
            <span className="text-slate-400 text-[10px] uppercase font-bold mr-1">Cam:</span>
            <select
              value={cameraMode}
              onChange={(e) => onCameraModeChange(e.target.value as CameraMode)}
              className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none cursor-pointer"
            >
              {cameraModes.map((cm) => (
                <option key={cm} value={cm} className="bg-slate-900 text-slate-200">
                  {cm}
                </option>
              ))}
            </select>
          </div>

          {/* Scale Mode */}
          <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <Layers className="w-3.5 h-3.5 text-cyan-400 mr-1" />
            <span className="text-slate-400 text-[10px] uppercase font-bold mr-1">Scale:</span>
            <select
              value={scaleMode}
              onChange={(e) => onScaleModeChange(e.target.value as ScaleMode)}
              className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none cursor-pointer"
            >
              {scaleModes.map((sm) => (
                <option key={sm} value={sm} className="bg-slate-900 text-slate-200">
                  {sm}
                </option>
              ))}
            </select>
          </div>

          {/* Coordinate Frame */}
          <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <Compass className="w-3.5 h-3.5 text-emerald-400 mr-1" />
            <span className="text-slate-400 text-[10px] uppercase font-bold mr-1">Frame:</span>
            <select
              value={coordinateFrame}
              onChange={(e) => onCoordinateFrameChange(e.target.value as CoordinateFrame)}
              className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none cursor-pointer"
            >
              {coordFrames.map((cf) => (
                <option key={cf} value={cf} className="bg-slate-900 text-slate-200">
                  {cf}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Section: Visual Toggles & Measurement Action */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleOrbits}
            className={`h-8 px-2.5 text-xs font-mono ${
              showOrbits
                ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}
          >
            <Orbit className="w-3.5 h-3.5 mr-1" />
            ORBITS
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onToggleGrid}
            className={`h-8 px-2.5 text-xs font-mono ${
              showGrid
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}
          >
            <Grid className="w-3.5 h-3.5 mr-1" />
            GRID
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onOpenMeasurement}
            className="h-8 px-3 bg-gradient-to-r from-cyan-600/30 to-indigo-600/30 border-cyan-500/50 text-cyan-300 hover:text-white text-xs font-mono"
          >
            <Atom className="w-3.5 h-3.5 mr-1 text-cyan-400" />
            MEASURE
          </Button>
        </div>
      </div>
    </div>
  );
};
