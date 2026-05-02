import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { GlobalAudioPlayer } from './GlobalAudioPlayer';
import { ChatWidget } from './ChatWidget';

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
      <GlobalAudioPlayer />
      <ChatWidget />
    </div>
  );
}
