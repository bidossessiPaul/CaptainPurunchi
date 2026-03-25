"use client";

import { useState, useEffect, useCallback } from "react";
import ConfirmModal from "../ConfirmModal";
import CategoryForm from "./CategoryForm";
import ItemRow from "./ItemRow";

interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
  active: boolean;
  items: Item[];
}

interface Item {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  order: number;
  active: boolean;
}

const ICON_LABELS: Record<string, string> = {
  martini: "Cocktail",
  wine: "Vin / Liqueur",
  coffee: "Café",
  citrus: "Jus",
  beer: "Bière",
  zap: "Énergie",
  fish: "Poisson",
  flame: "Grillades",
  utensils: "Couverts",
  "glass-water": "Eau",
};

export default function MenuManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "category" | "item"; id: string; label: string } | null>(null);

  // Item add form per category
  const [addingItemCatId, setAddingItemCatId] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [submittingItem, setSubmittingItem] = useState(false);

  // Edit item state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/menu/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ---- Category actions ----
  const handleAddCategory = async (name: string, icon: string) => {
    const res = await fetch("/api/menu/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon }),
    });
    if (res.ok) {
      await fetchCategories();
      setShowCatForm(false);
    }
  };

  const handleToggleCategoryActive = async (id: string, active: boolean) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, active } : c)));
    await fetch(`/api/menu/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
  };

  const handleDeleteCategory = (id: string, label: string) => {
    setDeleteTarget({ type: "category", id, label });
  };

  const handleMoveCategoryUp = async (index: number) => {
    if (index === 0) return;
    const arr = [...categories];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    setCategories(arr);
    await fetch("/api/menu/categories/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: arr.map((c) => c.id) }),
    });
  };

  const handleMoveCategoryDown = async (index: number) => {
    if (index === categories.length - 1) return;
    const arr = [...categories];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    setCategories(arr);
    await fetch("/api/menu/categories/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: arr.map((c) => c.id) }),
    });
  };

  // ---- Item actions ----
  const handleAddItem = async (categoryId: string) => {
    if (!itemName.trim() || !itemPrice.trim()) return;
    setSubmittingItem(true);

    const res = await fetch("/api/menu/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId,
        name: itemName.trim(),
        description: itemDesc.trim(),
        price: itemPrice.trim(),
      }),
    });

    if (res.ok) {
      await fetchCategories();
      setItemName("");
      setItemDesc("");
      setItemPrice("");
      setAddingItemCatId(null);
    }
    setSubmittingItem(false);
  };

  const handleToggleItemActive = async (itemId: string, active: boolean) => {
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        items: c.items.map((it) => (it.id === itemId ? { ...it, active } : it)),
      }))
    );
    await fetch(`/api/menu/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
  };

  const handleDeleteItem = (id: string, label: string) => {
    setDeleteTarget({ type: "item", id, label });
  };

  const handleStartEditItem = (item: Item) => {
    setEditingItemId(item.id);
    setEditName(item.name);
    setEditDesc(item.description);
    setEditPrice(item.price);
  };

  const handleSaveEditItem = async () => {
    if (!editingItemId || !editName.trim() || !editPrice.trim()) return;
    await fetch(`/api/menu/items/${editingItemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName.trim(),
        description: editDesc.trim(),
        price: editPrice.trim(),
      }),
    });
    setEditingItemId(null);
    await fetchCategories();
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  const handleMoveItemUp = async (categoryId: string, index: number) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat || index === 0) return;
    const arr = [...cat.items];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, items: arr } : c))
    );
    await fetch("/api/menu/items/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: arr.map((it) => it.id) }),
    });
  };

  const handleMoveItemDown = async (categoryId: string, index: number) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat || index === cat.items.length - 1) return;
    const arr = [...cat.items];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, items: arr } : c))
    );
    await fetch("/api/menu/items/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: arr.map((it) => it.id) }),
    });
  };

  // ---- Delete confirm ----
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    setDeleteTarget(null);

    if (type === "category") {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      await fetch(`/api/menu/categories/${id}`, { method: "DELETE" });
    } else {
      setCategories((prev) =>
        prev.map((c) => ({ ...c, items: c.items.filter((it) => it.id !== id) }))
      );
      await fetch(`/api/menu/items/${id}`, { method: "DELETE" });
    }
    await fetchCategories();
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement du menu...</p>
        </div>
      </div>
    );
  }

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <>
      {/* Header */}
      <div className="row mb-3">
        <div className="col d-flex align-items-center">
          <button className="btn btn-primary" onClick={() => setShowCatForm(!showCatForm)}>
            <i className={`iconoir-${showCatForm ? "minus" : "plus"} me-1`}></i>
            {showCatForm ? "Annuler" : "Ajouter une catégorie"}
          </button>
          <span className="text-muted ms-3 fs-13">
            {categories.length} catégorie{categories.length !== 1 ? "s" : ""} • {totalItems} item{totalItems !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Add category form */}
      {showCatForm && (
        <CategoryForm onSubmit={handleAddCategory} onCancel={() => setShowCatForm(false)} />
      )}

      {/* Categories accordion */}
      {categories.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="iconoir-cart-alt" style={{ fontSize: "48px", color: "#95a0c5" }}></i>
            <h5 className="mt-3">Aucune catégorie</h5>
            <p className="text-muted">Ajoutez votre première catégorie de menu.</p>
            <button className="btn btn-primary" onClick={() => setShowCatForm(true)}>
              <i className="iconoir-plus me-1"></i>
              Ajouter une catégorie
            </button>
          </div>
        </div>
      ) : (
        categories.map((cat, catIndex) => (
          <div key={cat.id} className="card mb-2">
            {/* Category header */}
            <div
              className="card-header d-flex align-items-center justify-content-between py-2"
              style={{ cursor: "pointer", userSelect: "none" }}
              onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)}
            >
              <div className="d-flex align-items-center gap-2">
                <i className={`iconoir-nav-arrow-${openCat === cat.id ? "down" : "right"}`}></i>
                <span className="fw-semibold">{ICON_LABELS[cat.icon] ? `${ICON_LABELS[cat.icon]} — ` : ""}{cat.name}</span>
                <span className="badge bg-primary-subtle text-primary">{cat.items.length}</span>
                {!cat.active && <span className="badge bg-secondary">Désactivé</span>}
              </div>
              <div className="d-flex align-items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={cat.active}
                    onChange={() => handleToggleCategoryActive(cat.id, !cat.active)}
                    id={`cat-active-${cat.id}`}
                  />
                </div>
                <button
                  className="btn btn-sm btn-light"
                  disabled={catIndex === 0}
                  onClick={() => handleMoveCategoryUp(catIndex)}
                  title="Monter"
                >
                  <i className="iconoir-arrow-up"></i>
                </button>
                <button
                  className="btn btn-sm btn-light"
                  disabled={catIndex === categories.length - 1}
                  onClick={() => handleMoveCategoryDown(catIndex)}
                  title="Descendre"
                >
                  <i className="iconoir-arrow-down"></i>
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  title="Supprimer"
                >
                  <i className="iconoir-trash"></i>
                </button>
              </div>
            </div>

            {/* Category body (items) */}
            {openCat === cat.id && (
              <div className="card-body p-0">
                {cat.items.length === 0 ? (
                  <p className="text-muted text-center py-3 mb-0">Aucun item dans cette catégorie.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "40px" }}>#</th>
                          <th>Nom</th>
                          <th>Description</th>
                          <th style={{ width: "130px" }}>Prix</th>
                          <th style={{ width: "160px" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cat.items.map((item, itemIndex) => (
                          <ItemRow
                            key={item.id}
                            item={item}
                            index={itemIndex}
                            isFirst={itemIndex === 0}
                            isLast={itemIndex === cat.items.length - 1}
                            isEditing={editingItemId === item.id}
                            editName={editName}
                            editDesc={editDesc}
                            editPrice={editPrice}
                            onEditNameChange={setEditName}
                            onEditDescChange={setEditDesc}
                            onEditPriceChange={setEditPrice}
                            onStartEdit={() => handleStartEditItem(item)}
                            onSaveEdit={handleSaveEditItem}
                            onCancelEdit={handleCancelEdit}
                            onToggleActive={(active) => handleToggleItemActive(item.id, active)}
                            onDelete={() => handleDeleteItem(item.id, item.name)}
                            onMoveUp={() => handleMoveItemUp(cat.id, itemIndex)}
                            onMoveDown={() => handleMoveItemDown(cat.id, itemIndex)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add item form */}
                <div className="p-3 border-top">
                  {addingItemCatId === cat.id ? (
                    <div className="row g-2 align-items-end">
                      <div className="col-md-3">
                        <label className="form-label fs-13">Nom</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Ex: Mojito"
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fs-13">Description</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Courte description..."
                          value={itemDesc}
                          onChange={(e) => setItemDesc(e.target.value)}
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label fs-13">Prix</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="3.000 F"
                          value={itemPrice}
                          onChange={(e) => setItemPrice(e.target.value)}
                        />
                      </div>
                      <div className="col-md-3 d-flex gap-1">
                        <button
                          className="btn btn-sm btn-primary"
                          disabled={submittingItem || !itemName.trim() || !itemPrice.trim()}
                          onClick={() => handleAddItem(cat.id)}
                        >
                          {submittingItem ? (
                            <span className="spinner-border spinner-border-sm" />
                          ) : (
                            <><i className="iconoir-check me-1"></i>Ajouter</>
                          )}
                        </button>
                        <button
                          className="btn btn-sm btn-light"
                          onClick={() => {
                            setAddingItemCatId(null);
                            setItemName("");
                            setItemDesc("");
                            setItemPrice("");
                          }}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setAddingItemCatId(cat.id);
                        setItemName("");
                        setItemDesc("");
                        setItemPrice("");
                      }}
                    >
                      <i className="iconoir-plus me-1"></i>
                      Ajouter un item
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={deleteTarget !== null}
        title={deleteTarget?.type === "category" ? "Supprimer la catégorie" : "Supprimer l'item"}
        message={
          deleteTarget?.type === "category"
            ? `Supprimer "${deleteTarget.label}" et tous ses items ? Cette action est irréversible.`
            : `Supprimer "${deleteTarget?.label}" ? Cette action est irréversible.`
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
