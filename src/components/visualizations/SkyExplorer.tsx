import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BRIGHT_STARS_CATALOG, CONSTELLATIONS_CATALOG, CELESTIAL_OBJECTS } from '@/services/astronomyData';
import { CoordinateEngine } from '@/services/astronomyEngine';
import type { CoordinateFrame, CelestialObject } from '@/types/astronomy';
import { EvidenceBadge } from '@/components/common/EvidenceBadge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Compass, Eye, MapPin, Search, Layers, RotateCcw } from 'lucide-react';

export const SkyExplorer: React.FC = () => {
  const [frame, setFrame] = useState<CoordinateFrame>('ICRS');
  const [observerLat, setObserverLat] = useState<number>(34.0522); // Griffith Observatory
  const [observerLon, setObserverLon] = useState<number>(-118.2437);
  const [centerRA, setCenterRA] = useState<number>(85); // Orion center
  const [centerDec, setCenterDec] = useState<number>(10);
  const [zoomLevel, setZoomLevel] = useState<number>(1.2);
  const [showConstellations, setShowConstellations] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [selectedStar, setSelectedStar] = useState<any>(BRIGHT_STARS_CATALOG[8]); // Betelgeuse default
  const [searchQuery, setSearchQuery] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute live Local Sidereal Time for current date & observer position
  const lstHours = useMemo(() => {
    return CoordinateEngine.calculateLST(new Date(), observerLon);
  }, [observerLon]);

  // Transform coordinates of selected target in all supported frames
  const transformedCoords = useMemo(() => {
    if (!selectedStar) return null;
    const ra = selectedStar.ra || selectedStar.coordinates?.ra || 0;
    const dec = selectedStar.dec || selectedStar.coordinates?.dec || 0;

    const gal = CoordinateEngine.icrsToGalactic(ra, dec);
    const altAz = CoordinateEngine.icrsToAltAz(ra, dec, observerLat, observerLon, new Date());

    return {
      icrs: { ra, dec },
      galactic: { l: gal.l, b: gal.b },
      altAz: { alt: altAz.alt, az: altAz.az, lst: altAz.lstHours },
    };
  }, [selectedStar, observerLat, observerLon]);

  // Interactive Celestial Sphere Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Deep Space Cosmic background
    ctx.fillStyle = '#05070E';
    ctx.fillRect(0, 0, width, height);

    // Celestial Grid projection
    if (showGrid) {
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
      ctx.lineWidth = 1;

      // RA meridians
      for (let ra = 0; ra < 360; ra += 30) {
        const x = centerX + (ra - centerRA) * 4 * zoomLevel;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.font = '9px ui-monospace, monospace';
        ctx.fillText(`${ra / 15}h`, x + 3, 15);
      }

      // Dec parallels
      for (let dec = -80; dec <= 80; dec += 20) {
        const y = centerY - (dec - centerDec) * 4 * zoomLevel;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.font = '9px ui-monospace, monospace';
        ctx.fillText(`${dec > 0 ? '+' : ''}${dec}°`, 5, y - 3);
      }
    }

    // Constellation lines & labels
    if (showConstellations) {
      CONSTELLATIONS_CATALOG.forEach((c) => {
        const cx = centerX + (c.centerRA - centerRA) * 4 * zoomLevel;
        const cy = centerY - (c.centerDec - centerDec) * 4 * zoomLevel;

        ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.font = '11px ui-monospace, monospace';
        ctx.fillText(c.name.toUpperCase(), cx - 30, cy);
      });
    }

    // Draw Catalog Stars
    BRIGHT_STARS_CATALOG.forEach((star) => {
      let sx: number;
      let sy: number;

      if (frame === 'ICRS' || frame === 'BCRS' || frame === 'HCRS' || frame === 'GCRS') {
        sx = centerX + (star.ra - centerRA) * 4 * zoomLevel;
        sy = centerY - (star.dec - centerDec) * 4 * zoomLevel;
      } else if (frame === 'Galactic') {
        const gal = CoordinateEngine.icrsToGalactic(star.ra, star.dec);
        sx = centerX + (gal.l - 180) * 2.5 * zoomLevel;
        sy = centerY - gal.b * 3 * zoomLevel;
      } else {
        // AltAz Frame
        const altAz = CoordinateEngine.icrsToAltAz(star.ra, star.dec, observerLat, observerLon, new Date());
        sx = centerX + (altAz.az - 180) * 2.2 * zoomLevel;
        sy = centerY - (altAz.alt - 45) * 4 * zoomLevel;
      }

      // Skip if offscreen
      if (sx < -20 || sx > width + 20 || sy < -20 || sy > height + 20) return;

      // Star brightness sizing
      const starRadius = Math.max(1.8, (3.5 - star.mag * 0.8) * Math.min(1.4, zoomLevel));

      // Star Spectral Colors
      let starColor = '#FFFFFF';
      if (star.spectral.startsWith('O') || star.spectral.startsWith('B')) starColor = '#93C5FD';
      else if (star.spectral.startsWith('A')) starColor = '#F8FAFC';
      else if (star.spectral.startsWith('F') || star.spectral.startsWith('G')) starColor = '#FEF08A';
      else if (star.spectral.startsWith('K')) starColor = '#FDBA74';
      else if (star.spectral.startsWith('M')) starColor = '#FCA5A5';

      // Highlight selected
      const isSelected = selectedStar && (selectedStar.name === star.name);
      if (isSelected) {
        ctx.strokeStyle = '#06B6D4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sx, sy, starRadius + 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.beginPath();
        ctx.moveTo(sx - starRadius - 10, sy);
        ctx.lineTo(sx + starRadius + 10, sy);
        ctx.moveTo(sx, sy - starRadius - 10);
        ctx.lineTo(sx, sy + starRadius + 10);
        ctx.stroke();
      }

      // Star Body & Glow
      ctx.fillStyle = starColor;
      ctx.shadowColor = starColor;
      ctx.shadowBlur = star.mag < 1.0 ? 8 : 3;
      ctx.beginPath();
      ctx.arc(sx, sy, starRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Star Label
      if (star.mag < 1.5 || isSelected) {
        ctx.fillStyle = isSelected ? '#06B6D4' : 'rgba(241, 245, 249, 0.75)';
        ctx.font = '10px ui-monospace, monospace';
        ctx.fillText(star.name, sx + starRadius + 5, sy + 3);
      }
    });

    // Draw Deep Space Objects (e.g. M31, M42, Sgr A*)
    CELESTIAL_OBJECTS.forEach((obj) => {
      const ox = centerX + (obj.coordinates.ra - centerRA) * 4 * zoomLevel;
      const oy = centerY - (obj.coordinates.dec - centerDec) * 4 * zoomLevel;

      if (ox < -20 || ox > width + 20 || oy < -20 || oy > height + 20) return;

      ctx.strokeStyle = obj.color || '#EC4899';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(ox, oy, 8 * zoomLevel, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = obj.color || '#EC4899';
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillText(obj.catalogDesignation || obj.name, ox + 12, oy + 3);
    });
  }, [frame, centerRA, centerDec, zoomLevel, showConstellations, showGrid, selectedStar, observerLat, observerLon]);

  // Canvas Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
        canvasRef.current.height = 460;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle canvas click to select star
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Find closest star
    let closest: any = null;
    let minDistance = 25;

    BRIGHT_STARS_CATALOG.forEach((star) => {
      const sx = centerX + (star.ra - centerRA) * 4 * zoomLevel;
      const sy = centerY - (star.dec - centerDec) * 4 * zoomLevel;
      const dist = Math.hypot(mouseX - sx, mouseY - sy);
      if (dist < minDistance) {
        minDistance = dist;
        closest = star;
      }
    });

    if (closest) {
      setSelectedStar(closest);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase().trim();
    const star = BRIGHT_STARS_CATALOG.find(
      (s) => s.name.toLowerCase().includes(q) || s.designation.toLowerCase().includes(q) || s.constellation.toLowerCase().includes(q)
    );
    if (star) {
      setSelectedStar(star);
      setCenterRA(star.ra);
      setCenterDec(star.dec);
      return;
    }
    const dso = CELESTIAL_OBJECTS.find(
      (o) => o.name.toLowerCase().includes(q) || o.catalogDesignation?.toLowerCase().includes(q)
    );
    if (dso) {
      setSelectedStar(dso);
      setCenterRA(dso.coordinates.ra);
      setCenterDec(dso.coordinates.dec);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sky Navigation Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-lg border border-border/70 backdrop-blur-md">
        {/* Frame Selector */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-slate-400">Frame:</span>
          {(['ICRS', 'Galactic', 'AltAz'] as CoordinateFrame[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFrame(f)}
              className={`px-2.5 py-1 rounded text-xs transition-colors border ${
                frame === f
                  ? 'bg-primary border-primary text-white font-bold'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search Star/Object */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search star, constellation (e.g. Vega, Orion)..."
              className="h-8 pl-8 text-xs font-mono w-48 sm:w-64 bg-slate-950 border-slate-800"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs font-mono">
            Locate
          </Button>
        </form>

        {/* Toggles */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <button
            type="button"
            onClick={() => setShowConstellations(!showConstellations)}
            className={`px-2 py-1 rounded border text-[11px] ${
              showConstellations ? 'bg-slate-800 border-primary text-primary-foreground' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            Constellations
          </button>
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2 py-1 rounded border text-[11px] ${
              showGrid ? 'bg-slate-800 border-primary text-primary-foreground' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            Grid
          </button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setCenterRA(85);
              setCenterDec(10);
              setZoomLevel(1.2);
            }}
            className="h-8 gap-1 text-xs text-slate-400"
          >
            <RotateCcw className="w-3 h-3" />
            Reset View
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Canvas Celestial Map */}
        <div className="lg:col-span-2 relative rounded-xl border border-border/80 bg-slate-950/90 overflow-hidden shadow-2xl min-h-[460px]">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-full block cursor-crosshair"
          />

          {/* Bottom Telemetry Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-cyan-400">
                <Compass className="w-3.5 h-3.5" /> Observer: {observerLat.toFixed(2)}° N, {Math.abs(observerLon).toFixed(2)}° W
              </span>
              <span>•</span>
              <span>LST: <strong className="text-slate-200">{lstHours.toFixed(2)}h</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <span>Zoom:</span>
              <Slider
                value={[zoomLevel * 10]}
                onValueChange={([v]) => setZoomLevel(v / 10)}
                min={5}
                max={30}
                step={1}
                className="w-20"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Selected Object & Coordinate Transformation Panel */}
        <div className="rounded-xl border border-border/80 bg-card/90 p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
          <div className="space-y-3 font-mono">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  {selectedStar?.name || 'Celestial Target'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedStar?.designation || selectedStar?.catalogDesignation || 'Astronomical Object'} • {selectedStar?.constellation || 'Deep Sky'}
                </p>
              </div>
              <EvidenceBadge status="OBSERVED" size="sm" />
            </div>

            {/* Multi-Frame Coordinate Transformations */}
            <div className="space-y-2 pt-2 border-t border-border/50 text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                Canonical Coordinate Transformations
              </span>

              {/* ICRS Equatorial */}
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-cyan-300 font-semibold">
                  <span>ICRS / J2000.0</span>
                  <span className="text-[10px] text-slate-500">Equatorial</span>
                </div>
                <div className="flex justify-between text-slate-300 text-[11px]">
                  <span>Right Ascension (α):</span>
                  <strong>{transformedCoords?.icrs.ra.toFixed(4)}° ({(transformedCoords?.icrs.ra ? (transformedCoords.icrs.ra / 15).toFixed(3) : '0')}h)</strong>
                </div>
                <div className="flex justify-between text-slate-300 text-[11px]">
                  <span>Declination (δ):</span>
                  <strong>{transformedCoords?.icrs.dec.toFixed(4)}°</strong>
                </div>
              </div>

              {/* Galactic Frame */}
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-indigo-300 font-semibold">
                  <span>Galactic Frame</span>
                  <span className="text-[10px] text-slate-500">IAU 1958</span>
                </div>
                <div className="flex justify-between text-slate-300 text-[11px]">
                  <span>Galactic Longitude (l):</span>
                  <strong>{transformedCoords?.galactic.l.toFixed(4)}°</strong>
                </div>
                <div className="flex justify-between text-slate-300 text-[11px]">
                  <span>Galactic Latitude (b):</span>
                  <strong>{transformedCoords?.galactic.b.toFixed(4)}°</strong>
                </div>
              </div>

              {/* Topocentric AltAz Frame */}
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-emerald-300 font-semibold">
                  <span>Topocentric AltAz</span>
                  <span className="text-[10px] text-slate-500">Observer Local Horizon</span>
                </div>
                <div className="flex justify-between text-slate-300 text-[11px]">
                  <span>Altitude (Alt):</span>
                  <strong className={transformedCoords?.altAz.alt! > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {transformedCoords?.altAz.alt.toFixed(2)}° ({transformedCoords?.altAz.alt! > 0 ? 'Above Horizon' : 'Below Horizon'})
                  </strong>
                </div>
                <div className="flex justify-between text-slate-300 text-[11px]">
                  <span>Azimuth (Az):</span>
                  <strong>{transformedCoords?.altAz.az.toFixed(2)}°</strong>
                </div>
              </div>
            </div>

            {/* Physical Attributes */}
            {selectedStar?.distLy && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Distance</span>
                  <span className="text-slate-200 font-bold">{selectedStar.distLy} ly</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Spectral Class</span>
                  <span className="text-amber-300 font-bold">{selectedStar.spectral || 'N/A'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-border/40">
            Coordinate engine strictly transforms via IAU spherical matrix algorithms.
          </div>
        </div>
      </div>
    </div>
  );
};
