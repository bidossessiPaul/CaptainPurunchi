"use client";

import { useState, useEffect } from "react";

interface BalanceData {
  period: { start: string; end: string };
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueBySource: Record<string, number>;
  expenseByCategory: Record<string, number>;
}

export default function BalanceSheet() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [balance, setBalance] = useState<BalanceData | null>(null);
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

  // Fetch balance when dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchBalance();
    }
  }, [startDate, endDate]);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/finance/balance?start=${startDate}&end=${endDate}`
      );
      const data = await res.json();
      setBalance(data);
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => n.toLocaleString("fr-FR");

  const getStatusColor = (value: number) => {
    if (value > 0) return "success";
    if (value < 0) return "danger";
    return "secondary";
  };

  if (loading && !balance) {
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
                onClick={fetchBalance}
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

      {balance && (
        <>
          {/* KPI Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card border-success">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Total Revenus</h6>
                      <h3 className="mb-0 text-success">
                        {fmt(balance.totalRevenue)} FCFA
                      </h3>
                    </div>
                    <div className="fs-1 text-success opacity-25">
                      <i className="fa-solid fa-arrow-trend-up"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-danger">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Total Dépenses</h6>
                      <h3 className="mb-0 text-danger">
                        {fmt(balance.totalExpenses)} FCFA
                      </h3>
                    </div>
                    <div className="fs-1 text-danger opacity-25">
                      <i className="fa-solid fa-arrow-trend-down"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className={`card border-${getStatusColor(balance.netProfit)}`}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Résultat Net</h6>
                      <h3 className={`mb-0 text-${getStatusColor(balance.netProfit)}`}>
                        {fmt(balance.netProfit)} FCFA
                      </h3>
                    </div>
                    <div
                      className={`fs-1 text-${getStatusColor(balance.netProfit)} opacity-25`}
                    >
                      <i
                        className={`fa-solid fa-${
                          balance.netProfit >= 0 ? "check-circle" : "times-circle"
                        }`}
                      ></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="row g-3">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-success bg-opacity-10">
                  <h5 className="card-title mb-0">
                    <i className="fa-solid fa-chart-pie me-2"></i>
                    Revenus par source
                  </h5>
                </div>
                <div className="card-body">
                  {Object.entries(balance.revenueBySource)
                    .filter(([, amount]) => amount > 0)
                    .map(([source, amount]) => {
                      const percentage =
                        balance.totalRevenue > 0
                          ? (amount / balance.totalRevenue) * 100
                          : 0;
                      return (
                        <div key={source} className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="text-capitalize">{source}</span>
                            <strong>{fmt(amount)} FCFA</strong>
                          </div>
                          <div className="progress" style={{ height: "8px" }}>
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{ width: `${percentage}%` }}
                              aria-valuenow={percentage}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            ></div>
                          </div>
                          <small className="text-muted">
                            {percentage.toFixed(1)}%
                          </small>
                        </div>
                      );
                    })}
                  {Object.values(balance.revenueBySource).every((v) => v === 0) && (
                    <p className="text-muted text-center mb-0">
                      Aucun revenu pour cette période
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-danger bg-opacity-10">
                  <h5 className="card-title mb-0">
                    <i className="fa-solid fa-chart-pie me-2"></i>
                    Dépenses par catégorie
                  </h5>
                </div>
                <div className="card-body">
                  {Object.entries(balance.expenseByCategory)
                    .filter(([, amount]) => amount > 0)
                    .map(([category, amount]) => {
                      const percentage =
                        balance.totalExpenses > 0
                          ? (amount / balance.totalExpenses) * 100
                          : 0;
                      return (
                        <div key={category} className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>{category}</span>
                            <strong>{fmt(amount)} FCFA</strong>
                          </div>
                          <div className="progress" style={{ height: "8px" }}>
                            <div
                              className="progress-bar bg-danger"
                              role="progressbar"
                              style={{ width: `${percentage}%` }}
                              aria-valuenow={percentage}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            ></div>
                          </div>
                          <small className="text-muted">
                            {percentage.toFixed(1)}%
                          </small>
                        </div>
                      );
                    })}
                  {Object.values(balance.expenseByCategory).every((v) => v === 0) && (
                    <p className="text-muted text-center mb-0">
                      Aucune dépense pour cette période
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
