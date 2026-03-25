"use client";

import { useState, useEffect, useCallback } from "react";
import type { Invoice } from "@/app/types/invoice";
import { INVOICE_STATUS_LABELS } from "@/lib/constants";
import InvoiceForm from "../finance/InvoiceForm";
import ConfirmModal from "../ConfirmModal";
import { generateInvoicePDF } from "@/lib/generate-invoice-pdf";

function fmt(n: number) {
  return Math.round(n).toLocaleString("fr-FR");
}

export default function FacturesManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceForm, setInvoiceForm] = useState<Invoice | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: "success" | "danger" } | null>(null);

  const [companyInfo, setCompanyInfo] = useState<{ phone: string; email: string; address: string }>({
    phone: "", email: "", address: "",
  });

  useEffect(() => {
    fetch("/api/contact").then((r) => r.json()).then((data) => {
      if (data && !data.error) setCompanyInfo({ phone: data.phone || "", email: data.email || "", address: data.address || "" });
    }).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/finance/invoices").then((r) => r.json());
      setInvoices(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Erreur chargement factures:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownloadPDF = async (invoice: Invoice) => {
    await generateInvoicePDF(invoice, companyInfo);
  };

  const handleInvoiceStatus = async (invoice: Invoice, status: string) => {
    try {
      await fetch(`/api/finance/invoices/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchData();
    } catch (err) {
      console.error("Erreur changement statut facture:", err);
    }
  };

  const handleSendInvoiceEmail = async (invoice: Invoice) => {
    const res = await fetch(`/api/finance/invoices/${invoice.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: invoice.status === "draft" ? "sent" : invoice.status, resendEmail: true }),
    });
    if (res.ok) {
      setAlertMsg({ text: `Facture ${invoice.invoiceNumber} envoyée par email à ${invoice.customerEmail}`, type: "success" });
    } else {
      setAlertMsg({ text: "Erreur lors de l'envoi de l'email", type: "danger" });
    }
    setTimeout(() => setAlertMsg(null), 5000);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    try {
      await fetch(`/api/finance/invoices/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error("Erreur suppression facture:", err);
    }
  };

  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const bom = "\uFEFF";
    const csv = bom + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
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

  return (
    <>
      {alertMsg && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show`} role="alert">
          <i className={`fa-solid ${alertMsg.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"} me-2`}></i>
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg(null)}></button>
        </div>
      )}

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
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => handleDownloadPDF(inv)} title="Télécharger PDF">
                                <i className="fa-solid fa-file-pdf"></i>
                              </button>
                              {inv.customerEmail && inv.status !== "cancelled" && (
                                <button className="btn btn-sm btn-outline-info" onClick={() => handleSendInvoiceEmail(inv)} title="Envoyer par email">
                                  <i className="fa-solid fa-envelope"></i>
                                </button>
                              )}
                              {inv.status === "draft" && (
                                <button className="btn btn-sm btn-outline-primary" onClick={() => setInvoiceForm(inv)} title="Modifier">
                                  <i className="fa-solid fa-pen"></i>
                                </button>
                              )}
                              {(inv.status === "sent" || inv.status === "draft") && (
                                <button className="btn btn-sm btn-outline-success" onClick={() => handleInvoiceStatus(inv, "paid")} title="Marquer payée">
                                  <i className="fa-solid fa-check"></i>
                                </button>
                              )}
                              {(inv.status === "draft" || inv.status === "cancelled") && (
                                <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget({ id: inv.id, label: inv.invoiceNumber })} title="Supprimer">
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

      <ConfirmModal
        open={deleteTarget !== null}
        title="Supprimer"
        message={`Voulez-vous vraiment supprimer la facture ${deleteTarget?.label} ?`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
