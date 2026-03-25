"use client";

import { useState, useEffect, useCallback } from "react";
import type { StockItem } from "@/app/types/stock-item";
import type { SupplyList, SupplyListItem } from "@/lib/supply-list-store";
import { STOCK_UNIT_LABELS } from "@/lib/constants";

function fmt(n: number) {
  return Math.round(n).toLocaleString("fr-FR");
}

export default function RavitaillementManager() {
  const [loading, setLoading] = useState(true);
  const [supplyLists, setSupplyLists] = useState<SupplyList[]>([]);
  const [activeSupplyList, setActiveSupplyList] = useState<SupplyList | null>(null);
  const [allStockItems, setAllStockItems] = useState<StockItem[]>([]);

  // Add item form
  const [addItemId, setAddItemId] = useState("");
  const [addItemQty, setAddItemQty] = useState("1");

  // Purchase modal
  const [purchaseModal, setPurchaseModal] = useState<SupplyListItem | null>(null);
  const [purchaseQty, setPurchaseQty] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [listsRes, itemsRes] = await Promise.all([
        fetch("/api/stock/supply-lists").then((r) => r.json()),
        fetch("/api/stock/items?active=true").then((r) => r.json()),
      ]);
      setSupplyLists(Array.isArray(listsRes) ? listsRes : []);
      setAllStockItems(Array.isArray(itemsRes) ? itemsRes : []);

      // Reload active list detail if one is selected
      if (activeSupplyList) {
        const detail = await fetch(`/api/stock/supply-lists/${activeSupplyList.id}`).then((r) => r.ok ? r.json() : null);
        setActiveSupplyList(detail);
      } else {
        // Auto-load the first active list
        const active = (listsRes as SupplyList[]).find((l) => l.status === "draft" || l.status === "submitted");
        if (active) {
          const detail = await fetch(`/api/stock/supply-lists/${active.id}`).then((r) => r.json());
          setActiveSupplyList(detail);
        }
      }
    } catch (err) {
      console.error("Erreur chargement ravitaillement:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Handlers ──
  async function handleCreateSupplyList() {
    const res = await fetch("/api/stock/supply-lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const list = await res.json();
      setActiveSupplyList(list);
      fetchData();
    }
  }

  async function handleSubmitSupplyList() {
    if (!activeSupplyList) return;
    await fetch(`/api/stock/supply-lists/${activeSupplyList.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "submitted" }),
    });
    fetchData();
  }

  async function handleDeleteSupplyList(id: string) {
    await fetch(`/api/stock/supply-lists/${id}`, { method: "DELETE" });
    setActiveSupplyList(null);
    fetchData();
  }

  async function handleAddItemToList() {
    if (!activeSupplyList || !addItemId) return;
    const item = allStockItems.find((i) => i.id === addItemId);
    if (!item) return;
    await fetch(`/api/stock/supply-lists/${activeSupplyList.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stockItemId: item.id,
        stockItemName: item.name,
        quantityNeeded: Number(addItemQty) || 1,
      }),
    });
    setAddItemId("");
    setAddItemQty("1");
    fetchData();
  }

  async function handleRemoveItem(itemId: string) {
    if (!activeSupplyList) return;
    await fetch(`/api/stock/supply-lists/${activeSupplyList.id}/items/${itemId}`, { method: "DELETE" });
    fetchData();
  }

  async function handleConfirmPurchase() {
    if (!purchaseModal || !activeSupplyList) return;
    const qty = Number(purchaseQty);
    if (!qty || qty <= 0) return;
    await fetch(`/api/stock/supply-lists/${activeSupplyList.id}/items/${purchaseModal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quantityBought: qty,
        unitPrice: Number(purchasePrice) || 0,
      }),
    });
    setPurchaseModal(null);
    setPurchaseQty("");
    setPurchasePrice("");
    fetchData();
  }

  async function handleViewList(list: SupplyList) {
    const detail = await fetch(`/api/stock/supply-lists/${list.id}`).then((r) => r.json());
    setActiveSupplyList(detail);
  }

  // ── Status badge ──
  function statusBadge(s: string) {
    const map: Record<string, { cls: string; label: string }> = {
      draft: { cls: "bg-secondary", label: "Brouillon" },
      submitted: { cls: "bg-info", label: "Soumise" },
      completed: { cls: "bg-success", label: "Terminée" },
    };
    const b = map[s] || { cls: "bg-secondary", label: s };
    return <span className={`badge ${b.cls}`}>{b.label}</span>;
  }

  // ── Loading ──
  if (loading && supplyLists.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Detail view ──
  if (activeSupplyList) {
    const listItems = activeSupplyList.items || [];
    const purchasedCount = listItems.filter((i) => i.purchased).length;
    const totalCost = listItems.reduce((sum, i) => sum + (i.purchased ? i.unitPrice * i.quantityBought : 0), 0);
    const isEditable = activeSupplyList.status === "draft";
    const canCheckOff = activeSupplyList.status === "submitted" || activeSupplyList.status === "draft";

    return (
      <>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => setActiveSupplyList(null)}>
              <i className="fa-solid fa-arrow-left me-1"></i> Retour
            </button>
            {statusBadge(activeSupplyList.status)}
            <small className="text-muted ms-2">
              {new Date(activeSupplyList.createdAt).toLocaleDateString("fr-FR")} par {activeSupplyList.createdBy || "—"}
            </small>
          </div>
          <div className="d-flex gap-2">
            {isEditable && listItems.length > 0 && (
              <button className="btn btn-sm btn-primary" onClick={handleSubmitSupplyList}>
                <i className="fa-solid fa-paper-plane me-1"></i> Soumettre
              </button>
            )}
            {isEditable && (
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteSupplyList(activeSupplyList.id)}>
                <i className="fa-solid fa-trash me-1"></i> Supprimer
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        {listItems.length > 0 && (
          <div className="card mb-3">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontSize: 13, fontWeight: 600 }}>Progression</span>
                <span style={{ fontSize: 13 }}>{purchasedCount}/{listItems.length} articles</span>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${listItems.length > 0 ? (purchasedCount / listItems.length) * 100 : 0}%` }}
                ></div>
              </div>
              {totalCost > 0 && (
                <div className="mt-2 text-end">
                  <small className="text-muted">Total achats : </small>
                  <strong>{fmt(totalCost)} FCFA</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add item (draft only) */}
        {isEditable && (
          <div className="card mb-3">
            <div className="card-body py-2">
              <div className="row g-2 align-items-end">
                <div className="col-md-5">
                  <label className="form-label mb-1" style={{ fontSize: 12 }}>Ajouter un produit</label>
                  <select className="form-select form-select-sm" value={addItemId} onChange={(e) => setAddItemId(e.target.value)}>
                    <option value="">Sélectionner un produit...</option>
                    {allStockItems
                      .filter((si) => !listItems.some((li) => li.stockItemId === si.id))
                      .map((si) => <option key={si.id} value={si.id}>{si.name}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label mb-1" style={{ fontSize: 12 }}>Quantité</label>
                  <input type="number" className="form-control form-control-sm" value={addItemQty} onChange={(e) => setAddItemQty(e.target.value)} min="0.1" step="0.1" />
                </div>
                <div className="col-md-4">
                  <button className="btn btn-sm btn-success" disabled={!addItemId} onClick={handleAddItemToList}>
                    <i className="fa-solid fa-plus me-1"></i> Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Items table */}
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 50 }}></th>
                    <th>Produit</th>
                    <th className="text-center">Qté nécessaire</th>
                    <th className="text-center">Qté achetée</th>
                    <th className="text-end">Prix unit.</th>
                    <th className="text-end">Total</th>
                    <th style={{ width: 100 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {listItems.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-muted py-4">Aucun article dans la liste</td></tr>
                  ) : listItems.map((item) => (
                    <tr key={item.id} style={{ opacity: item.purchased ? 0.6 : 1, textDecoration: item.purchased ? "line-through" : "none" }}>
                      <td className="text-center">
                        {item.purchased ? (
                          <i className="fa-solid fa-circle-check text-success" style={{ fontSize: 20 }}></i>
                        ) : canCheckOff ? (
                          <button
                            className="btn btn-sm btn-outline-success"
                            style={{ padding: "2px 8px" }}
                            onClick={() => {
                              setPurchaseModal(item);
                              setPurchaseQty(String(item.quantityNeeded));
                              setPurchasePrice("");
                            }}
                            title="Marquer comme acheté"
                          >
                            <i className="fa-regular fa-circle"></i>
                          </button>
                        ) : (
                          <i className="fa-regular fa-circle text-muted" style={{ fontSize: 20 }}></i>
                        )}
                      </td>
                      <td className="fw-semibold">{item.stockItemName}</td>
                      <td className="text-center">{item.quantityNeeded}</td>
                      <td className="text-center">{item.purchased ? item.quantityBought : "—"}</td>
                      <td className="text-end">{item.purchased && item.unitPrice > 0 ? `${fmt(item.unitPrice)} FCFA` : "—"}</td>
                      <td className="text-end">{item.purchased ? `${fmt(item.unitPrice * item.quantityBought)} FCFA` : "—"}</td>
                      <td className="text-center">
                        {isEditable && !item.purchased && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            style={{ padding: "2px 8px", fontSize: 12 }}
                            onClick={() => handleRemoveItem(item.id)}
                            title="Retirer"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Purchase confirmation modal */}
        {purchaseModal && (
          <div
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => setPurchaseModal(null)}
          >
            <div className="card" style={{ width: 420, maxWidth: "90vw" }} onClick={(e) => e.stopPropagation()}>
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="fa-solid fa-check-circle text-success me-2"></i>
                  Confirmer l'achat
                </h5>
              </div>
              <div className="card-body">
                <p className="mb-3"><strong>{purchaseModal.stockItemName}</strong></p>
                <div className="mb-3">
                  <label className="form-label">Quantité achetée</label>
                  <input type="number" className="form-control" value={purchaseQty} onChange={(e) => setPurchaseQty(e.target.value)} min="0.1" step="0.1" autoFocus />
                </div>
                <div className="mb-3">
                  <label className="form-label">Prix unitaire (FCFA)</label>
                  <input type="number" className="form-control" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} min="0" placeholder="Optionnel" />
                </div>
              </div>
              <div className="card-footer d-flex gap-2 justify-content-end">
                <button className="btn btn-light" onClick={() => setPurchaseModal(null)}>Annuler</button>
                <button className="btn btn-success" onClick={handleConfirmPurchase} disabled={!purchaseQty || Number(purchaseQty) <= 0}>
                  <i className="fa-solid fa-check me-1"></i> Confirmer
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ── Main list view ──
  const activeLists = supplyLists.filter((l) => l.status === "draft" || l.status === "submitted");
  const completedLists = supplyLists.filter((l) => l.status === "completed");

  return (
    <>
      {/* Active lists */}
      {activeLists.length === 0 ? (
        <div className="card mb-3">
          <div className="card-body text-center py-5">
            <i className="fa-solid fa-truck-field" style={{ fontSize: 48, color: "#95a0c5" }}></i>
            <h5 className="mt-3">Aucune liste de ravitaillement en cours</h5>
            <p className="text-muted">Créez une liste pour commencer. Les produits en dessous du seuil minimum seront ajoutés automatiquement.</p>
            <button className="btn btn-success" onClick={handleCreateSupplyList}>
              <i className="fa-solid fa-plus me-1"></i> Nouvelle liste de courses
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Listes en cours</h5>
            <button className="btn btn-success btn-sm" onClick={handleCreateSupplyList}>
              <i className="fa-solid fa-plus me-1"></i> Nouvelle liste
            </button>
          </div>
          {activeLists.map((list) => (
            <div key={list.id} className="card mb-2" style={{ cursor: "pointer" }} onClick={() => handleViewList(list)}>
              <div className="card-body py-3 d-flex justify-content-between align-items-center">
                <div>
                  {statusBadge(list.status)}
                  <span className="ms-2 fw-semibold">Liste du {new Date(list.createdAt).toLocaleDateString("fr-FR")}</span>
                  <small className="text-muted ms-2">par {list.createdBy || "—"}</small>
                </div>
                <i className="fa-solid fa-chevron-right text-muted"></i>
              </div>
            </div>
          ))}
        </>
      )}

      {/* History */}
      {completedLists.length > 0 && (
        <div className="mt-4">
          <h5 className="mb-3">Historique</h5>
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Créée par</th>
                      <th>Statut</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedLists.map((list) => (
                      <tr key={list.id}>
                        <td>{new Date(list.createdAt).toLocaleDateString("fr-FR")}</td>
                        <td>{list.createdBy || "—"}</td>
                        <td>{statusBadge(list.status)}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => handleViewList(list)}>
                            <i className="fa-solid fa-eye me-1"></i> Voir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
