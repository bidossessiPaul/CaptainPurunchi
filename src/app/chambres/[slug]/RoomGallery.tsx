"use client";

import { useState } from "react";

export default function RoomGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) return null;

  const prev = () => setActive(active === 0 ? images.length - 1 : active - 1);
  const next = () => setActive(active === images.length - 1 ? 0 : active + 1);

  return (
    <div className="rd-gallery">
      <div className="rd-gallery-main">
        <img src={images[active]} alt={`${name} — photo ${active + 1}`} className="rd-gallery-img" />
        {images.length > 1 && (
          <>
            <button className="rd-gallery-nav rd-gallery-prev" onClick={prev} aria-label="Photo précédente">&#8249;</button>
            <button className="rd-gallery-nav rd-gallery-next" onClick={next} aria-label="Photo suivante">&#8250;</button>
            <div className="rd-gallery-counter">{active + 1} / {images.length}</div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="rd-gallery-thumbs">
          {images.map((src, i) => (
            <button
              key={i}
              className={`rd-gallery-thumb${i === active ? " active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`Photo ${i + 1}`}
            >
              <img src={src} alt={`${name} — miniature ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
