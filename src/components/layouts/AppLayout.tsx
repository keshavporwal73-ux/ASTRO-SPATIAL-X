import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AstroLogo } from '@/components/brand/AstroLogo';
import {
  Telescope,
  Bot,
  Orbit,
  Calculator,
  FlaskConical,
  FolderKanban,
  Sparkles,
  LayoutDashboard,
  Menu,
  X,
  Compass,
  Globe,
  Radio,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: '3D Spatial Lab', href: '/spatial', icon: Orbit, badge: '3D/XR' },
  { name: 'AI Observatory', href: '/ai-observatory', icon: Bot, badge: 'AI' },
  { name: 'Visualizations', href: '/visualizations', icon: Globe },
  { name: 'Calculator', href: '/calculator', icon: Calculator },
  { name: 'Research Lab', href: '/research-lab', icon: FlaskConical },
  { name: 'Workspace', href: '/workspace', icon: FolderKanban },
  { name: 'Object Catalog', href: '/objects', icon: Telescope },
  { name: 'APOD Archive', href: '/apod', icon: Sparkles },
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-full bg-[#05070E] text-slate-100 font-sans antialiased selection:bg-primary/30 selection:text-white">
      {/* Desktop Sidebar (hidden on mobile, visible on md+) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-border/80 bg-slate-950/90 backdrop-blur-xl fixed inset-y-0 left-0 z-30">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-4 border-b border-border/80">
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <AstroLogo size="sm" showText={true} showTagline={false} />
          </Link>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 font-mono text-xs">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary/20 text-white border border-primary/50 shadow-[0_0_10px_rgba(99,102,241,0.2)] font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] bg-primary/30 text-cyan-300 px-1.5 py-0.2 rounded font-mono border border-primary/40">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer System Status */}
        <div className="p-4 border-t border-border/80 bg-slate-950/60 font-mono text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              IAU J2000 Engine
            </span>
            <span className="text-cyan-400">v2.4</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Astropy / NASA JPL Horizons
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 md:pl-64 flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 sticky top-0 z-20 border-b border-border/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
          {/* Mobile Menu Trigger (md:hidden) */}
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden h-9 w-9 p-0 text-slate-300">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-slate-950 border-r border-border/80 text-slate-100 w-64 p-0">
                <div className="h-16 flex items-center px-4 border-b border-border/80">
                  <AstroLogo size="sm" showText={true} showTagline={false} />
                </div>

                <div className="p-3 space-y-1 font-mono text-xs">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                          isActive
                            ? 'bg-primary/20 text-white border border-primary/50'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-slate-400" />
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>

            <span className="font-mono text-xs text-slate-400 hidden sm:inline-block">
              Astrophysics Laboratory & Intelligence Workstation
            </span>
          </div>

          {/* Topbar Right Telemetry */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="hidden lg:inline-flex items-center gap-1.5 text-slate-400 text-[11px] bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
              <Compass className="w-3.5 h-3.5 text-primary" /> Frames: ICRS • Galactic • AltAz
            </span>
            <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-[11px] text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              Decoupled Science Engine
            </div>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
