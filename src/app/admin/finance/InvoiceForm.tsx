"use client";

import { useState } from "react";
import type { Invoice, InvoiceItem } from "@/app/types/invoice";

interface Props {
  invoice: Invoice | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function InvoiceForm({ invoice, onSave, onCancel }: Props) {
  const existingItems: InvoiceItem[] = invoice ? JSON.parse(invoice.items) : [];

  const [customerName, setCustomerName] = useState(invoice?.customerName || "");
  const [customerEmail, setCustomerEmail] = useState(invoice?.customerEmail || "");
  const [customerPhone, setCustomerPhone] = useState(invoice?.customerPhone || "");
  const [items, setItems] = useState<InvoiceItem[]>(
    existingItems.length > 0 ? existingItems : [{ description: "", qty: 1, unitPrice: 0, total: 0 }]
  );
  const [tax, setTax] = useState(invoice?.tax?.toString() || "0");
  const [dueDate, setDueDate] = useState(invoice?.dueDate || "");
  const [notes, setNotes] = useState(invoice?.notes || "");
  const [saving, setSaving] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal + Number(tax);

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[index] };
      if (field === "description") item.description = value as string;
      if (field === "qty") item.qty = Number(value);
      if (field === "unitPrice") item.unitPrice = Number(value);
      item.total = item.qty * item.unitPrice;
      next[index] = item;
      return next;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { description: "", qty: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = invoice ? `/api/finance/invoices/${invoice.id}` : "/api/finance/invoices";
    const method = invoice ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        customerEmail,
        customerPhone,
        items: JSON.stringify(items),
        subtotal,
        tax: Number(tax),
        total,
        dueDate,
        notes,
      }),
    });

    setSaving(false);
    onSave();
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">
          {invoice ? `Modifier la facture ${invoice.invoiceNumber}` : "Nouvelle facture"}
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Nom du client *</label>
              <input
                type="text"
                className="form-control"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Téléphone</label>
              <input
                type="text"
                className="form-control"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>

          <h6 className="mt-2 mb-3">Articles</h6>
          <div className="table-responsive mb-3">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Description</th>
                  <th style={{ width: "100px" }}>Qté</th>
                  <th style={{ width: "150px" }}>Prix unit.</th>
                  <th style={{ width: "150px" }}>Total</th>
                  <th style={{ width: "50px" }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={item.description}
                        onChange={(e) => updateItem(i, "description", e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={item.qty}
                        onChange={(e) => updateItem(i, "qty", e.target.value)}
                        min="1"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(i, "unitPrice", e.target.value)}
                        min="0"
                        required
                      />
                    </td>
                    <td className="fw-bold">
                      {item.total.toLocaleString("fr-FR")} FCFA
                    </td>
                    <td>
                      {items.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeItem(i)}
                        >
                          <i className="fa-solid fa-times"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn btn-sm btn-outline-primary mb-3" onClick={addItem}>
            <i className="fa-solid fa-plus me-1"></i> Ajouter une ligne
          </button>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Date d'échéance</label>
                <input
                  type="date"
                  className="form-control"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="bg-light rounded p-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Sous-total</span>
                  <strong>{subtotal.toLocaleString("fr-FR")} FCFA</strong>
                </div>
                <div className="d-flex justify-content-between mb-2 align-items-center">
                  <span>Taxe</span>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    style={{ width: "120px" }}
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    min="0"
                  />
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <strong style={{ fontSize: "16px" }}>Total</strong>
                  <strong style={{ fontSize: "16px", color: "#1a3a5c" }}>
                    {total.toLocaleString("fr-FR")} FCFA
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Enregistrement..." : invoice ? "Modifier" : "Créer la facture"}
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
