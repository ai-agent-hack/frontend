import GoogleMap from "../components/GoogleMap";
import { samplePins, mapCenter } from "../data/mapData";

export default function Home() {
  // Replace with your actual Google Maps API key
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <GoogleMap
        apiKey={GOOGLE_MAPS_API_KEY}
        center={mapCenter}
        zoom={4}
        pins={samplePins}
      />
    </div>
  );
}
