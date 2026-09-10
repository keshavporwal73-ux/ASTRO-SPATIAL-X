import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { routes } from '@/routes';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </AppLayout>
      <Toaster position="top-right" richColors theme="dark" />
    </BrowserRouter>
  );
}
