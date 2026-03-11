"use client";

import { useState, useEffect } from "react";

interface ProfitLossData {
  period: { start: string; end: string };
  revenue: {
    restaurant: number;
    bar: number;
    hébergement: number;
    événement: number;
    autre: number;
    total: number;
  };
  expenses: {
    "Achats fournisseurs": number;
    "Salaires": number;
    "Charges fixes": number;
    "Entretien & réparations": number;
    "Marketing": number;
    "Divers": number;
    total: number;
  };
  netProfit: number;
  margin: number; // %
}

export default function ProfitLossReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [profitLoss, setProfitLoss] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize with current month
  useEffect(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
    setStartDate(start);
    setEndDate(end);
  }, []);

  // Fetch P&L when dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchProfitLoss();
    }
  }, [startDate, endDate]);

  const fetchProfitLoss = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/finance/profit-loss?start=${startDate}&end=${endDate}`
      );
      const data = await res.json();
      setProfitLoss(data);
    } catch (error) {
      console.error("Error fetching profit & loss:", error);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => n.toLocaleString("fr-FR");

  if (loading && !profitLoss) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Date Range Picker */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Date début</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Date fin</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-primary w-100"
                onClick={fetchProfitLoss}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Chargement...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-refresh me-2"></i>
                    Actualiser
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {profitLoss && (
        <>
          {/* Summary Card */}
          <div className="card mb-4 border-primary">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="fa-solid fa-file-invoice-dollar me-2"></i>
                Compte de Résultat
                <small className="float-end">
                  {new Date(profitLoss.period.start).toLocaleDateString("fr-FR")} -{" "}
                  {new Date(profitLoss.period.end).toLocaleDateString("fr-FR")}
                </small>
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-4">
                  <h6 className="text-muted">Chiffre d'affaires</h6>
                  <h4 className="text-success">{fmt(profitLoss.revenue.total)} FCFA</h4>
                </div>
                <div className="col-md-4">
                  <h6 className="text-muted">Charges totales</h6>
                  <h4 className="text-danger">{fmt(profitLoss.expenses.total)} FCFA</h4>
                </div>
                <div className="col-md-4">
                  <h6 className="text-muted">Résultat net</h6>
                  <h4
                    className={
                      profitLoss.netProfit >= 0 ? "text-success" : "text-danger"
                    }
                  >
                    {fmt(profitLoss.netProfit)} FCFA
                  </h4>
                  <small
                    className={
                      profitLoss.netProfit >= 0 ? "text-success" : "text-danger"
                    }
                  >
                    Marge : {profitLoss.margin.toFixed(2)}%
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed P&L Table */}
          <div className="row g-3">
            {/* Revenue Details */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-success bg-opacity-10">
                  <h5 className="card-title mb-0">
                    <i className="fa-solid fa-plus-circle me-2 text-success"></i>
                    Produits (Revenus)
                  </h5>
                </div>
                <div className="card-body">
                  <table className="table table-sm mb-0">
                    <tbody>
                      <tr>
                        <td>
                          <i className="fa-solid fa-utensils me-2 text-muted"></i>
                          Restaurant
                        </td>
                        <td className="text-end">
                          {fmt(profitLoss.revenue.restaurant)} FCFA
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <i className="fa-solid fa-wine-glass me-2 text-muted"></i>
                          Bar
                        </td>
                        <td className="text-end">{fmt(profitLoss.revenue.bar)} FCFA</td>
                      </tr>
                      <tr>
                        <td>
                          <i className="fa-solid fa-bed me-2 text-muted"></i>
                          Hébergement
                        </td>
                        <td className="text-end">
                          {fmt(profitLoss.revenue.hébergement)} FCFA
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <i className="fa-solid fa-calendar-star me-2 text-muted"></i>
                          Événements
                        </td>
                        <td className="text-end">
                          {fmt(profitLoss.revenue.événement)} FCFA
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <i className="fa-solid fa-ellipsis me-2 text-muted"></i>
                          Autres
                        </td>
                        <td className="text-end">
                          {fmt(profitLoss.revenue.autre)} FCFA
                        </td>
                      </tr>
                      <tr className="table-success fw-bold">
                        <td>Total Produits</td>
                        <td className="text-end">
                          {fmt(profitLoss.revenue.total)} FCFA
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Expense Details */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-danger bg-opacity-10">
                  <h5 className="card-title mb-0">
                    <i className="fa-solid fa-minus-circle me-2 text-danger"></i>
                    Charges (Dépenses)
                  </h5>
                </div>
                <div className="card-body">
                  <table className="table table-sm mb-0">
                    <tbody>
                      <tr>
                        <td>
                          <i className="fa-solid fa-shopping-cart me-2 text-muted"></i>
                          Achats fournisseurs
                        </td>
                        <td className="text-end">
                          {fmt(profitLoss.expenses["Achats fournisseurs"])} FCFA
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <i className="fa-solid fa-users me-2 text-muted"></i>
                          Salaires
                        </td>
                        <td className="text-end">
                          {fmt(profitLoss.expenses["Salaires"])} FCFA
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <i className="fa-solid fa-file-invoice me-2 text-muted"></i>
                          Charges fixes
                        </td>
                        <td className="text-end">
                          {fmt(profitLoss.expenses["Charges fixes"])} FCFA
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <i className="fa-solid fa-wrench me-2 text-muted"></i>
                          Entretien & réparations
                        </td>
                        <td className="text-end">
                          {fmt(profitLoss.expenses["Entretien & réparations"])} FCFA
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <i className="fa-solid fa-bullhorn me-2 text-muted"></i>
                          Marketing
                        </td>
                        <td className="text-end">
                          {fmt(profitLoss.expenses["Marketing"])} FCFA
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <i className="fa-solid fa-ellipsis me-2 text-muted"></i>
                          Divers
                        </td>
                        <td className="text-end">
                          {fmt(profitLoss.expenses["Divers"])} FCFA
                        </td>
                      </tr>
                      <tr className="table-danger fw-bold">
                        <td>Total Charges</td>
                        <td className="text-end">
                          {fmt(profitLoss.expenses.total)} FCFA
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Net Result */}
          <div className="card mt-3 border-primary">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h4 className="mb-0">
                    <i className="fa-solid fa-calculator me-2"></i>
                    Résultat Net (Produits - Charges)
                  </h4>
                  <small className="text-muted">
                    Marge nette : {profitLoss.margin.toFixed(2)}% du chiffre d'affaires
                  </small>
                </div>
                <div className="col-md-4 text-end">
                  <h2
                    className={`mb-0 ${
                      profitLoss.netProfit >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {profitLoss.netProfit >= 0 ? "+" : ""}
                    {fmt(profitLoss.netProfit)} FCFA
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
