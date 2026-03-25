"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CashRegister } from "@/app/types/cash-register";
import type { CashOperation } from "@/app/types/cash-operation";
import { PAYMENT_LABELS, CASH_OPERATION_TYPE_LABELS } from "@/lib/constants";
import CashRegisterForm from "../finance/CashRegisterForm";
import CashOperationForm from "../finance/CashOperationForm";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function monthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("fr-FR");
}

export default function CaisseManager() {
  const [dateFrom, setDateFrom] = useState(monthStart());
  const [dateTo, setDateTo] = useState(todayStr());

  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [cashHistory, setCashHistory] = useState<CashRegister[]>([]);
  const [cashOperations, setCashOperations] = useState<CashOperation[]>([]);
  const [cashOpTotals, setCashOpTotals] = useState<{ especes: number; carte: number; mtnMoney: number; moovMoney: number; virement: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Detail view for a historical register
  const [viewRegister, setViewRegister] = useState<CashRegister | null>(null);
  const [viewOps, setViewOps] = useState<CashOperation[]>([]);

  const [cashForm, setCashForm] = useState<"open" | "close" | null>(null);

  const loadOpsForRegister = async (reg: CashRegister) => {
    let opsList: CashOperation[] = [];
    try {
      const ops = await fetch(`/api/finance/cash-operations?cashRegisterId=${reg.id}`).then((r) => r.json());
      opsList = Array.isArray(ops) ? ops : [];
    } catch (err) {
      console.error("Erreur chargement opérations:", err);
    }
    const totals = { especes: 0, carte: 0, mtnMoney: 0, moovMoney: 0, virement: 0 };
    for (const op of opsList) {
      const sign = op.type === "encaissement" ? 1 : -1;
      const amt = op.amount * sign;
      if (op.paymentMethod === "especes") totals.especes += amt;
      else if (op.paymentMethod === "carte") totals.carte += amt;
      else if (op.paymentMethod === "mtn_money") totals.mtnMoney += amt;
      else if (op.paymentMethod === "moov_money") totals.moovMoney += amt;
      else if (op.paymentMethod === "virement") totals.virement += amt;
    }
    return { ops: opsList, totals };
  };

  const initialLoadDone = useRef(false);

  const fetchData = useCallback(async () => {
    if (!initialLoadDone.current) setLoading(true);
    try {
      // Fetch: today's register + any open register + history
      const [todayReg, openRegs, history] = await Promise.all([
        fetch(`/api/finance/cash-registers?today=${todayStr()}`).then((r) => r.json()),
        fetch(`/api/finance/cash-registers?status=open`).then((r) => r.json()),
        fetch(`/api/finance/cash-registers?dateFrom=${dateFrom}&dateTo=${dateTo}`).then((r) => r.json()),
      ]);

      setCashHistory(Array.isArray(history) ? history : []);

      // Priority: any open register (even from previous day), then today's
      const openList: CashRegister[] = Array.isArray(openRegs) ? openRegs : [];
      const activeOpen = openList.length > 0 ? openList[0] : null;
      const todayRegClean = todayReg && !todayReg.error ? todayReg : null;
      const reg = activeOpen || todayRegClean;

      setCashRegister(reg);

      if (reg) {
        const { ops, totals } = await loadOpsForRegister(reg);
        setCashOperations(ops);
        setCashOpTotals(totals);
      } else {
        setCashOperations([]);
        setCashOpTotals(null);
      }
    } catch (err) {
      console.error("Erreur chargement caisse:", err);
    }
    setLoading(false);
    initialLoadDone.current = true;
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteOp = async (opId: string) => {
    if (!confirm("Supprimer cette opération ?")) return;
    try {
      await fetch(`/api/finance/cash-operations/${opId}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const handleViewRegister = async (reg: CashRegister) => {
    const { ops } = await loadOpsForRegister(reg);
    setViewRegister(reg);
    setViewOps(ops);
  };

  const cashTotalEncaissements = cashOperations.filter(op => op.type === "encaissement").reduce((sum, op) => sum + op.amount, 0);
  const cashTotalRetraits = cashOperations.filter(op => op.type !== "encaissement").reduce((sum, op) => sum + op.amount, 0);
  const cashNetTotal = cashTotalEncaissements - cashTotalRetraits;
  const cashRunningBalance = (cashRegister?.openingBalance || 0) + cashNetTotal;

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (cashForm) {
    return (
      <CashRegisterForm
        register={cashForm === "close" ? cashRegister : null}
        mode={cashForm}
        prefill={cashForm === "close" && cashOpTotals ? cashOpTotals : undefined}
        onSave={() => { setCashForm(null); fetchData(); }}
        onCancel={() => setCashForm(null)}
      />
    );
  }

  // Detail view of a historical register
  if (viewRegister) {
    const vTotalEncaissements = viewOps.filter(op => op.type === "encaissement").reduce((sum, op) => sum + op.amount, 0);
    const vTotalRetraits = viewOps.filter(op => op.type !== "encaissement").reduce((sum, op) => sum + op.amount, 0);
    const vNetTotal = vTotalEncaissements - vTotalRetraits;
    const recette = viewRegister.especes + viewRegister.carte + viewRegister.mtnMoney + viewRegister.moovMoney + viewRegister.virement;

    return (
      <>
        <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => setViewRegister(null)}>
          <i className="fa-solid fa-arrow-left me-1"></i> Retour à l'historique
        </button>

        {/* Résumé de la caisse */}
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              <i className="fa-solid fa-cash-register me-2"></i>
              Caisse du {viewRegister.date}
              {viewRegister.closedAt && (
                <small className="text-muted ms-2">
                  (fermée à {new Date(viewRegister.closedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })})
                </small>
              )}
            </h5>
            <span className={`badge ${viewRegister.status === "open" ? "bg-success" : "bg-secondary"}`}>
              {viewRegister.status === "open" ? "Ouverte" : "Fermée"}
            </span>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-2 col-6">
                <div className="p-3 bg-light rounded text-center">
                  <small className="text-muted d-block">Fond de caisse</small>
                  <strong>{fmt(viewRegister.openingBalance)} FCFA</strong>
                </div>
              </div>
              <div className="col-md-2 col-6">
                <div className="p-3 bg-success bg-opacity-10 rounded text-center">
                  <small className="text-muted d-block">Total encaissé</small>
                  <strong className="text-success">+{fmt(vTotalEncaissements)} FCFA</strong>
                </div>
              </div>
              <div className="col-md-2 col-6">
                <div className="p-3 bg-danger bg-opacity-10 rounded text-center">
                  <small className="text-muted d-block">Total retiré</small>
                  <strong className="text-danger">{vTotalRetraits > 0 ? "-" : ""}{fmt(vTotalRetraits)} FCFA</strong>
                </div>
              </div>
              <div className="col-md-2 col-6">
                <div className="p-3 bg-primary bg-opacity-10 rounded text-center">
                  <small className="text-muted d-block">Recette nette</small>
                  <strong className="text-primary">{fmt(vNetTotal)} FCFA</strong>
                </div>
              </div>
              {viewRegister.status === "closed" && (
                <>
                  <div className="col-md-2 col-6">
                    <div className="p-3 bg-light rounded text-center">
                      <small className="text-muted d-block">Solde clôture</small>
                      <strong>{fmt(viewRegister.closingBalance)} FCFA</strong>
                    </div>
                  </div>
                  <div className="col-md-2 col-6">
                    <div className={`p-3 rounded text-center ${viewRegister.difference === 0 ? "bg-success bg-opacity-10" : "bg-danger bg-opacity-10"}`}>
                      <small className="text-muted d-block">Écart</small>
                      <strong className={viewRegister.difference === 0 ? "text-success" : "text-danger"}>
                        {viewRegister.difference > 0 ? "+" : ""}{fmt(viewRegister.difference)} FCFA
                      </strong>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Détail par mode de paiement */}
            {viewRegister.status === "closed" && recette !== 0 && (
              <div className="row">
                <div className="col-12 mb-2"><h6 className="text-muted">Détail par mode de paiement</h6></div>
                {viewRegister.especes !== 0 && (
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">Espèces</small><strong>{fmt(viewRegister.especes)}</strong></div></div>
                )}
                {viewRegister.carte !== 0 && (
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">Carte</small><strong>{fmt(viewRegister.carte)}</strong></div></div>
                )}
                {viewRegister.mtnMoney !== 0 && (
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">MTN</small><strong>{fmt(viewRegister.mtnMoney)}</strong></div></div>
                )}
                {viewRegister.moovMoney !== 0 && (
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">Moov</small><strong>{fmt(viewRegister.moovMoney)}</strong></div></div>
                )}
                {viewRegister.virement !== 0 && (
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">Virement</small><strong>{fmt(viewRegister.virement)}</strong></div></div>
                )}
              </div>
            )}

            <div className="mt-3">
              <small className="text-muted">
                <i className="fa-solid fa-user me-1"></i>Ouvert par : <strong>{viewRegister.openedBy}</strong>
                {viewRegister.closedBy && <> | Fermé par : <strong>{viewRegister.closedBy}</strong></>}
              </small>
            </div>
          </div>
        </div>

        {/* Liste de TOUTES les opérations */}
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              <i className="fa-solid fa-list me-2"></i>
              Détail des opérations
              <span className="badge bg-primary ms-2">{viewOps.length}</span>
            </h5>
            <div className="d-flex gap-3">
              <span className="text-success fw-bold small">
                <i className="fa-solid fa-arrow-up me-1"></i>{fmt(vTotalEncaissements)} FCFA
              </span>
              <span className="text-danger fw-bold small">
                <i className="fa-solid fa-arrow-down me-1"></i>{fmt(vTotalRetraits)} FCFA
              </span>
            </div>
          </div>
          {viewOps.length > 0 ? (
            <div className="card-body p-0">
              <div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto" }}>
                <table className="table table-hover mb-0">
                  <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr>
                      <th>Heure</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Paiement</th>
                      <th className="text-end">Montant</th>
                      <th>Par</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewOps.map((op) => (
                      <tr key={op.id}>
                        <td>{new Date(op.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</td>
                        <td>
                          <span className={`badge ${op.type === "encaissement" ? "bg-success" : "bg-warning text-dark"}`}>
                            {CASH_OPERATION_TYPE_LABELS[op.type] || op.type}
                          </span>
                        </td>
                        <td>{op.description || "-"}</td>
                        <td>{PAYMENT_LABELS[op.paymentMethod] || op.paymentMethod}</td>
                        <td className={`text-end fw-bold ${op.type === "encaissement" ? "text-success" : "text-danger"}`}>
                          {op.type === "encaissement" ? "+" : "-"}{fmt(op.amount)} FCFA
                        </td>
                        <td><small className="text-muted">{op.createdBy}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card-body text-center py-4">
              <i className="fa-solid fa-inbox text-muted" style={{ fontSize: "32px" }}></i>
              <p className="text-muted mt-2 mb-0">Aucune opération enregistrée pour cette caisse</p>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Period filter */}
      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
        <label className="form-label mb-0">Du</label>
        <input type="date" className="form-control" style={{ width: "auto" }} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <label className="form-label mb-0">au</label>
        <input type="date" className="form-control" style={{ width: "auto" }} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        <button className="btn btn-outline-primary btn-sm" onClick={() => { setDateFrom(monthStart()); setDateTo(todayStr()); }}>Ce mois</button>
        <button className="btn btn-outline-primary btn-sm" onClick={() => { setDateFrom(todayStr()); setDateTo(todayStr()); }}>Aujourd'hui</button>
      </div>

      {/* Active register (open - could be from any day) */}
      {cashRegister?.status === "open" && (
        <div className="card mb-4 border-success">
          <div className="card-header d-flex justify-content-between align-items-center bg-success bg-opacity-10">
            <h5 className="card-title mb-0">
              <i className="fa-solid fa-cash-register me-2"></i>
              Caisse ouverte — {cashRegister.date}
              {cashRegister.date !== todayStr() && (
                <span className="badge bg-warning text-dark ms-2">
                  <i className="fa-solid fa-triangle-exclamation me-1"></i>
                  Ouverte depuis le {cashRegister.date} à {new Date(cashRegister.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </h5>
            <button className="btn btn-warning btn-sm" onClick={() => setCashForm("close")}>
              <i className="fa-solid fa-lock me-1"></i> Fermer la caisse
            </button>
          </div>
          <div className="card-body">
            {/* Résumé principal */}
            <div className="row mb-3">
              <div className="col-md-2 col-6">
                <div className="p-3 bg-light rounded text-center">
                  <small className="text-muted d-block">Fond de caisse</small>
                  <strong>{fmt(cashRegister.openingBalance)} FCFA</strong>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="p-3 bg-success bg-opacity-10 rounded text-center">
                  <small className="text-muted d-block">Total encaissé</small>
                  <strong className="text-success">{cashTotalEncaissements > 0 ? "+" : ""}{fmt(cashTotalEncaissements)} FCFA</strong>
                </div>
              </div>
              <div className="col-md-2 col-6">
                <div className="p-3 bg-danger bg-opacity-10 rounded text-center">
                  <small className="text-muted d-block">Total retiré</small>
                  <strong className="text-danger">{cashTotalRetraits > 0 ? "-" : ""}{fmt(cashTotalRetraits)} FCFA</strong>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="p-3 bg-primary bg-opacity-10 rounded text-center">
                  <small className="text-muted d-block">Solde en cours</small>
                  <strong className="text-primary fs-5">{fmt(cashRunningBalance)} FCFA</strong>
                </div>
              </div>
              <div className="col-md-2 col-6">
                <div className="p-3 bg-light rounded text-center">
                  <small className="text-muted d-block">Ouvert par</small>
                  <strong>{cashRegister.openedBy}</strong>
                </div>
              </div>
            </div>

            {/* Détail par mode de paiement */}
            {cashOpTotals && cashOperations.length > 0 && (
              <div className="row">
                <div className="col-12">
                  <h6 className="text-muted mb-2">Détail par mode de paiement</h6>
                </div>
                {cashOpTotals.especes !== 0 && (
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">Espèces</small><strong>{fmt(cashOpTotals.especes)}</strong></div></div>
                )}
                {cashOpTotals.carte !== 0 && (
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">Carte</small><strong>{fmt(cashOpTotals.carte)}</strong></div></div>
                )}
                {cashOpTotals.mtnMoney !== 0 && (
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">MTN</small><strong>{fmt(cashOpTotals.mtnMoney)}</strong></div></div>
                )}
                {cashOpTotals.moovMoney !== 0 && (
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">Moov</small><strong>{fmt(cashOpTotals.moovMoney)}</strong></div></div>
                )}
                {cashOpTotals.virement !== 0 && (
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">Virement</small><strong>{fmt(cashOpTotals.virement)}</strong></div></div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* No open register - show "open" button */}
      {!cashRegister || cashRegister.status === "closed" ? (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Caisse du jour — {todayStr()}</h5>
            <button className="btn btn-success btn-sm" onClick={() => setCashForm("open")}>
              <i className="fa-solid fa-lock-open me-1"></i> Ouvrir la caisse
            </button>
          </div>
          <div className="card-body">
            {cashRegister?.status === "closed" ? (
              <>
                <div className="row mb-3">
                  <div className="col-md-3 col-6">
                    <div className="p-3 bg-light rounded text-center">
                      <small className="text-muted d-block">Statut</small>
                      <span className="badge bg-secondary mt-1">Fermée</span>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="p-3 bg-light rounded text-center">
                      <small className="text-muted d-block">Fond de caisse</small>
                      <strong>{fmt(cashRegister.openingBalance)} FCFA</strong>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="p-3 bg-light rounded text-center">
                      <small className="text-muted d-block">Solde clôture</small>
                      <strong>{fmt(cashRegister.closingBalance)} FCFA</strong>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className={`p-3 rounded text-center ${cashRegister.difference === 0 ? "bg-success bg-opacity-10" : "bg-danger bg-opacity-10"}`}>
                      <small className="text-muted d-block">Écart</small>
                      <strong className={cashRegister.difference === 0 ? "text-success" : "text-danger"}>
                        {cashRegister.difference > 0 ? "+" : ""}{fmt(cashRegister.difference)} FCFA
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-12 mb-2"><h6 className="text-muted">Détail des encaissements</h6></div>
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">Espèces</small><strong>{fmt(cashRegister.especes)}</strong></div></div>
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">Carte</small><strong>{fmt(cashRegister.carte)}</strong></div></div>
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">MTN</small><strong>{fmt(cashRegister.mtnMoney)}</strong></div></div>
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">Moov</small><strong>{fmt(cashRegister.moovMoney)}</strong></div></div>
                  <div className="col"><div className="p-2 bg-light rounded text-center"><small className="text-muted d-block">Virement</small><strong>{fmt(cashRegister.virement)}</strong></div></div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <i className="fa-solid fa-cash-register" style={{ fontSize: "48px", color: "#95a0c5" }}></i>
                <h5 className="mt-3">Caisse non ouverte</h5>
                <p className="text-muted">La caisse n'a pas encore été ouverte aujourd'hui.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Operation form — always visible when register is open */}
      {cashRegister?.status === "open" && (
        <CashOperationForm
          cashRegisterId={cashRegister.id}
          onSave={() => { fetchData(); }}
          onCancel={() => {}}
        />
      )}

      {/* Operations list for active register */}
      {cashRegister?.status === "open" && cashOperations.length > 0 && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              Opérations
              <span className="badge bg-primary ms-2">{cashOperations.length}</span>
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto" }}>
              <table className="table table-hover mb-0">
                <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                    <th>Heure</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Paiement</th>
                    <th className="text-end">Montant</th>
                    <th>Par</th>
                    <th style={{ width: "50px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cashOperations.map((op) => (
                    <tr key={op.id}>
                      <td>{new Date(op.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</td>
                      <td>
                        <span className={`badge ${op.type === "encaissement" ? "bg-success" : "bg-warning text-dark"}`}>
                          {CASH_OPERATION_TYPE_LABELS[op.type] || op.type}
                        </span>
                      </td>
                      <td>{op.description || "-"}</td>
                      <td>{PAYMENT_LABELS[op.paymentMethod] || op.paymentMethod}</td>
                      <td className={`text-end fw-bold ${op.type === "encaissement" ? "text-success" : "text-danger"}`}>
                        {op.type === "encaissement" ? "+" : "-"}{fmt(op.amount)} FCFA
                      </td>
                      <td><small className="text-muted">{op.createdBy}</small></td>
                      <td>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteOp(op.id)} title="Supprimer">
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-end gap-3 px-3 py-2 bg-light border-top">
              <span className="text-success fw-bold">
                <i className="fa-solid fa-arrow-up me-1"></i>Encaissé : {fmt(cashTotalEncaissements)} FCFA
              </span>
              <span className="text-danger fw-bold">
                <i className="fa-solid fa-arrow-down me-1"></i>Retiré : {fmt(cashTotalRetraits)} FCFA
              </span>
              <span className={`fw-bold ${cashNetTotal >= 0 ? "text-primary" : "text-danger"}`}>
                = Net : {cashNetTotal >= 0 ? "+" : ""}{fmt(cashNetTotal)} FCFA
              </span>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {cashHistory.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Historique des caisses</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Ouvert par</th>
                    <th>Fond</th>
                    <th>Recette</th>
                    <th>Clôture</th>
                    <th>Écart</th>
                    <th>Statut</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cashHistory.map((c) => {
                    const recette = c.especes + c.carte + c.mtnMoney + c.moovMoney + c.virement;
                    return (
                      <tr key={c.id}>
                        <td>{c.date}</td>
                        <td>{c.openedBy}</td>
                        <td>{fmt(c.openingBalance)} FCFA</td>
                        <td>
                          {c.status === "closed" ? (
                            <span className={recette >= 0 ? "text-success fw-bold" : "text-danger fw-bold"}>
                              {fmt(recette)} FCFA
                            </span>
                          ) : "-"}
                        </td>
                        <td>{c.status === "closed" ? `${fmt(c.closingBalance)} FCFA` : "-"}</td>
                        <td>
                          {c.status === "closed" ? (
                            <span className={c.difference === 0 ? "text-success" : "text-danger"}>
                              {c.difference > 0 ? "+" : ""}{fmt(c.difference)} FCFA
                            </span>
                          ) : "-"}
                        </td>
                        <td>
                          <span className={`badge ${c.status === "open" ? "bg-success" : "bg-secondary"}`}>
                            {c.status === "open" ? "Ouverte" : "Fermée"}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => handleViewRegister(c)} title="Voir détails">
                            <i className="fa-solid fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
