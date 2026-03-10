"use client";

import { useState } from "react";
import type { CashRegister } from "@/app/types/cash-register";

interface Props {
  register: CashRegister | null;
  mode: "open" | "close";
  onSave: () => void;
  onCancel: () => void;
}

export default function CashRegisterForm({ register, mode, onSave, onCancel }: Props) {
  const [openingBalance, setOpeningBalance] = useState(register?.openingBalance?.toString() || "0");
  const [especes, setEspeces] = useState("0");
  const [carte, setCarte] = useState("0");
  const [mtnMoney, setMtnMoney] = useState("0");
  const [moovMoney, setMoovMoney] = useState("0");
  const [virement, setVirement] = useState("0");
  const [closingBalance, setClosingBalance] = useState("0");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const totalPayments = Number(especes) + Number(carte) + Number(mtnMoney) + Number(moovMoney) + Number(virement);
  const expectedBalance = (register?.openingBalance || Number(openingBalance)) + totalPayments;
  const difference = Number(closingBalance) - expectedBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (mode === "open") {
      await fetch("/api/finance/cash-registers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().split("T")[0],
          openingBalance: Number(openingBalance),
          notes,
        }),
      });
    } else if (register) {
      await fetch(`/api/finance/cash-registers/${register.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "close",
          especes: Number(especes),
          carte: Number(carte),
          mtnMoney: Number(mtnMoney),
          moovMoney: Number(moovMoney),
          virement: Number(virement),
          closingBalance: Number(closingBalance),
          notes,
        }),
      });
    }

    setSaving(false);
    onSave();
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">
          {mode === "open" ? "Ouvrir la caisse" : "Fermer la caisse"}
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {mode === "open" ? (
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Fond de caisse (FCFA)</label>
                <input
                  type="number"
                  className="form-control"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  min="0"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  className="form-control"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes optionnelles"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="alert alert-info mb-3">
                <strong>Fond de caisse :</strong> {register?.openingBalance?.toLocaleString("fr-FR")} FCFA
              </div>
              <h6 className="mb-3">Ventilation par mode de paiement</h6>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Espèces</label>
                  <input
                    type="number"
                    className="form-control"
                    value={especes}
                    onChange={(e) => setEspeces(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Carte bancaire</label>
                  <input
                    type="number"
                    className="form-control"
                    value={carte}
                    onChange={(e) => setCarte(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">MTN Money</label>
                  <input
                    type="number"
                    className="form-control"
                    value={mtnMoney}
                    onChange={(e) => setMtnMoney(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Moov Money</label>
                  <input
                    type="number"
                    className="form-control"
                    value={moovMoney}
                    onChange={(e) => setMoovMoney(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Virement</label>
                  <input
                    type="number"
                    className="form-control"
                    value={virement}
                    onChange={(e) => setVirement(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Solde de clôture</label>
                  <input
                    type="number"
                    className="form-control"
                    value={closingBalance}
                    onChange={(e) => setClosingBalance(e.target.value)}
                    min="0"
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">Total encaissé</small>
                    <div className="fw-bold">{totalPayments.toLocaleString("fr-FR")} FCFA</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">Solde attendu</small>
                    <div className="fw-bold">{expectedBalance.toLocaleString("fr-FR")} FCFA</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className={`p-3 rounded ${difference === 0 ? "bg-success bg-opacity-10" : "bg-danger bg-opacity-10"}`}>
                    <small className="text-muted">Écart</small>
                    <div className={`fw-bold ${difference === 0 ? "text-success" : "text-danger"}`}>
                      {difference > 0 ? "+" : ""}{difference.toLocaleString("fr-FR")} FCFA
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Notes de clôture</label>
                <textarea
                  className="form-control"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Observations sur la journée..."
                />
              </div>
            </>
          )}
          <div className="d-flex gap-2">
            <button type="submit" className={`btn ${mode === "open" ? "btn-success" : "btn-warning"}`} disabled={saving}>
              {saving ? "Enregistrement..." : mode === "open" ? "Ouvrir la caisse" : "Fermer la caisse"}
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
