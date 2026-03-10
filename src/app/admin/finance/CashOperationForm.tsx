"use client";

import { useState } from "react";
import { CASH_OPERATION_TYPES, PAYMENT_METHODS } from "@/lib/constants";

interface Props {
  cashRegisterId: string;
  onSave: () => void;
  onCancel: () => void;
}

export default function CashOperationForm({ cashRegisterId, onSave, onCancel }: Props) {
  const [type, setType] = useState("encaissement");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("especes");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setSaving(true);

    await fetch("/api/finance/cash-operations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cashRegisterId,
        type,
        amount: Number(amount),
        paymentMethod,
        description,
      }),
    });

    setSaving(false);
    onSave();
  };

  return (
    <div className="card border-primary mb-3">
      <div className="card-header bg-primary bg-opacity-10">
        <h6 className="card-title mb-0">
          <i className="fa-solid fa-plus me-2"></i>
          Nouvelle opération
        </h6>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-3 mb-3">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {CASH_OPERATION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Montant (FCFA)</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                required
                placeholder="0"
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Mode de paiement</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {PAYMENT_METHODS.filter((m) => m.value).map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Description</label>
              <input
                type="text"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Commande table 5"
              />
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              type="submit"
              className={`btn ${type === "encaissement" ? "btn-success" : "btn-warning"} btn-sm`}
              disabled={saving || !amount || Number(amount) <= 0}
            >
              {saving ? "Enregistrement..." : type === "encaissement" ? "Ajouter l'encaissement" : "Ajouter le retrait"}
            </button>
            <button type="button" className="btn btn-light btn-sm" onClick={onCancel}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
