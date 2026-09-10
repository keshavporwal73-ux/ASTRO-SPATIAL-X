import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { InvestigationStorage } from '@/services/investigationStorage';
import type { InvestigationRecord, ResearchHypothesis, EvidenceItem, EvidenceStatus } from '@/types/astronomy';
import { EvidenceBadge } from '@/components/common/EvidenceBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  FlaskConical,
  Plus,
  Bookmark,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Database,
  Trash2,
  Orbit,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const ResearchLabPage: React.FC = () => {
  const [investigations, setInvestigations] = useState<InvestigationRecord[]>(() =>
    InvestigationStorage.getInvestigations()
  );
  const [activeInv, setActiveInv] = useState<InvestigationRecord>(investigations[0]);
  const [isAddHypothesisOpen, setIsAddHypothesisOpen] = useState(false);
  const [isAddEvidenceOpen, setIsAddEvidenceOpen] = useState(false);
  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string | null>(null);

  // New Hypothesis Form State
  const [hypTitle, setHypTitle] = useState('');
  const [hypQuestion, setHypQuestion] = useState('');
  const [hypKnowledge, setHypKnowledge] = useState('');
  const [hypCompeting, setHypCompeting] = useState('');

  // New Evidence Form State
  const [evClaim, setEvClaim] = useState('');
  const [evType, setEvType] = useState<'Supporting' | 'Counter' | 'Neutral'>('Supporting');
  const [evStatus, setEvStatus] = useState<EvidenceStatus>('OBSERVED');
  const [evSource, setEvSource] = useState('');

  const reloadData = () => {
    const list = InvestigationStorage.getInvestigations();
    setInvestigations(list);
    const updated = list.find((i) => i.id === activeInv?.id) || list[0];
    setActiveInv(updated);
  };

  const handleCreateHypothesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hypTitle.trim()) return;

    const newHyp: ResearchHypothesis = {
      id: `hyp-${Date.now()}`,
      title: hypTitle,
      question: hypQuestion,
      status: 'Active Testing',
      establishedKnowledge: hypKnowledge ? hypKnowledge.split('\n').filter(Boolean) : [],
      competingHypotheses: hypCompeting ? hypCompeting.split('\n').filter(Boolean) : [],
      evidencePoints: [],
      calculationsPerformed: [],
      conclusionSummary: 'Initial investigation ongoing. Gathering observational datasets.',
      uncertainties: ['Awaiting preliminary observational data'],
      sources: [{ name: 'ASTRO Research Lab Session', sourceType: 'Theoretical Model' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    InvestigationStorage.addHypothesis(activeInv.id, newHyp);
    reloadData();
    setIsAddHypothesisOpen(false);
    setHypTitle('');
    setHypQuestion('');
    setHypKnowledge('');
    setHypCompeting('');
    toast.success('Research hypothesis registered into laboratory workspace.');
  };

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evClaim.trim() || !selectedHypothesisId) return;

    const hyp = activeInv.hypotheses?.find((h) => h.id === selectedHypothesisId);
    if (!hyp) return;

    const newEvPoint = {
      id: `ep-${Date.now()}`,
      type: evType,
      claim: evClaim,
      evidenceStatus: evStatus,
      source: { name: evSource || 'Astronomical Dataset', sourceType: 'Observatory' as const },
    };

    hyp.evidencePoints = hyp.evidencePoints || [];
    hyp.evidencePoints.push(newEvPoint);
    InvestigationStorage.addHypothesis(activeInv.id, hyp);
    reloadData();
    setIsAddEvidenceOpen(false);
    setEvClaim('');
    setEvSource('');
    toast.success('Evidence item attached to hypothesis.');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-border/80 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold font-mono text-slate-100">Astrophysics Research Lab</h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Structured hypothesis testing, competing models, and evidence confidence evaluation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="border-indigo-500/50 bg-indigo-950/40 text-indigo-300 hover:text-white font-mono text-xs h-8 gap-1.5">
            <Link to="/spatial?mode=orbit-lab">
              <Orbit className="w-3.5 h-3.5 text-cyan-400" />
              Test in 3D Orbit Lab
            </Link>
          </Button>
          <Button
            onClick={() => setIsAddHypothesisOpen(true)}
            className="gap-1.5 font-mono text-xs bg-primary hover:bg-primary/90 text-primary-foreground h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            New Research Hypothesis
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 1 Col: Active Investigations Selector */}
        <div className="rounded-xl border border-border/80 bg-slate-950/90 p-3 backdrop-blur-md space-y-2 font-mono">
          <div className="text-xs text-slate-400 px-1 pb-1 flex justify-between items-center border-b border-border/40">
            <span>Investigation Studies</span>
            <span className="text-[10px]">{investigations.length} Active</span>
          </div>

          <div className="space-y-2">
            {investigations.map((inv) => (
              <button
                key={inv.id}
                type="button"
                onClick={() => setActiveInv(inv)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  activeInv?.id === inv.id
                    ? 'bg-primary/20 border-primary shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                    : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-xs text-slate-100 line-clamp-1">{inv.title}</h4>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-700 text-cyan-300">
                    {inv.status}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{inv.researchQuestion}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                  <span>{inv.hypotheses?.length || 0} Hypotheses</span>
                  <span>•</span>
                  <span>{inv.savedCalculations?.length || 0} Calculations</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Hypotheses & Evidence Cards */}
        <div className="lg:col-span-2 space-y-4 font-mono">
          {activeInv?.hypotheses && activeInv.hypotheses.length > 0 ? (
            activeInv.hypotheses.map((hyp) => (
              <div
                key={hyp.id}
                className="rounded-xl border border-border/80 bg-card/90 p-5 backdrop-blur-md space-y-4 shadow-xl"
              >
                {/* Hypothesis Header */}
                <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-border/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-100">{hyp.title}</h3>
                      <Badge variant="outline" className="border-indigo-500/40 bg-indigo-950/40 text-indigo-300 text-[10px]">
                        {hyp.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-cyan-300 mt-1">Research Focus: {hyp.question}</p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedHypothesisId(hyp.id);
                      setIsAddEvidenceOpen(true);
                    }}
                    className="h-8 gap-1.5 text-xs font-mono border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary-foreground"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Attach Evidence
                  </Button>
                </div>

                {/* Established Knowledge */}
                {hyp.establishedKnowledge.length > 0 && (
                  <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
                      Established Astronomical Baseline
                    </span>
                    <ul className="space-y-1 text-slate-300">
                      {hyp.establishedKnowledge.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Evidence Points (Supporting / Counter) */}
                <div className="space-y-2">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">
                    Observed & Calculated Evidence Stream
                  </span>

                  <div className="space-y-2">
                    {hyp.evidencePoints && hyp.evidencePoints.length > 0 ? (
                      hyp.evidencePoints.map((ev) => (
                        <div
                          key={ev.id}
                          className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                            ev.type === 'Supporting'
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100'
                              : ev.type === 'Counter'
                              ? 'bg-rose-950/20 border-rose-500/30 text-rose-100'
                              : 'bg-slate-900/60 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                  ev.type === 'Supporting' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-rose-900/60 text-rose-300'
                                }`}
                              >
                                {ev.type}
                              </span>
                              <span className="font-semibold text-slate-200">{ev.claim}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block">Source: {ev.source?.name}</span>
                          </div>

                          <EvidenceBadge status={ev.evidenceStatus} size="sm" />
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500 p-3 text-center border border-dashed border-slate-800 rounded-lg">
                        No evidence cards attached yet. Click "Attach Evidence" to link observations or simulation findings.
                      </div>
                    )}
                  </div>
                </div>

                {/* Competing Hypotheses */}
                {hyp.competingHypotheses.length > 0 && (
                  <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="text-[11px] text-amber-400/90 uppercase font-bold tracking-wider block">
                      Competing Models & Counter-Explanations
                    </span>
                    <ul className="space-y-1 text-slate-300">
                      {hyp.competingHypotheses.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Conclusion & Uncertainties */}
                <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-lg text-xs text-indigo-200 space-y-1">
                  <strong className="text-indigo-300 block font-semibold">Laboratory Status Assessment</strong>
                  <p>{hyp.conclusionSummary}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/50 text-slate-400 space-y-3">
              <FlaskConical className="w-8 h-8 text-primary mx-auto opacity-70" />
              <h3 className="font-bold text-sm text-slate-200">No Research Hypotheses in this Study</h3>
              <p className="text-xs max-w-sm mx-auto">
                Create a new hypothesis to systematically structure observational evidence, calculations, and uncertainties.
              </p>
              <Button onClick={() => setIsAddHypothesisOpen(true)} size="sm" className="gap-1 text-xs">
                <Plus className="w-3.5 h-3.5" /> Create Hypothesis
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Hypothesis */}
      <Dialog open={isAddHypothesisOpen} onOpenChange={setIsAddHypothesisOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-slate-950 border-slate-800 text-slate-100 font-mono">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-primary" /> Create Research Hypothesis
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateHypothesis} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Hypothesis Title</label>
              <Input
                value={hypTitle}
                onChange={(e) => setHypTitle(e.target.value)}
                placeholder="e.g. Primordial Black Hole as Dark Matter Candidate"
                className="h-8 bg-slate-900 border-slate-700 text-xs"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Research Question</label>
              <Input
                value={hypQuestion}
                onChange={(e) => setHypQuestion(e.target.value)}
                placeholder="e.g. Could asteroid-mass PBHs account for 100% of the Galactic halo density?"
                className="h-8 bg-slate-900 border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Established Baseline Knowledge (One per line)</label>
              <Textarea
                value={hypKnowledge}
                onChange={(e) => setHypKnowledge(e.target.value)}
                placeholder="Gravitational microlensing constraints ruled out PBHs between 1e-7 and 10 M_☉"
                className="bg-slate-900 border-slate-700 text-xs min-h-[60px]"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Competing Models (One per line)</label>
              <Textarea
                value={hypCompeting}
                onChange={(e) => setHypCompeting(e.target.value)}
                placeholder="WIMP particles; Axions; Sterile neutrinos"
                className="bg-slate-900 border-slate-700 text-xs min-h-[60px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsAddHypothesisOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" className="h-8 text-xs bg-primary text-primary-foreground">
                Save Hypothesis
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Attach Evidence Card */}
      <Dialog open={isAddEvidenceOpen} onOpenChange={setIsAddEvidenceOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-slate-950 border-slate-800 text-slate-100 font-mono">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" /> Attach Evidence Item
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddEvidence} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Evidence Type</label>
              <select
                value={evType}
                onChange={(e) => setEvType(e.target.value as any)}
                className="w-full h-8 bg-slate-900 border border-slate-700 rounded px-2 text-xs text-slate-200"
              >
                <option value="Supporting">Supporting (Corroborating Evidence)</option>
                <option value="Counter">Counter (Contradictory / Constraining)</option>
                <option value="Neutral">Neutral / Contextual</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Evidence Status Classification</label>
              <select
                value={evStatus}
                onChange={(e) => setEvStatus(e.target.value as any)}
                className="w-full h-8 bg-slate-900 border border-slate-700 rounded px-2 text-xs text-slate-200"
              >
                <option value="OBSERVED">OBSERVED (Empirical / Telescope)</option>
                <option value="CALCULATED">CALCULATED (Mathematical Equation)</option>
                <option value="SIMULATED">SIMULATED (Computational Model)</option>
                <option value="HYPOTHETICAL">HYPOTHETICAL (Theoretical Scenario)</option>
                <option value="UNCERTAIN">UNCERTAIN (Contested / Low SNR)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Scientific Claim / Finding</label>
              <Textarea
                value={evClaim}
                onChange={(e) => setEvClaim(e.target.value)}
                placeholder="e.g. Subaru Hyper Suprime-Cam microlensing survey placed upper limit on PBH mass fraction f < 0.01"
                className="bg-slate-900 border-slate-700 text-xs min-h-[70px]"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Source / Dataset / Paper</label>
              <Input
                value={evSource}
                onChange={(e) => setEvSource(e.target.value)}
                placeholder="e.g. Niikura et al. (2019) Nature Astronomy"
                className="h-8 bg-slate-900 border-slate-700 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsAddEvidenceOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" className="h-8 text-xs bg-primary text-primary-foreground">
                Attach
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
