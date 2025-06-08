
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AngioplastyCreate } from './pages/AngioplastyCreate';
import { AngioplastyList } from './pages/AngioplastyList';
import { AngioplastyView } from './pages/AngioplastyView';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Routes>
          <Route path="/angioplasty/create" element={<AngioplastyCreate />} />
          <Route path="/angioplasty/list" element={<AngioplastyList />} />
          <Route path="/angioplasty/view/:id" element={<AngioplastyView />} />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
