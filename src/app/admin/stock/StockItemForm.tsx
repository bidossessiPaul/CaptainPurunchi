"use client";

import { useState } from "react";
import type { StockItem } from "@/app/types/stock-item";
import { STOCK_CATEGORIES, STOCK_UNITS } from "@/lib/constants";

interface Props {
  item: StockItem | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function StockItemForm({ item, onSave, onCancel }: Props) {
  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [category, setCategory] = useState(item?.category || "");
  const [unit, setUnit] = useState(item?.unit || "");
  const [currentStock, setCurrentStock] = useState(item?.currentStock?.toString() || "0");
  const [minStock, setMinStock] = useState(item?.minStock?.toString() || "0");
  const [unitPrice, setUnitPrice] = useState(item?.unitPrice?.toString() || "0");
  const [supplier, setSupplier] = useState(item?.supplier || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = item ? `/api/stock/items/${item.id}` : "/api/stock/items";
    const method = item ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        category,
        unit,
        currentStock: Number(currentStock),
        minStock: Number(minStock),
        unitPrice: Number(unitPrice),
        supplier,
      }),
    });

    setSaving(false);
    onSave();
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title mb-0">
          {item ? "Modifier le produit" : "Nouveau produit"}
        </h4>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Nom *</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Fournisseur</label>
              <input
                type="text"
                className="form-control"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Catégorie *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">-- Choisir --</option>
                {STOCK_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Unité *</label>
              <select
                className="form-select"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
              >
                <option value="">-- Choisir --</option>
                {STOCK_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">{item ? "Stock actuel" : "Stock initial"}</label>
              <input
                type="number"
                className="form-control"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                min="0"
                step="any"
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Stock minimum (alerte)</label>
              <input
                type="number"
                className="form-control"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                min="0"
                step="any"
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Prix unitaire (FCFA)</label>
              <input
                type="number"
                className="form-control"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <span className="spinner-border spinner-border-sm me-1"></span>}
              {item ? "Enregistrer" : "Créer"}
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
