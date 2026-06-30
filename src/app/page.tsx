import HeroSection from "@/components/sections/HeroSection";
import OurStorySection from "@/components/sections/OurStorySection";
import ScheduleSection from "@/components/sections/ScheduleSection";
import FaqSection from "@/components/sections/FaqSection";
import RsvpSection from "@/components/sections/RsvpSection";
import Footer from "@/components/sections/Footer";
import NavBar from "@/components/NavBar";

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
  return (
    <main>
      <NavBar />
      <HeroSection />
      <OurStorySection />
      <SectionDivider />
      <ScheduleSection />
      <SectionDivider />
      <FaqSection />
      <RsvpSection />
      <Footer />
    </main>
  );
}
