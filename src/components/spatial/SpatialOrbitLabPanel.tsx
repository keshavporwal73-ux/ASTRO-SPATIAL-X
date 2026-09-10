import React, { useState } from 'react';
import { SpatialEngine } from '@/services/spatialEngine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Orbit, Play, Pause, RotateCcw, ArrowUpRight, Activity, Save } from 'lucide-react';
import { toast } from 'sonner';

interface SpatialOrbitLabPanelProps {
  onApplyOrbit: (params: { semiMajorAxisAU: number; eccentricity: number; inclinationDeg: number; centralMassSolar: number }) => void;
  onClose: () => void;
}

export const SpatialOrbitLabPanel: React.FC<SpatialOrbitLabPanelProps> = ({ onApplyOrbit, onClose }) => {
  const [semiMajorAxisAU, setSemiMajorAxisAU] = useState(1.524); // Mars default
  const [eccentricity, setEccentricity] = useState(0.0934);
  const [inclinationDeg, setInclinationDeg] = useState(1.85);
  const [centralMassSolar, setCentralMassSolar] = useState(1.0);
  const [simTimeStepHours, setSimTimeStepHours] = useState(24);

  // Derived calculations
  const orbitalPeriodYears = Math.sqrt(Math.pow(semiMajorAxisAU, 3) / centralMassSolar);
  const orbitalPeriodDays = orbitalPeriodYears * 365.256;
  const periapsisAU = semiMajorAxisAU * (1 - eccentricity);
  const apoapsisAU = semiMajorAxisAU * (1 + eccentricity);
  const meanVelocityKmS = (29.78 / Math.sqrt(semiMajorAxisAU)) * Math.sqrt(centralMassSolar);
  const periapsisVelocityKmS = meanVelocityKmS * Math.sqrt((1 + eccentricity) / (1 - eccentricity));
  const apoapsisVelocityKmS = meanVelocityKmS * Math.sqrt((1 - eccentricity) / (1 + eccentricity));

  const handleApply = () => {
    onApplyOrbit({
      semiMajorAxisAU,
      eccentricity,
      inclinationDeg,
      centralMassSolar,
    });
    toast.success('Orbit trajectory recalculated and rendered in 3D viewport');
  };

  const handleSaveToLab = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('astro_investigations') || '[]');
      const newEntry = {
        id: `inv-orbit-${Date.now()}`,
        title: `3D Orbital Dynamics Simulation: a=${semiMajorAxisAU} AU, e=${eccentricity}`,
        question: `How does an eccentricity of ${eccentricity} and semi-major axis of ${semiMajorAxisAU} AU govern orbital stability and velocity extremes?`,
        status: 'Ongoing',
        createdAt: new Date().toISOString(),
        establishedKnowledge: [
          `Central Body Mass: ${centralMassSolar} M☉`,
          `Orbital Period: ${orbitalPeriodDays.toFixed(2)} days (${orbitalPeriodYears.toFixed(3)} yrs)`,
          `Periapsis Distance: ${periapsisAU.toFixed(4)} AU`,
          `Apoapsis Distance: ${apoapsisAU.toFixed(4)} AU`,
        ],
        competingHypotheses: [
          'Stable Keplerian closed ellipse',
          'Perturbed resonant trajectory',
        ],
        evidencePoints: [
          {
            id: 'ev-orbit-1',
            type: 'Supporting',
            claim: `Periapsis velocity reaches ${periapsisVelocityKmS.toFixed(2)} km/s and apoapsis velocity drops to ${apoapsisVelocityKmS.toFixed(2)} km/s in accordance with the Vis-Viva equation.`,
            evidenceStatus: 'CALCULATED',
            source: { name: 'Keplerian Two-Body Mechanics Engine', sourceType: 'Deterministic Algorithm' },
          },
        ],
      };
      saved.unshift(newEntry);
      localStorage.setItem('astro_investigations', JSON.stringify(saved));
      toast.success('Saved orbital simulation run to Research Lab Workspace!');
    } catch {
      toast.error('Failed to save to research workspace');
    }
  };

  return (
    <div className="absolute top-14 left-3 z-30 w-80 md:w-96 max-h-[calc(100vh-140px)] overflow-y-auto bg-slate-900/95 border border-slate-700 rounded-xl p-4 backdrop-blur-lg shadow-2xl space-y-4 font-sans text-slate-200 animate-in slide-in-from-left-4 duration-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Orbit className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-slate-100 text-sm">3D Orbit Lab Simulator</h3>
        </div>
        <Badge variant="outline" className="border-blue-500/60 bg-blue-950/80 text-blue-300 font-mono text-[10px]">
          CALCULATED
        </Badge>
      </div>

      {/* Preset Buttons */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Presets</span>
        <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setSemiMajorAxisAU(1.0);
              setEccentricity(0.0167);
              setInclinationDeg(0.0);
              setCentralMassSolar(1.0);
            }}
            className="p-1.5 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700 text-center"
          >
            Earth (1.0 AU)
          </button>
          <button
            type="button"
            onClick={() => {
              setSemiMajorAxisAU(1.524);
              setEccentricity(0.0934);
              setInclinationDeg(1.85);
              setCentralMassSolar(1.0);
            }}
            className="p-1.5 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700 text-center"
          >
            Mars (1.52 AU)
          </button>
          <button
            type="button"
            onClick={() => {
              setSemiMajorAxisAU(17.83);
              setEccentricity(0.967);
              setInclinationDeg(17.8);
              setCentralMassSolar(1.0);
            }}
            className="p-1.5 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700 text-center"
          >
            Halley Comet
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-3 text-xs">
        <div>
          <div className="flex justify-between mb-1 font-mono">
            <span className="text-slate-400">Semi-Major Axis (a):</span>
            <strong className="text-cyan-300">{semiMajorAxisAU.toFixed(3)} AU</strong>
          </div>
          <Slider
            min={0.1}
            max={35.0}
            step={0.05}
            value={[semiMajorAxisAU]}
            onValueChange={([v]) => setSemiMajorAxisAU(v)}
          />
        </div>

        <div>
          <div className="flex justify-between mb-1 font-mono">
            <span className="text-slate-400">Eccentricity (e):</span>
            <strong className="text-indigo-300">{eccentricity.toFixed(4)}</strong>
          </div>
          <Slider
            min={0.0}
            max={0.98}
            step={0.005}
            value={[eccentricity]}
            onValueChange={([v]) => setEccentricity(v)}
          />
        </div>

        <div>
          <div className="flex justify-between mb-1 font-mono">
            <span className="text-slate-400">Inclination (i):</span>
            <strong className="text-emerald-300">{inclinationDeg.toFixed(1)}°</strong>
          </div>
          <Slider
            min={0}
            max={90}
            step={0.5}
            value={[inclinationDeg]}
            onValueChange={([v]) => setInclinationDeg(v)}
          />
        </div>

        <div>
          <div className="flex justify-between mb-1 font-mono">
            <span className="text-slate-400">Central Star Mass (M):</span>
            <strong className="text-amber-300">{centralMassSolar.toFixed(2)} M☉</strong>
          </div>
          <Slider
            min={0.1}
            max={5.0}
            step={0.1}
            value={[centralMassSolar]}
            onValueChange={([v]) => setCentralMassSolar(v)}
          />
        </div>
      </div>

      {/* Computed Telemetry Readout */}
      <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block border-b border-slate-800 pb-1 mb-1.5">
          Calculated Orbital Telemetry
        </span>
        <div className="flex justify-between">
          <span className="text-slate-400">Period (P):</span>
          <strong className="text-slate-200">
            {orbitalPeriodDays.toFixed(1)} days ({orbitalPeriodYears.toFixed(3)} yrs)
          </strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Periapsis (r_p):</span>
          <strong className="text-emerald-400">{periapsisAU.toFixed(4)} AU</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Apoapsis (r_a):</span>
          <strong className="text-rose-400">{apoapsisAU.toFixed(4)} AU</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Periapsis Velocity (v_max):</span>
          <strong className="text-cyan-400">{periapsisVelocityKmS.toFixed(2)} km/s</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Apoapsis Velocity (v_min):</span>
          <strong className="text-slate-300">{apoapsisVelocityKmS.toFixed(2)} km/s</strong>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
        <Button
          size="sm"
          onClick={handleApply}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono"
        >
          <Activity className="w-3.5 h-3.5 mr-1" />
          APPLY ORBIT
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleSaveToLab}
          className="border-slate-700 text-slate-300 hover:text-white text-xs font-mono"
        >
          <Save className="w-3.5 h-3.5 mr-1" />
          LOG EXPERIMENT
        </Button>
      </div>
    </div>
  );
};
