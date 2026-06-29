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
  {
    src: photo1,
    alt: "Kaia and Richard gazing at each other against a black background",
  },
  {
    src: photo2,
    alt: "Kaia and Richard sitting together on the floor beside potted plants",
  },
  {
    src: photo3,
    alt: "Richard kissing Kaia on the forehead as she smiles with eyes closed",
  },
  {
    src: photo4,
    alt: "Kaia's arms wrapped around Richard's shoulders, her engagement ring visible",
  },
  {
    src: photo5,
    alt: "Kaia and Richard seated together on a white curved sofa in a minimalist room",
  },
  {
    src: photo6,
    alt: "Kaia and Richard smiling at the camera in a close-up portrait",
  },
  {
    src: photo7,
    alt: "Kaia and Richard walking hand in hand toward the camera, laughing",
  },
  {
    src: photo8,
    alt: "Kaia and Richard with foreheads together, smiling beside a fiddle-leaf fig plant",
  },
  {
    src: photo9,
    alt: "Close portrait of Kaia and Richard resting their foreheads together indoors",
  },
  {
    src: photo10,
    alt: "Kaia and Richard face to face with eyes closed, sharing a quiet moment by a houseplant",
  },
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
          <div style={{ marginTop: 12 }}>
            <GalleryGrid photos={photos} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
