import React, { useState } from 'react';
import type { EvidenceSource } from '@/types/astronomy';
import { ExternalLink, ChevronDown, ChevronUp, BookOpen, Database, Telescope, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EvidencePanelProps {
  sources: EvidenceSource[];
  assumptions?: string[];
  uncertainties?: string[];
  equations?: { name: string; formula: string; substituted: string; result: string }[];
  defaultExpanded?: boolean;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  sources,
  assumptions = [],
  uncertainties = [],
  equations = [],
  defaultExpanded = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  if (!sources?.length && !assumptions?.length && !uncertainties?.length && !equations?.length) {
    return null;
  }

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'Observatory':
        return <Telescope className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Space Mission':
        return <Rocket className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Catalog':
        return <Database className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <BookOpen className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="mt-4 border border-border/80 bg-slate-950/60 rounded-lg overflow-hidden backdrop-blur-sm">
      <Button
        variant="ghost"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 rounded-none border-none h-auto"
      >
        <div className="flex items-center gap-2 font-mono">
          <Database className="w-3.5 h-3.5 text-primary" />
          <span className="font-semibold text-slate-300">Evidence & Scientific Sources</span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded-full">
            {sources.length} sources
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </Button>

      {isOpen && (
        <div className="p-3.5 pt-2 border-t border-border/40 space-y-3 text-xs">
          {/* Equations section if any */}
          {equations.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Mathematical Proof & Substitutions
              </span>
              <div className="space-y-2">
                {equations.map((eq, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-2.5 rounded border border-slate-800/80 font-mono text-[11px]">
                    <div className="text-primary font-medium mb-0.5">{eq.name}</div>
                    <div className="text-slate-400 text-[10px] mb-1">Formula: {eq.formula}</div>
                    <div className="text-slate-300 bg-slate-950/90 p-1.5 rounded mb-1 text-[11px]">
                      {eq.substituted}
                    </div>
                    <div className="text-blue-300 font-semibold text-[11px]">⟹ Result: {eq.result}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources List */}
          {sources.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Verified Astronomical Data Sources
              </span>
              <div className="grid grid-cols-1 gap-2">
                {sources.map((src, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded bg-slate-900/40 border border-slate-800/50 gap-1.5"
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">{getSourceIcon(src.sourceType)}</div>
                      <div>
                        <div className="font-medium text-slate-200">{src.name}</div>
                        {src.dataset && (
                          <div className="text-[10px] text-slate-400 font-mono">Dataset: {src.dataset}</div>
                        )}
                        {src.dataUsed && (
                          <div className="text-[10px] text-slate-400">Parameter: {src.dataUsed}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <span className="text-[10px] bg-slate-800/80 px-2 py-0.5 rounded text-slate-300 font-mono">
                        {src.sourceType}
                      </span>
                      {src.url && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 p-1 rounded hover:bg-slate-800 transition-colors"
                          title="Open external dataset"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assumptions */}
          {assumptions.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Physical Assumptions & Boundary Conditions
              </span>
              <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                {assumptions.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Uncertainties */}
          {uncertainties.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400/90 font-semibold block">
                Scientific Uncertainty & Error Bounds
              </span>
              <ul className="list-disc list-inside text-amber-300/80 space-y-0.5 text-[11px]">
                {uncertainties.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
