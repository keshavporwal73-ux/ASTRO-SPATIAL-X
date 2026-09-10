import React from 'react';
import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { DashboardPage } from '@/pages/DashboardPage';
import { SpatialObservatoryPage } from '@/pages/SpatialObservatoryPage';
import { AIObservatoryPage } from '@/pages/AIObservatoryPage';
import { VisualizationsPage } from '@/pages/VisualizationsPage';
import { CalculatorPage } from '@/pages/CalculatorPage';
import { ResearchLabPage } from '@/pages/ResearchLabPage';
import { InvestigationWorkspacePage } from '@/pages/InvestigationWorkspacePage';
import { ObjectExplorerPage } from '@/pages/ObjectExplorerPage';
import { APODPage } from '@/pages/APODPage';

export interface AppRoute {
  name: string;
  path: string;
  element: React.ReactNode;
}

export const routes: AppRoute[] = [
  {
    name: 'Dashboard',
    path: '/',
    element: <DashboardPage />,
  },
  {
    name: '3D Spatial Observatory',
    path: '/spatial',
    element: <SpatialObservatoryPage />,
  },
  {
    name: 'AI Observatory',
    path: '/ai-observatory',
    element: <AIObservatoryPage />,
  },
  {
    name: 'Visualizations',
    path: '/visualizations',
    element: <VisualizationsPage />,
  },
  {
    name: 'Calculator',
    path: '/calculator',
    element: <CalculatorPage />,
  },
  {
    name: 'Research Lab',
    path: '/research-lab',
    element: <ResearchLabPage />,
  },
  {
    name: 'Investigation Workspace',
    path: '/workspace',
    element: <InvestigationWorkspacePage />,
  },
  {
    name: 'Object Explorer',
    path: '/objects',
    element: <ObjectExplorerPage />,
  },
  {
    name: 'APOD Archive',
    path: '/apod',
    element: <APODPage />,
  },
  {
    name: 'Catch All',
    path: '*',
    element: <Navigate to="/" replace />,
  },
];
