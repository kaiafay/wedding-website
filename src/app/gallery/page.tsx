import NavBar from "@/components/NavBar";
import Footer from "@/components/sections/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import GalleryGrid from "@/components/GalleryGrid";

import photo1 from "../../../public/images/gallery/0G5A5034.webp";
import photo2 from "../../../public/images/gallery/0G5A5103.webp";
import photo3 from "../../../public/images/gallery/0G5A5109.webp";
import photo4 from "../../../public/images/gallery/0G5A5170.webp";
import photo5 from "../../../public/images/gallery/0G5A5185.webp";
import photo6 from "../../../public/images/gallery/0G5A5259.webp";
import photo7 from "../../../public/images/gallery/0G5A5274.webp";
import photo8 from "../../../public/images/gallery/0G5A5285.webp";
import photo9 from "../../../public/images/gallery/0G5A5360.webp";
import photo10 from "../../../public/images/gallery/0G5A5517.webp";

const photos = [
  photo1, photo2, photo3, photo4, photo5,
  photo6, photo7, photo8, photo9, photo10,
];

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
        <div className="gallery-inner" style={{ maxWidth: 900, margin: "0 auto", padding: "0 48px" }}>
          <SectionHeader label="Photos" title="Gallery" />
          <GalleryGrid photos={photos} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
