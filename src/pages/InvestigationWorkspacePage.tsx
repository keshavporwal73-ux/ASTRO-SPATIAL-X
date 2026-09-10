import React, { useState } from 'react';
import { InvestigationStorage } from '@/services/investigationStorage';
import type { InvestigationRecord } from '@/types/astronomy';
import { EvidenceBadge } from '@/components/common/EvidenceBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  FolderKanban,
  Calendar,
  Tag,
  Search,
  Plus,
  Trash2,
  FileText,
  Calculator,
  MessageSquare,
  FlaskConical,
  ExternalLink,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const InvestigationWorkspacePage: React.FC = () => {
  const [investigations, setInvestigations] = useState<InvestigationRecord[]>(() =>
    InvestigationStorage.getInvestigations()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInv, setSelectedInv] = useState<InvestigationRecord | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Investigation Form State
  const [title, setTitle] = useState('');
  const [researchQuestion, setResearchQuestion] = useState('');
  const [category, setCategory] = useState('Astrophysics');
  const [tagInput, setTagInput] = useState('');

  const reloadData = () => {
    setInvestigations(InvestigationStorage.getInvestigations());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newInv: InvestigationRecord = {
      id: `inv-${Date.now()}`,
      title,
      researchQuestion,
      category,
      tags: tagInput.split(',').map((t) => t.trim()).filter(Boolean),
      conversationLog: [],
      savedCalculations: [],
      savedObjects: [],
      datasetsReferenced: ['NASA/JPL SSD Horizons'],
      hypotheses: [],
      notes: '',
      status: 'Ongoing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    InvestigationStorage.saveInvestigation(newInv);
    reloadData();
    setIsCreateOpen(false);
    setTitle('');
    setResearchQuestion('');
    setTagInput('');
    toast.success('New investigation project initialized!');
  };

  const handleDelete = (id: string) => {
    InvestigationStorage.deleteInvestigation(id);
    reloadData();
    if (selectedInv?.id === id) setSelectedInv(null);
    toast.success('Investigation removed from workspace.');
  };

  const filtered = investigations.filter((inv) => {
    const matchesSearch =
      inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.researchQuestion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 font-mono">
      {/* Workspace Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-border/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-100">Investigation Workspace</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Persistent research timeline, saved calculations, AI transcripts & observational notes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter studies & notes..."
              className="h-8 pl-8 text-xs w-48 sm:w-60 bg-slate-950 border-slate-800"
            />
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            size="sm"
            className="gap-1.5 text-xs bg-primary text-primary-foreground h-8"
          >
            <Plus className="w-3.5 h-3.5" /> New Study
          </Button>
        </div>
      </div>

      {/* Chronological Investigation Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((inv) => (
          <div
            key={inv.id}
            className="rounded-xl border border-border/80 bg-card/90 p-5 backdrop-blur-md flex flex-col justify-between space-y-4 shadow-xl hover:border-slate-700 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-100 line-clamp-1">{inv.title}</h3>
                  <span className="text-[10px] text-cyan-400 block mt-0.5">{inv.category}</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-2 py-0.5 ${
                    inv.status === 'Concluded'
                      ? 'border-emerald-500/50 text-emerald-300'
                      : 'border-indigo-500/50 text-indigo-300'
                  }`}
                >
                  {inv.status}
                </Badge>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {inv.researchQuestion}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {inv.tags.map((t, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* Counts Badge Row */}
              <div className="grid grid-cols-3 gap-1 pt-2 border-t border-border/40 text-[10px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Calculator className="w-3 h-3 text-primary" />
                  <span>{inv.savedCalculations?.length || 0} Calcs</span>
                </div>
                <div className="flex items-center gap-1">
                  <FlaskConical className="w-3 h-3 text-emerald-400" />
                  <span>{inv.hypotheses?.length || 0} Hyp</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-cyan-400" />
                  <span>{inv.conversationLog?.length || 0} Logs</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {new Date(inv.updatedAt).toLocaleDateString()}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedInv(inv)}
                  className="h-7 px-2 text-xs text-primary hover:bg-slate-800"
                >
                  Inspect Study
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(inv.id)}
                  className="h-7 w-7 p-0 text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Investigation */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-slate-950 border-slate-800 text-slate-100 font-mono">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-primary" /> Initialize Investigation
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Study Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Spectral Analysis of K2-18 b Atmospheric Methane"
                className="h-8 bg-slate-900 border-slate-700 text-xs"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Core Scientific Question</label>
              <Input
                value={researchQuestion}
                onChange={(e) => setResearchQuestion(e.target.value)}
                placeholder="e.g. Can photochemical haze explain the JWST NIRSpec transmission slope?"
                className="h-8 bg-slate-900 border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Field Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-8 bg-slate-900 border border-slate-700 rounded px-2 text-xs text-slate-200"
              >
                <option value="Exoplanet Atmospheres">Exoplanet Atmospheres</option>
                <option value="Orbital Mechanics">Orbital Mechanics</option>
                <option value="Cosmology & Relativistic Physics">Cosmology & Relativistic Physics</option>
                <option value="Stellar Evolution">Stellar Evolution</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Tags (Comma separated)</label>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="JWST, Methane, Exoplanets, Biosignatures"
                className="h-8 bg-slate-900 border-slate-700 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" className="h-8 text-xs bg-primary text-primary-foreground">
                Initialize Study
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Detailed Study Viewer */}
      <Dialog open={!!selectedInv} onOpenChange={(open) => !open && setSelectedInv(null)}>
        {selectedInv && (
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl bg-slate-950 border-slate-800 text-slate-100 font-mono max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg">{selectedInv.title}</DialogTitle>
                <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
                  {selectedInv.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Research Question</span>
                <p className="text-slate-200 font-medium mt-0.5">{selectedInv.researchQuestion}</p>
              </div>

              {/* Saved Calculations Section */}
              {selectedInv.savedCalculations && selectedInv.savedCalculations.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-slate-400 uppercase font-bold block">
                    Saved Calculations ({selectedInv.savedCalculations.length})
                  </span>
                  <div className="space-y-2">
                    {selectedInv.savedCalculations.map((calc, idx) => (
                      <div key={idx} className="p-3 bg-slate-900/40 rounded border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center">
                          <strong className="text-cyan-300">{calc.name}</strong>
                          <span className="text-[10px] text-slate-500">{calc.date}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Equation: {calc.equation}</div>
                        <div className="p-2 bg-slate-950 rounded text-[11px] text-emerald-300 border border-slate-800/80">
                          {Object.entries(calc.outputs).map(([k, v]) => (
                            <div key={k}>
                              {k}: <strong>{v}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hypotheses Section */}
              {selectedInv.hypotheses && selectedInv.hypotheses.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-slate-400 uppercase font-bold block">
                    Structured Hypotheses ({selectedInv.hypotheses.length})
                  </span>
                  <div className="space-y-2">
                    {selectedInv.hypotheses.map((h) => (
                      <div key={h.id} className="p-3 bg-slate-900/40 rounded border border-slate-800 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <strong className="text-slate-200">{h.title}</strong>
                          <span className="text-[10px] text-indigo-300">{h.status}</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{h.conclusionSummary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};
