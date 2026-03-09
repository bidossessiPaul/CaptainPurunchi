"use client";

import { useState, useEffect, useCallback } from "react";
import type { DailyDish } from "@/app/types/daily-dish";
import DishCard from "./DishCard";
import DishForm from "./DishForm";
import ConfirmModal from "../ConfirmModal";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function formatDateLabel(date: string) {
  const today = todayStr();
  const tomorrow = tomorrowStr();
  if (date === today) return "Aujourd'hui";
  if (date === tomorrow) return "Demain";
  return new Date(date + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function DailyMenuManager() {
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [dishes, setDishes] = useState<DailyDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDish, setEditingDish] = useState<DailyDish | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchDishes = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/daily-dishes?date=${selectedDate}`);
    const data = await res.json();
    setDishes(data);
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  const handleCreate = async (data: Record<string, unknown>) => {
    const res = await fetch("/api/daily-dishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchDishes();
      setShowForm(false);
    }
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingDish) return;
    const res = await fetch(`/api/daily-dishes/${editingDish.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchDishes();
      setEditingDish(null);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    setDishes((prev) => prev.map((d) => (d.id === id ? { ...d, active } : d)));
    await fetch(`/api/daily-dishes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    setDishes((prev) => prev.filter((d) => d.id !== id));
    await fetch(`/api/daily-dishes/${id}`, { method: "DELETE" });
    await fetchDishes();
  };

  const reorder = async (newDishes: DailyDish[]) => {
    setDishes(newDishes);
    await fetch("/api/daily-dishes/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: newDishes.map((d) => d.id) }),
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const arr = [...dishes];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    reorder(arr);
  };

  const handleMoveDown = (index: number) => {
    if (index === dishes.length - 1) return;
    const arr = [...dishes];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    reorder(arr);
  };

  return (
    <>
      {/* Date selector */}
      <div className="row mb-3">
        <div className="col">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              className={`btn ${selectedDate === todayStr() ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setSelectedDate(todayStr())}
            >
              Aujourd&apos;hui
            </button>
            <button
              className={`btn ${selectedDate === tomorrowStr() ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setSelectedDate(tomorrowStr())}
            >
              Demain
            </button>
            <input
              type="date"
              className="form-control"
              style={{ width: "auto" }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <span className="text-muted ms-2 fs-14">
              <i className="iconoir-calendar me-1"></i>
              {formatDateLabel(selectedDate)} &mdash; {dishes.length} plat{dishes.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="row mb-3">
        <div className="col">
          <button
            className="btn btn-primary"
            onClick={() => { setShowForm(true); setEditingDish(null); }}
          >
            <i className="iconoir-plus me-1"></i>
            Ajouter un plat
          </button>
        </div>
      </div>

      {/* Form */}
      {(showForm || editingDish) && (
        <div className="row mb-3">
          <div className="col-lg-8">
            <DishForm
              dish={editingDish}
              selectedDate={selectedDate}
              onSave={editingDish ? handleUpdate : handleCreate}
              onCancel={() => { setShowForm(false); setEditingDish(null); }}
            />
          </div>
        </div>
      )}

      {/* Dishes grid */}
      {loading ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        </div>
      ) : dishes.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="iconoir-dish" style={{ fontSize: "48px", color: "#95a0c5" }}></i>
            <h5 className="mt-3">Aucun plat pour {formatDateLabel(selectedDate)}</h5>
            <p className="text-muted">Ajoutez des plats au menu du jour.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <i className="iconoir-plus me-1"></i>
              Ajouter un plat
            </button>
          </div>
        </div>
      ) : (
        <div className="row">
          {dishes.map((dish, i) => (
            <div key={dish.id} className="col-md-6 col-lg-4 col-xl-3">
              <DishCard
                dish={dish}
                index={i}
                onToggleActive={handleToggleActive}
                onEdit={(d) => { setEditingDish(d); setShowForm(false); }}
                onDelete={(id) => setDeleteTarget(id)}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isFirst={i === 0}
                isLast={i === dishes.length - 1}
              />
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Supprimer le plat"
        message="Voulez-vous vraiment supprimer ce plat ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
