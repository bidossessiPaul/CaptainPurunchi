"use client";

import { useState } from "react";
import type { StockItem } from "@/app/types/stock-item";
import { STOCK_MOVEMENT_TYPES } from "@/lib/constants";

interface Props {
  items: StockItem[];
  preselectedItemId?: string;
  preselectedType?: string;
  onSave: () => void;
  onCancel: () => void;
}

export default function StockMovementForm({ items, preselectedItemId, preselectedType, onSave, onCancel }: Props) {
  const [stockItemId, setStockItemId] = useState(preselectedItemId || "");
  const [type, setType] = useState(preselectedType || "entry");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const selectedItem = items.find((i) => i.id === stockItemId);

  // Pre-fill unitPrice when item changes
  const handleItemChange = (id: string) => {
    setStockItemId(id);
    const item = items.find((i) => i.id === id);
    if (item) setUnitPrice(item.unitPrice.toString());
  };

  const filteredItems = search
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockItemId || !quantity) return;
    setSaving(true);

    await fetch("/api/stock/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stockItemId,
        type,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        reason,
        date,
      }),
    });

    setSaving(false);
    onSave();
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title mb-0">Nouveau mouvement de stock</h4>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Produit *</label>
              <input
                type="text"
                className="form-control mb-1"
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="form-select"
                value={stockItemId}
                onChange={(e) => handleItemChange(e.target.value)}
                required
                size={5}
                style={{ maxHeight: "150px" }}
              >
                {filteredItems.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.currentStock} {i.unit})
                  </option>
                ))}
              </select>
              {selectedItem && (
                <small className="text-muted mt-1 d-block">
                  Stock actuel : {selectedItem.currentStock} {selectedItem.unit}
                </small>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Type de mouvement *</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                {STOCK_MOVEMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>

              <label className="form-label mt-3">Quantité *</label>
              <input
                type="number"
                className="form-control"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                step="any"
                required
              />

              <label className="form-label mt-3">Prix unitaire (FCFA)</label>
              <input
                type="number"
                className="form-control"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="row">
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
            <div className="col-md-6 mb-3">
              <label className="form-label">Raison / Note</label>
              <input
                type="text"
                className="form-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Achat fournisseur, Utilisation cuisine..."
              />
            </div>
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={saving || !stockItemId}>
              {saving && <span className="spinner-border spinner-border-sm me-1"></span>}
              Enregistrer
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
