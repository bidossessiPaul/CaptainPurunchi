"use client";

import { useEffect, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TrendPoint {
  date: string;
  tables: number;
  orders: number;
  rooms: number;
  events: number;
}

const PERIODS = [
  { label: "7j", days: 7 },
  { label: "30j", days: 30 },
  { label: "90j", days: 90 },
  { label: "12 mois", days: 365 },
] as const;

const SERIES = [
  { key: "tables", name: "Réservations tables", color: "#5BC0EB" },
  { key: "orders", name: "Commandes", color: "#10b981" },
  { key: "rooms", name: "Réservations chambres", color: "#f59e0b" },
  { key: "events", name: "Réservations événements", color: "#ef4444" },
] as const;

function formatDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  if (days <= 7) {
    return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
  }
  if (days <= 90) {
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  }
  return d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
}

export default function TrendsChart() {
  const [data, setData] = useState<TrendPoint[]>([]);
  const [activeDays, setActiveDays] = useState(30);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (days: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/trends?days=${days}`);
      if (res.ok) {
        setData(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeDays);
  }, [activeDays, fetchData]);

  const handlePeriod = (days: number) => {
    setActiveDays(days);
  };

  // For long periods, reduce tick count
  const tickInterval =
    activeDays <= 7 ? 0 : activeDays <= 30 ? 3 : activeDays <= 90 ? 9 : 29;

  return (
    <div className="card">
      <div className="card-header">
        <div className="row align-items-center">
          <div className="col">
            <h4 className="card-title">Tendances</h4>
          </div>
          <div className="col-auto">
            <div className="btn-group btn-group-sm">
              {PERIODS.map((p) => (
                <button
                  key={p.days}
                  type="button"
                  className={`btn ${activeDays === p.days ? "btn-primary" : "btn-light"}`}
                  onClick={() => handlePeriod(p.days)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary spinner-border-sm" role="status" />
            <p className="text-muted mt-2 mb-0">Chargement...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-5">
            <i className="fa-solid fa-chart-line fs-1 text-muted mb-3 d-block" />
            <p className="text-muted mb-0">Aucune donnée pour cette période</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => formatDate(v, activeDays)}
                interval={tickInterval}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                labelFormatter={(v) => {
                  const d = new Date(v + "T00:00:00");
                  return d.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                }}
                contentStyle={{
                  background: "#1e293b",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 13,
                }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 13, paddingTop: 12 }}
                iconType="circle"
                iconSize={8}
              />
              {SERIES.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={activeDays <= 30}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
