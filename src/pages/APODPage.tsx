import React, { useState } from 'react';
import { APOD_RECORDS } from '@/services/astronomyData';
import type { APODRecord } from '@/types/astronomy';
import { EvidenceBadge } from '@/components/common/EvidenceBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Sparkles, ExternalLink, Info, Image as ImageIcon } from 'lucide-react';

export const APODPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentApod: APODRecord = APOD_RECORDS[currentIndex] || APOD_RECORDS[0];

  return (
    <div className="space-y-4 font-mono">
      {/* Header Banner */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-border/80 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">NASA Astronomy Picture of the Day</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Curated daily cosmic phenomena, deep space imagery, and astronomical discoveries
          </p>
        </div>

        {/* Date / Entry Navigators */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={currentIndex >= APOD_RECORDS.length - 1}
            onClick={() => setCurrentIndex((prev) => Math.min(APOD_RECORDS.length - 1, prev + 1))}
            className="h-8 gap-1 text-xs border-slate-800 bg-slate-950 text-slate-300"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </Button>

          <span className="text-xs text-cyan-300 px-2 py-1 bg-slate-950 border border-slate-800 rounded">
            {currentApod.date}
          </span>

          <Button
            size="sm"
            variant="outline"
            disabled={currentIndex <= 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="h-8 gap-1 text-xs border-slate-800 bg-slate-950 text-slate-300"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main APOD Showcase Card */}
      <div className="rounded-xl border border-border/80 bg-card/90 overflow-hidden shadow-2xl backdrop-blur-md">
        {/* High-res Image Container */}
        <div className="relative aspect-video max-h-[550px] w-full overflow-hidden bg-slate-950">
          <img
            src={currentApod.hdurl || currentApod.url}
            alt={currentApod.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

          {/* Overlay Tags */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <Badge className="bg-slate-900/80 border border-slate-700 text-slate-200 text-xs backdrop-blur-md">
              <Calendar className="w-3 h-3 mr-1" /> {currentApod.date}
            </Badge>

            <EvidenceBadge status="OBSERVED" size="md" />
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-md">
              {currentApod.title}
            </h3>
            {currentApod.copyright && (
              <span className="text-xs text-slate-300 drop-shadow block mt-1">
                Image Credit & Copyright: {currentApod.copyright}
              </span>
            )}
          </div>
        </div>

        {/* Explanation & Technical Details */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">
              NASA Astrophysical Explanation
            </span>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {currentApod.explanation}
            </p>
          </div>

          {/* Related Discovery Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/40 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] block uppercase">Data Source</span>
              <span className="text-cyan-300 font-bold">NASA APOD API / APOD Archive</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] block uppercase">Evidence Status</span>
              <span className="text-emerald-300 font-bold">Empirically Verified Observation</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] block uppercase">Original Media Type</span>
              <span className="text-slate-200 font-bold">High-Resolution CCD / Telescopic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Archive Grid Preview */}
      <div className="space-y-2">
        <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">
          Featured APOD Archive Collection
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {APOD_RECORDS.map((item: APODRecord, idx: number) => (
            <button
              key={item.date || idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`rounded-lg overflow-hidden border text-left transition-all ${
                currentIndex === idx
                  ? 'border-primary ring-2 ring-primary/40 scale-[1.02]'
                  : 'border-slate-800/80 hover:border-slate-600 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="aspect-video w-full overflow-hidden bg-slate-950">
                <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-2.5 bg-slate-900/90 text-xs">
                <span className="text-[10px] text-cyan-400 block">{item.date}</span>
                <h4 className="font-bold text-slate-200 truncate">{item.title}</h4>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
