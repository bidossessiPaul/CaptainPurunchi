"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { LuMartini, LuWine, LuCoffee, LuCitrus, LuBeer, LuZap, LuFish, LuFlame, LuUtensils, LuGlassWater } from "react-icons/lu";
import type { MenuCategoryWithItems } from "@/app/types/menu";

const iconMap: Record<string, ReactNode> = {
  martini: <LuMartini size={18} />,
  wine: <LuWine size={18} />,
  coffee: <LuCoffee size={18} />,
  citrus: <LuCitrus size={18} />,
  beer: <LuBeer size={18} />,
  zap: <LuZap size={18} />,
  fish: <LuFish size={18} />,
  flame: <LuFlame size={18} />,
  utensils: <LuUtensils size={18} />,
  "glass-water": <LuGlassWater size={18} />,
};

export default function MenuTabs({ categories }: { categories: MenuCategoryWithItems[] }) {
  const [active, setActive] = useState(0);

  if (categories.length === 0) return null;

  return (
    <div id="menu" className="menu-section">
      <div className="container">
        <div className="menu-section-header">
          <h2 className="block-title text-center">Notre Carte</h2>
          <p className="title-caption text-center">
            Des saveurs authentiques, des produits frais et des recettes
            qui vous transportent au c&oelig;ur de l&apos;oc&eacute;an.
          </p>
        </div>

        {/* Tabs */}
        <div className="menu-tabs-nav">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              className={`menu-tab-btn ${i === active ? "is-active" : ""}`}
              onClick={() => setActive(i)}
            >
              <span className="menu-tab-icon">{iconMap[cat.icon] || <LuUtensils size={18} />}</span>
              <span className="menu-tab-label">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="menu-tabs-content">
          <div className="menu-items-grid">
            {categories[active].items.map((item, idx) => (
              <div key={item.id} className="menu-item" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="menu-item-header">
                  <h3 className="menu-item-name">{item.name}</h3>
                  <span className="menu-item-dots"></span>
                  <span className="menu-item-price">{item.price}</span>
                </div>
                <p className="menu-item-desc">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="menu-see-more">
          <Link href="/menu">Voir la carte compl&egrave;te</Link>
        </div>
      </div>
    </div>
  );
}
