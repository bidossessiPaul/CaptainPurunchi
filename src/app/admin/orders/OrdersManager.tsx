"use client";

import { useState, useEffect, useCallback } from "react";
import type { Order } from "@/app/types/order";
import OrderCard from "./OrderCard";
import OrderForm from "./OrderForm";
import ConfirmModal from "../ConfirmModal";

const TABS = [
  { key: "all", label: "Toutes" },
  { key: "pending", label: "En attente" },
  { key: "confirmed", label: "Confirmé" },
  { key: "completed", label: "Terminé" },
  { key: "cancelled", label: "Annulé" },
] as const;

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

type FormMode = null | { action: "create" } | { action: "edit"; data: Order };

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/orders?date=${selectedDate}`;
      if (activeTab !== "all") url += `&status=${activeTab}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement commandes:", err);
      setOrders([]);
    }
    setLoading(false);
  }, [selectedDate, activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleChangeStatus = async (id: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await fetchOrders();
    } catch (err) {
      console.error("Erreur changement statut:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    setOrders((prev) => prev.filter((o) => o.id !== id));
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    await fetchOrders();
  };

  const handleFormSave = () => {
    setFormMode(null);
    fetchOrders();
  };

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <>
      {/* Form */}
      {formMode && (
        <OrderForm
          order={formMode.action === "edit" ? formMode.data : null}
          onSave={handleFormSave}
          onCancel={() => setFormMode(null)}
        />
      )}

      {/* Date + tabs */}
      <div className="row mb-3">
        <div className="col">
          <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
            <button
              className={`btn ${selectedDate === todayStr() ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setSelectedDate(todayStr())}
            >
              Aujourd'hui
            </button>
            <input
              type="date"
              className="form-control"
              style={{ width: "auto" }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <span className="text-muted ms-2">
              {orders.length} commande{orders.length !== 1 ? "s" : ""}
              {pendingCount > 0 && <span className="badge bg-warning ms-2">{pendingCount} en attente</span>}
            </span>
            {!formMode && (
              <button
                className="btn btn-success ms-auto"
                onClick={() => setFormMode({ action: "create" })}
              >
                <i className="fa-solid fa-plus me-1"></i>
                Nouvelle commande
              </button>
            )}
          </div>

          <ul className="nav nav-tabs">
            {TABS.map((tab) => (
              <li key={tab.key} className="nav-item">
                <button
                  className={`nav-link ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="iconoir-shopping-bag" style={{ fontSize: "48px", color: "#95a0c5" }}></i>
            <h5 className="mt-3">Aucune commande</h5>
            <p className="text-muted">Aucune commande pour cette date et ce filtre.</p>
          </div>
        </div>
      ) : (
        <div className="row">
          {orders.map((order) => (
            <div key={order.id} className="col-md-6 col-lg-4">
              <OrderCard
                order={order}
                onChangeStatus={handleChangeStatus}
                onDelete={(id) => setDeleteTarget(id)}
                onEdit={(o) => setFormMode({ action: "edit", data: o })}
              />
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Supprimer la commande"
        message="Voulez-vous vraiment supprimer cette commande ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
