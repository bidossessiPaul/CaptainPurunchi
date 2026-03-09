"use client";

import { useState } from "react";
import type { DailyDish } from "@/app/types/daily-dish";
import OrderModal from "./OrderModal";

const CATEGORY_ORDER = ["Entrée", "Plat", "Accompagnement", "Dessert", "Boisson", "Spécial"];

function groupByCategory(dishes: DailyDish[]) {
  const map = new Map<string, DailyDish[]>();
  for (const d of dishes) {
    const arr = map.get(d.category) || [];
    arr.push(d);
    map.set(d.category, arr);
  }
  const sorted: { category: string; dishes: DailyDish[] }[] = [];
  for (const cat of CATEGORY_ORDER) {
    if (map.has(cat)) {
      sorted.push({ category: cat, dishes: map.get(cat)! });
      map.delete(cat);
    }
  }
  for (const [cat, dishes] of map) {
    sorted.push({ category: cat, dishes });
  }
  return sorted;
}

export default function MenuDuJour({ dishes, whatsapp }: { dishes: DailyDish[]; whatsapp: string }) {
  const [orderOpen, setOrderOpen] = useState(false);

  if (dishes.length === 0) return null;

  const groups = groupByCategory(dishes);

  return (
    <div id="menu-du-jour" className="menu-jour-section">
      <div className="container">
        <div className="text-center">
          <h2 className="block-title">Menu du Jour</h2>
          <p className="menu-jour-subtitle">
            Découvrez nos plats frais préparés spécialement pour aujourd&apos;hui
          </p>
        </div>

        <div className="menu-jour-grid">
          {groups.map((group) => (
            <div key={group.category} className="menu-jour-category">
              <h3 className="menu-jour-cat-title">{group.category}</h3>
              <div className="menu-jour-dishes">
                {group.dishes.map((dish) => (
                  <div key={dish.id} className="menu-jour-dish">
                    {dish.photo && (
                      <div className="menu-jour-dish-img">
                        <img src={dish.photo} alt={dish.name} />
                      </div>
                    )}
                    <div className="menu-jour-dish-info">
                      <div className="menu-jour-dish-header">
                        <h4 className="menu-jour-dish-name">{dish.name}</h4>
                        <span className="menu-jour-dish-price">{dish.price}</span>
                      </div>
                      {dish.description && (
                        <p className="menu-jour-dish-desc">{dish.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="menu-jour-cta">
          <button
            className="menu-jour-order-btn hvr-underline-from-center"
            onClick={() => setOrderOpen(true)}
          >
            <i className="fa fa-shopping-cart" style={{ marginRight: 8 }}></i>
            Commander maintenant
          </button>
        </div>
      </div>

      {orderOpen && (
        <OrderModal
          dishes={dishes}
          whatsapp={whatsapp}
          onClose={() => setOrderOpen(false)}
        />
      )}
    </div>
  );
}
