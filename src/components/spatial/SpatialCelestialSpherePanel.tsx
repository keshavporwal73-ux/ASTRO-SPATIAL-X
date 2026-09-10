import React, { useState } from 'react';
import { CoordinateFrame } from '@/types/spatial';
import { SpatialEngine } from '@/services/spatialEngine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Radio, Compass, MapPin, Clock, X, Check } from 'lucide-react';

interface SpatialCelestialSpherePanelProps {
  currentFrame: CoordinateFrame;
  onFrameChange: (frame: CoordinateFrame) => void;
  onClose: () => void;
}

export const SpatialCelestialSpherePanel: React.FC<SpatialCelestialSpherePanelProps> = ({
  currentFrame,
  onFrameChange,
  onClose,
}) => {
  const [observerLat, setObserverLat] = useState(28.5721); // Kennedy Space Center default
  const [observerLon, setObserverLon] = useState(-80.648);
  const [raDeg, setRaDeg] = useState(88.79); // Betelgeuse default
  const [decDeg, setDecDeg] = useState(7.407);

  // Approximate Local Sidereal Time in hours
  const now = new Date();
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const lstHours = (utcHours + observerLon / 15 + 24) % 24;

  const transformed = SpatialEngine.transformCoordinates(
    raDeg,
    decDeg,
    'ICRS',
    currentFrame,
    observerLat,
    observerLon,
    lstHours
  );

  const frames: { id: CoordinateFrame; label: string; desc: string }[] = [
    { id: 'ICRS', label: 'ICRS (J2000)', desc: 'International Celestial Reference System (α, δ) origin at solar barycenter' },
    { id: 'BCRS', label: 'BCRS', desc: 'Barycentric Celestial Reference System with relativistic corrections' },
    { id: 'HCRS', label: 'HCRS', desc: 'Heliocentric Celestial Reference System (Sun-centered)' },
    { id: 'GCRS', label: 'GCRS', desc: 'Geocentric Celestial Reference System (Earth-centered)' },
    { id: 'Galactic', label: 'Galactic (IAU 1958)', desc: 'Galactic longitude (l) and latitude (b) centered on Milky Way core' },
    { id: 'AltAz', label: 'Topocentric AltAz', desc: 'Local observer horizon coordinates (Altitude, Azimuth, Local Sidereal Time)' },
    { id: 'Ecliptic', label: 'Ecliptic (λ, β)', desc: 'Ecliptic plane coordinates aligned with Earth orbit' },
  ];

  return (
    <div className="absolute top-14 left-3 z-30 w-80 md:w-96 max-h-[calc(100vh-140px)] overflow-y-auto bg-slate-900/95 border border-slate-700 rounded-xl p-4 backdrop-blur-lg shadow-2xl space-y-4 font-sans text-slate-200 animate-in slide-in-from-left-4 duration-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-slate-100 text-sm">3D Multi-Frame Celestial Sphere</h3>
        </div>
        <Button size="sm" variant="ghost" onClick={onClose} className="h-7 w-7 p-0 text-slate-400">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Frame Selection */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Coordinate Frame</span>
        <div className="space-y-1">
          {frames.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFrameChange(f.id)}
              className={`w-full text-left p-2 rounded-lg border text-xs transition-all ${
                currentFrame === f.id
                  ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center font-semibold">
                <span>{f.label}</span>
                {currentFrame === f.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{f.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Observer Coordinates for AltAz */}
      {currentFrame === 'AltAz' && (
        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2 text-xs font-mono">
          <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Observer Geographic Parameters
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Latitude (°)</label>
              <Input
                type="number"
                value={observerLat}
                onChange={(e) => setObserverLat(parseFloat(e.target.value) || 0)}
                className="h-7 bg-slate-900 border-slate-700 text-xs text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Longitude (°)</label>
              <Input
                type="number"
                value={observerLon}
                onChange={(e) => setObserverLon(parseFloat(e.target.value) || 0)}
                className="h-7 bg-slate-900 border-slate-700 text-xs text-slate-200 font-mono"
              />
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
            <span>Local Sidereal Time:</span>
            <strong className="text-emerald-400">{lstHours.toFixed(2)}h</strong>
          </div>
        </div>
      )}

      {/* Live Transformed Output */}
      <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2 text-xs font-mono">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block border-b border-slate-800 pb-1">
          Transformed Target Coordinates ({currentFrame})
        </span>
        {Object.entries(transformed.coords).map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <span className="text-slate-400 capitalize">{k}:</span>
            <strong className="text-cyan-300">
              {typeof v === 'number' ? v.toFixed(4) + '°' : v}
            </strong>
          </div>
        ))}
        <div className="flex justify-between text-[10px] text-slate-500 pt-1">
          <span>Status:</span>
          <span className="text-blue-400 font-bold">{transformed.evidence}</span>
        </div>
      </div>
    </div>
  );
};
