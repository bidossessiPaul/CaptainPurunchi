"use client";

import { useState } from "react";

interface Specialty {
  id: string;
  title: string;
  description: string;
  src: string;
}

export default function Specialties({ items }: { items: Specialty[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (items.length === 0) return null;

  return (
    <section className="specialties-section">
      <div className="specialties-overlay" />
      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <div className="wow fadeIn" data-wow-duration="1s" data-wow-delay="0.1s">
          <h2 className="block-title color-white text-center">
            Nos Sp&eacute;cialit&eacute;s
          </h2>
          <h5 className="title-caption text-center">
            D&eacute;couvrez les cr&eacute;ations signatures de notre chef,
            pr&eacute;par&eacute;es chaque jour avec des produits frais
            de la p&ecirc;che locale et des ingr&eacute;dients de saison.
          </h5>
        </div>

        <div className="specialties-grid">
          {items.map((item) => {
            const isHovered = hoveredId === item.id;
            return (
              <div
                key={item.id}
                className="specialty-card"
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="specialty-img-wrapper">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="specialty-img"
                    loading="lazy"
                  />
                  <div
                    className="specialty-overlay-hover"
                    style={{ opacity: isHovered ? 1 : 0 }}
                  />
                  <div
                    className="specialty-info"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? "translateY(0)" : "translateY(10px)",
                    }}
                  >
                    <span className="specialty-title">{item.title}</span>
                    <div className="specialty-line" />
                    <span className="specialty-desc">{item.description}</span>
                  </div>
                </div>
                <div className="specialty-name">{item.title}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
