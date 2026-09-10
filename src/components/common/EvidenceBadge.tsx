import React from 'react';
import type { EvidenceStatus } from '@/types/astronomy';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EvidenceBadgeProps {
  status: EvidenceStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<
  EvidenceStatus,
  {
    label: string;
    dotColor: string;
    badgeClass: string;
    description: string;
    symbol: string;
  }
> = {
  OBSERVED: {
    label: 'OBSERVED',
    dotColor: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]',
    badgeClass: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/60',
    description: 'Directly supported by astronomical observations, telescopes, or empirical catalog astrometry.',
    symbol: '🟢',
  },
  CALCULATED: {
    label: 'CALCULATED',
    dotColor: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.7)]',
    badgeClass: 'border-blue-500/40 bg-blue-950/40 text-blue-300 hover:bg-blue-950/60',
    description: 'Produced through deterministic scientific calculations and standard mathematical astrophysics equations.',
    symbol: '🔵',
  },
  SIMULATED: {
    label: 'SIMULATED',
    dotColor: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.7)]',
    badgeClass: 'border-purple-500/40 bg-purple-950/40 text-purple-300 hover:bg-purple-950/60',
    description: 'Produced from an astrophysical computational model, numerical integration, or N-body simulation.',
    symbol: '🟣',
  },
  HYPOTHETICAL: {
    label: 'HYPOTHETICAL',
    dotColor: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]',
    badgeClass: 'border-amber-500/40 bg-amber-950/40 text-amber-300 hover:bg-amber-950/60',
    description: 'A theoretical model, scenario, or candidate hypothesis rather than an established physical fact.',
    symbol: '🟠',
  },
  UNCERTAIN: {
    label: 'UNCERTAIN',
    dotColor: 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]',
    badgeClass: 'border-rose-500/40 bg-rose-950/40 text-rose-300 hover:bg-rose-950/60',
    description: 'Available empirical evidence is incomplete, contested in literature, or subject to high observational error.',
    symbol: '🔴',
  },
};

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  status,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.OBSERVED;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-2',
  }[size];

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`font-mono inline-flex items-center tracking-wider transition-all cursor-default ${config.badgeClass} ${sizeClasses} ${className}`}
          >
            <span className={`rounded-full shrink-0 ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${config.dotColor}`} />
            {showLabel && <span>{config.label}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs bg-slate-900/95 border-slate-700 text-slate-200 text-xs p-3">
          <div className="flex items-center gap-2 mb-1 font-semibold text-slate-100">
            <span>{config.symbol}</span>
            <span>{config.label} Evidence Status</span>
          </div>
          <p className="text-slate-300 leading-relaxed">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
