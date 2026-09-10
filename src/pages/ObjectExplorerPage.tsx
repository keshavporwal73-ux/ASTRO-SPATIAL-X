import React, { useState } from 'react';
import { CELESTIAL_OBJECTS } from '@/services/astronomyData';
import type { CelestialObject } from '@/types/astronomy';
import { EvidenceBadge } from '@/components/common/EvidenceBadge';
import { EvidencePanel } from '@/components/common/EvidencePanel';
import { CoordinateEngine } from '@/services/astronomyEngine';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Telescope, Filter, Sparkles, Compass, Layers, ExternalLink } from 'lucide-react';

export const ObjectExplorerPage: React.FC = () => {
  const [selectedObject, setSelectedObject] = useState<CelestialObject>(CELESTIAL_OBJECTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const types = ['All', 'Black Hole', 'Galaxy', 'Nebula', 'Star', 'Supernova Remnant'];

  const filtered = CELESTIAL_OBJECTS.filter((obj) => {
    const matchesSearch =
      obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.catalogDesignation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.constellation?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || obj.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-border/80 backdrop-blur-md font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search celestial objects by name, catalog ID, constellation..."
              className="h-8 pl-8 text-xs w-56 sm:w-72 bg-slate-950 border-slate-800"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t} Objects
              </option>
            ))}
          </select>
        </div>

        <div className="text-slate-400">
          Showing <strong className="text-slate-200">{filtered.length}</strong> catalog targets
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 1 Col: Object Cards List */}
        <div className="rounded-xl border border-border/80 bg-slate-950/90 p-3 backdrop-blur-md space-y-2 max-h-[650px] overflow-y-auto font-mono">
          <div className="text-xs text-slate-400 px-1 pb-1 flex justify-between items-center border-b border-border/40">
            <span>Astronomical Catalog</span>
            <span className="text-[10px]">SIMBAD / NED Linked</span>
          </div>

          <div className="space-y-2">
            {filtered.map((obj) => (
              <button
                key={obj.id}
                type="button"
                onClick={() => setSelectedObject(obj)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedObject.id === obj.id
                    ? 'bg-primary/20 border-primary shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                    : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-100">{obj.name}</h4>
                    <span className="text-[10px] text-cyan-400 block mt-0.5">
                      {obj.catalogDesignation} • {obj.type}
                    </span>
                  </div>
                  <EvidenceBadge status={obj.evidenceStatus} size="sm" showLabel={false} />
                </div>
                <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
                  <span>Dist: <strong className="text-slate-300">{obj.distanceLy.toLocaleString()} ly</strong></span>
                  <span>Const: <strong className="text-slate-300">{obj.constellation}</strong></span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Detailed Object Profile */}
        <div className="lg:col-span-2 rounded-xl border border-border/80 bg-card/90 p-5 backdrop-blur-md space-y-5 shadow-2xl flex flex-col justify-between font-mono">
          <div className="space-y-4">
            {/* Header with Hero Image Banner */}
            {selectedObject.imageUrl && (
              <div className="relative h-44 rounded-lg overflow-hidden border border-slate-800">
                <img
                  src={selectedObject.imageUrl}
                  alt={selectedObject.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{selectedObject.name}</h3>
                    <span className="text-xs text-cyan-300">
                      {selectedObject.catalogDesignation} • {selectedObject.subType || selectedObject.type}
                    </span>
                  </div>
                  <EvidenceBadge status={selectedObject.evidenceStatus} size="md" />
                </div>
              </div>
            )}

            {/* Description & Scientific Notes */}
            <div className="space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {selectedObject.description}
              </p>
              {selectedObject.scientificNotes && (
                <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg text-xs text-slate-300">
                  <strong className="text-primary block font-semibold mb-0.5 font-mono">
                    Astrophysical Investigation Notes
                  </strong>
                  <span className="font-sans">{selectedObject.scientificNotes}</span>
                </div>
              )}
            </div>

            {/* Coordinates in Multiple Reference Frames */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">
                Canonical Coordinate Ephemeris
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="bg-slate-950/90 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-cyan-300 font-bold block text-[11px]">ICRS Equatorial (J2000.0)</span>
                  <div className="flex justify-between text-slate-300">
                    <span>Right Ascension (RA):</span>
                    <strong>{selectedObject.coordinates.raHMS || selectedObject.coordinates.ra + '°'}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Declination (Dec):</span>
                    <strong>{selectedObject.coordinates.decDMS || selectedObject.coordinates.dec + '°'}</strong>
                  </div>
                </div>

                <div className="bg-slate-950/90 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-indigo-300 font-bold block text-[11px]">Galactic Frame (IAU 1958)</span>
                  <div className="flex justify-between text-slate-300">
                    <span>Galactic Longitude (l):</span>
                    <strong>{selectedObject.coordinates.galacticL?.toFixed(4) || 'N/A'}°</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Galactic Latitude (b):</span>
                    <strong>{selectedObject.coordinates.galacticB?.toFixed(4) || 'N/A'}°</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Distance</span>
                <span className="text-cyan-300 font-bold">{selectedObject.distanceLy.toLocaleString()} ly</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Constellation</span>
                <span className="text-slate-200 font-bold">{selectedObject.constellation}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Mass (Solar)</span>
                <span className="text-emerald-300 font-bold">{selectedObject.massSolar ? `${selectedObject.massSolar.toLocaleString()} M_☉` : 'N/A'}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Temperature</span>
                <span className="text-amber-300 font-bold">{selectedObject.temperatureKelvin ? `${selectedObject.temperatureKelvin.toLocaleString()} K` : 'N/A'}</span>
              </div>
            </div>

            {/* Evidence & Sources Panel */}
            <EvidencePanel sources={selectedObject.sources} defaultExpanded={false} />
          </div>

          <div className="text-[10px] text-slate-500 pt-2 border-t border-border/40 flex justify-between">
            <span>NASA / CDS SIMBAD Verified Deep Space Database</span>
            <EvidenceBadge status={selectedObject.evidenceStatus} size="sm" showLabel={false} />
          </div>
        </div>
      </div>
    </div>
  );
};
