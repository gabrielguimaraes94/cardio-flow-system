import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from 'react-query';
import { Toaster } from 'sonner';
import { AngioplastyCreate } from './pages/AngioplastyCreate';
import { AngioplastyList } from './pages/AngioplastyList';
import { AngioplastyView } from './pages/AngioplastyView';

function App() {
  return (
    <BrowserRouter>
      <QueryClient>
        <Toaster />
        <Routes>
          <Route path="/angioplasty/create" element={<AngioplastyCreate />} />
          <Route path="/angioplasty/list" element={<AngioplastyList />} />
          <Route path="/angioplasty/view/:id" element={<AngioplastyView />} />
        </Routes>
      </QueryClient>
    </BrowserRouter>
  );
}

export default App;
