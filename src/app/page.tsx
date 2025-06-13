import Image from "next/image";
import styles from "./page.module.css";
import GoogleMap from "../components/GoogleMap";
import { samplePins, mapCenter } from "../data/mapData";

export default function Home() {
  // Replace with your actual Google Maps API key
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE";

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        
        <div style={{ margin: "2rem 0", textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Interactive Map with Pins</h1>
          <p style={{ color: "#666", marginBottom: "2rem" }}>
            Explore popular locations across the United States
          </p>
        </div>

        {/* Google Maps Component */}
        <div style={{ width: "100%", height: "500px", margin: "2rem 0", position: "relative" }}>
          <GoogleMap
            apiKey={GOOGLE_MAPS_API_KEY}
            center={mapCenter}
            zoom={4}
            pins={samplePins}
            className="w-full h-full shadow-lg"
          />
        </div>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Featured Locations</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem", margin: "1rem 0" }}>
            {samplePins.slice(0, 4).map((pin) => (
              <div key={pin.id} style={{ 
                padding: "1rem", 
                border: "1px solid #ddd", 
                borderRadius: "8px", 
                backgroundColor: "#f9f9f9" 
              }}>
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>{pin.title}</h3>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>{pin.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
