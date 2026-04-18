import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './app/store';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import LogInteraction from './pages/LogInteraction';
import InteractionsList from './pages/InteractionsList';
import HCPProfile from './pages/HCPProfile';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Inter, sans-serif' }}>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/log" element={<LogInteraction />} />
              <Route path="/interactions" element={<InteractionsList />} />
              <Route path="/hcp-profile" element={<HCPProfile />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </Provider>
  );
}