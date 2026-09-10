import React, { useState } from 'react';
import { EXOPLANET_CATALOG } from '@/services/astronomyData';
import type { ExoplanetData } from '@/types/astronomy';
import { EvidenceBadge } from '@/components/common/EvidenceBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Globe, Filter, Sparkles, Compass, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ExoplanetViewer: React.FC = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<ExoplanetData>(EXOPLANET_CATALOG[0]); // TRAPPIST-1e default
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [habitableOnly, setHabitableOnly] = useState(false);

  const filteredPlanets = EXOPLANET_CATALOG.filter((planet) => {
    const matchesSearch =
      planet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      planet.hostStar.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'all' || planet.discoveryMethod === methodFilter;
    const matchesHabitable = !habitableOnly || planet.isPotentiallyHabitableCandidate;
    return matchesSearch && matchesMethod && matchesHabitable;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-lg border border-border/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exoplanet or host star..."
              className="h-8 pl-8 text-xs font-mono w-48 sm:w-64 bg-slate-950 border-slate-800"
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="h-8 bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Discovery Methods</option>
            <option value="Transit">Transit Photometry</option>
            <option value="Radial Velocity">Radial Velocity (Doppler)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHabitableOnly(!habitableOnly)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors ${
              habitableOnly
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Potentially Habitable Candidates Only
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 1 Col: Scrollable Catalog List */}
        <div className="rounded-xl border border-border/80 bg-slate-950/90 p-3 backdrop-blur-md space-y-2 max-h-[600px] overflow-y-auto">
          <div className="text-xs font-mono text-slate-400 px-1 pb-1 flex justify-between items-center border-b border-border/40">
            <span>Confirmed Exoplanets ({filteredPlanets.length})</span>
            <span className="text-[10px]">NASA Exoplanet Archive</span>
          </div>

          <div className="space-y-2">
            {filteredPlanets.map((planet) => (
              <button
                key={planet.id}
                type="button"
                onClick={() => setSelectedPlanet(planet)}
                className={`w-full text-left p-3 rounded-lg border transition-all font-mono ${
                  selectedPlanet.id === planet.id
                    ? 'bg-primary/20 border-primary shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                    : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">{planet.name}</h4>
                    <span className="text-[11px] text-slate-400 block">Host: {planet.hostStar} ({planet.hostStarSpectralType})</span>
                  </div>
                  {planet.isPotentiallyHabitableCandidate ? (
                    <Badge variant="outline" className="border-emerald-500/40 bg-emerald-950/50 text-emerald-300 text-[10px] px-1.5 py-0.2">
                      Habitable Candidate
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-slate-800 text-slate-400 text-[10px] px-1.5 py-0.2">
                      {planet.discoveryMethod}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1 mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                  <div>Dist: <strong className="text-slate-300">{planet.distanceLy} ly</strong></div>
                  <div>Period: <strong className="text-slate-300">{planet.orbitalPeriodDays.toFixed(1)} d</strong></div>
                  <div>Radius: <strong className="text-slate-300">{planet.radiusEarth} R_⊕</strong></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Detailed Exoplanet Habitable System Inspector */}
        <div className="lg:col-span-2 rounded-xl border border-border/80 bg-card/90 p-5 backdrop-blur-md space-y-5 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4 font-mono">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-2xl font-bold text-slate-100">{selectedPlanet.name}</h3>
                  <EvidenceBadge status={selectedPlanet.evidenceStatus} size="md" />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Host Star: <strong className="text-cyan-400">{selectedPlanet.hostStar}</strong> ({selectedPlanet.hostStarSpectralType}) • Distance: <strong className="text-slate-200">{selectedPlanet.distanceLy} light-years</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-300">
                  Discovered: {selectedPlanet.discoveryYear} ({selectedPlanet.discoveryMethod})
                </span>
              </div>
            </div>

            {/* Habitable Zone Status Banner */}
            {selectedPlanet.isPotentiallyHabitableCandidate ? (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-2.5 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-300 block font-semibold">Potentially Habitable Candidate Designation</strong>
                  <span>{selectedPlanet.habitabilityNotes}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
                <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-300 block font-semibold">Extreme / Non-Habitable Zone Environment</strong>
                  <span>{selectedPlanet.habitabilityNotes || 'Physical parameters exceed conservative runaway greenhouse or tidal extremes.'}</span>
                </div>
              </div>
            )}

            {/* Habitable Zone Schematic Gauge */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
                Stellar Circumstellar Habitable Zone Scale (AU)
              </span>

              <div className="relative h-6 bg-slate-900 rounded-full overflow-hidden border border-slate-800 flex items-center px-2">
                {/* Hot Zone */}
                <div className="h-full bg-rose-950/40 w-1/4 border-r border-rose-800/40" title="Hot Inner Zone" />
                {/* Habitable Zone */}
                <div className="h-full bg-emerald-900/40 w-1/3 border-r border-emerald-700/40 flex items-center justify-center text-[9px] text-emerald-300 font-bold" title="Conservative Habitable Zone">
                  Habitable Zone
                </div>
                {/* Cold Outer Zone */}
                <div className="h-full bg-blue-950/40 flex-1" title="Cold Outer Zone" />

                {/* Planet Marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_8px_#06B6D4]"
                  style={{
                    left: `${Math.min(92, Math.max(8, (selectedPlanet.semiMajorAxisAU / (selectedPlanet.semiMajorAxisAU * 2.5)) * 100))}%`,
                  }}
                  title={`${selectedPlanet.name}: ${selectedPlanet.semiMajorAxisAU} AU`}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 AU (Host Star)</span>
                <span>Orbit: {selectedPlanet.semiMajorAxisAU} AU</span>
                <span>Outer Cold Limit</span>
              </div>
            </div>

            {/* Astrophysical Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Orbital Period</span>
                <span className="text-indigo-300 font-bold text-sm">{selectedPlanet.orbitalPeriodDays.toFixed(2)} days</span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Radius</span>
                <span className="text-cyan-300 font-bold text-sm">{selectedPlanet.radiusEarth} R_⊕</span>
                <span className="text-[10px] text-slate-400 block">{(selectedPlanet.radiusEarth * 6371).toLocaleString()} km</span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Mass</span>
                <span className="text-emerald-300 font-bold text-sm">{selectedPlanet.massEarth ? `${selectedPlanet.massEarth} M_⊕` : 'Unconstrained'}</span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Equilibrium Temp</span>
                <span className="text-amber-300 font-bold text-sm">
                  {selectedPlanet.equilibriumTempKelvin ? `${selectedPlanet.equilibriumTempKelvin} K (${selectedPlanet.equilibriumTempKelvin - 273} °C)` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Atmosphere & Scientific Notes */}
            {selectedPlanet.atmosphereNotes && (
              <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200">
                <strong className="text-indigo-300 block font-semibold mb-0.5">Atmospheric Spectroscopy (JWST Data)</strong>
                <span>{selectedPlanet.atmosphereNotes}</span>
              </div>
            )}
          </div>

          <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-border/40 flex items-center justify-between">
            <span>NASA Exoplanet Archive • NExScI Caltech/IPAC Verified Data</span>
            <EvidenceBadge status="OBSERVED" size="sm" showLabel={false} />
          </div>
        </div>
      </div>
    </div>
  );
};
