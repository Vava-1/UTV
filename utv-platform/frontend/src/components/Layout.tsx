import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { GlobalAudioPlayer } from './GlobalAudioPlayer';
import { UTVAssistant } from './UTVAssistant';

export function Layout() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Header />
      <main className="pt-16 min-h-screen pb-24">
        <Outlet />
      </main>
      <GlobalAudioPlayer />
      <UTVAssistant />
    </div>
  );
}
