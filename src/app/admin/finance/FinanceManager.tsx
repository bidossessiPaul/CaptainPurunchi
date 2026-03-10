"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import type { Revenue } from "@/app/types/revenue";
import type { Expense } from "@/app/types/expense";
import type { CashRegister } from "@/app/types/cash-register";
import type { Invoice } from "@/app/types/invoice";
import type { CashOperation } from "@/app/types/cash-operation";
import { REVENUE_SOURCE_LABELS, EXPENSE_CATEGORY_LABELS, INVOICE_STATUS_LABELS, PAYMENT_LABELS, CASH_OPERATION_TYPE_LABELS } from "@/lib/constants";
import RevenueForm from "./RevenueForm";
import ExpenseForm from "./ExpenseForm";
import CashRegisterForm from "./CashRegisterForm";
import CashOperationForm from "./CashOperationForm";
import InvoiceForm from "./InvoiceForm";
import ConfirmModal from "../ConfirmModal";
import { generateInvoicePDF } from "@/lib/generate-invoice-pdf";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: "fa-solid fa-chart-pie" },
  { key: "revenues", label: "Revenus", icon: "fa-solid fa-arrow-trend-up" },
  { key: "expenses", label: "Dépenses", icon: "fa-solid fa-arrow-trend-down" },
  { key: "cash", label: "Caisse", icon: "fa-solid fa-cash-register" },
  { key: "invoices", label: "Factures", icon: "fa-solid fa-file-invoice" },
  { key: "bilan", label: "Bilan", icon: "fa-solid fa-scale-balanced" },
] as const;

type Tab = (typeof TABS)[number]["key"];

const PIE_COLORS = ["#5BC0EB", "#FDE74C", "#9BC53D", "#E55934", "#FA7921", "#6F6AF8"];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function monthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

export default function FinanceManager() {
  const [tab, setTab] = useState<Tab>("dashboard");

  // Period filter
  const [dateFrom, setDateFrom] = useState(monthStart());
  const [dateTo, setDateTo] = useState(todayStr());

  // Data
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [cashHistory, setCashHistory] = useState<CashRegister[]>([]);
  const [cashOperations, setCashOperations] = useState<CashOperation[]>([]);
  const [cashOpTotals, setCashOpTotals] = useState<{ especes: number; carte: number; mtnMoney: number; moovMoney: number; virement: number } | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<{
    totalRevenue: number;
    totalExpense: number;
    netBalance: number;
    bySource: { source: string; total: number }[];
    byCategory: { category: string; total: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Forms
  const [revenueForm, setRevenueForm] = useState<Revenue | null | "new">(null);
  const [expenseForm, setExpenseForm] = useState<Expense | null | "new">(null);
  const [cashForm, setCashForm] = useState<"open" | "close" | null>(null);
  const [showOpForm, setShowOpForm] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState<Invoice | null | "new">(null);

  // Company info (for PDF)
  const [companyInfo, setCompanyInfo] = useState<{ phone: string; email: string; address: string }>({
    phone: "", email: "", address: "",
  });

  useEffect(() => {
    fetch("/api/contact").then((r) => r.json()).then((data) => {
      if (data && !data.error) setCompanyInfo({ phone: data.phone || "", email: data.email || "", address: data.address || "" });
    }).catch(() => {});
  }, []);

  const handleDownloadPDF = async (invoice: Invoice) => {
    await generateInvoicePDF(invoice, companyInfo);
  };

  // Bilan
  const [bilanYear, setBilanYear] = useState(new Date().getFullYear());
  const [bilanData, setBilanData] = useState<{
    year: number;
    months: { month: string; revenue: number; expense: number; net: number }[];
    totalRevenue: number;
    totalExpense: number;
    totalNet: number;
  } | null>(null);

  // Deletes
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; label: string } | null>(null);

  // ─── CSV EXPORT ──────────────────────────────────
  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const bom = "\uFEFF"; // UTF-8 BOM for Excel
    const csv = bom + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportRevenuesCSV = () => {
    downloadCSV(
      `revenus_${dateFrom}_${dateTo}.csv`,
      ["Date", "Description", "Source", "Paiement", "Montant (FCFA)", "Créé par"],
      revenues.map((r) => [
        r.date,
        `"${r.description}"`,
        REVENUE_SOURCE_LABELS[r.source] || r.source,
        PAYMENT_LABELS[r.paymentMethod] || "",
        String(r.amount),
        r.createdBy,
      ])
    );
  };

  const exportExpensesCSV = () => {
    downloadCSV(
      `depenses_${dateFrom}_${dateTo}.csv`,
      ["Date", "Description", "Catégorie", "Fournisseur", "Paiement", "Montant (FCFA)", "Statut"],
      expenses.map((e) => [
        e.date,
        `"${e.description}"`,
        EXPENSE_CATEGORY_LABELS[e.category] || e.category,
        `"${e.supplier || ""}"`,
        PAYMENT_LABELS[e.paymentMethod] || "",
        String(e.amount),
        e.status,
      ])
    );
  };

  const exportInvoicesCSV = () => {
    downloadCSV(
      `factures.csv`,
      ["N° Facture", "Client", "Email", "Téléphone", "Sous-total", "Taxe", "Total (FCFA)", "Statut", "Échéance", "Date création"],
      invoices.map((inv) => [
        inv.invoiceNumber,
        `"${inv.customerName}"`,
        inv.customerEmail,
        inv.customerPhone,
        String(inv.subtotal),
        String(inv.tax),
        String(inv.total),
        INVOICE_STATUS_LABELS[inv.status] || inv.status,
        inv.dueDate,
        new Date(inv.createdAt).toLocaleDateString("fr-FR"),
      ])
    );
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "dashboard") {
        const [revRes, expRes, sumRes, cashRes] = await Promise.all([
          fetch(`/api/finance/revenue?dateFrom=${dateFrom}&dateTo=${dateTo}`).then((r) => r.json()),
          fetch(`/api/finance/expenses?dateFrom=${dateFrom}&dateTo=${dateTo}`).then((r) => r.json()),
          fetch(`/api/finance/summary?dateFrom=${dateFrom}&dateTo=${dateTo}`).then((r) => r.json()),
          fetch(`/api/finance/cash-registers?today=${todayStr()}`).then((r) => r.json()),
        ]);
        setRevenues(Array.isArray(revRes) ? revRes : []);
        setExpenses(Array.isArray(expRes) ? expRes : []);
        if (sumRes && !sumRes.error) setSummary(sumRes);
        setCashRegister(cashRes && !cashRes.error ? cashRes : null);
      } else if (tab === "revenues") {
        const res = await fetch(`/api/finance/revenue?dateFrom=${dateFrom}&dateTo=${dateTo}`).then((r) => r.json());
        setRevenues(Array.isArray(res) ? res : []);
      } else if (tab === "expenses") {
        const res = await fetch(`/api/finance/expenses?dateFrom=${dateFrom}&dateTo=${dateTo}`).then((r) => r.json());
        setExpenses(Array.isArray(res) ? res : []);
      } else if (tab === "cash") {
        const [todayReg, history] = await Promise.all([
          fetch(`/api/finance/cash-registers?today=${todayStr()}`).then((r) => r.json()),
          fetch(`/api/finance/cash-registers?dateFrom=${dateFrom}&dateTo=${dateTo}`).then((r) => r.json()),
        ]);
        const reg = todayReg && !todayReg.error ? todayReg : null;
        setCashRegister(reg);
        setCashHistory(Array.isArray(history) ? history : []);
        // Fetch operations for today's register
        if (reg) {
          const ops = await fetch(`/api/finance/cash-operations?cashRegisterId=${reg.id}`).then((r) => r.json());
          setCashOperations(Array.isArray(ops) ? ops : []);
          // Calculate totals by payment method
          const totals = { especes: 0, carte: 0, mtnMoney: 0, moovMoney: 0, virement: 0 };
          for (const op of (Array.isArray(ops) ? ops : [])) {
            const sign = op.type === "encaissement" ? 1 : -1;
            const amt = op.amount * sign;
            if (op.paymentMethod === "especes") totals.especes += amt;
            else if (op.paymentMethod === "carte") totals.carte += amt;
            else if (op.paymentMethod === "mtn_money") totals.mtnMoney += amt;
            else if (op.paymentMethod === "moov_money") totals.moovMoney += amt;
            else if (op.paymentMethod === "virement") totals.virement += amt;
          }
          setCashOpTotals(totals);
        } else {
          setCashOperations([]);
          setCashOpTotals(null);
        }
      } else if (tab === "invoices") {
        const res = await fetch("/api/finance/invoices").then((r) => r.json());
        setInvoices(Array.isArray(res) ? res : []);
      } else if (tab === "bilan") {
        const res = await fetch(`/api/finance/summary/monthly?year=${bilanYear}`).then((r) => r.json());
        if (res && !res.error) setBilanData(res);
      }
    } catch {}
    setLoading(false);
  }, [tab, dateFrom, dateTo, bilanYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    setDeleteTarget(null);

    const urlMap: Record<string, string> = {
      revenue: `/api/finance/revenue/${id}`,
      expense: `/api/finance/expenses/${id}`,
      invoice: `/api/finance/invoices/${id}`,
    };

    await fetch(urlMap[type], { method: "DELETE" });
    fetchData();
  };

  const handleInvoiceStatus = async (invoice: Invoice, status: string) => {
    await fetch(`/api/finance/invoices/${invoice.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  // Alert message
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: "success" | "danger" } | null>(null);

  const handleSendInvoiceEmail = async (invoice: Invoice) => {
    const res = await fetch(`/api/finance/invoices/${invoice.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: invoice.status === "draft" ? "sent" : invoice.status, resendEmail: true }),
    });
    if (res.ok) {
      setAlertMsg({ text: `Facture ${invoice.invoiceNumber} envoyée par email à ${invoice.customerEmail}`, type: "success" });
      setTimeout(() => setAlertMsg(null), 5000);
    } else {
      setAlertMsg({ text: "Erreur lors de l'envoi de l'email", type: "danger" });
      setTimeout(() => setAlertMsg(null), 5000);
    }
    fetchData();
  };

  // ─── DASHBOARD ──────────────────────────────────
  const renderDashboard = () => {
    if (!summary) return null;

    const barData = (() => {
      const map: Record<string, { date: string; revenus: number; depenses: number }> = {};
      revenues.forEach((r) => {
        if (!map[r.date]) map[r.date] = { date: r.date, revenus: 0, depenses: 0 };
        map[r.date].revenus += r.amount;
      });
      expenses.forEach((e) => {
        if (!map[e.date]) map[e.date] = { date: e.date, revenus: 0, depenses: 0 };
        map[e.date].depenses += e.amount;
      });
      return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
    })();

    return (
      <>
        {/* Stat cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <p className="text-muted mb-1">Revenus</p>
                    <h4 className="mb-0 text-success">{fmt(summary.totalRevenue)} <small className="fs-6">FCFA</small></h4>
                  </div>
                  <div className="text-success" style={{ fontSize: "28px" }}>
                    <i className="fa-solid fa-arrow-trend-up"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <p className="text-muted mb-1">Dépenses</p>
                    <h4 className="mb-0 text-danger">{fmt(summary.totalExpense)} <small className="fs-6">FCFA</small></h4>
                  </div>
                  <div className="text-danger" style={{ fontSize: "28px" }}>
                    <i className="fa-solid fa-arrow-trend-down"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <p className="text-muted mb-1">Solde net</p>
                    <h4 className={`mb-0 ${summary.netBalance >= 0 ? "text-primary" : "text-danger"}`}>
                      {fmt(summary.netBalance)} <small className="fs-6">FCFA</small>
                    </h4>
                  </div>
                  <div className="text-primary" style={{ fontSize: "28px" }}>
                    <i className="fa-solid fa-scale-balanced"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <p className="text-muted mb-1">Caisse</p>
                    <h4 className="mb-0">
                      {cashRegister ? (
                        <span className={cashRegister.status === "open" ? "text-success" : "text-muted"}>
                          {cashRegister.status === "open" ? "Ouverte" : "Fermée"}
                        </span>
                      ) : (
                        <span className="text-muted">Non ouverte</span>
                      )}
                    </h4>
                  </div>
                  <div className="text-warning" style={{ fontSize: "28px" }}>
                    <i className="fa-solid fa-cash-register"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex gap-2 flex-wrap">
              <button
                className="btn btn-success"
                onClick={() => { setTab("revenues"); setRevenueForm("new"); }}
              >
                <i className="fa-solid fa-plus me-1"></i> Ajouter un revenu
              </button>
              <button
                className="btn btn-danger"
                onClick={() => { setTab("expenses"); setExpenseForm("new"); }}
              >
                <i className="fa-solid fa-plus me-1"></i> Ajouter une dépense
              </button>
              {!cashRegister ? (
                <button
                  className="btn btn-warning"
                  onClick={() => { setTab("cash"); setCashForm("open"); }}
                >
                  <i className="fa-solid fa-lock-open me-1"></i> Ouvrir la caisse
                </button>
              ) : cashRegister.status === "open" ? (
                <button
                  className="btn btn-outline-warning"
                  onClick={() => { setTab("cash"); setCashForm("close"); }}
                >
                  <i className="fa-solid fa-lock me-1"></i> Fermer la caisse
                </button>
              ) : null}
              <button
                className="btn btn-primary"
                onClick={() => { setTab("invoices"); setInvoiceForm("new"); }}
              >
                <i className="fa-solid fa-file-invoice me-1"></i> Créer une facture
              </button>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Revenus vs Dépenses</h5>
              </div>
              <div className="card-body">
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => `${fmt(Number(v))} FCFA`} />
                      <Legend />
                      <Bar dataKey="revenus" fill="#28a745" name="Revenus" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="depenses" fill="#dc3545" name="Dépenses" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted text-center py-5">Aucune donnée pour cette période</p>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Revenus par source</h5>
              </div>
              <div className="card-body">
                {summary.bySource.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={summary.bySource.map((s) => ({
                          name: REVENUE_SOURCE_LABELS[s.source] || s.source,
                          value: s.total,
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {summary.bySource.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${fmt(Number(v))} FCFA`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted text-center py-5">Aucune donnée</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // ─── REVENUS ──────────────────────────────────
  const renderRevenues = () => (
    <>
      {revenueForm ? (
        <RevenueForm
          revenue={revenueForm === "new" ? null : revenueForm}
          onSave={() => { setRevenueForm(null); fetchData(); }}
          onCancel={() => setRevenueForm(null)}
        />
      ) : (
        <>
          <div className="d-flex justify-content-end gap-2 mb-3">
            {revenues.length > 0 && (
              <button className="btn btn-outline-secondary" onClick={exportRevenuesCSV}>
                <i className="fa-solid fa-file-csv me-1"></i> Exporter CSV
              </button>
            )}
            <button className="btn btn-success" onClick={() => setRevenueForm("new")}>
              <i className="fa-solid fa-plus me-1"></i> Nouveau revenu
            </button>
          </div>
          {revenues.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="fa-solid fa-arrow-trend-up" style={{ fontSize: "48px", color: "#95a0c5" }}></i>
                <h5 className="mt-3">Aucun revenu</h5>
                <p className="text-muted">Aucun revenu enregistré pour cette période.</p>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Source</th>
                        <th>Paiement</th>
                        <th className="text-end">Montant</th>
                        <th>Par</th>
                        <th style={{ width: "100px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenues.map((r) => (
                        <tr key={r.id}>
                          <td>{r.date}</td>
                          <td>{r.description}</td>
                          <td>
                            <span className="badge bg-success bg-opacity-10 text-success">
                              {REVENUE_SOURCE_LABELS[r.source] || r.source}
                            </span>
                          </td>
                          <td>{PAYMENT_LABELS[r.paymentMethod] || "-"}</td>
                          <td className="text-end fw-bold text-success">{fmt(r.amount)} FCFA</td>
                          <td><small className="text-muted">{r.createdBy}</small></td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setRevenueForm(r)}
                                title="Modifier"
                              >
                                <i className="fa-solid fa-pen"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => setDeleteTarget({ type: "revenue", id: r.id, label: `${fmt(r.amount)} FCFA` })}
                                title="Supprimer"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-light">
                        <td colSpan={4} className="fw-bold">Total</td>
                        <td className="text-end fw-bold text-success">
                          {fmt(revenues.reduce((s, r) => s + r.amount, 0))} FCFA
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );

  // ─── DEPENSES ──────────────────────────────────
  const renderExpenses = () => (
    <>
      {expenseForm ? (
        <ExpenseForm
          expense={expenseForm === "new" ? null : expenseForm}
          onSave={() => { setExpenseForm(null); fetchData(); }}
          onCancel={() => setExpenseForm(null)}
        />
      ) : (
        <>
          <div className="d-flex justify-content-end gap-2 mb-3">
            {expenses.length > 0 && (
              <button className="btn btn-outline-secondary" onClick={exportExpensesCSV}>
                <i className="fa-solid fa-file-csv me-1"></i> Exporter CSV
              </button>
            )}
            <button className="btn btn-success" onClick={() => setExpenseForm("new")}>
              <i className="fa-solid fa-plus me-1"></i> Nouvelle dépense
            </button>
          </div>
          {expenses.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="fa-solid fa-arrow-trend-down" style={{ fontSize: "48px", color: "#95a0c5" }}></i>
                <h5 className="mt-3">Aucune dépense</h5>
                <p className="text-muted">Aucune dépense enregistrée pour cette période.</p>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Catégorie</th>
                        <th>Fournisseur</th>
                        <th>Paiement</th>
                        <th className="text-end">Montant</th>
                        <th style={{ width: "100px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((e) => (
                        <tr key={e.id}>
                          <td>{e.date}</td>
                          <td>{e.description}</td>
                          <td>
                            <span className="badge bg-danger bg-opacity-10 text-danger">
                              {EXPENSE_CATEGORY_LABELS[e.category] || e.category}
                            </span>
                          </td>
                          <td>{e.supplier || "-"}</td>
                          <td>{PAYMENT_LABELS[e.paymentMethod] || "-"}</td>
                          <td className="text-end fw-bold text-danger">{fmt(e.amount)} FCFA</td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setExpenseForm(e)}
                                title="Modifier"
                              >
                                <i className="fa-solid fa-pen"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => setDeleteTarget({ type: "expense", id: e.id, label: `${fmt(e.amount)} FCFA` })}
                                title="Supprimer"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-light">
                        <td colSpan={5} className="fw-bold">Total</td>
                        <td className="text-end fw-bold text-danger">
                          {fmt(expenses.reduce((s, e) => s + e.amount, 0))} FCFA
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );

  // ─── CAISSE ──────────────────────────────────
  const handleDeleteOp = async (opId: string) => {
    await fetch(`/api/finance/cash-operations/${opId}`, { method: "DELETE" });
    fetchData();
  };

  const cashNetTotal = cashOperations.reduce((sum, op) => sum + (op.type === "encaissement" ? op.amount : -op.amount), 0);
  const cashRunningBalance = (cashRegister?.openingBalance || 0) + cashNetTotal;

  const renderCash = () => (
    <>
      {cashForm ? (
        <CashRegisterForm
          register={cashForm === "close" ? cashRegister : null}
          mode={cashForm}
          prefill={cashForm === "close" && cashOpTotals ? cashOpTotals : undefined}
          onSave={() => { setCashForm(null); setShowOpForm(false); fetchData(); }}
          onCancel={() => setCashForm(null)}
        />
      ) : (
        <>
          {/* Today's register */}
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Caisse du jour — {todayStr()}</h5>
              <div className="d-flex gap-2">
                {!cashRegister && (
                  <button className="btn btn-success btn-sm" onClick={() => setCashForm("open")}>
                    <i className="fa-solid fa-lock-open me-1"></i> Ouvrir la caisse
                  </button>
                )}
                {cashRegister?.status === "open" && (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowOpForm(true)}>
                      <i className="fa-solid fa-plus me-1"></i> Ajouter une opération
                    </button>
                    <button className="btn btn-warning btn-sm" onClick={() => setCashForm("close")}>
                      <i className="fa-solid fa-lock me-1"></i> Fermer la caisse
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="card-body">
              {cashRegister ? (
                <>
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <div className="p-3 bg-light rounded text-center">
                        <small className="text-muted d-block">Statut</small>
                        <span className={`badge ${cashRegister.status === "open" ? "bg-success" : "bg-secondary"} mt-1`}>
                          {cashRegister.status === "open" ? "Ouverte" : "Fermée"}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 bg-light rounded text-center">
                        <small className="text-muted d-block">Fond de caisse</small>
                        <strong>{fmt(cashRegister.openingBalance)} FCFA</strong>
                      </div>
                    </div>
                    {cashRegister.status === "open" ? (
                      <div className="col-md-3">
                        <div className="p-3 bg-primary bg-opacity-10 rounded text-center">
                          <small className="text-muted d-block">Solde en cours</small>
                          <strong className="text-primary">{fmt(cashRunningBalance)} FCFA</strong>
                        </div>
                      </div>
                    ) : (
                      <div className="col-md-3">
                        <div className="p-3 bg-light rounded text-center">
                          <small className="text-muted d-block">Solde clôture</small>
                          <strong>{fmt(cashRegister.closingBalance)} FCFA</strong>
                        </div>
                      </div>
                    )}
                    <div className="col-md-3">
                      <div className="p-3 bg-light rounded text-center">
                        <small className="text-muted d-block">Ouvert par</small>
                        <strong>{cashRegister.openedBy}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Payment method breakdown when open (from operations) */}
                  {cashRegister.status === "open" && cashOpTotals && cashOperations.length > 0 && (
                    <div className="row mb-3">
                      <div className="col-12">
                        <h6 className="text-muted mb-2">Récapitulatif par mode de paiement</h6>
                      </div>
                      {cashOpTotals.especes !== 0 && (
                        <div className="col">
                          <div className="p-2 bg-light rounded text-center">
                            <small className="text-muted d-block">Espèces</small>
                            <strong>{fmt(cashOpTotals.especes)}</strong>
                          </div>
                        </div>
                      )}
                      {cashOpTotals.carte !== 0 && (
                        <div className="col">
                          <div className="p-2 bg-light rounded text-center">
                            <small className="text-muted d-block">Carte</small>
                            <strong>{fmt(cashOpTotals.carte)}</strong>
                          </div>
                        </div>
                      )}
                      {cashOpTotals.mtnMoney !== 0 && (
                        <div className="col">
                          <div className="p-2 bg-light rounded text-center">
                            <small className="text-muted d-block">MTN</small>
                            <strong>{fmt(cashOpTotals.mtnMoney)}</strong>
                          </div>
                        </div>
                      )}
                      {cashOpTotals.moovMoney !== 0 && (
                        <div className="col">
                          <div className="p-2 bg-light rounded text-center">
                            <small className="text-muted d-block">Moov</small>
                            <strong>{fmt(cashOpTotals.moovMoney)}</strong>
                          </div>
                        </div>
                      )}
                      {cashOpTotals.virement !== 0 && (
                        <div className="col">
                          <div className="p-2 bg-light rounded text-center">
                            <small className="text-muted d-block">Virement</small>
                            <strong>{fmt(cashOpTotals.virement)}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Closed register details */}
                  {cashRegister.status === "closed" && (
                    <div className="row mb-3">
                      <div className="col-12 mb-2">
                        <h6 className="text-muted">Détail des encaissements</h6>
                      </div>
                      <div className="col-md-2">
                        <div className="p-2 bg-light rounded text-center">
                          <small className="text-muted d-block">Espèces</small>
                          <strong>{fmt(cashRegister.especes)}</strong>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="p-2 bg-light rounded text-center">
                          <small className="text-muted d-block">Carte</small>
                          <strong>{fmt(cashRegister.carte)}</strong>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="p-2 bg-light rounded text-center">
                          <small className="text-muted d-block">MTN</small>
                          <strong>{fmt(cashRegister.mtnMoney)}</strong>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="p-2 bg-light rounded text-center">
                          <small className="text-muted d-block">Moov</small>
                          <strong>{fmt(cashRegister.moovMoney)}</strong>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="p-2 bg-light rounded text-center">
                          <small className="text-muted d-block">Virement</small>
                          <strong>{fmt(cashRegister.virement)}</strong>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className={`p-2 rounded text-center ${cashRegister.difference === 0 ? "bg-success bg-opacity-10" : "bg-danger bg-opacity-10"}`}>
                          <small className="text-muted d-block">Écart</small>
                          <strong className={cashRegister.difference === 0 ? "text-success" : "text-danger"}>
                            {cashRegister.difference > 0 ? "+" : ""}{fmt(cashRegister.difference)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <i className="fa-solid fa-cash-register" style={{ fontSize: "48px", color: "#95a0c5" }}></i>
                  <h5 className="mt-3">Caisse non ouverte</h5>
                  <p className="text-muted">La caisse n&apos;a pas encore été ouverte aujourd&apos;hui.</p>
                </div>
              )}
            </div>
          </div>

          {/* Operation form */}
          {showOpForm && cashRegister?.status === "open" && (
            <CashOperationForm
              cashRegisterId={cashRegister.id}
              onSave={() => { setShowOpForm(false); fetchData(); }}
              onCancel={() => setShowOpForm(false)}
            />
          )}

          {/* Operations list */}
          {cashRegister && cashOperations.length > 0 && (
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  Opérations du jour
                  <span className="badge bg-primary ms-2">{cashOperations.length}</span>
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Heure</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Paiement</th>
                        <th className="text-end">Montant</th>
                        <th>Par</th>
                        {cashRegister.status === "open" && <th style={{ width: "50px" }}></th>}
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
                          {cashRegister.status === "open" && (
                            <td>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteOp(op.id)}
                                title="Supprimer"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-light">
                        <td colSpan={4} className="fw-bold">Solde net des opérations</td>
                        <td className={`text-end fw-bold ${cashNetTotal >= 0 ? "text-success" : "text-danger"}`}>
                          {cashNetTotal >= 0 ? "+" : ""}{fmt(cashNetTotal)} FCFA
                        </td>
                        <td colSpan={cashRegister.status === "open" ? 2 : 1}></td>
                      </tr>
                    </tfoot>
                  </table>
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
                        <th>Clôture</th>
                        <th>Écart</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashHistory.map((c) => (
                        <tr key={c.id}>
                          <td>{c.date}</td>
                          <td>{c.openedBy}</td>
                          <td>{fmt(c.openingBalance)} FCFA</td>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );

  // ─── FACTURES ──────────────────────────────────
  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: "bg-secondary",
      sent: "bg-info",
      paid: "bg-success",
      cancelled: "bg-danger",
    };
    return (
      <span className={`badge ${map[status] || "bg-secondary"}`}>
        {INVOICE_STATUS_LABELS[status] || status}
      </span>
    );
  };

  const renderInvoices = () => (
    <>
      {invoiceForm ? (
        <InvoiceForm
          invoice={invoiceForm === "new" ? null : invoiceForm}
          onSave={() => { setInvoiceForm(null); fetchData(); }}
          onCancel={() => setInvoiceForm(null)}
        />
      ) : (
        <>
          <div className="d-flex justify-content-end gap-2 mb-3">
            {invoices.length > 0 && (
              <button className="btn btn-outline-secondary" onClick={exportInvoicesCSV}>
                <i className="fa-solid fa-file-csv me-1"></i> Exporter CSV
              </button>
            )}
            <button className="btn btn-success" onClick={() => setInvoiceForm("new")}>
              <i className="fa-solid fa-plus me-1"></i> Nouvelle facture
            </button>
          </div>
          {invoices.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="fa-solid fa-file-invoice" style={{ fontSize: "48px", color: "#95a0c5" }}></i>
                <h5 className="mt-3">Aucune facture</h5>
                <p className="text-muted">Aucune facture créée.</p>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>N° Facture</th>
                        <th>Client</th>
                        <th>Date</th>
                        <th>Échéance</th>
                        <th className="text-end">Total</th>
                        <th>Statut</th>
                        <th style={{ width: "160px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="fw-bold">{inv.invoiceNumber}</td>
                          <td>
                            {inv.customerName}
                            {inv.customerEmail && <small className="text-muted d-block">{inv.customerEmail}</small>}
                          </td>
                          <td>{new Date(inv.createdAt).toLocaleDateString("fr-FR")}</td>
                          <td>{inv.dueDate || "-"}</td>
                          <td className="text-end fw-bold">{fmt(inv.total)} FCFA</td>
                          <td>{statusBadge(inv.status)}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleDownloadPDF(inv)}
                                title="Télécharger PDF"
                              >
                                <i className="fa-solid fa-file-pdf"></i>
                              </button>
                              {inv.customerEmail && inv.status !== "cancelled" && (
                                <button
                                  className="btn btn-sm btn-outline-info"
                                  onClick={() => handleSendInvoiceEmail(inv)}
                                  title="Envoyer par email"
                                >
                                  <i className="fa-solid fa-envelope"></i>
                                </button>
                              )}
                              {inv.status === "draft" && (
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => setInvoiceForm(inv)}
                                  title="Modifier"
                                >
                                  <i className="fa-solid fa-pen"></i>
                                </button>
                              )}
                              {(inv.status === "sent" || inv.status === "draft") && (
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleInvoiceStatus(inv, "paid")}
                                  title="Marquer payée"
                                >
                                  <i className="fa-solid fa-check"></i>
                                </button>
                              )}
                              {(inv.status === "draft" || inv.status === "cancelled") && (
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => setDeleteTarget({ type: "invoice", id: inv.id, label: inv.invoiceNumber })}
                                  title="Supprimer"
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );

  // ─── BILAN MENSUEL ──────────────────────────────────
  const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

  const renderBilan = () => {
    if (!bilanData) return null;

    const barData = bilanData.months.map((m, i) => ({
      name: MONTH_NAMES[i],
      revenus: m.revenue,
      depenses: m.expense,
      net: m.net,
    }));

    return (
      <>
        {/* Year selector */}
        <div className="d-flex align-items-center gap-2 mb-4">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setBilanYear((y) => y - 1)}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <h5 className="mb-0">{bilanData.year}</h5>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setBilanYear((y) => y + 1)}
            disabled={bilanYear >= new Date().getFullYear()}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        {/* Annual summary cards */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card">
              <div className="card-body text-center">
                <p className="text-muted mb-1">Total Revenus {bilanData.year}</p>
                <h3 className="text-success mb-0">{fmt(bilanData.totalRevenue)} <small className="fs-6">FCFA</small></h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body text-center">
                <p className="text-muted mb-1">Total Dépenses {bilanData.year}</p>
                <h3 className="text-danger mb-0">{fmt(bilanData.totalExpense)} <small className="fs-6">FCFA</small></h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body text-center">
                <p className="text-muted mb-1">Résultat net {bilanData.year}</p>
                <h3 className={`mb-0 ${bilanData.totalNet >= 0 ? "text-primary" : "text-danger"}`}>
                  {bilanData.totalNet >= 0 ? "+" : ""}{fmt(bilanData.totalNet)} <small className="fs-6">FCFA</small>
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly bar chart */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="card-title mb-0">Évolution mensuelle</h5>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${fmt(Number(v))} FCFA`} />
                <Legend />
                <Bar dataKey="revenus" fill="#28a745" name="Revenus" radius={[4, 4, 0, 0]} />
                <Bar dataKey="depenses" fill="#dc3545" name="Dépenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly table with comparison */}
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Détail mensuel</h5>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                downloadCSV(
                  `bilan_${bilanData.year}.csv`,
                  ["Mois", "Revenus (FCFA)", "Dépenses (FCFA)", "Résultat net (FCFA)", "Variation vs mois précédent"],
                  bilanData.months.map((m, i) => {
                    const prev = i > 0 ? bilanData.months[i - 1].net : 0;
                    const variation = i === 0 ? "" : m.net - prev > 0 ? `+${m.net - prev}` : String(m.net - prev);
                    return [MONTH_NAMES[i], String(m.revenue), String(m.expense), String(m.net), variation];
                  })
                );
              }}
            >
              <i className="fa-solid fa-file-csv me-1"></i> Exporter CSV
            </button>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Mois</th>
                    <th className="text-end">Revenus</th>
                    <th className="text-end">Dépenses</th>
                    <th className="text-end">Résultat net</th>
                    <th className="text-end">Variation</th>
                  </tr>
                </thead>
                <tbody>
                  {bilanData.months.map((m, i) => {
                    const prevNet = i > 0 ? bilanData.months[i - 1].net : null;
                    const variation = prevNet !== null ? m.net - prevNet : null;
                    const isEmpty = m.revenue === 0 && m.expense === 0;
                    return (
                      <tr key={m.month} className={isEmpty ? "text-muted" : ""}>
                        <td className="fw-bold">{MONTH_NAMES[i]} {bilanData.year}</td>
                        <td className="text-end text-success">{fmt(m.revenue)}</td>
                        <td className="text-end text-danger">{fmt(m.expense)}</td>
                        <td className={`text-end fw-bold ${m.net >= 0 ? "text-primary" : "text-danger"}`}>
                          {m.net >= 0 ? "+" : ""}{fmt(m.net)}
                        </td>
                        <td className="text-end">
                          {variation !== null ? (
                            <span className={variation >= 0 ? "text-success" : "text-danger"}>
                              <i className={`fa-solid fa-arrow-${variation >= 0 ? "up" : "down"} me-1`}></i>
                              {variation >= 0 ? "+" : ""}{fmt(variation)}
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="table-light fw-bold">
                    <td>Total {bilanData.year}</td>
                    <td className="text-end text-success">{fmt(bilanData.totalRevenue)}</td>
                    <td className="text-end text-danger">{fmt(bilanData.totalExpense)}</td>
                    <td className={`text-end ${bilanData.totalNet >= 0 ? "text-primary" : "text-danger"}`}>
                      {bilanData.totalNet >= 0 ? "+" : ""}{fmt(bilanData.totalNet)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {/* Alert notification */}
      {alertMsg && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show`} role="alert">
          <i className={`fa-solid ${alertMsg.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"} me-2`}></i>
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg(null)}></button>
        </div>
      )}

      {/* Period filter + tabs */}
      <div className="row mb-3">
        <div className="col">
          <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
            <label className="form-label mb-0">Du</label>
            <input
              type="date"
              className="form-control"
              style={{ width: "auto" }}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <label className="form-label mb-0">au</label>
            <input
              type="date"
              className="form-control"
              style={{ width: "auto" }}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => { setDateFrom(monthStart()); setDateTo(todayStr()); }}
            >
              Ce mois
            </button>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => { setDateFrom(todayStr()); setDateTo(todayStr()); }}
            >
              Aujourd&apos;hui
            </button>
          </div>

          <ul className="nav nav-tabs">
            {TABS.map((t) => (
              <li key={t.key} className="nav-item">
                <button
                  className={`nav-link ${tab === t.key ? "active" : ""}`}
                  onClick={() => setTab(t.key)}
                >
                  <i className={`${t.icon} me-1`}></i>
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {tab === "dashboard" && renderDashboard()}
          {tab === "revenues" && renderRevenues()}
          {tab === "expenses" && renderExpenses()}
          {tab === "cash" && renderCash()}
          {tab === "invoices" && renderInvoices()}
          {tab === "bilan" && renderBilan()}
        </>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Supprimer"
        message={`Voulez-vous vraiment supprimer ${deleteTarget?.label} ?`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
