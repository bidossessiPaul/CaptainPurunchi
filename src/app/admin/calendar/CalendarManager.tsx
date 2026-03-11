"use client";

import { useState } from "react";
import { useCalendarNavigation } from "./hooks/useCalendarNavigation";
import { useCalendarData } from "./hooks/useCalendarData";
import CalendarToolbar from "./components/CalendarToolbar";
import CalendarFilters from "./components/CalendarFilters";
import MonthView from "./components/MonthView";

const VIEW_TABS = [
  { key: "month", label: "Mois", icon: "fa-solid fa-calendar" },
  // Future: { key: "week", label: "Semaine", icon: "fa-solid fa-calendar-week" },
  // Future: { key: "day", label: "Jour", icon: "fa-solid fa-clock" },
  // Future: { key: "gantt", label: "Planning Chambres", icon: "fa-solid fa-bed" },
] as const;

type ViewType = "month";

export default function CalendarManager() {
  const [activeView, setActiveView] = useState<ViewType>("month");
  const [filterType, setFilterType] = useState<'all' | 'table' | 'room' | 'event'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Navigation hook
  const {
    currentDate,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
  } = useCalendarNavigation();

  // Data hook
  const { events, loading, error, refetch } = useCalendarData({
    currentDate,
    type: filterType,
    status: filterStatus,
  });

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          <i className="fa-solid fa-calendar-days me-2"></i>
          Planning Calendrier
        </h1>
      </div>

      {/* View tabs (MVP: only month) */}
      <div className="d-flex gap-2 mb-3">
        {VIEW_TABS.map(tab => (
          <button
            key={tab.key}
            className={`btn ${activeView === tab.key ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveView(tab.key)}
          >
            <i className={`${tab.icon} me-1`}></i>{tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <CalendarFilters
        type={filterType}
        status={filterStatus}
        onTypeChange={setFilterType}
        onStatusChange={setFilterStatus}
      />

      {/* Calendar view */}
      <div className="card">
        <div className="card-body">
          {/* Toolbar */}
          <CalendarToolbar
            currentDate={currentDate}
            onPrevious={goToPreviousMonth}
            onNext={goToNextMonth}
            onToday={goToToday}
          />

          {/* Month View */}
          {activeView === "month" && (
            <MonthView
              currentDate={currentDate}
              events={events}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
}
