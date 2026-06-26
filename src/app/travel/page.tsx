import NavBar from "@/components/NavBar";
import Footer from "@/components/sections/Footer";
import TravelPageContent from "./TravelPageContent";

export default function TravelPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />
      <TravelPageContent />
      <Footer />
    </div>
  );
}
