"use client";

import { useState, useRef } from "react";
import type { Expense } from "@/app/types/expense";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";

interface Props {
  expense: Expense | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function ExpenseForm({ expense, onSave, onCancel }: Props) {
  const [amount, setAmount] = useState(expense?.amount?.toString() || "");
  const [category, setCategory] = useState(expense?.category || "Achats fournisseurs");
  const [supplier, setSupplier] = useState(expense?.supplier || "");
  const [description, setDescription] = useState(expense?.description || "");
  const [paymentMethod, setPaymentMethod] = useState(expense?.paymentMethod || "");
  const [date, setDate] = useState(expense?.date || new Date().toISOString().split("T")[0]);
  const [isRecurring, setIsRecurring] = useState(expense?.isRecurring || false);
  const [recurringDay, setRecurringDay] = useState(expense?.recurringDay?.toString() || "1");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>(expense?.receiptUrl || "");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (expense) {
        // Update existing expense (JSON)
        await fetch(`/api/finance/expenses/${expense.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Number(amount),
            category,
            supplier,
            description,
            paymentMethod,
            date,
            isRecurring,
            recurringDay: isRecurring ? Number(recurringDay) : undefined,
          }),
        });
      } else {
        // Create new expense (FormData for file upload)
        const formData = new FormData();
        formData.append("amount", amount);
        formData.append("category", category);
        formData.append("supplier", supplier);
        formData.append("description", description);
        formData.append("paymentMethod", paymentMethod);
        formData.append("date", date);
        formData.append("isRecurring", isRecurring.toString());
        if (isRecurring) {
          formData.append("recurringDay", recurringDay);
        }
        if (receiptFile) {
          formData.append("receiptFile", receiptFile);
        }

        await fetch("/api/finance/expenses", {
          method: "POST",
          body: formData,
        });
      }

      setSaving(false);
      onSave();
    } catch (error) {
      console.error("Error saving expense:", error);
      setSaving(false);
      alert("Erreur lors de l'enregistrement de la dépense");
    }
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
            <div className="col-md-12 mb-3">
              <label className="form-label">Photo de la facture</label>
              <input
                ref={fileInputRef}
                type="file"
                className="form-control"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                disabled={!!expense}
              />
              {expense && expense.receiptUrl && (
                <small className="text-muted">
                  Facture déjà enregistrée. Modification non disponible.
                </small>
              )}
              {receiptPreview && (
                <div className="mt-2">
                  {receiptFile?.type.startsWith("image/") || expense?.receiptUrl?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img
                      src={receiptPreview}
                      alt="Aperçu facture"
                      style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain" }}
                      className="border rounded"
                    />
                  ) : (
                    <span className="badge bg-secondary">
                      <i className="fa-solid fa-file-pdf me-1"></i>
                      {receiptFile?.name || "Facture PDF"}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="col-md-12 mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isRecurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="isRecurring">
                  Dépense récurrente (ex: salaire mensuel)
                </label>
              </div>
            </div>
            {isRecurring && (
              <div className="col-md-6 mb-3">
                <label className="form-label">Jour du mois *</label>
                <input
                  type="number"
                  className="form-control"
                  value={recurringDay}
                  onChange={(e) => setRecurringDay(e.target.value)}
                  min="1"
                  max="31"
                  required
                  placeholder="Ex: 25 pour le 25 de chaque mois"
                />
                <small className="text-muted">
                  Cette dépense sera automatiquement recréée chaque mois à cette date
                </small>
              </div>
            )}
          </div>
          {!expense && (
            <div className="alert alert-info">
              <i className="fa-solid fa-info-circle me-2"></i>
              La dépense sera en attente d'approbation par un Manager
            </div>
          )}
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
