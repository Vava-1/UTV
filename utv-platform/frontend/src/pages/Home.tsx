import React from "react";
import { HeroSection } from "@/components/HeroSection";
import { UTVAssistant } from "@/components/UTVAssistant";
import { MissionSection } from "@/components/MissionSection";

export function Home() {
  return (
    <div>
      <HeroSection />
      <MissionSection />
      <UTVAssistant />
    </div>
  );
}

