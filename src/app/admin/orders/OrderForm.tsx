"use client";

import { useState } from "react";
import type { Order } from "@/app/types/order";
import { PAYMENT_METHODS } from "@/lib/constants";

interface Props {
  order: Order | null;
  onSave: () => void;
  onCancel: () => void;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmé" },
  { value: "completed", label: "Terminé" },
  { value: "cancelled", label: "Annulé" },
];

export default function OrderForm({ order, onSave, onCancel }: Props) {
  const [customerName, setCustomerName] = useState(order?.customerName ?? "");
  const [customerPhone, setCustomerPhone] = useState(order?.customerPhone ?? "");
  const [customerEmail, setCustomerEmail] = useState(order?.customerEmail ?? "");
  const [totalAmount, setTotalAmount] = useState(order?.totalAmount ?? "");
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [status, setStatus] = useState(order?.status ?? "pending");
  const [paymentMethod, setPaymentMethod] = useState(order?.paymentMethod ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditing = !!order;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!customerName || !customerPhone) {
      setError("Nom et téléphone sont obligatoires");
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        customerName,
        customerPhone,
        customerEmail,
        notes,
        paymentMethod,
      };

      if (isEditing) {
        body.status = status;
        body.totalAmount = totalAmount;
      } else {
        body.items = [];
        body.totalAmount = totalAmount || "0 FCFA";
        body.orderDate = new Date().toISOString().split("T")[0];
      }

      const url = isEditing ? `/api/orders/${order.id}` : "/api/orders";
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur serveur");
      }
      onSave();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row mb-3">
      <div className="col-lg-8 col-xl-6">
        <div className="card border">
          <div className="card-header">
            <h4 className="card-title">
              {isEditing ? "Modifier la commande" : "Nouvelle commande"}
            </h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nom *</label>
                  <input type="text" className="form-control" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Téléphone *</label>
                  <input type="tel" className="form-control" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email</label>
                  <input type="email" className="form-control" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Montant total</label>
                  <input type="text" className="form-control" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="ex: 15 000 FCFA" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Mode de paiement</label>
                  <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                {isEditing && (
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Statut</label>
                    <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value as Order["status"])}>
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="col-12">
                  <label className="form-label fw-semibold">Notes</label>
                  <textarea className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
                </div>

                {isEditing && order.items.length > 0 && (
                  <div className="col-12">
                    <label className="form-label fw-semibold">Articles commandés</label>
                    <div className="list-group">
                      {order.items.map((item, i) => (
                        <div key={i} className="list-group-item d-flex justify-content-between py-2">
                          <span>{item.dishName} x{item.quantity}</span>
                          <span className="text-muted">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {error && <div className="alert alert-danger mt-3 mb-0 py-2">{error}</div>}

              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Enregistrement..." : isEditing ? "Enregistrer" : "Créer"}
                </button>
                <button type="button" className="btn btn-light" onClick={onCancel}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
