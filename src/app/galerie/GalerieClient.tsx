"use client";

import { useState } from "react";
import type { GalleryImage } from "@/app/types/gallery";
import { GalleryLightbox } from "../Gallery";

export default function GalerieClient({ images }: { images: GalleryImage[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <>
      <div className="container">
        <div className="gallery-grid gallery-grid-full">
          {images.map((item, i) => (
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
      </div>

      <GalleryLightbox items={images} lightbox={lightbox} setLightbox={setLightbox} />
    </>
  );
}
