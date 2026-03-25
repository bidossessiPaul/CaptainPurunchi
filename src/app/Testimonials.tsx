"use client";

import type { Testimonial } from "@/app/types/testimonial";

function Stars({ count }: { count: number }) {
  const full = Math.floor(count);
  const half = count % 1 >= 0.5;
  return (
    <div className="testimonial-stars">
      {Array.from({ length: full }).map((_, i) => (
        <i key={i} className="fa fa-star" aria-hidden="true"></i>
      ))}
      {half && <i className="fa fa-star-half-o" aria-hidden="true"></i>}
    </div>
  );
}

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  // Double the list for seamless infinite scroll
  const items = [...testimonials, ...testimonials];

  return (
    <div id="testimonials" className="testimonials-section">
      <div className="container">
        <div className="wow fadeIn" data-wow-duration="1s" data-wow-delay="0.1s" suppressHydrationWarning>
          <h2 className="block-title text-center">Ce que disent nos clients</h2>
          <p className="testimonials-subtitle text-center">
            Des expériences authentiques partagées par ceux qui nous font confiance.
          </p>
        </div>
      </div>

      <div className="testimonials-track-wrapper">
        <div className="testimonials-track">
          {items.map((t, i) => (
            <div key={i} className="testimonial-card">
              {t.image && (
                <div className="testimonial-image">
                  <img src={t.image} alt={t.name} />
                </div>
              )}
              <Stars count={t.stars} />
              <p className="testimonial-text">&laquo; {t.text} &raquo;</p>
              <div className="testimonial-author">
                {t.avatar ? (
                  <img
                    className="testimonial-avatar-img"
                    src={t.avatar}
                    alt={t.name}
                  />
                ) : (
                  <div className="testimonial-avatar">
                    <i className="fa fa-user" aria-hidden="true"></i>
                  </div>
                )}
                <div>
                  <h4 className="testimonial-name">{t.name}</h4>
                  <p className="testimonial-role">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
