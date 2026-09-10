import React, { useState } from 'react';
import { SpatialMeasurement, SpatialObject3D } from '@/types/spatial';
import { SpatialEngine } from '@/services/spatialEngine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Atom, ArrowRightLeft, Check, Clock, Radio, X } from 'lucide-react';

interface SpatialMeasurementDialogProps {
  objects: SpatialObject3D[];
  initialSourceId?: string | null;
  onApplyMeasurement: (measurement: SpatialMeasurement) => void;
  onClose: () => void;
}

export const SpatialMeasurementDialog: React.FC<SpatialMeasurementDialogProps> = ({
  objects,
  initialSourceId,
  onApplyMeasurement,
  onClose,
}) => {
  const [sourceId, setSourceId] = useState<string>(initialSourceId || objects[0]?.id || 'earth');
  const [targetId, setTargetId] = useState<string>(
    objects.find((o) => o.id !== (initialSourceId || 'earth'))?.id || 'mars'
  );

  const objA = objects.find((o) => o.id === sourceId) || objects[0];
  const objB = objects.find((o) => o.id === targetId) || objects[1];

  const measurement =
    objA && objB
      ? SpatialEngine.measureDistance(
          { id: objA.id, name: objA.name, positionAU: objA.position },
          { id: objB.id, name: objB.name, positionAU: objB.position }
        )
      : null;

  const handleApply = () => {
    if (measurement) {
      onApplyMeasurement(measurement);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4 font-sans text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Atom className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm">3D Spatial Measurement Tool</h3>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="h-7 w-7 p-0 text-slate-400">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Object Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Origin Body (A)</label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {objects.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.name} ({obj.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Target Body (B)</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {objects.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.name} ({obj.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Measurement Readout */}
        {measurement && (
          <div className="p-3.5 rounded-lg bg-slate-950/90 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-cyan-300 font-bold">
                {measurement.sourceObjectName} ↔ {measurement.targetObjectName}
              </span>
              <Badge variant="outline" className="border-blue-500/50 text-blue-300 text-[10px]">
                {measurement.evidenceStatus}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Distance (AU)</span>
                <strong className="text-cyan-400 text-sm">{measurement.distanceAU.toFixed(4)} AU</strong>
              </div>

              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Distance (km)</span>
                <strong className="text-slate-200 text-sm">
                  {measurement.distanceKm.toExponential(4)} km
                </strong>
              </div>

              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Light-Travel Time</span>
                <strong className="text-amber-300 text-sm">{measurement.lightTravelTimeFormatted}</strong>
              </div>

              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Angular Separation</span>
                <strong className="text-indigo-300 text-sm">{measurement.angularSeparationDMS}</strong>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed pt-1">
              Deterministic calculation based on 3D Euclidean metrics and IAU physical constants (c = 299,792.458 km/s).
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose} className="border-slate-700 text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            PIN MEASUREMENT IN 3D
          </Button>
        </div>
      </div>
    </div>
  );
};
