"use client";

import { useState } from "react";
import type { Expense } from "@/app/types/expense";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";

interface Props {
  expense: Expense | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function ExpenseForm({ expense, onSave, onCancel }: Props) {
  const [amount, setAmount] = useState(expense?.amount?.toString() || "");
  const [category, setCategory] = useState(expense?.category || "fournisseurs");
  const [supplier, setSupplier] = useState(expense?.supplier || "");
  const [description, setDescription] = useState(expense?.description || "");
  const [paymentMethod, setPaymentMethod] = useState(expense?.paymentMethod || "");
  const [date, setDate] = useState(expense?.date || new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = expense ? `/api/finance/expenses/${expense.id}` : "/api/finance/expenses";
    const method = expense ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(amount),
        category,
        supplier,
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
          {expense ? "Modifier la dépense" : "Nouvelle dépense"}
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
              <label className="form-label">Catégorie *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Fournisseur</label>
              <input
                type="text"
                className="form-control"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Nom du fournisseur"
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
            <div className="col-md-12 mb-3">
              <label className="form-label">Description *</label>
              <input
                type="text"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Ex: Achat légumes marché, Facture électricité..."
              />
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
              {saving ? "Enregistrement..." : expense ? "Modifier" : "Ajouter"}
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
