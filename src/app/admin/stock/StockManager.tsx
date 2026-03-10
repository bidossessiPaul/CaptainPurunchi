"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import type { StockItem } from "@/app/types/stock-item";
import type { StockMovement } from "@/app/types/stock-movement";
import {
  STOCK_CATEGORIES,
  STOCK_CATEGORY_LABELS,
  STOCK_MOVEMENT_TYPES,
  STOCK_MOVEMENT_TYPE_LABELS,
  STOCK_UNIT_LABELS,
} from "@/lib/constants";
import StockItemForm from "./StockItemForm";
import StockMovementForm from "./StockMovementForm";

const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ConfirmModal = dynamic(() => import("@/app/admin/finance/FinanceManager").then((m) => (m as any).ConfirmModal).catch(() => () => null), { ssr: false });

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: "fa-solid fa-chart-pie" },
  { key: "items", label: "Produits", icon: "fa-solid fa-box" },
  { key: "movements", label: "Mouvements", icon: "fa-solid fa-arrow-right-arrow-left" },
  { key: "alerts", label: "Alertes", icon: "fa-solid fa-triangle-exclamation" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const PIE_COLORS = ["#1a3a5c", "#5BC0EB", "#28a745", "#ffc107", "#dc3545", "#6f42c1"];

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

export default function StockManager() {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [loading, setLoading] = useState(true);

  // Data
  const [items, setItems] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [summary, setSummary] = useState<{
    totalItems: number;
    lowStockCount: number;
    movementsToday: number;
    totalValue: number;
    byCategory: Record<string, number>;
  } | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterMovType, setFilterMovType] = useState("");
  const [filterMovItem, setFilterMovItem] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Forms
  const [itemForm, setItemForm] = useState<StockItem | "new" | null>(null);
  const [movementForm, setMovementForm] = useState<{ itemId?: string; type?: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; label: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "dashboard") {
        const [itemsRes, summaryRes] = await Promise.all([
          fetch("/api/stock/items?active=true").then((r) => r.json()),
          fetch("/api/stock/summary").then((r) => r.json()),
        ]);
        setItems(itemsRes);
        setSummary(summaryRes);
      } else if (tab === "items") {
        const params = new URLSearchParams();
        if (filterCategory) params.set("category", filterCategory);
        if (filterSearch) params.set("search", filterSearch);
        const res = await fetch(`/api/stock/items?${params}`);
        setItems(await res.json());
      } else if (tab === "movements") {
        const params = new URLSearchParams();
        if (filterMovType) params.set("type", filterMovType);
        if (filterMovItem) params.set("stockItemId", filterMovItem);
        if (dateFrom) params.set("dateFrom", dateFrom);
        if (dateTo) params.set("dateTo", dateTo);
        const [movRes, itemsRes] = await Promise.all([
          fetch(`/api/stock/movements?${params}`).then((r) => r.json()),
          fetch("/api/stock/items").then((r) => r.json()),
        ]);
        setMovements(movRes);
        setItems(itemsRes);
      } else if (tab === "alerts") {
        const res = await fetch("/api/stock/items?active=true");
        const all: StockItem[] = await res.json();
        setItems(all.filter((i) => i.minStock > 0 && i.currentStock < i.minStock));
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [tab, filterCategory, filterSearch, filterMovType, filterMovItem, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const endpoint = deleteTarget.type === "item"
      ? `/api/stock/items/${deleteTarget.id}`
      : `/api/stock/movements/${deleteTarget.id}`;
    await fetch(endpoint, { method: "DELETE" });
    setDeleteTarget(null);
    fetchData();
  };

  // ── CSV Export helpers ──
  function downloadCSV(filename: string, header: string[], rows: string[][]) {
    const BOM = "\uFEFF";
    const csv = [header.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportItemsCSV() {
    downloadCSV(
      "stock_produits.csv",
      ["Nom", "Catégorie", "Stock actuel", "Unité", "Stock min", "Prix unitaire", "Fournisseur"],
      items.map((i) => [
        i.name,
        STOCK_CATEGORY_LABELS[i.category] || i.category,
        String(i.currentStock),
        STOCK_UNIT_LABELS[i.unit] || i.unit,
        String(i.minStock),
        String(i.unitPrice),
        i.supplier,
      ])
    );
  }

  function exportMovementsCSV() {
    downloadCSV(
      "stock_mouvements.csv",
      ["Date", "Produit", "Type", "Quantité", "Prix unitaire", "Coût total", "Raison", "Par"],
      movements.map((m) => [
        m.date,
        m.stockItemName,
        STOCK_MOVEMENT_TYPE_LABELS[m.type] || m.type,
        String(m.quantity),
        String(m.unitPrice),
        String(m.totalCost),
        m.reason,
        m.createdBy,
      ])
    );
  }

  // ── Stock level badge ──
  function stockBadge(item: StockItem) {
    if (item.minStock <= 0) return <span className="badge bg-secondary-subtle text-secondary">{item.currentStock} {item.unit}</span>;
    if (item.currentStock < item.minStock) return <span className="badge bg-danger-subtle text-danger">{item.currentStock} {item.unit}</span>;
    if (item.currentStock < item.minStock * 1.5) return <span className="badge bg-warning-subtle text-warning">{item.currentStock} {item.unit}</span>;
    return <span className="badge bg-success-subtle text-success">{item.currentStock} {item.unit}</span>;
  }

  // ── Movement type badge ──
  function movTypeBadge(type: string) {
    const colors: Record<string, string> = { entry: "success", exit: "primary", waste: "danger", adjustment: "warning" };
    const color = colors[type] || "secondary";
    return <span className={`badge bg-${color}-subtle text-${color}`}>{STOCK_MOVEMENT_TYPE_LABELS[type] || type}</span>;
  }

  // ── RENDER: Dashboard ──
  function renderDashboard() {
    if (!summary) return null;

    const pieData = Object.entries(summary.byCategory)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({ name: STOCK_CATEGORY_LABELS[key] || key, value }));

    // Low stock items for quick view
    const lowItems = items.filter((i) => i.minStock > 0 && i.currentStock < i.minStock).slice(0, 5);

    return (
      <>
        {/* Stat Cards */}
        <div className="row g-3 mb-4">
          {[
            { label: "Produits actifs", value: summary.totalItems, icon: "fa-solid fa-box", color: "#1a3a5c" },
            { label: "En alerte", value: summary.lowStockCount, icon: "fa-solid fa-triangle-exclamation", color: "#dc3545" },
            { label: "Valeur du stock", value: `${fmt(summary.totalValue)} FCFA`, icon: "fa-solid fa-coins", color: "#28a745" },
            { label: "Mouvements aujourd'hui", value: summary.movementsToday, icon: "fa-solid fa-arrow-right-arrow-left", color: "#5BC0EB" },
          ].map((card, i) => (
            <div key={i} className="col-md-3 col-6">
              <div className="card mb-0" style={{ borderLeft: `4px solid ${card.color}` }}>
                <div className="card-body py-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: `${card.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <i className={card.icon} style={{ color: card.color, fontSize: 18 }}></i>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#8a92a6", fontWeight: 600, textTransform: "uppercase" }}>{card.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#1a3a5c" }}>{card.value}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="row g-3 mb-4">
          <div className="col-md-7">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Valeur par catégorie</h5>
              </div>
              <div className="card-body">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""} ${((percent || 0) * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${fmt(Number(v))} FCFA`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted text-center py-4">Aucune donnée</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-5">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Alertes stock bas</h5>
                {lowItems.length > 0 && (
                  <button className="btn btn-sm btn-outline-danger" onClick={() => setTab("alerts")}>
                    Voir tout
                  </button>
                )}
              </div>
              <div className="card-body p-0">
                {lowItems.length === 0 ? (
                  <p className="text-muted text-center py-4">
                    <i className="fa-solid fa-circle-check text-success me-1"></i>
                    Tous les stocks sont OK
                  </p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Produit</th>
                          <th className="text-center">Stock</th>
                          <th className="text-center">Min</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowItems.map((i) => (
                          <tr key={i.id}>
                            <td>{i.name}</td>
                            <td className="text-center">{stockBadge(i)}</td>
                            <td className="text-center text-muted">{i.minStock} {i.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-primary btn-sm" onClick={() => { setTab("items"); setItemForm("new"); }}>
            <i className="fa-solid fa-plus me-1"></i> Nouveau produit
          </button>
          <button className="btn btn-success btn-sm" onClick={() => { setTab("movements"); setMovementForm({ type: "entry" }); }}>
            <i className="fa-solid fa-arrow-down me-1"></i> Entrée de stock
          </button>
          <button className="btn btn-warning btn-sm" onClick={() => { setTab("movements"); setMovementForm({ type: "exit" }); }}>
            <i className="fa-solid fa-arrow-up me-1"></i> Sortie de stock
          </button>
        </div>
      </>
    );
  }

  // ── RENDER: Items ──
  function renderItems() {
    return (
      <>
        {/* Filters */}
        <div className="card mb-3">
          <div className="card-body py-2">
            <div className="row g-2 align-items-end">
              <div className="col-md-3">
                <label className="form-label mb-1" style={{ fontSize: 12 }}>Catégorie</label>
                <select className="form-select form-select-sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="">Toutes</option>
                  {STOCK_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label mb-1" style={{ fontSize: 12 }}>Recherche</label>
                <input
                  className="form-control form-control-sm"
                  placeholder="Nom du produit..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                />
              </div>
              <div className="col-md-5 d-flex gap-2 justify-content-end">
                <button className="btn btn-primary btn-sm" onClick={() => setItemForm("new")}>
                  <i className="fa-solid fa-plus me-1"></i> Nouveau produit
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={exportItemsCSV} disabled={items.length === 0}>
                  <i className="fa-solid fa-download me-1"></i> CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        {itemForm && (
          <StockItemForm
            item={itemForm === "new" ? null : itemForm}
            onSave={() => { setItemForm(null); fetchData(); }}
            onCancel={() => setItemForm(null)}
          />
        )}

        {/* Table */}
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nom</th>
                    <th>Catégorie</th>
                    <th className="text-center">Stock</th>
                    <th className="text-center">Min</th>
                    <th className="text-end">Prix unit.</th>
                    <th>Fournisseur</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-muted py-4">Aucun produit</td></tr>
                  ) : items.map((item) => (
                    <tr key={item.id} style={{ opacity: item.active ? 1 : 0.5 }}>
                      <td>
                        <div className="fw-semibold">{item.name}</div>
                        {item.description && <small className="text-muted">{item.description}</small>}
                      </td>
                      <td><span className="badge bg-secondary-subtle text-secondary">{STOCK_CATEGORY_LABELS[item.category] || item.category}</span></td>
                      <td className="text-center">{stockBadge(item)}</td>
                      <td className="text-center text-muted">{item.minStock > 0 ? `${item.minStock} ${item.unit}` : "—"}</td>
                      <td className="text-end">{item.unitPrice > 0 ? `${fmt(item.unitPrice)} FCFA` : "—"}</td>
                      <td className="text-muted">{item.supplier || "—"}</td>
                      <td className="text-center">
                        <div className="d-flex gap-1 justify-content-center">
                          <button
                            className="btn btn-sm btn-soft-success"
                            title="Entrée"
                            onClick={() => setMovementForm({ itemId: item.id, type: "entry" })}
                            style={{ padding: "2px 8px", fontSize: 12 }}
                          >
                            <i className="fa-solid fa-arrow-down"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-soft-warning"
                            title="Sortie"
                            onClick={() => setMovementForm({ itemId: item.id, type: "exit" })}
                            style={{ padding: "2px 8px", fontSize: 12 }}
                          >
                            <i className="fa-solid fa-arrow-up"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-soft-primary"
                            title="Modifier"
                            onClick={() => setItemForm(item)}
                            style={{ padding: "2px 8px", fontSize: 12 }}
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-soft-danger"
                            title="Supprimer"
                            onClick={() => setDeleteTarget({ type: "item", id: item.id, label: item.name })}
                            style={{ padding: "2px 8px", fontSize: 12 }}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Movement form if triggered from item actions */}
        {movementForm && (
          <StockMovementForm
            items={items}
            preselectedItemId={movementForm.itemId}
            preselectedType={movementForm.type}
            onSave={() => { setMovementForm(null); fetchData(); }}
            onCancel={() => setMovementForm(null)}
          />
        )}
      </>
    );
  }

  // ── RENDER: Movements ──
  function renderMovements() {
    return (
      <>
        {/* Filters */}
        <div className="card mb-3">
          <div className="card-body py-2">
            <div className="row g-2 align-items-end">
              <div className="col-md-2">
                <label className="form-label mb-1" style={{ fontSize: 12 }}>Type</label>
                <select className="form-select form-select-sm" value={filterMovType} onChange={(e) => setFilterMovType(e.target.value)}>
                  <option value="">Tous</option>
                  {STOCK_MOVEMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label mb-1" style={{ fontSize: 12 }}>Produit</label>
                <select className="form-select form-select-sm" value={filterMovItem} onChange={(e) => setFilterMovItem(e.target.value)}>
                  <option value="">Tous</option>
                  {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label mb-1" style={{ fontSize: 12 }}>Du</label>
                <input type="date" className="form-control form-control-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="col-md-2">
                <label className="form-label mb-1" style={{ fontSize: 12 }}>Au</label>
                <input type="date" className="form-control form-control-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <div className="col-md-3 d-flex gap-2 justify-content-end">
                <button className="btn btn-primary btn-sm" onClick={() => setMovementForm({})}>
                  <i className="fa-solid fa-plus me-1"></i> Mouvement
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={exportMovementsCSV} disabled={movements.length === 0}>
                  <i className="fa-solid fa-download me-1"></i> CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        {movementForm && (
          <StockMovementForm
            items={items}
            preselectedItemId={movementForm.itemId}
            preselectedType={movementForm.type}
            onSave={() => { setMovementForm(null); fetchData(); }}
            onCancel={() => setMovementForm(null)}
          />
        )}

        {/* Table */}
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Produit</th>
                    <th className="text-center">Type</th>
                    <th className="text-end">Quantité</th>
                    <th className="text-end">P.U.</th>
                    <th className="text-end">Coût total</th>
                    <th>Raison</th>
                    <th>Par</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.length === 0 ? (
                    <tr><td colSpan={9} className="text-center text-muted py-4">Aucun mouvement</td></tr>
                  ) : movements.map((m) => (
                    <tr key={m.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{m.date}</td>
                      <td className="fw-semibold">{m.stockItemName}</td>
                      <td className="text-center">{movTypeBadge(m.type)}</td>
                      <td className="text-end">{m.quantity}</td>
                      <td className="text-end">{m.unitPrice > 0 ? `${fmt(m.unitPrice)}` : "—"}</td>
                      <td className="text-end">{m.totalCost > 0 ? `${fmt(m.totalCost)} FCFA` : "—"}</td>
                      <td className="text-muted">{m.reason || "—"}</td>
                      <td className="text-muted">{m.createdBy || "—"}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-soft-danger"
                          title="Supprimer"
                          onClick={() => setDeleteTarget({ type: "movement", id: m.id, label: `${STOCK_MOVEMENT_TYPE_LABELS[m.type]} — ${m.stockItemName}` })}
                          style={{ padding: "2px 8px", fontSize: 12 }}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── RENDER: Alerts ──
  function renderAlerts() {
    const sorted = [...items].sort((a, b) => (a.currentStock - a.minStock) - (b.currentStock - b.minStock));

    return (
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="fa-solid fa-triangle-exclamation text-danger me-2"></i>
            Produits en alerte ({items.length})
          </h5>
        </div>
        <div className="card-body p-0">
          {sorted.length === 0 ? (
            <p className="text-muted text-center py-5">
              <i className="fa-solid fa-circle-check text-success me-1" style={{ fontSize: 28 }}></i>
              <br />
              Tous les stocks sont au-dessus du seuil minimum
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Produit</th>
                    <th>Catégorie</th>
                    <th className="text-center">Stock actuel</th>
                    <th className="text-center">Stock min</th>
                    <th className="text-center">Déficit</th>
                    <th>Fournisseur</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((item) => {
                    const deficit = item.minStock - item.currentStock;
                    return (
                      <tr key={item.id}>
                        <td className="fw-semibold">{item.name}</td>
                        <td><span className="badge bg-secondary-subtle text-secondary">{STOCK_CATEGORY_LABELS[item.category] || item.category}</span></td>
                        <td className="text-center">{stockBadge(item)}</td>
                        <td className="text-center text-muted">{item.minStock} {item.unit}</td>
                        <td className="text-center">
                          <span className="badge bg-danger">{deficit.toFixed(1)} {item.unit}</span>
                        </td>
                        <td className="text-muted">{item.supplier || "—"}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => {
                              setTab("movements");
                              setTimeout(() => setMovementForm({ itemId: item.id, type: "entry" }), 100);
                            }}
                          >
                            <i className="fa-solid fa-arrow-down me-1"></i> Réapprovisionner
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── MAIN RENDER ──
  if (loading && !summary && items.length === 0) {
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

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0" style={{ fontWeight: 700, color: "#1a3a5c" }}>
          <i className="fa-solid fa-boxes-stacked me-2"></i>
          Gestion de Stock
        </h4>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        {TABS.map((t) => (
          <li key={t.key} className="nav-item">
            <button
              className={`nav-link${tab === t.key ? " active" : ""}`}
              onClick={() => { setTab(t.key); setItemForm(null); setMovementForm(null); }}
            >
              <i className={`${t.icon} me-1`}></i>
              {t.label}
              {t.key === "alerts" && summary && summary.lowStockCount > 0 && (
                <span className="badge bg-danger ms-1">{summary.lowStockCount}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Tab content */}
      {tab === "dashboard" && renderDashboard()}
      {tab === "items" && renderItems()}
      {tab === "movements" && renderMovements()}
      {tab === "alerts" && renderAlerts()}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="card"
            style={{ width: 400, maxWidth: "90vw" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-body text-center p-4">
              <i className="fa-solid fa-triangle-exclamation text-danger" style={{ fontSize: 40 }}></i>
              <h5 className="mt-3">Confirmer la suppression</h5>
              <p className="text-muted">Supprimer &quot;{deleteTarget.label}&quot; ?</p>
              <div className="d-flex gap-2 justify-content-center">
                <button className="btn btn-danger" onClick={handleDeleteConfirm}>Supprimer</button>
                <button className="btn btn-light" onClick={() => setDeleteTarget(null)}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
