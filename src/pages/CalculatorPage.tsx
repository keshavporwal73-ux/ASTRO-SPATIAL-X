import React, { useState } from 'react';
import { ASTRONOMY_CALCULATION_MODULES } from '@/services/astronomyEngine';
import type { CalculationModule, CalculationResult } from '@/types/astronomy';
import { EvidenceBadge } from '@/components/common/EvidenceBadge';
import { EvidencePanel } from '@/components/common/EvidencePanel';
import { InvestigationStorage } from '@/services/investigationStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Calculator, Sparkles, BookmarkPlus, Layers, Info, Check, RotateCcw } from 'lucide-react';

export const CalculatorPage: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<CalculationModule>(ASTRONOMY_CALCULATION_MODULES[0]);
  const [inputs, setInputs] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    ASTRONOMY_CALCULATION_MODULES[0].variables.forEach((v) => {
      init[v.id] = v.defaultValue;
    });
    return init;
  });

  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const categories = ['All', 'Orbital Mechanics', 'Stellar Physics', 'Relativity & Cosmology', 'Optics & Observational'];

  const filteredModules = ASTRONOMY_CALCULATION_MODULES.filter(
    (m) => categoryFilter === 'All' || m.category === categoryFilter
  );

  // Compute live result
  const result: CalculationResult = React.useMemo(() => {
    return selectedModule.calculate(inputs);
  }, [selectedModule, inputs]);

  const handleSelectModule = (mod: CalculationModule) => {
    setSelectedModule(mod);
    const newInputs: Record<string, number> = {};
    mod.variables.forEach((v) => {
      newInputs[v.id] = v.defaultValue;
    });
    setInputs(newInputs);
  };

  const handleInputChange = (id: string, val: number) => {
    setInputs((prev) => ({ ...prev, [id]: val }));
  };

  const handleSaveToWorkspace = () => {
    const newInv = {
      id: `inv-calc-${Date.now()}`,
      title: `${selectedModule.name} Calculation`,
      researchQuestion: `Quantitative computation for ${selectedModule.name}`,
      category: selectedModule.category,
      tags: [selectedModule.category, 'Calculator Output'],
      conversationLog: [],
      savedCalculations: [
        {
          name: selectedModule.name,
          equation: selectedModule.formulaTex,
          inputs,
          outputs: result.results.reduce((acc, r) => ({ ...acc, [r.label]: `${r.formatted} ${r.unit}` }), {}),
          date: new Date().toISOString().split('T')[0],
        },
      ],
      savedObjects: [],
      datasetsReferenced: result.sources.map((s) => s.name),
      hypotheses: [],
      notes: `Calculated values with boundary conditions: ${result.assumptions.join('; ')}`,
      status: 'Ongoing' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    InvestigationStorage.saveInvestigation(newInv);
    toast.success('Calculation saved to Investigation Workspace!');
  };

  return (
    <div className="space-y-4">
      {/* Category Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
        <span className="text-slate-400 shrink-0 flex items-center gap-1.5 mr-1">
          <Layers className="w-3.5 h-3.5 text-primary" /> Categories:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg border transition-colors shrink-0 ${
              categoryFilter === cat
                ? 'bg-primary border-primary text-white font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 1 Col: Calculation Modules List */}
        <div className="rounded-xl border border-border/80 bg-slate-950/90 p-3 backdrop-blur-md space-y-2 max-h-[650px] overflow-y-auto font-mono">
          <div className="text-xs text-slate-400 px-1 pb-1 flex justify-between items-center border-b border-border/40">
            <span>Astrophysics Equations ({filteredModules.length})</span>
            <span className="text-[10px]">Deterministic Engine</span>
          </div>

          <div className="space-y-2">
            {filteredModules.map((mod) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => handleSelectModule(mod)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedModule.id === mod.id
                    ? 'bg-primary/20 border-primary shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                    : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-100">{mod.name}</h4>
                    <span className="text-[10px] text-cyan-400 block mt-0.5">{mod.category}</span>
                  </div>
                  <EvidenceBadge status="CALCULATED" size="sm" showLabel={false} />
                </div>
                <div className="mt-1.5 text-[10px] text-slate-400 bg-slate-950/70 p-1.5 rounded font-mono border border-slate-800/60 truncate">
                  {mod.formulaTex}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Interactive Parameter Inputs & Step-by-Step Proof */}
        <div className="lg:col-span-2 rounded-xl border border-border/80 bg-card/90 p-5 backdrop-blur-md space-y-5 shadow-2xl flex flex-col justify-between font-mono">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-border/50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-100">{selectedModule.name}</h3>
                  <EvidenceBadge status="CALCULATED" size="sm" />
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selectedModule.description}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveToWorkspace}
                className="h-8 gap-1.5 text-xs font-mono border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary-foreground"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                Save Output
              </Button>
            </div>

            {/* Formula Banner */}
            <div className="p-3.5 rounded-lg bg-slate-950/90 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Astrophysical Equation</span>
                <span className="text-sm text-cyan-300 font-bold">{selectedModule.formulaTex}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const resetInputs: Record<string, number> = {};
                  selectedModule.variables.forEach((v) => (resetInputs[v.id] = v.defaultValue));
                  setInputs(resetInputs);
                }}
                className="h-7 text-xs text-slate-400 gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset Defaults
              </Button>
            </div>

            {/* Variable Input Controls */}
            <div className="space-y-3">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">
                Input Variables & Physical Parameters
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedModule.variables.map((v) => (
                  <div key={v.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-200">{v.name}</span>
                        <span className="text-slate-400 ml-1">({v.symbol})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={inputs[v.id] ?? v.defaultValue}
                          onChange={(e) => handleInputChange(v.id, parseFloat(e.target.value) || 0)}
                          step={v.step || 0.1}
                          className="h-7 w-24 text-right font-mono text-xs bg-slate-950 border-slate-700 text-cyan-300"
                        />
                        <span className="text-slate-400 text-[10px] w-8">{v.unit}</span>
                      </div>
                    </div>

                    {v.description && (
                      <p className="text-[10px] text-slate-400 leading-tight">{v.description}</p>
                    )}

                    {v.min !== undefined && v.max !== undefined && (
                      <Slider
                        value={[inputs[v.id] ?? v.defaultValue]}
                        onValueChange={([val]) => handleInputChange(v.id, val)}
                        min={v.min}
                        max={v.max}
                        step={v.step || 0.1}
                        className="pt-1"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Computed Output Cards */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">
                Computed Scientific Outputs
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {result.results.map((res, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-950/90 border border-primary/30 shadow-[0_0_10px_rgba(99,102,241,0.15)]">
                    <span className="text-slate-400 text-[10px] block">{res.label}</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-base font-bold text-slate-100">{res.formatted}</span>
                      <span className="text-xs text-cyan-400 font-semibold">{res.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Mathematical Substitutions */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">
                Step-by-Step Calculation Steps
              </span>

              <div className="space-y-2">
                {result.steps.map((st) => (
                  <div key={st.step} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">
                        {st.step}
                      </span>
                      <span>{st.description}</span>
                    </div>
                    <div className="text-slate-400 text-[10px] pl-7">Equation: {st.formula}</div>
                    <div className="text-slate-200 bg-slate-950/80 p-2 rounded text-[11px] font-mono border border-slate-800/60 ml-7">
                      {st.substituted}
                    </div>
                    <div className="text-emerald-300 font-bold text-[11px] pl-7">
                      ⟹ {st.result}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence & References */}
            <EvidencePanel
              sources={result.sources}
              assumptions={result.assumptions}
              defaultExpanded={false}
            />
          </div>

          <div className="text-[10px] text-slate-500 pt-2 border-t border-border/40 flex justify-between">
            <span>ASTRO Deterministic Math Engine</span>
            <EvidenceBadge status="CALCULATED" size="sm" showLabel={false} />
          </div>
        </div>
      </div>
    </div>
  );
};
