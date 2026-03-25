"use client";

import { useState } from "react";
import type { CashRegister } from "@/app/types/cash-register";

interface Props {
  register: CashRegister | null;
  mode: "open" | "close";
  prefill?: {
    especes: number;
    carte: number;
    mtnMoney: number;
    moovMoney: number;
    virement: number;
  };
  onSave: () => void;
  onCancel: () => void;
}

export default function CashRegisterForm({ register, mode, prefill, onSave, onCancel }: Props) {
  const [openingBalance, setOpeningBalance] = useState(register?.openingBalance?.toString() || "0");
  const [especes, setEspeces] = useState(prefill?.especes?.toString() || "0");
  const [carte, setCarte] = useState(prefill?.carte?.toString() || "0");
  const [mtnMoney, setMtnMoney] = useState(prefill?.mtnMoney?.toString() || "0");
  const [moovMoney, setMoovMoney] = useState(prefill?.moovMoney?.toString() || "0");
  const [virement, setVirement] = useState(prefill?.virement?.toString() || "0");
  const [closingBalance, setClosingBalance] = useState(() => {
    if (mode === "close") {
      const opening = register?.openingBalance || 0;
      const payments = (prefill?.especes || 0) + (prefill?.carte || 0) + (prefill?.mtnMoney || 0) + (prefill?.moovMoney || 0) + (prefill?.virement || 0);
      return (opening + payments).toString();
    }
    return "0";
  });
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPayments = Number(especes) + Number(carte) + Number(mtnMoney) + Number(moovMoney) + Number(virement);
  const expectedBalance = (register?.openingBalance || Number(openingBalance)) + totalPayments;
  const difference = Number(closingBalance) - expectedBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let res: Response;

      if (mode === "open") {
        res = await fetch("/api/finance/cash-registers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: new Date().toISOString().split("T")[0],
            openingBalance: Number(openingBalance),
            notes,
          }),
        });
      } else if (register) {
        res = await fetch(`/api/finance/cash-registers/${register.id}`, {
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
      } else {
        setSaving(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Erreur ${mode === "open" ? "d'ouverture" : "de fermeture"}`);
        setSaving(false);
        return;
      }

      setSaving(false);
      onSave();
    } catch {
      setError("Erreur réseau");
      setSaving(false);
    }
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
          {error && (
            <div className="alert alert-danger py-2 mb-3">
              <i className="fa-solid fa-circle-exclamation me-2"></i>{error}
            </div>
          )}
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

              <h6 className="mb-3">Récapitulatif des opérations du jour</h6>
              <div className="row mb-3">
                {Number(especes) !== 0 && (
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">Espèces</small><strong>{Number(especes).toLocaleString("fr-FR")} FCFA</strong></div></div>
                )}
                {Number(carte) !== 0 && (
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">Carte</small><strong>{Number(carte).toLocaleString("fr-FR")} FCFA</strong></div></div>
                )}
                {Number(mtnMoney) !== 0 && (
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">MTN Money</small><strong>{Number(mtnMoney).toLocaleString("fr-FR")} FCFA</strong></div></div>
                )}
                {Number(moovMoney) !== 0 && (
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">Moov Money</small><strong>{Number(moovMoney).toLocaleString("fr-FR")} FCFA</strong></div></div>
                )}
                {Number(virement) !== 0 && (
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">Virement</small><strong>{Number(virement).toLocaleString("fr-FR")} FCFA</strong></div></div>
                )}
                {totalPayments === 0 && (
                  <div className="col"><div className="p-2 bg-light rounded text-center text-muted">Aucune opération enregistrée</div></div>
                )}
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <div className="p-3 bg-success bg-opacity-10 rounded text-center">
                    <small className="text-muted">Total net des opérations</small>
                    <div className="fw-bold text-success fs-5">{totalPayments.toLocaleString("fr-FR")} FCFA</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-primary bg-opacity-10 rounded text-center">
                    <small className="text-muted">Solde attendu</small>
                    <div className="fw-bold text-primary fs-5">{expectedBalance.toLocaleString("fr-FR")} FCFA</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className={`p-3 rounded text-center ${difference === 0 ? "bg-success bg-opacity-10" : "bg-danger bg-opacity-10"}`}>
                    <small className="text-muted">Écart</small>
                    <div className={`fw-bold fs-5 ${difference === 0 ? "text-success" : "text-danger"}`}>
                      {difference > 0 ? "+" : ""}{difference.toLocaleString("fr-FR")} FCFA
                    </div>
                  </div>
                </div>
              </div>

              <hr />
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Solde de clôture (comptage réel en caisse)</label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    value={closingBalance}
                    onChange={(e) => setClosingBalance(e.target.value)}
                    min="0"
                  />
                  <small className="text-muted">Comptez l'argent physique dans la caisse et saisissez le montant total</small>
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
