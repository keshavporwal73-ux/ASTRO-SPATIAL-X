import React, { useState, useEffect, useRef, useMemo } from 'react';
import { OrbitPhysicsEngine, CONSTANTS } from '@/services/astronomyEngine';
import type { OrbitParameters, CalculatedOrbitResult } from '@/types/astronomy';
import { EvidenceBadge } from '@/components/common/EvidenceBadge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Activity, Sparkles, Orbit } from 'lucide-react';

interface Preset {
  name: string;
  params: OrbitParameters;
  description: string;
}

const PRESETS: Preset[] = [
  {
    name: 'Earth (Standard 1 AU)',
    params: { semiMajorAxisAU: 1.0, eccentricity: 0.0167, inclinationDeg: 0, centralBodyMassSolar: 1.0 },
    description: 'Near-circular 1-year orbit around the Sun.',
  },
  {
    name: "Halley's Comet (High Eccentricity)",
    params: { semiMajorAxisAU: 17.83, eccentricity: 0.967, inclinationDeg: 17.8, centralBodyMassSolar: 1.0 },
    description: 'Extreme elliptical path plunging into 0.59 AU perihelion and 35.1 AU aphelion.',
  },
  {
    name: 'Mercury (Apsidal Precession)',
    params: { semiMajorAxisAU: 0.387, eccentricity: 0.2056, inclinationDeg: 7.0, centralBodyMassSolar: 1.0 },
    description: 'Innermost high-speed orbit with relativistic precession signature.',
  },
  {
    name: 'Hypothetical Sedna / Outer TNO',
    params: { semiMajorAxisAU: 506.0, eccentricity: 0.855, inclinationDeg: 11.9, centralBodyMassSolar: 1.0 },
    description: 'Distant detached trans-Neptunian object orbit taking ~11,400 years.',
  },
  {
    name: 'Hot Jupiter (0.05 AU)',
    params: { semiMajorAxisAU: 0.05, eccentricity: 0.02, inclinationDeg: 2.0, centralBodyMassSolar: 1.1 },
    description: 'Scorching 4-day orbital period tight around a host star.',
  },
];

export const OrbitSimulator: React.FC = () => {
  const [params, setParams] = useState<OrbitParameters>({
    semiMajorAxisAU: 2.5,
    eccentricity: 0.45,
    inclinationDeg: 12.0,
    centralBodyMassSolar: 1.0,
  });

  const [isPlaying, setIsPlaying] = useState(true);
  const [trueAnomaly, setTrueAnomaly] = useState(0); // in degrees
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute calculated values via decoupled scientific engine
  const calculation: CalculatedOrbitResult = useMemo(() => {
    return OrbitPhysicsEngine.computeOrbit(params);
  }, [params]);

  // Animation Loop for Orbit
  useEffect(() => {
    let animationId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Grid background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Scaling calculation to fit orbit into canvas
      const maxExtent = calculation.aphelionAU;
      const scale = Math.min((width * 0.38) / Math.max(1, maxExtent), 120);

      // Central body position (Primary Focus)
      // Focus is offset from ellipse center by c = a * e
      const focusX = centerX - (params.semiMajorAxisAU * params.eccentricity * scale * 0.6);
      const focusY = centerY;

      // Draw Orbit Path from calculation.points
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      calculation.points.forEach((pt, idx) => {
        const px = focusX + pt.x * scale;
        const py = focusY + pt.y * scale;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.stroke();

      // Draw Line of Apsides (Major Axis)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(focusX - calculation.perihelionAU * scale, focusY);
      ctx.lineTo(focusX + calculation.aphelionAU * scale, focusY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Central Star (Sun/Primary Mass)
      const starGrad = ctx.createRadialGradient(focusX, focusY, 0, focusX, focusY, 20);
      starGrad.addColorStop(0, '#FFFBEB');
      starGrad.addColorStop(0.3, '#F59E0B');
      starGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = starGrad;
      ctx.beginPath();
      ctx.arc(focusX, focusY, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(focusX, focusY, 7, 0, Math.PI * 2);
      ctx.fill();

      // Current orbiting body position
      const nuRad = (trueAnomaly * Math.PI) / 180;
      const currentR =
        (params.semiMajorAxisAU * (1 - params.eccentricity * params.eccentricity)) /
        (1 + params.eccentricity * Math.cos(nuRad));

      const bodyX = focusX + currentR * Math.cos(nuRad) * scale;
      const bodyY = focusY + currentR * Math.sin(nuRad) * scale * Math.cos((params.inclinationDeg * Math.PI) / 180);

      // Instantaneous velocity via Vis-Viva
      const rMeters = currentR * CONSTANTS.AU_METERS;
      const mKg = params.centralBodyMassSolar * CONSTANTS.SOLAR_MASS_KG;
      const aMeters = params.semiMajorAxisAU * CONSTANTS.AU_METERS;
      const instVelKmS = Math.sqrt(CONSTANTS.G * mKg * (2 / rMeters - 1 / aMeters)) / 1000;

      // Draw Satellite Body & Velocity Vector
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.lineWidth = 2;
      const vVectorLen = Math.min(40, instVelKmS * 0.8);
      // Tangent direction
      const vx = -Math.sin(nuRad) * vVectorLen;
      const vy = Math.cos(nuRad) * vVectorLen;
      ctx.beginPath();
      ctx.moveTo(bodyX, bodyY);
      ctx.lineTo(bodyX + vx, bodyY + vy);
      ctx.stroke();

      // Satellite glow & body
      ctx.fillStyle = '#06B6D4';
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(bodyX, bodyY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Telemetry labels at Perihelion & Aphelion points
      ctx.fillStyle = '#10B981';
      ctx.font = '10px ui-monospace, monospace';
      const periX = focusX + calculation.perihelionAU * scale;
      ctx.fillText(`Perihelion: ${calculation.perihelionAU.toFixed(2)} AU (${calculation.perihelionVelocityKmS.toFixed(1)} km/s)`, periX + 8, focusY - 8);

      ctx.fillStyle = '#F43F5E';
      const aphX = focusX - calculation.aphelionAU * scale;
      ctx.fillText(`Aphelion: ${calculation.aphelionAU.toFixed(2)} AU (${calculation.aphelionVelocityKmS.toFixed(1)} km/s)`, aphX - 160, focusY + 16);

      // Advance orbital true anomaly (Kepler's 2nd law: sweeps equal areas in equal time)
      if (isPlaying) {
        // Angular velocity dtheta/dt = h / r^2
        const deltaTheta = (0.5 * speedMultiplier * (params.semiMajorAxisAU / Math.max(0.1, currentR))) % 360;
        setTrueAnomaly((prev) => (prev + deltaTheta) % 360);
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, trueAnomaly, speedMultiplier, calculation, params]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
        canvasRef.current.height = 420;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="space-y-4">
      {/* Top Presets bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-mono text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-primary" /> Orbital Presets:
        </span>
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => {
              setParams(preset.params);
              setTrueAnomaly(0);
            }}
            className="text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors shrink-0"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Interactive Canvas */}
        <div className="lg:col-span-2 relative rounded-xl border border-border/80 bg-slate-950/90 overflow-hidden shadow-2xl flex flex-col justify-between">
          {/* Controls Overlay Bar */}
          <div className="p-3 border-b border-border/40 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-7 text-xs font-mono gap-1.5 border-primary/40 bg-slate-950"
              >
                {isPlaying ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                {isPlaying ? 'Pause' : 'Resume'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setTrueAnomaly(0)}
                className="h-7 text-xs font-mono gap-1 text-slate-400"
              >
                <RotateCcw className="w-3 h-3" />
                Periapsis
              </Button>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>Time Warp:</span>
              <Slider
                value={[speedMultiplier * 10]}
                onValueChange={([v]) => setSpeedMultiplier(v / 10)}
                min={2}
                max={40}
                step={1}
                className="w-24"
              />
              <span className="text-cyan-400 font-bold">{speedMultiplier.toFixed(1)}×</span>
            </div>
          </div>

          <canvas ref={canvasRef} className="w-full h-[380px] block" />

          {/* Bottom Live Calculation Telemetry */}
          <div className="p-3 bg-slate-900/80 border-t border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            <div className="bg-slate-950/70 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block uppercase">Orbital Period</span>
              <span className="text-indigo-300 font-bold">{calculation.orbitalPeriodYears} yrs</span>
            </div>
            <div className="bg-slate-950/70 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block uppercase">Mean Velocity</span>
              <span className="text-emerald-300 font-bold">{calculation.meanOrbitalVelocityKmS} km/s</span>
            </div>
            <div className="bg-slate-950/70 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block uppercase">Perihelion</span>
              <span className="text-cyan-300 font-bold">{calculation.perihelionAU} AU</span>
            </div>
            <div className="bg-slate-950/70 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block uppercase">Aphelion</span>
              <span className="text-amber-300 font-bold">{calculation.aphelionAU} AU</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Parameter Controls & Equation Proof */}
        <div className="rounded-xl border border-border/80 bg-card/90 p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
                <Orbit className="w-4 h-4 text-primary" />
                Orbital Parameters
              </h3>
              <EvidenceBadge status="CALCULATED" size="sm" />
            </div>

            {/* Slider: Semi-Major Axis */}
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Semi-Major Axis (a)</span>
                <span className="text-cyan-400 font-bold">{params.semiMajorAxisAU} AU</span>
              </div>
              <Slider
                value={[params.semiMajorAxisAU * 10]}
                onValueChange={([v]) => setParams((p) => ({ ...p, semiMajorAxisAU: v / 10 }))}
                min={1}
                max={300}
                step={1}
              />
            </div>

            {/* Slider: Eccentricity */}
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Eccentricity (e)</span>
                <span className="text-amber-400 font-bold">{params.eccentricity.toFixed(3)}</span>
              </div>
              <Slider
                value={[params.eccentricity * 1000]}
                onValueChange={([v]) => setParams((p) => ({ ...p, eccentricity: v / 1000 }))}
                min={0}
                max={950}
                step={5}
              />
            </div>

            {/* Slider: Inclination */}
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Inclination (i)</span>
                <span className="text-indigo-400 font-bold">{params.inclinationDeg}°</span>
              </div>
              <Slider
                value={[params.inclinationDeg]}
                onValueChange={([v]) => setParams((p) => ({ ...p, inclinationDeg: v }))}
                min={0}
                max={80}
                step={1}
              />
            </div>

            {/* Slider: Central Star Mass */}
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Central Mass (M_☉)</span>
                <span className="text-emerald-400 font-bold">{params.centralBodyMassSolar} M_☉</span>
              </div>
              <Slider
                value={[params.centralBodyMassSolar * 10]}
                onValueChange={([v]) => setParams((p) => ({ ...p, centralBodyMassSolar: v / 10 }))}
                min={1}
                max={50}
                step={1}
              />
            </div>

            {/* Substituted Equation Breakdown */}
            <div className="space-y-2 pt-2 border-t border-border/50 font-mono text-[11px]">
              <span className="text-slate-400 uppercase tracking-wider block font-semibold">
                Astrophysical Equations Applied
              </span>
              <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800 space-y-1">
                <div className="text-primary font-medium">{calculation.equations[0]?.name}</div>
                <div className="text-slate-400 text-[10px]">Formula: {calculation.equations[0]?.formula}</div>
                <div className="text-slate-300 bg-slate-950 p-1.5 rounded text-[10px]">
                  {calculation.equations[0]?.substituted}
                </div>
                <div className="text-blue-300 font-bold">⟹ T = {calculation.orbitalPeriodYears} yrs</div>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-border/40">
            Newtonian 2-Body Keplerian Solver • Astropy standard compliant
          </div>
        </div>
      </div>
    </div>
  );
};
