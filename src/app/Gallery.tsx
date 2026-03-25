"use client";

import { useState } from "react";
import Link from "next/link";
import type { GalleryImage } from "@/app/types/gallery";

const PREVIEW_COUNT = 8;

export function GalleryLightbox({
  items,
  lightbox,
  setLightbox,
}: {
  items: { src: string; alt: string; type?: "image" | "video" }[];
  lightbox: number | null;
  setLightbox: (v: number | null) => void;
}) {
  if (lightbox === null) return null;
  const current = items[lightbox];
  const isVideo = current.type === "video";

  return (
    <div className="gallery-lightbox" onClick={() => setLightbox(null)}>
      <button className="gallery-lightbox-close" onClick={() => setLightbox(null)}>
        &times;
      </button>
      <button
        className="gallery-lightbox-prev"
        onClick={(e) => {
          e.stopPropagation();
          setLightbox(lightbox === 0 ? items.length - 1 : lightbox - 1);
        }}
      >
        &#8249;
      </button>
      {isVideo ? (
        <video
          src={current.src}
          controls
          autoPlay
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: "90vw", maxHeight: "80vh" }}
        />
      ) : (
        <img
          src={current.src}
          alt={current.alt}
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <button
        className="gallery-lightbox-next"
        onClick={(e) => {
          e.stopPropagation();
          setLightbox(lightbox === items.length - 1 ? 0 : lightbox + 1);
        }}
      >
        &#8250;
      </button>
      <p className="gallery-lightbox-caption">{current.alt}</p>
    </div>
  );
}

export default function Gallery({ images }: { images: GalleryImage[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const preview = images.slice(0, PREVIEW_COUNT);
  const hasMore = images.length > PREVIEW_COUNT;

  if (images.length === 0) return null;

  return (
    <div id="gallery" className="gallery-section">
      <div className="container">
        <div className="wow fadeIn" data-wow-duration="1s" data-wow-delay="0.1s" suppressHydrationWarning>
          <h2 className="block-title text-center">Notre Galerie</h2>
          <p className="gallery-subtitle text-center">
            Découvrez l'univers Captain Purunchi en images
          </p>
        </div>

        <div className="gallery-grid">
          {preview.map((item, i) => (
            <div
              key={item.id}
              className="gallery-item"
              onClick={() => setLightbox(i)}
            >
              {item.type === "video" ? (
                <video src={item.src} muted playsInline />
              ) : (
                <img src={item.src} alt={item.alt} />
              )}
              <div className="gallery-overlay">
                {item.type === "video" && (
                  <span className="gallery-play-icon">&#9654;</span>
                )}
                <span className="gallery-overlay-text">{item.alt}</span>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="gallery-more">
            <Link href="/galerie" className="gallery-more-btn hvr-underline-from-center">
              Voir toute la galerie
            </Link>
          </div>
        )}
      </div>

      <GalleryLightbox items={preview} lightbox={lightbox} setLightbox={setLightbox} />
    </div>
  );
}
