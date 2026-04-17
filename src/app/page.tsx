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

type TokenState =
  | { status: "loading" }
  | { status: "none" }
  | { status: "valid"; name: string | null; token: string }
  | { status: "used" };

export default function Home() {
  const [tokenState, setTokenState] = useState<TokenState>({ status: "loading" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");

    if (!t) {
      setTokenState({ status: "none" });
      return;
    }

    fetch(`/api/token?token=${encodeURIComponent(t)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setTokenState({ status: "valid", name: data.name || null, token: t });
        } else if (data.reason === "used") {
          setTokenState({ status: "used" });
        } else {
          setTokenState({ status: "none" });
        }
      })
      .catch(() => setTokenState({ status: "none" }));
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
        token={tokenState.status === "valid" ? tokenState.token : null}
        tokenValid={tokenState.status === "valid"}
        tokenChecked={tokenState.status !== "loading"}
        tokenUsed={tokenState.status === "used"}
        guestName={tokenState.status === "valid" ? tokenState.name : null}
      />
      <Footer />
    </main>
  );
}
