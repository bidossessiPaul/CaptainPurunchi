"use client";

import { useState } from "react";

const ICONS = [
  { value: "martini", label: "Cocktail" },
  { value: "wine", label: "Vin / Liqueur" },
  { value: "coffee", label: "Café" },
  { value: "citrus", label: "Jus" },
  { value: "beer", label: "Bière" },
  { value: "zap", label: "Énergie" },
  { value: "fish", label: "Poisson" },
  { value: "flame", label: "Grillades" },
  { value: "utensils", label: "Couverts" },
  { value: "glass-water", label: "Eau" },
];

interface CategoryFormProps {
  onSubmit: (name: string, icon: string) => Promise<void>;
  onCancel: () => void;
}

export default function CategoryForm({ onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("utensils");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await onSubmit(name.trim(), icon);
    setSubmitting(false);
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h6 className="mb-3">Nouvelle catégorie</h6>
        <form onSubmit={handleSubmit}>
          <div className="row g-2 align-items-end">
            <div className="col-md-5">
              <label className="form-label fs-13">Nom de la catégorie</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Ex: Cocktails, Entrées, Grillades..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fs-13">Icône</label>
              <select
                className="form-select form-select-sm"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              >
                {ICONS.map((ic) => (
                  <option key={ic.value} value={ic.value}>
                    {ic.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3 d-flex gap-1">
              <button
                type="submit"
                className="btn btn-sm btn-primary"
                disabled={submitting || !name.trim()}
              >
                {submitting ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <><i className="iconoir-check me-1"></i>Créer</>
                )}
              </button>
              <button type="button" className="btn btn-sm btn-light" onClick={onCancel}>
                Annuler
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
