import React from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { GlobalAudioPlayer } from './GlobalAudioPlayer';
import { ChatWidget } from './ChatWidget';

export function Layout() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <main className="min-h-screen pb-24">
        <Outlet />
      </main>
      <Footer />
      <GlobalAudioPlayer />
      <ChatWidget />
    </div>
  );
}
