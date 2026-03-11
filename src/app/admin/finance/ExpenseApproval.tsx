"use client";

import { useState } from "react";
import type { Expense } from "@/app/types/expense";

interface Props {
  expenses: Expense[];
  onApprovalComplete: () => void;
}

export default function ExpenseApproval({ expenses, onApprovalComplete }: Props) {
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  const pendingExpenses = expenses.filter((e) => e.status === "pending");

  const handleApprove = async (expenseId: string) => {
    setProcessing(expenseId);
    try {
      await fetch("/api/finance/expenses/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expenseId,
          approved: true,
        }),
      });
      onApprovalComplete();
    } catch (error) {
      console.error("Error approving expense:", error);
      alert("Erreur lors de l'approbation");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (expenseId: string) => {
    setProcessing(expenseId);
    try {
      await fetch("/api/finance/expenses/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expenseId,
          approved: false,
          rejectionReason: rejectReason,
        }),
      });
      setShowRejectModal(null);
      setRejectReason("");
      onApprovalComplete();
    } catch (error) {
      console.error("Error rejecting expense:", error);
      alert("Erreur lors du rejet");
    } finally {
      setProcessing(null);
    }
  };

  const fmt = (n: number) => n.toLocaleString("fr-FR");

  if (pendingExpenses.length === 0) {
    return (
      <div className="alert alert-success">
        <i className="fa-solid fa-check-circle me-2"></i>
        Aucune dépense en attente d'approbation
      </div>
    );
  }

  return (
    <>
      <div className="alert alert-warning">
        <i className="fa-solid fa-exclamation-triangle me-2"></i>
        <strong>{pendingExpenses.length}</strong> dépense(s) en attente de votre validation
      </div>

      <div className="row g-3">
        {pendingExpenses.map((expense) => (
          <div key={expense.id} className="col-md-6">
            <div className="card">
              <div className="card-header bg-warning bg-opacity-10">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    <i className="fa-solid fa-clock me-2"></i>
                    En attente
                  </h6>
                  <span className="badge bg-warning">{fmt(expense.amount)} FCFA</span>
                </div>
              </div>
              <div className="card-body">
                <div className="mb-2">
                  <strong>Description :</strong> {expense.description}
                </div>
                <div className="mb-2">
                  <strong>Catégorie :</strong>{" "}
                  <span className="badge bg-secondary">{expense.category}</span>
                </div>
                {expense.supplier && (
                  <div className="mb-2">
                    <strong>Fournisseur :</strong> {expense.supplier}
                  </div>
                )}
                <div className="mb-2">
                  <strong>Date :</strong> {expense.date}
                </div>
                {expense.paymentMethod && (
                  <div className="mb-2">
                    <strong>Paiement :</strong> {expense.paymentMethod}
                  </div>
                )}
                {expense.isRecurring && (
                  <div className="mb-2">
                    <span className="badge bg-info">
                      <i className="fa-solid fa-repeat me-1"></i>
                      Récurrent (jour {expense.recurringDay})
                    </span>
                  </div>
                )}
                {expense.receiptUrl && (
                  <div className="mb-3">
                    <a
                      href={expense.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="fa-solid fa-paperclip me-1"></i>
                      Voir la facture
                    </a>
                  </div>
                )}
                <hr />
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success flex-fill"
                    onClick={() => handleApprove(expense.id)}
                    disabled={processing === expense.id}
                  >
                    {processing === expense.id ? (
                      <span className="spinner-border spinner-border-sm me-1"></span>
                    ) : (
                      <i className="fa-solid fa-check me-1"></i>
                    )}
                    Approuver
                  </button>
                  <button
                    className="btn btn-danger flex-fill"
                    onClick={() => setShowRejectModal(expense.id)}
                    disabled={processing === expense.id}
                  >
                    <i className="fa-solid fa-times me-1"></i>
                    Rejeter
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowRejectModal(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Rejeter la dépense</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRejectModal(null)}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label">
                  Raison du rejet (optionnel)
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ex: Montant trop élevé, justificatif manquant..."
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowRejectModal(null)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleReject(showRejectModal)}
                  disabled={processing === showRejectModal}
                >
                  {processing === showRejectModal ? (
                    <span className="spinner-border spinner-border-sm me-1"></span>
                  ) : (
                    <i className="fa-solid fa-times me-1"></i>
                  )}
                  Confirmer le rejet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
