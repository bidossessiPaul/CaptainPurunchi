"use client";

import { useRef, useState } from "react";
import Link from "next/link";

const VIDEO_URL =
  "https://res.cloudinary.com/di8wt4y4s/video/upload/v1780580279/captain-purunchi/videos/promo-culinaire.mp4";

export default function VideoPromo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="videopromo-section">
      <div className="container">
        <div className="videopromo-inner">

          {/* Colonne vidéo (format story 9:16) */}
          <div className="videopromo-col-video">
            <div className="videopromo-wrapper">
              <video
                ref={videoRef}
                src={VIDEO_URL}
                className="videopromo-video"
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="videopromo-overlay" />
              <div className="videopromo-controls">
                <button
                  className="videopromo-btn"
                  onClick={togglePlay}
                  aria-label={playing ? "Pause" : "Lecture"}
                >
                  {playing ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </button>
                <button
                  className="videopromo-btn"
                  onClick={toggleMute}
                  aria-label={muted ? "Activer le son" : "Couper le son"}
                >
                  {muted ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11 5L6 9H2v6h4l5 4V5z" />
                      <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11 5L6 9H2v6h4l5 4V5z" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Colonne texte */}
          <div className="videopromo-col-text">
            <span className="videopromo-label">Notre cuisine</span>
            <h2 className="videopromo-title">
              Une aventure culinaire à chaque assiette
            </h2>
            <div className="videopromo-divider" />
            <p className="videopromo-text">
              Chaque jour, notre chef embarque pour une nouvelle aventure :
              sélection des meilleurs poissons frais du port de Cotonou,
              crustacés vivants, épices soigneusement choisies.
            </p>
            <p className="videopromo-text">
              De la langouste grillée au feu de bois au poisson braisé sauce
              tomate, chaque plat est une invitation à découvrir les saveurs
              authentiques de l&apos;Atlantique.
            </p>
            <ul className="videopromo-list">
              <li>Produits frais de la pêche locale chaque matin</li>
              <li>Recettes du chef élaborées avec passion</li>
              <li>Grillades au feu de bois pour un goût unique</li>
              <li>Cadre rooftop avec vue sur Cotonou</li>
            </ul>
            <Link href="/specialites" className="videopromo-cta">
              Découvrir nos spécialités
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
