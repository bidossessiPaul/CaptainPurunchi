"use client";

import { useState } from "react";
import Link from "next/link";

const INITIAL_COUNT = 3;

interface Specialty {
  id: string;
  title: string;
  description: string;
  src: string;
}

export default function Specialties({ items }: { items: Specialty[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  if (items.length === 0) return null;

  const visible = showAll ? items : items.slice(0, INITIAL_COUNT);
  const hasMore = items.length > INITIAL_COUNT;

  return (
    <section className="specialties-section" id="specialties">
      <div className="specialties-overlay" />
      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <div className="wow fadeIn" data-wow-duration="1s" data-wow-delay="0.1s" suppressHydrationWarning>
          <h2 className="block-title color-white text-center">
            Nos Spécialités
          </h2>
          <h5 className="title-caption text-center">
            Découvrez les créations signatures de notre chef,
            préparées chaque jour avec des produits frais
            de la pêche locale et des ingrédients de saison.
          </h5>
        </div>

        <div className="specialties-grid">
          {visible.map((item) => {
            const isHovered = hoveredId === item.id;
            return (
              <Link
                key={item.id}
                href={`/specialites/${item.id}`}
                className="specialty-card"
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ textDecoration: "none" }}
              >
                <div className="specialty-img-wrapper">
                  {item.src ? (
                    <img
                      src={item.src}
                      alt={item.title}
                      className="specialty-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="specialty-img specialty-img-placeholder" />
                  )}
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
                    <span className="specialty-more-link">Voir le détail →</span>
                  </div>
                </div>
                <div className="specialty-name">{item.title}</div>
              </Link>
            );
          })}
        </div>

        {hasMore && (
          <div className="text-center mt-4">
            <button
              className="btn btn-outline-light specialty-voir-plus"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? (
                <><i className="iconoir-arrow-up me-2"></i>Voir moins</>
              ) : (
                <><i className="iconoir-arrow-down me-2"></i>Voir les {items.length - INITIAL_COUNT} autres spécialités</>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
