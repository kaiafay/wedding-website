"use client";

import { useEffect, useState } from "react";
import HeroSection from "@/components/sections/HeroSection";
import OurStorySection from "@/components/sections/OurStorySection";
import ScheduleSection from "@/components/sections/ScheduleSection";
import RsvpSection from "@/components/sections/RsvpSection";

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
      <ScheduleSection />
      <RsvpSection
        token={token}
        tokenValid={tokenValid}
        tokenChecked={tokenChecked}
        tokenUsed={tokenUsed}
        guestName={guestName}
      />
    </main>
  );
}
