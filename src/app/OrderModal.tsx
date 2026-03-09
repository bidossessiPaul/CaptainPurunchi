"use client";

import { useState } from "react";
import type { DailyDish } from "@/app/types/daily-dish";

interface CartItem {
  dish: DailyDish;
  qty: number;
}

function parsePrice(price: string): number {
  const parts = price.split("/");
  const raw = parts.length > 1 ? parts[1] : parts[0];
  const digits = raw.replace(/[^\d]/g, "");
  const n = parseInt(digits, 10);
  return isNaN(n) ? 0 : n;
}

function formatTotal(amount: number): string {
  return amount.toLocaleString("fr-FR") + " FCFA";
}

export default function OrderModal({
  dishes,
  whatsapp,
  onClose,
}: {
  dishes: DailyDish[];
  whatsapp: string;
  onClose: () => void;
}) {
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"select" | "info" | "success">("select");
  const [submitting, setSubmitting] = useState(false);

  const updateQty = (dish: DailyDish, delta: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(dish.id);
      const newQty = (existing?.qty || 0) + delta;
      if (newQty <= 0) {
        next.delete(dish.id);
      } else {
        next.set(dish.id, { dish, qty: newQty });
      }
      return next;
    });
  };

  const totalItems = Array.from(cart.values()).reduce((s, i) => s + i.qty, 0);
  const totalAmount = Array.from(cart.values()).reduce(
    (s, i) => s + parsePrice(i.dish.price) * i.qty,
    0
  );

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || cart.size === 0) return;
    setSubmitting(true);

    const items = Array.from(cart.values()).map((i) => ({
      dishId: i.dish.id,
      dishName: i.dish.name,
      category: i.dish.category,
      price: i.dish.price,
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
    const lines = [`Bonjour, je voudrais commander :`];
    for (const item of cart.values()) {
      lines.push(`- ${item.qty}x ${item.dish.name} (${item.dish.price})`);
    }
    lines.push(`\nTotal : ${formatTotal(totalAmount)}`);
    lines.push(`Nom : ${name}`);
    lines.push(`Tél : ${phone}`);
    if (notes) lines.push(`Notes : ${notes}`);
    return encodeURIComponent(lines.join("\n"));
  };

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        <button className="order-modal-close" onClick={onClose}>&times;</button>

        {step === "select" && (
          <>
            <div className="order-modal-header">
              <h3>Votre commande</h3>
              <p>Sélectionnez les plats et quantités</p>
            </div>
            <div className="order-modal-body">
              <div className="order-dish-list">
                {dishes.map((dish) => {
                  const item = cart.get(dish.id);
                  const qty = item?.qty || 0;
                  return (
                    <div key={dish.id} className={`order-dish-row ${qty > 0 ? "selected" : ""}`}>
                      <div className="order-dish-info">
                        {dish.photo && (
                          <img src={dish.photo} alt={dish.name} className="order-dish-thumb" />
                        )}
                        <div>
                          <span className="order-dish-name">{dish.name}</span>
                          <span className="order-dish-cat">{dish.category}</span>
                          <span className="order-dish-price">{dish.price}</span>
                        </div>
                      </div>
                      <div className="order-qty-controls">
                        <button
                          className="order-qty-btn"
                          onClick={() => updateQty(dish, -1)}
                          disabled={qty === 0}
                        >
                          &minus;
                        </button>
                        <span className="order-qty-value">{qty}</span>
                        <button
                          className="order-qty-btn"
                          onClick={() => updateQty(dish, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="order-modal-footer">
              <div className="order-summary-row">
                <span>{totalItems} article{totalItems !== 1 ? "s" : ""}</span>
                <span className="order-total">{formatTotal(totalAmount)}</span>
              </div>
              <button
                className="order-next-btn"
                disabled={cart.size === 0}
                onClick={() => setStep("info")}
              >
                Continuer
              </button>
            </div>
          </>
        )}

        {step === "info" && (
          <>
            <div className="order-modal-header">
              <h3>Vos informations</h3>
              <p>Pour que nous puissions vous contacter</p>
            </div>
            <div className="order-modal-body">
              <div className="order-form">
                <div className="order-form-group">
                  <label>Nom complet *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom"
                  />
                </div>
                <div className="order-form-group">
                  <label>Téléphone *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Votre numéro"
                  />
                </div>
                <div className="order-form-group">
                  <label>Notes (optionnel)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Allergies, préférences, heure de retrait..."
                    rows={3}
                  />
                </div>

                <div className="order-recap">
                  <h4>Récapitulatif</h4>
                  {Array.from(cart.values()).map((item) => (
                    <div key={item.dish.id} className="order-recap-item">
                      <span>{item.qty}x {item.dish.name}</span>
                      <span>{item.dish.price}</span>
                    </div>
                  ))}
                  <div className="order-recap-total">
                    <span>Total</span>
                    <span>{formatTotal(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-modal-footer">
              <button className="order-back-btn" onClick={() => setStep("select")}>
                &larr; Retour
              </button>
              <button
                className="order-submit-btn"
                disabled={!name.trim() || !phone.trim() || submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Envoi..." : "Valider la commande"}
              </button>
            </div>
          </>
        )}

        {step === "success" && (
          <>
            <div className="order-modal-header">
              <div className="order-success-icon">
                <i className="fa fa-check-circle"></i>
              </div>
              <h3>Commande envoyée !</h3>
              <p>Nous avons bien reçu votre commande. Vous serez contacté sous peu.</p>
            </div>
            <div className="order-modal-body">
              <div className="order-recap">
                <h4>Récapitulatif</h4>
                {Array.from(cart.values()).map((item) => (
                  <div key={item.dish.id} className="order-recap-item">
                    <span>{item.qty}x {item.dish.name}</span>
                    <span>{item.dish.price}</span>
                  </div>
                ))}
                <div className="order-recap-total">
                  <span>Total</span>
                  <span>{formatTotal(totalAmount)}</span>
                </div>
              </div>
            </div>
            <div className="order-modal-footer">
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}?text=${whatsappMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="order-whatsapp-btn"
                >
                  <i className="fa fa-whatsapp" style={{ marginRight: 8 }}></i>
                  Confirmer sur WhatsApp
                </a>
              )}
              <button className="order-close-btn" onClick={onClose}>
                Fermer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
