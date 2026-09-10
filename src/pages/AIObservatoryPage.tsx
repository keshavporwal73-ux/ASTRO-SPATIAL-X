import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AstronomyAIRouter, type AstroAIResponse, type ToolCallExecution } from '@/services/aiRouter';
import { SpatialCommandRouter } from '@/services/spatialCommandRouter';
import { InvestigationStorage } from '@/services/investigationStorage';
import { EvidenceBadge } from '@/components/common/EvidenceBadge';
import { EvidencePanel } from '@/components/common/EvidencePanel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Send,
  Sparkles,
  Bot,
  User,
  BookmarkPlus,
  Terminal,
  Activity,
  Cpu,
  HelpCircle,
  RefreshCw,
  Orbit,
  ArrowRight,
  Crosshair,
  Layers,
  Compass,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  aiResponse?: AstroAIResponse;
  spatialAction?: any;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    role: 'assistant',
    content: `Welcome to **ASTRO AI Observatory & Spatial Lab Controller**. I am your domain-specific astrophysics intelligence system.\n\nEvery factual assertion, calculation, or theoretical model is explicitly qualified with evidence status labels (**OBSERVED**, **CALCULATED**, **SIMULATED**, **HYPOTHETICAL**, **UNCERTAIN**) and backed by NASA, SIMBAD, and astrophysics datasets.\n\nI can also execute live 3D spatial actions such as *"Focus on Mars"*, *"Compare Earth and Jupiter"*, *"Measure distance between Earth and Neptune"*, or *"Switch to Galactic coordinates"*.\n\nHow may I assist your scientific inquiry today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    aiResponse: {
      answer: '',
      primaryStatus: 'OBSERVED',
      evidenceItems: [],
      sources: [
        { name: 'NASA Astrophysical Data System (ADS)', sourceType: 'Catalog' },
        { name: 'NASA Exoplanet Archive / NExScI', sourceType: 'Catalog' },
      ],
      toolCalls: [],
      suggestedFollowUps: [
        'Show Mars in 3D and calculate its orbital period.',
        'Compare Earth and Mars physical parameters in 3D.',
        'Investigate the Planet Nine hypothesis and evidence.',
        'Measure distance and light travel time from Earth to Jupiter.',
      ],
    },
  },
];

const SUGGESTED_QUERIES = [
  'Focus on Mars in 3D and show its orbit.',
  'Measure distance from Earth to Jupiter.',
  'Calculate the orbital period of an object at 5 AU.',
  'Compare Earth and Mars physical parameters.',
  'Investigate the Planet Nine hypothesis and evidence.',
  'What are the confirmed exoplanets in TRAPPIST-1 system?',
];

export const AIObservatoryPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(true);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Execute through domain router
      const aiResponse = await AstronomyAIRouter.query(prompt);
      const spatialAction = SpatialCommandRouter.parseCommand(prompt);

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        aiResponse,
        spatialAction,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      toast.error('Failed to generate scientific response. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToInvestigation = (msg: ChatMessage) => {
    if (!msg.aiResponse) return;
    const newInv = {
      id: `inv-${Date.now()}`,
      title: msg.content.slice(0, 50) + '...',
      researchQuestion: msg.content,
      category: 'AI Observatory Inquiries',
      tags: ['AI Inquiry', 'Observatory'],
      conversationLog: [
        {
          role: msg.role,
          content: msg.content,
          timestamp: new Date().toISOString(),
          evidenceItems: msg.aiResponse.evidenceItems,
        },
      ],
      savedCalculations: msg.aiResponse.equationsUsed?.map((eq) => ({
        name: eq.name,
        equation: eq.formula,
        inputs: {},
        outputs: { result: eq.result },
        date: new Date().toISOString().split('T')[0],
      })) || [],
      savedObjects: [],
      datasetsReferenced: msg.aiResponse.sources.map((s) => s.name),
      hypotheses: [],
      notes: 'Saved from AI Observatory conversation session.',
      status: 'Ongoing' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    InvestigationStorage.saveInvestigation(newInv);
    toast.success('Investigation saved to Workspace Timeline!');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[900px] rounded-xl border border-border/80 bg-slate-950/80 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Observatory Header */}
      <div className="p-3.5 px-4 border-b border-border/70 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/20 border border-primary/40 text-primary">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono font-bold text-sm text-slate-100">AI Observatory</h2>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded-full font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Domain Router Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Transparent evidence & confidence evaluation backed by astronomical physics engines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setShowTelemetry(!showTelemetry)}
            className={`px-2.5 py-1 rounded-md border text-xs flex items-center gap-1.5 transition-colors ${
              showTelemetry ? 'bg-slate-800 border-primary/50 text-primary-foreground' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Telemetry Stream
          </button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-4 space-y-2.5 border shadow-lg ${
                msg.role === 'user'
                  ? 'bg-primary/20 border-primary/40 text-slate-100'
                  : 'bg-card/90 border-border/80 text-slate-200'
              }`}
            >
              {/* Header with Evidence Status */}
              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-border/40 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-300">
                    {msg.role === 'user' ? 'Astronomer' : 'ASTRO Laboratory'}
                  </span>
                  <span className="text-slate-500 text-[10px]">{msg.timestamp}</span>
                </div>

                {msg.aiResponse && (
                  <div className="flex items-center gap-1.5">
                    <EvidenceBadge status={msg.aiResponse.primaryStatus} size="sm" />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSaveToInvestigation(msg)}
                      className="h-6 px-1.5 text-[10px] text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                      title="Save to Investigation Workspace"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5 mr-1" /> Save
                    </Button>
                  </div>
                )}
              </div>

              {/* Tool Calling Telemetry Badge */}
              {showTelemetry && msg.aiResponse?.toolCalls && msg.aiResponse.toolCalls.length > 0 && (
                <div className="bg-slate-950/90 p-2 rounded-md border border-slate-800/80 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-cyan-400" /> Scientific Tools Invoked
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.aiResponse.toolCalls.map((tc) => (
                      <span
                        key={tc.id}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 flex items-center gap-1"
                      >
                        <Cpu className="w-2.5 h-2.5 text-primary" /> {tc.name}()
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Content */}
              <div className="prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-200">
                {msg.content}
              </div>

              {/* 3D Spatial Action Launcher if detected */}
              {msg.spatialAction && (
                <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-500/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Orbit className="w-4 h-4 text-cyan-400 animate-spin" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-300 block">
                        3D Spatial Action Available
                      </span>
                      <span className="text-[11px] text-slate-300">{msg.spatialAction.description}</span>
                    </div>
                  </div>

                  <Button asChild size="sm" className="h-7 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono">
                    <Link
                      to={`/spatial?mode=${msg.spatialAction.viewMode || 'solar-system'}${
                        msg.spatialAction.targetId ? `&focus=${msg.spatialAction.targetId}` : ''
                      }`}
                    >
                      <Crosshair className="w-3.5 h-3.5 mr-1" />
                      VIEW IN 3D
                    </Link>
                  </Button>
                </div>
              )}

              {/* Verified Sources & Equations Panel */}
              {msg.aiResponse && (
                <EvidencePanel
                  sources={msg.aiResponse.sources || []}
                  assumptions={msg.aiResponse.assumptions || []}
                  uncertainties={msg.aiResponse.uncertainties || []}
                  equations={msg.aiResponse.equationsUsed || []}
                  defaultExpanded={false}
                />
              )}

              {/* Follow-up suggestions */}
              {msg.aiResponse?.suggestedFollowUps && msg.aiResponse.suggestedFollowUps.length > 0 && (
                <div className="pt-2 border-t border-border/40 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono">Suggested Inquiries:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.aiResponse.suggestedFollowUps.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSubmit(item)}
                        className="text-[11px] px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1 text-left"
                      >
                        <ArrowRight className="w-2.5 h-2.5 text-primary" /> {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-card/90 border border-border/80 rounded-xl p-3.5 space-y-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Executing domain tool calling & cross-checking astronomical catalogs...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Quick Chips */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-border/40 bg-slate-900/40 flex items-center gap-2 overflow-x-auto scrollbar-none font-mono">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" /> Quick Inquiries:
          </span>
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSubmit(q)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-slate-900/70 border-t border-border/70 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-end gap-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask an astrophysics question, calculate an orbit, or request object telemetry..."
            className="min-h-[44px] max-h-32 text-xs font-mono bg-slate-950 border-slate-800 focus-visible:ring-primary text-slate-100 resize-none"
            rows={1}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-11 px-4 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 font-mono text-xs gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};
