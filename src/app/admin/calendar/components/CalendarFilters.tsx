interface CalendarFiltersProps {
  type: 'all' | 'table' | 'room' | 'event';
  status: string;
  onTypeChange: (type: 'all' | 'table' | 'room' | 'event') => void;
  onStatusChange: (status: string) => void;
}

export default function CalendarFilters({ type, status, onTypeChange, onStatusChange }: CalendarFiltersProps) {
  return (
    <div className="d-flex gap-3 mb-3 flex-wrap">
      {/* Type filter */}
      <div>
        <label htmlFor="filter-type" className="form-label small mb-1">Type</label>
        <select
          id="filter-type"
          className="form-select form-select-sm"
          value={type}
          onChange={(e) => onTypeChange(e.target.value as typeof type)}
        >
          <option value="all">Toutes les réservations</option>
          <option value="table">Tables uniquement</option>
          <option value="room">Chambres uniquement</option>
          <option value="event">Événements uniquement</option>
        </select>
      </div>

      {/* Status filter */}
      <div>
        <label htmlFor="filter-status" className="form-label small mb-1">Statut</label>
        <select
          id="filter-status"
          className="form-select form-select-sm"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmé</option>
          <option value="completed">Terminé</option>
          <option value="cancelled">Annulé</option>
        </select>
      </div>

      {/* Legend */}
      <div className="ms-auto d-flex gap-2 align-items-end">
        <small className="text-muted">Légende :</small>
        <span className="badge bg-primary">Tables</span>
        <span className="badge bg-warning text-dark">Chambres</span>
        <span className="badge" style={{ backgroundColor: '#FF6B6B', color: 'white' }}>Événements</span>
      </div>
    </div>
  );
}
