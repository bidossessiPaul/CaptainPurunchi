"use client";

import { useState, type ReactNode } from "react";
import { LuMartini, LuWine, LuCoffee, LuCitrus, LuBeer, LuZap, LuFish, LuFlame, LuUtensils, LuGlassWater } from "react-icons/lu";
import type { MenuCategoryWithItems, MenuItem } from "@/app/types/menu";

const iconMap: Record<string, (size: number) => ReactNode> = {
  martini: (s) => <LuMartini size={s} />,
  wine: (s) => <LuWine size={s} />,
  coffee: (s) => <LuCoffee size={s} />,
  citrus: (s) => <LuCitrus size={s} />,
  beer: (s) => <LuBeer size={s} />,
  zap: (s) => <LuZap size={s} />,
  fish: (s) => <LuFish size={s} />,
  flame: (s) => <LuFlame size={s} />,
  utensils: (s) => <LuUtensils size={s} />,
  "glass-water": (s) => <LuGlassWater size={s} />,
};

function getIcon(key: string, size: number): ReactNode {
  return (iconMap[key] || iconMap.utensils)(size);
}

interface CartItem {
  item: MenuItem;
  categoryName: string;
  qty: number;
}

function parsePrice(price: string): number {
  // Prices like "3.000 F", "25.000 / 2.500 F" — dots are thousands separators
  // For dual prices (bottle / glass), take the second (unit) price
  const parts = price.split("/");
  const raw = parts.length > 1 ? parts[1] : parts[0];
  // Remove everything except digits → "3.000 F" → "3000"
  const digits = raw.replace(/[^\d]/g, "");
  const n = parseInt(digits, 10);
  return isNaN(n) ? 0 : n;
}

function formatTotal(amount: number): string {
  return amount.toLocaleString("fr-FR") + " FCFA";
}

export default function MenuPageClient({
  categories,
  whatsapp,
}: {
  categories: MenuCategoryWithItems[];
  whatsapp: string;
}) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [showOrder, setShowOrder] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"info" | "success">("info");

  if (categories.length === 0) {
    return <p className="text-center" style={{ padding: "60px 0", color: "#888" }}>Aucun menu disponible pour le moment.</p>;
  }

  const filtered = activeTab
    ? categories.filter((c) => c.id === activeTab)
    : categories;

  const addToCart = (item: MenuItem, categoryName: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(item.id);
      next.set(item.id, {
        item,
        categoryName,
        qty: (existing?.qty || 0) + 1,
      });
      return next;
    });
  };

  const updateQty = (itemId: string, delta: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(itemId);
      if (!existing) return prev;
      const newQty = existing.qty + delta;
      if (newQty <= 0) {
        next.delete(itemId);
      } else {
        next.set(itemId, { ...existing, qty: newQty });
      }
      return next;
    });
  };

  const totalItems = Array.from(cart.values()).reduce((s, i) => s + i.qty, 0);
  const totalAmount = Array.from(cart.values()).reduce(
    (s, i) => s + parsePrice(i.item.price) * i.qty,
    0
  );

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || cart.size === 0) return;
    setSubmitting(true);

    const items = Array.from(cart.values()).map((i) => ({
      dishId: i.item.id,
      dishName: i.item.name,
      category: i.categoryName,
      price: i.item.price,
      quantity: i.qty,
    }));

    const today = new Date().toISOString().split("T")[0];

    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        items,
        totalAmount: formatTotal(totalAmount),
        notes: notes.trim(),
        orderDate: today,
      }),
    });

    setSubmitting(false);
    setStep("success");
  };

  const whatsappMessage = () => {
    const lines = [`Bonjour Captain Purunchi ! Je voudrais commander :`];
    for (const ci of cart.values()) {
      lines.push(`- ${ci.qty}x ${ci.item.name} (${ci.item.price})`);
    }
    lines.push(`\nTotal : ${formatTotal(totalAmount)}`);
    lines.push(`Nom : ${name}`);
    lines.push(`Tél : ${phone}`);
    if (notes) lines.push(`Notes : ${notes}`);
    return encodeURIComponent(lines.join("\n"));
  };

  const closeOrder = () => {
    setShowOrder(false);
    if (step === "success") {
      setCart(new Map());
      setName("");
      setPhone("");
      setNotes("");
      setStep("info");
    }
  };

  return (
    <>
      {/* Category filter tabs */}
      <div className="menu-page-tabs">
        <button
          className={`menu-page-tab ${activeTab === null ? "is-active" : ""}`}
          onClick={() => setActiveTab(null)}
        >
          <span className="menu-page-tab-icon">{getIcon("utensils", 18)}</span>
          <span>Tout</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`menu-page-tab ${activeTab === cat.id ? "is-active" : ""}`}
            onClick={() => setActiveTab(cat.id)}
          >
            <span className="menu-page-tab-icon">{getIcon(cat.icon, 18)}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* All categories */}
      {filtered.map((cat, catIdx) => (
        <section key={cat.id} className="menu-page-category" style={{ animationDelay: `${catIdx * 0.1}s` }}>
          <div className="menu-page-cat-header">
            <span className="menu-page-cat-icon">{getIcon(cat.icon, 28)}</span>
            <h2>{cat.name}</h2>
          </div>

          <div className="menu-page-items">
            {cat.items.map((item, idx) => {
              const inCart = cart.get(item.id);
              return (
                <div
                  key={item.id}
                  className={`menu-page-item ${inCart ? "in-cart" : ""}`}
                  style={{ animationDelay: `${idx * 0.04}s` }}
                >
                  <div className="menu-page-item-header">
                    <h3 className="menu-page-item-name">{item.name}</h3>
                    <span className="menu-page-item-dots"></span>
                    <span className="menu-page-item-price">{item.price}</span>
                  </div>
                  {item.description && (
                    <p className="menu-page-item-desc">{item.description}</p>
                  )}
                  <div className="menu-page-item-action">
                    {inCart ? (
                      <div className="menu-qty-controls">
                        <button
                          className="menu-qty-btn"
                          onClick={() => updateQty(item.id, -1)}
                        >
                          &minus;
                        </button>
                        <span className="menu-qty-value">{inCart.qty}</span>
                        <button
                          className="menu-qty-btn"
                          onClick={() => updateQty(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        className="menu-add-btn"
                        onClick={() => addToCart(item, cat.name)}
                      >
                        <i className="fa fa-plus"></i>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* Floating cart bar */}
      {totalItems > 0 && !showOrder && (
        <div className="menu-cart-bar">
          <div className="menu-cart-bar-inner">
            <div className="menu-cart-info">
              <span className="menu-cart-badge">{totalItems}</span>
              <span className="menu-cart-label">
                {totalItems === 1 ? "article" : "articles"}
              </span>
            </div>
            <button
              className="menu-cart-order-btn"
              onClick={() => setShowOrder(true)}
            >
              Commander • {formatTotal(totalAmount)}
            </button>
          </div>
        </div>
      )}

      {/* Order modal */}
      {showOrder && (
        <div className="menu-order-overlay" onClick={closeOrder}>
          <div className="menu-order-modal" onClick={(e) => e.stopPropagation()}>
            <button className="menu-order-close" onClick={closeOrder}>
              &times;
            </button>

            {step === "info" && (
              <>
                <div className="menu-order-header">
                  <h3>Votre commande</h3>
                  <p>Remplissez vos informations pour commander</p>
                </div>
                <div className="menu-order-body">
                  {/* Recap */}
                  <div className="menu-order-recap">
                    {Array.from(cart.values()).map((ci) => (
                      <div key={ci.item.id} className="menu-order-recap-row">
                        <div className="menu-order-recap-left">
                          <div className="menu-qty-controls mini">
                            <button
                              className="menu-qty-btn"
                              onClick={() => updateQty(ci.item.id, -1)}
                            >
                              &minus;
                            </button>
                            <span className="menu-qty-value">{ci.qty}</span>
                            <button
                              className="menu-qty-btn"
                              onClick={() => updateQty(ci.item.id, 1)}
                            >
                              +
                            </button>
                          </div>
                          <span className="menu-order-recap-name">{ci.item.name}</span>
                        </div>
                        <span className="menu-order-recap-price">{ci.item.price}</span>
                      </div>
                    ))}
                    <div className="menu-order-recap-total">
                      <span>Total</span>
                      <span>{formatTotal(totalAmount)}</span>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="menu-order-form">
                    <div className="menu-order-field">
                      <label>Nom complet *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Votre nom"
                      />
                    </div>
                    <div className="menu-order-field">
                      <label>Téléphone *</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Votre numéro"
                      />
                    </div>
                    <div className="menu-order-field">
                      <label>Notes (optionnel)</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Allergies, préférences..."
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
                <div className="menu-order-footer">
                  <button
                    className="menu-order-submit"
                    disabled={!name.trim() || !phone.trim() || cart.size === 0 || submitting}
                    onClick={handleSubmit}
                  >
                    {submitting ? (
                      <span>Envoi en cours...</span>
                    ) : (
                      <span>Valider • {formatTotal(totalAmount)}</span>
                    )}
                  </button>
                </div>
              </>
            )}

            {step === "success" && (
              <>
                <div className="menu-order-header">
                  <div className="menu-order-success-icon">
                    <i className="fa fa-check-circle"></i>
                  </div>
                  <h3>Commande envoyée !</h3>
                  <p>
                    Nous avons bien reçu votre commande.
                    Confirmez-la sur WhatsApp pour un traitement rapide.
                  </p>
                </div>
                <div className="menu-order-body">
                  <div className="menu-order-recap">
                    {Array.from(cart.values()).map((ci) => (
                      <div key={ci.item.id} className="menu-order-recap-row">
                        <span className="menu-order-recap-name">
                          {ci.qty}x {ci.item.name}
                        </span>
                        <span className="menu-order-recap-price">{ci.item.price}</span>
                      </div>
                    ))}
                    <div className="menu-order-recap-total">
                      <span>Total</span>
                      <span>{formatTotal(totalAmount)}</span>
                    </div>
                  </div>
                </div>
                <div className="menu-order-footer">
                  {whatsapp && (
                    <a
                      href={`https://wa.me/${whatsapp}?text=${whatsappMessage()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="menu-order-whatsapp"
                    >
                      <i className="fa fa-whatsapp"></i>
                      Confirmer sur WhatsApp
                    </a>
                  )}
                  <button className="menu-order-close-btn" onClick={closeOrder}>
                    Fermer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
