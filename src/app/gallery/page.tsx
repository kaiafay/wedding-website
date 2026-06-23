import NavBar from "@/components/NavBar";
import Footer from "@/components/sections/Footer";
import SectionHeader from "@/components/ui/SectionHeader";

export default function GalleryPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <style>{`
        @media (max-width: 480px) {
          .gallery-inner { padding: 0 24px !important; }
        }
      `}</style>

      <NavBar />

      <section style={{ background: "var(--white)", padding: "120px 0 96px", flex: 1 }}>
        <div className="gallery-inner" style={{ maxWidth: 900, margin: "0 auto", padding: "0 80px" }}>
          <SectionHeader label="Photos" title="Gallery" />

          <div style={{ textAlign: "center", padding: "48px 0 24px" }}>
            <p
              className="font-serif italic"
              style={{ fontSize: 20, color: "var(--subtle)", lineHeight: 1.7 }}
            >
              Photos coming soon.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
