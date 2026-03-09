"use client";

import { useState, useEffect } from "react";
import type { HeroSlide } from "@/app/types/hero";

const DEFAULTS = {
  title: "Captain Purunchi",
  subtitle: "Restaurant, Bar, Rooftop & Hébergement",
  caption: "Une expérience culinaire unique à Cotonou",
};

export default function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const activeSlide = slides[current];

  return (
    <div id="banner" className="hero-slideshow">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`hero-slide ${i === current ? "active" : ""}`}
          style={{ backgroundImage: `url(${slide.src})` }}
        />
      ))}
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1>{activeSlide.title || DEFAULTS.title}</h1>
        <h2>{activeSlide.subtitle || DEFAULTS.subtitle}</h2>
        <p>{activeSlide.caption || DEFAULTS.caption}</p>
        <div className="book-btn">
          <a href="/reservation" className="table-btn hvr-underline-from-center">
            Réserver une table
          </a>
        </div>
        <a href="#about">
          <div className="mouse"></div>
        </a>
      </div>
    </div>
  );
}
