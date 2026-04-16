"use client";

import { useEffect, useState } from "react";
import HeroSection from "@/components/sections/HeroSection";
import OurStorySection from "@/components/sections/OurStorySection";
import ScheduleSection from "@/components/sections/ScheduleSection";
import FaqSection from "@/components/sections/FaqSection";
import RsvpSection from "@/components/sections/RsvpSection";
import Footer from "@/components/sections/Footer";

function SectionDivider() {
  return (
    <div style={{ background: "var(--white)", padding: "0 48px" }}>
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
        <div
          style={{
            width: 7,
            height: 7,
            background: "transparent",
            border: "1px solid var(--mauve)",
            transform: "rotate(45deg)",
            flexShrink: 0,
            opacity: 0.6,
          }}
        />
        <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
      </div>
    </div>
  );
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean>(false);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [tokenUsed, setTokenUsed] = useState<boolean>(false);
  const [tokenChecked, setTokenChecked] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");

    if (!t) {
      setTokenChecked(true);
      return;
    }

    setToken(t);

    fetch(`/api/token?token=${encodeURIComponent(t)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setTokenValid(true);
          setGuestName(data.name || null);
        } else if (data.reason === "used") {
          setTokenUsed(true);
        }
      })
      .finally(() => setTokenChecked(true));
  }, []);

  return (
    <main>
      <HeroSection />
      <OurStorySection />
      <SectionDivider />
      <ScheduleSection />
      <SectionDivider />
      <FaqSection />
      <RsvpSection
        token={token}
        tokenValid={tokenValid}
        tokenChecked={tokenChecked}
        tokenUsed={tokenUsed}
        guestName={guestName}
      />
      <Footer />
    </main>
  );
}
