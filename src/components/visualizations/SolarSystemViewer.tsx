import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SOLAR_SYSTEM_BODIES } from '@/services/astronomyData';
import type { SolarSystemBody } from '@/types/astronomy';
import { EvidenceBadge } from '@/components/common/EvidenceBadge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Info, ArrowLeftRight, Eye, Gauge, Compass } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const SolarSystemViewer: React.FC = () => {
  const [selectedBody, setSelectedBody] = useState<SolarSystemBody>(SOLAR_SYSTEM_BODIES[3]); // Earth default
  const [compareBody, setCompareBody] = useState<SolarSystemBody | null>(SOLAR_SYSTEM_BODIES[4]); // Mars default
  const [isComparing, setIsComparing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(5); // days per frame
  const [scaleMode, setScaleMode] = useState<'logarithmic' | 'proportional'>('logarithmic');
  const [simDays, setSimDays] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation Loop for planetary positions
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

      // Deep space background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 50 * zoom;
      for (let x = (centerX % gridSize); x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = (centerY % gridSize); y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Central Sun
      const sunRadius = Math.max(12, 18 * zoom);
      const sunGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sunRadius * 2);
      sunGrad.addColorStop(0, '#FFFBEB');
      sunGrad.addColorStop(0.3, '#FBBF24');
      sunGrad.addColorStop(0.7, '#D97706');
      sunGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');

      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sunRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(centerX, centerY, sunRadius * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Draw Planets
      const planets = SOLAR_SYSTEM_BODIES.filter((b) => b.type === 'Planet' || b.type === 'Dwarf Planet');

      planets.forEach((planet) => {
        // Calculate orbital radius on canvas
        let rPixels: number;
        if (scaleMode === 'logarithmic') {
          // Logarithmic scale for inner/outer planet visibility
          rPixels = (35 + Math.log10(planet.semiMajorAxisAU * 10 + 1) * 90) * zoom;
        } else {
          // Linear proportional scale
          rPixels = planet.semiMajorAxisAU * 14 * zoom;
        }

        // Draw orbit ring
        ctx.strokeStyle = selectedBody.id === planet.id ? 'rgba(99, 102, 241, 0.6)' : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = selectedBody.id === planet.id ? 1.5 : 1;
        ctx.setLineDash(selectedBody.id === planet.id ? [4, 4] : []);
        ctx.beginPath();
        ctx.arc(centerX, centerY, rPixels, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Calculate planet position angle (based on true orbital period)
        const meanAnomaly = (simDays / planet.orbitalPeriodDays) * Math.PI * 2;
        const planetX = centerX + Math.cos(meanAnomaly) * rPixels;
        const planetY = centerY + Math.sin(meanAnomaly) * rPixels;

        // Draw Planet Body
        const bodyRadius = Math.max(3.5, (planet.radiusEarthRelative * 2.5 + 2) * Math.min(1.5, zoom));

        // Glow if selected
        if (selectedBody.id === planet.id) {
          ctx.strokeStyle = '#6366F1';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(planetX, planetY, bodyRadius + 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = planet.color;
        ctx.beginPath();
        ctx.arc(planetX, planetY, bodyRadius, 0, Math.PI * 2);
        ctx.fill();

        // Planet Label
        ctx.fillStyle = selectedBody.id === planet.id ? '#FFFFFF' : '#94A3B8';
        ctx.font = `${Math.max(10, Math.round(11 * zoom))}px ui-monospace, SFMono-Regular, monospace`;
        ctx.fillText(planet.name, planetX + bodyRadius + 6, planetY + 4);
      });

      if (isPlaying) {
        setSimDays((prev) => prev + simSpeed);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, simSpeed, scaleMode, zoom, selectedBody.id]);

  // Canvas resize handler
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
        canvasRef.current.height = Math.max(480, Math.min(650, window.innerHeight * 0.65));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="space-y-4">
      {/* Visualizer Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-lg border border-border/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-8 gap-1.5 font-mono text-xs border-primary/40 bg-slate-950/60"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSimDays(0)}
            className="h-8 gap-1 text-xs text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Day
          </Button>
          <span className="text-xs font-mono text-slate-400 px-2 py-1 bg-slate-950/80 rounded border border-border/50">
            Day: <strong className="text-primary-foreground">{Math.round(simDays)}</strong> ({((simDays / 365.25)).toFixed(2)} yrs)
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span>Speed:</span>
            <span className="w-12 text-slate-200 font-bold">{simSpeed} d/f</span>
            <Slider
              value={[simSpeed]}
              onValueChange={([v]) => setSimSpeed(v)}
              min={1}
              max={30}
              step={1}
              className="w-24"
            />
          </div>

          <div className="flex items-center gap-2">
            <span>Zoom:</span>
            <Slider
              value={[zoom * 10]}
              onValueChange={([v]) => setZoom(v / 10)}
              min={5}
              max={25}
              step={1}
              className="w-20"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded border border-border/50">
            <button
              type="button"
              onClick={() => setScaleMode('logarithmic')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                scaleMode === 'logarithmic' ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Log Scale
            </button>
            <button
              type="button"
              onClick={() => setScaleMode('proportional')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                scaleMode === 'proportional' ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Linear Scale
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas & Body Selector Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Orbital Canvas */}
        <div className="lg:col-span-2 relative rounded-xl border border-border/80 bg-slate-950/90 overflow-hidden shadow-2xl min-h-[480px]">
          <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

          {/* Planetary selector quick pills at top */}
          <div className="absolute top-3 left-3 right-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {SOLAR_SYSTEM_BODIES.map((body) => (
              <button
                key={body.id}
                type="button"
                onClick={() => setSelectedBody(body)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all shrink-0 border ${
                  selectedBody.id === body.id
                    ? 'bg-primary/30 border-primary text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: body.color }} />
                <span>{body.name}</span>
              </button>
            ))}
          </div>

          {/* Canvas Overlay Info */}
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-primary" /> Keplerian 2-Body Heliocentric
            </span>
            <span>•</span>
            <span className="text-slate-300">Selected: <strong className="text-cyan-400">{selectedBody.name}</strong></span>
          </div>
        </div>

        {/* Right 1 Col: Selected Planet Telemetry Card */}
        <div className="rounded-xl border border-border/80 bg-card/90 p-5 backdrop-blur-md flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
                    {selectedBody.name}
                  </h3>
                  <EvidenceBadge status={selectedBody.evidenceStatus} size="sm" />
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {selectedBody.type} • {selectedBody.orderFromSun === 0 ? 'Solar Center' : `${selectedBody.orderFromSun}th body from Sun`}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsComparing(true)}
                className="gap-1.5 text-xs font-mono border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary-foreground h-8"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Compare
              </Button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedBody.description}
            </p>

            {/* Scientific Telemetry Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs font-mono">
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Semi-Major Axis</span>
                <span className="text-cyan-300 font-bold text-sm">{selectedBody.semiMajorAxisAU} AU</span>
                <span className="text-slate-400 text-[10px] block mt-0.5">{(selectedBody.semiMajorAxisAU * 149.6).toFixed(1)}M km</span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Orbital Period</span>
                <span className="text-indigo-300 font-bold text-sm">{selectedBody.orbitalPeriodDays} d</span>
                <span className="text-slate-400 text-[10px] block mt-0.5">{(selectedBody.orbitalPeriodDays / 365.25).toFixed(2)} yrs</span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Orbital Velocity</span>
                <span className="text-emerald-300 font-bold text-sm">{selectedBody.orbitalVelocityKmS} km/s</span>
                <span className="text-slate-400 text-[10px] block mt-0.5">{(selectedBody.orbitalVelocityKmS * 3600).toLocaleString()} km/h</span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Surface Gravity</span>
                <span className="text-amber-300 font-bold text-sm">{selectedBody.surfaceGravityMs2} m/s²</span>
                <span className="text-slate-400 text-[10px] block mt-0.5">{(selectedBody.surfaceGravityMs2 / 9.807).toFixed(2)} g</span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Mean Temperature</span>
                <span className="text-rose-300 font-bold text-sm">{selectedBody.surfaceTempKelvinMean} K</span>
                <span className="text-slate-400 text-[10px] block mt-0.5">{(selectedBody.surfaceTempKelvinMean - 273.15).toFixed(0)} °C</span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Moons Count</span>
                <span className="text-purple-300 font-bold text-sm">{selectedBody.knownMoonsCount}</span>
                <span className="text-slate-400 text-[10px] block mt-0.5">Confirmed satellites</span>
              </div>
            </div>

            {/* Notable Features */}
            {selectedBody.notableFeatures.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                  Key Planetary Characteristics
                </span>
                <ul className="space-y-1">
                  {selectedBody.notableFeatures.map((feat, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-border/40 flex items-center justify-between">
            <span>NASA / JPL SSD Horizon Dataset</span>
            <EvidenceBadge status="OBSERVED" size="sm" showLabel={false} />
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Dialog */}
      <Dialog open={isComparing} onOpenChange={setIsComparing}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-3xl bg-slate-950/95 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="font-mono text-lg flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-primary" />
              Comparative Planetary Telemetry
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-2">
            {/* Primary Planet */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-lg text-slate-100">{selectedBody.name}</h4>
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedBody.color }} />
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Semi-Major Axis</span>
                  <span className="text-slate-200 font-bold">{selectedBody.semiMajorAxisAU} AU</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Mass (Earth Relative)</span>
                  <span className="text-slate-200 font-bold">{selectedBody.massEarthRelative} M_⊕</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Radius</span>
                  <span className="text-slate-200 font-bold">{selectedBody.radiusKm.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Surface Gravity</span>
                  <span className="text-slate-200 font-bold">{selectedBody.surfaceGravityMs2} m/s²</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Orbital Velocity</span>
                  <span className="text-slate-200 font-bold">{selectedBody.orbitalVelocityKmS} km/s</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Surface Temp (Mean)</span>
                  <span className="text-slate-200 font-bold">{selectedBody.surfaceTempKelvinMean} K</span>
                </div>
              </div>
            </div>

            {/* Compare Planet */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <select
                  value={compareBody?.id || ''}
                  onChange={(e) => {
                    const found = SOLAR_SYSTEM_BODIES.find((b) => b.id === e.target.value);
                    if (found) setCompareBody(found);
                  }}
                  className="bg-slate-950 text-slate-100 border border-slate-700 rounded px-2 py-1 text-sm font-mono font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {SOLAR_SYSTEM_BODIES.filter((b) => b.id !== selectedBody.id).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {compareBody && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: compareBody.color }} />}
              </div>

              {compareBody && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Semi-Major Axis</span>
                    <span className="text-cyan-300 font-bold">{compareBody.semiMajorAxisAU} AU</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Mass (Earth Relative)</span>
                    <span className="text-cyan-300 font-bold">{compareBody.massEarthRelative} M_⊕</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Radius</span>
                    <span className="text-cyan-300 font-bold">{compareBody.radiusKm.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Surface Gravity</span>
                    <span className="text-cyan-300 font-bold">{compareBody.surfaceGravityMs2} m/s²</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Orbital Velocity</span>
                    <span className="text-cyan-300 font-bold">{compareBody.orbitalVelocityKmS} km/s</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Surface Temp (Mean)</span>
                    <span className="text-cyan-300 font-bold">{compareBody.surfaceTempKelvinMean} K</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
