import React, { useState } from 'react';
import { SolarSystemViewer } from '@/components/visualizations/SolarSystemViewer';
import { OrbitSimulator } from '@/components/visualizations/OrbitSimulator';
import { SkyExplorer } from '@/components/visualizations/SkyExplorer';
import { ExoplanetViewer } from '@/components/visualizations/ExoplanetViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sun, Orbit, Compass, Globe } from 'lucide-react';

export const VisualizationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('solar-system');

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-border/80 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Orbit className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold font-mono text-slate-100">Interactive Astrophysical Visualizations</h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Decoupled scientific rendering layers powered by Keplerian dynamics and celestial coordinate transforms
          </p>
        </div>
      </div>

      {/* Tabs Suite */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-900/80 border border-border/80 p-1 rounded-xl h-auto flex flex-wrap font-mono text-xs">
          <TabsTrigger
            value="solar-system"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white h-9 px-4 rounded-lg"
          >
            <Sun className="w-3.5 h-3.5" /> Solar System Explorer
          </TabsTrigger>
          <TabsTrigger
            value="orbit-simulator"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white h-9 px-4 rounded-lg"
          >
            <Orbit className="w-3.5 h-3.5" /> Orbit Simulator
          </TabsTrigger>
          <TabsTrigger
            value="sky-explorer"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white h-9 px-4 rounded-lg"
          >
            <Compass className="w-3.5 h-3.5" /> Sky Map & Coordinates
          </TabsTrigger>
          <TabsTrigger
            value="exoplanet-explorer"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white h-9 px-4 rounded-lg"
          >
            <Globe className="w-3.5 h-3.5" /> Exoplanet Explorer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="solar-system" className="mt-0">
          <SolarSystemViewer />
        </TabsContent>

        <TabsContent value="orbit-simulator" className="mt-0">
          <OrbitSimulator />
        </TabsContent>

        <TabsContent value="sky-explorer" className="mt-0">
          <SkyExplorer />
        </TabsContent>

        <TabsContent value="exoplanet-explorer" className="mt-0">
          <ExoplanetViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
};
