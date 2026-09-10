import React from 'react';
import { Link } from 'react-router-dom';
import { CELESTIAL_OBJECTS, APOD_RECORDS, SOLAR_SYSTEM_BODIES, EXOPLANET_CATALOG } from '@/services/astronomyData';
import { ASTRONOMY_CALCULATION_MODULES } from '@/services/astronomyEngine';
import { InvestigationStorage } from '@/services/investigationStorage';
import { EvidenceBadge } from '@/components/common/EvidenceBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Telescope,
  Bot,
  Orbit,
  Calculator,
  FlaskConical,
  FolderKanban,
  Sparkles,
  ArrowRight,
  Activity,
  Compass,
  Globe,
  Radio,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const currentApod = APOD_RECORDS[0];
  const investigations = InvestigationStorage.getInvestigations();

  return (
    <div className="space-y-6 font-mono">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl border border-border/80 bg-slate-950/90 p-6 sm:p-8 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="absolute -right-12 -bottom-12 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 px-2.5 py-0.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse mr-1.5" />
              Observatory Online • IAU Canonical Engine
            </Badge>
            <EvidenceBadge status="OBSERVED" size="sm" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-sans">
            ASTRO Deep Space Observatory
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            AI-native astrophysics intelligence platform combining conversational domain reasoning,
            deterministic Keplerian & relativistic calculation engines, multi-frame coordinate transformations,
            and interactive celestial laboratories.
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 shadow-lg shadow-indigo-500/20">
              <Link to="/spatial">
                <Orbit className="w-3.5 h-3.5 text-cyan-300" /> Open 3D Spatial Laboratory
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs gap-1.5">
              <Link to="/ai-observatory">
                <Bot className="w-3.5 h-3.5" /> AI Observatory
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs gap-1.5">
              <Link to="/research-lab">
                <FlaskConical className="w-3.5 h-3.5 text-indigo-400" /> Research Lab
              </Link>
            </Button>
            <Button asChild variant="ghost" className="text-xs text-slate-300 hover:text-white gap-1.5">
              <Link to="/calculator">
                <Calculator className="w-3.5 h-3.5" /> Scientific Calculator <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Live Observatory Telemetry Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-border/80 bg-card/80 backdrop-blur-md space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Verified Objects</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{CELESTIAL_OBJECTS.length}+</span>
            <span className="text-[10px] text-cyan-400">SIMBAD/NED</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/80 bg-card/80 backdrop-blur-md space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Confirmed Exoplanets</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{EXOPLANET_CATALOG.length}+</span>
            <span className="text-[10px] text-emerald-400">NASA Archive</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/80 bg-card/80 backdrop-blur-md space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Physics Modules</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{ASTRONOMY_CALCULATION_MODULES.length}</span>
            <span className="text-[10px] text-indigo-400">Deterministic</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/80 bg-card/80 backdrop-blur-md space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Active Investigations</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{investigations.length}</span>
            <span className="text-[10px] text-amber-400">Lab Studies</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Featured APOD & Quick Lab Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: APOD Spotlight */}
        <div className="lg:col-span-2 rounded-xl border border-border/80 bg-card/90 overflow-hidden shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-border/40 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">NASA Astronomy Picture of the Day</h3>
              </div>
              <EvidenceBadge status="OBSERVED" size="sm" />
            </div>

            <div className="relative aspect-video max-h-72 w-full overflow-hidden bg-slate-950">
              <img
                src={currentApod.url}
                alt={currentApod.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-[10px] text-cyan-300 block">{currentApod.date}</span>
                <h4 className="text-lg font-bold text-white drop-shadow">{currentApod.title}</h4>
              </div>
            </div>

            <div className="p-4">
              <p className="text-xs text-slate-300 line-clamp-3 font-sans leading-relaxed">
                {currentApod.explanation}
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-900/50 border-t border-border/40 flex justify-between items-center text-xs">
            <span className="text-slate-400 text-[10px]">Credit: {currentApod.copyright || 'NASA/ESA'}</span>
            <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-primary gap-1">
              <Link to="/apod">
                View Full APOD Archive <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Right 1 Col: Quick Physics & Investigation Access */}
        <div className="space-y-4">
          {/* Scientific Lab Quick Launcher */}
          <div className="rounded-xl border border-border/80 bg-card/90 p-4 backdrop-blur-md space-y-3">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-primary" /> Active Research Studies
            </h3>

            <div className="space-y-2">
              {investigations.slice(0, 3).map((inv) => (
                <Link
                  key={inv.id}
                  to="/research-lab"
                  className="block p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700 transition-all text-xs"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-200 line-clamp-1">{inv.title}</h4>
                    <span className="text-[9px] text-cyan-400">{inv.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{inv.researchQuestion}</p>
                </Link>
              ))}
            </div>

            <Button asChild variant="outline" size="sm" className="w-full text-xs border-slate-800 h-8">
              <Link to="/workspace">Open Investigation Workspace</Link>
            </Button>
          </div>

          {/* Featured Celestial Target Spotlight */}
          <div className="rounded-xl border border-border/80 bg-card/90 p-4 backdrop-blur-md space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Telescope className="w-4 h-4 text-cyan-400" /> Deep Space Target
              </h3>
              <EvidenceBadge status="OBSERVED" size="sm" showLabel={false} />
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <strong className="text-slate-100">{CELESTIAL_OBJECTS[0].name}</strong>
                <span className="text-cyan-400 text-[10px]">{CELESTIAL_OBJECTS[0].catalogDesignation}</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                {CELESTIAL_OBJECTS[0].description}
              </p>
              <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                <span>Dist: {CELESTIAL_OBJECTS[0].distanceLy.toLocaleString()} ly</span>
                <span>Type: {CELESTIAL_OBJECTS[0].type}</span>
              </div>
            </div>

            <Button asChild variant="secondary" size="sm" className="w-full text-xs h-8">
              <Link to="/objects">Explore Object Catalog</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
