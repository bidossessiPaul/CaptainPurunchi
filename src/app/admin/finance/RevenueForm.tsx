"use client";

import { useState } from "react";
import type { Revenue } from "@/app/types/revenue";
import { REVENUE_SOURCES, PAYMENT_METHODS } from "@/lib/constants";

interface Props {
  revenue: Revenue | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function RevenueForm({ revenue, onSave, onCancel }: Props) {
  const [amount, setAmount] = useState(revenue?.amount?.toString() || "");
  const [source, setSource] = useState(revenue?.source || "restaurant");
  const [description, setDescription] = useState(revenue?.description || "");
  const [paymentMethod, setPaymentMethod] = useState(revenue?.paymentMethod || "");
  const [date, setDate] = useState(revenue?.date || new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = revenue ? `/api/finance/revenue/${revenue.id}` : "/api/finance/revenue";
    const method = revenue ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(amount),
        source,
        description,
        paymentMethod,
        date,
      }),
    });

    setSaving(false);
    onSave();
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">
          {revenue ? "Modifier le revenu" : "Nouveau revenu"}
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Montant (FCFA) *</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Source *</label>
              <select
                className="form-select"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                required
              >
                {REVENUE_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-12 mb-3">
              <label className="form-label">Description *</label>
              <input
                type="text"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Ex: Vente repas midi, Service bar..."
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Mode de paiement</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Date *</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Enregistrement..." : revenue ? "Modifier" : "Ajouter"}
            </button>
            <button type="button" className="btn btn-light" onClick={onCancel}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
