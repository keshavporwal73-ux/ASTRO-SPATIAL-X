import React from 'react';
import { CoordinateFrame, SpatialObject3D } from '@/types/spatial';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  X,
  ExternalLink,
  Crosshair,
  Orbit,
  ArrowRightLeft,
  Compass,
  BookmarkPlus,
  Scale,
  Sparkles,
  Database,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

interface SpatialObjectInspectorProps {
  object: SpatialObject3D | null;
  coordinateFrame: CoordinateFrame;
  onClose: () => void;
  onFocus: (object: SpatialObject3D) => void;
  onCompare: (object: SpatialObject3D) => void;
  onStartMeasure: (object: SpatialObject3D) => void;
}

export const SpatialObjectInspector: React.FC<SpatialObjectInspectorProps> = ({
  object,
  coordinateFrame,
  onClose,
  onFocus,
  onCompare,
  onStartMeasure,
}) => {
  if (!object) return null;

  const handleSaveToInvestigation = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('astro_investigations') || '[]');
      const newEntry = {
        id: `inv-${Date.now()}`,
        title: `Astrophysical Examination: ${object.name}`,
        question: `What are the definitive physical properties, orbital dynamics, and observational sources of ${object.name}?`,
        status: 'Ongoing',
        createdAt: new Date().toISOString(),
        establishedKnowledge: [
          `Classification: ${object.type} ${object.subType || ''}`,
          `Catalog Designation: ${object.name}`,
          object.semiMajorAxisAU ? `Semi-major axis: ${object.semiMajorAxisAU} AU` : '',
          object.surfaceTempK ? `Mean temperature: ${object.surfaceTempK} K` : '',
        ].filter(Boolean),
        competingHypotheses: [
          'Standard Solar Nebula formation model',
          'Tidal capture / resonance orbital migration scenario',
        ],
        evidencePoints: [
          {
            id: 'ev-1',
            type: 'Supporting',
            claim: `Physical radius of ${object.radiusKm.toLocaleString()} km verified via high-precision telemetry.`,
            evidenceStatus: object.evidenceStatus,
            source: object.sources?.[0] || { name: 'NASA / JPL Horizons Ephemeris' },
          },
        ],
      };
      saved.unshift(newEntry);
      localStorage.setItem('astro_investigations', JSON.stringify(saved));
      toast.success(`Saved "${object.name}" telemetry to Research Lab Investigation Workspace!`);
    } catch {
      toast.error('Failed to save to investigation workspace');
    }
  };

  const evidenceColorClass = {
    OBSERVED: 'border-emerald-500/60 bg-emerald-950/80 text-emerald-300',
    CALCULATED: 'border-blue-500/60 bg-blue-950/80 text-blue-300',
    SIMULATED: 'border-purple-500/60 bg-purple-950/80 text-purple-300',
    HYPOTHETICAL: 'border-amber-500/60 bg-amber-950/80 text-amber-300',
    UNCERTAIN: 'border-rose-500/60 bg-rose-950/80 text-rose-300',
  }[object.evidenceStatus] || 'border-slate-700 bg-slate-900 text-slate-300';

  return (
    <div className="absolute top-14 right-3 z-30 w-80 md:w-96 max-h-[calc(100vh-140px)] overflow-y-auto bg-slate-900/95 border border-slate-700 rounded-xl p-4 backdrop-blur-lg shadow-2xl space-y-4 font-sans text-slate-200 animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: object.color }} />
            <h3 className="font-bold text-slate-100 text-base leading-tight">{object.name}</h3>
          </div>
          <span className="text-xs text-cyan-400 font-mono block mt-0.5">
            {object.type} {object.subType ? `• ${object.subType}` : ''}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-mono uppercase ${evidenceColorClass}`}>
            {object.evidenceStatus}
          </Badge>
          <Button size="sm" variant="ghost" onClick={onClose} className="h-7 w-7 p-0 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
        {object.description}
      </p>

      {/* Habitability Assessment if Exoplanet */}
      {object.type === 'Exoplanet' && (
        <div className="p-2.5 rounded-lg border bg-slate-950/80 border-slate-800 space-y-1 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Habitability Assessment (Strict Scientific Standard)
          </span>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                object.isPotentiallyHabitableCandidate
                  ? 'border-emerald-500/60 text-emerald-300 bg-emerald-950/40 text-[10px]'
                  : 'border-slate-700 text-slate-400 text-[10px]'
              }
            >
              {object.isPotentiallyHabitableCandidate ? 'Potentially Habitable Candidate' : 'Non-Habitable Zone Candidate'}
            </Badge>
          </div>
          {object.habitabilityNotes && (
            <p className="text-slate-300 text-[11px] mt-1">{object.habitabilityNotes}</p>
          )}
        </div>
      )}

      {/* Astrophysical & Physical Metadata */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
          <Scale className="w-3 h-3 text-cyan-400" />
          Astrophysical Metadata
        </span>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Radius</span>
            <strong className="text-slate-200">
              {object.radiusKm ? `${object.radiusKm.toLocaleString()} km` : 'N/A'}
            </strong>
          </div>

          <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Mass</span>
            <strong className="text-slate-200">
              {object.massKg ? (typeof object.massKg === 'number' ? object.massKg.toExponential(3) : object.massKg) + ' kg' : 'N/A'}
            </strong>
          </div>

          <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Mean Temperature</span>
            <strong className="text-slate-200">
              {object.surfaceTempK ? `${object.surfaceTempK} K (${(object.surfaceTempK - 273.15).toFixed(1)}°C)` : 'N/A'}
            </strong>
          </div>

          <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Distance</span>
            <strong className="text-slate-200">
              {object.distanceLy ? `${object.distanceLy} ly` : object.semiMajorAxisAU ? `${object.semiMajorAxisAU} AU` : 'Origin'}
            </strong>
          </div>
        </div>
      </div>

      {/* Orbital Dynamics Parameters */}
      {object.semiMajorAxisAU !== undefined && (
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Orbit className="w-3 h-3 text-indigo-400" />
            Keplerian Orbital Telemetry
          </span>

          <div className="space-y-1.5 text-xs font-mono bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Semi-Major Axis (a):</span>
              <strong className="text-slate-200">{object.semiMajorAxisAU} AU</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Eccentricity (e):</span>
              <strong className="text-slate-200">{object.eccentricity ?? 0}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Inclination (i):</span>
              <strong className="text-slate-200">{object.inclinationDeg ?? 0}°</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Orbital Period (P):</span>
              <strong className="text-slate-200">
                {object.orbitalPeriodDays ? `${object.orbitalPeriodDays.toFixed(2)} days` : 'N/A'}
              </strong>
            </div>
            {object.rotationPeriodHours && (
              <div className="flex justify-between">
                <span className="text-slate-400">Sidereal Rotation:</span>
                <strong className="text-slate-200">{object.rotationPeriodHours} hours</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Sources & Citations */}
      {object.sources && object.sources.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Database className="w-3 h-3 text-emerald-400" />
            Authoritative Catalog Sources
          </span>
          <div className="space-y-1">
            {object.sources.map((src, i) => (
              <div key={i} className="text-[11px] text-slate-300 bg-slate-950/70 p-2 rounded border border-slate-800 flex justify-between items-center">
                <span>{src.name}</span>
                <span className="text-[9px] text-cyan-400/80 uppercase">{src.sourceType || 'Catalog'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onFocus(object)}
          className="border-indigo-500/50 text-indigo-300 hover:bg-indigo-950/60 text-xs font-mono"
        >
          <Crosshair className="w-3.5 h-3.5 mr-1" />
          FOCUS 3D
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onCompare(object)}
          className="border-slate-700 text-slate-300 hover:text-white text-xs font-mono"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />
          COMPARE
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onStartMeasure(object)}
          className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-950/60 text-xs font-mono"
        >
          <Compass className="w-3.5 h-3.5 mr-1" />
          MEASURE FROM
        </Button>

        <Button
          size="sm"
          onClick={handleSaveToInvestigation}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono"
        >
          <BookmarkPlus className="w-3.5 h-3.5 mr-1" />
          INVESTIGATE
        </Button>
      </div>
    </div>
  );
};
