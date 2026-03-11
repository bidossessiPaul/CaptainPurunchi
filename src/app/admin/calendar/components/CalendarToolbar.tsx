import { formatMonthYear } from '../utils/calendarHelpers';

interface CalendarToolbarProps {
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function CalendarToolbar({ currentDate, onPrevious, onNext, onToday }: CalendarToolbarProps) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2 className="h4 mb-0 text-capitalize">{formatMonthYear(currentDate)}</h2>

      <div className="btn-group" role="group">
        <button
          className="btn btn-outline-secondary"
          onClick={onPrevious}
          title="Mois précédent"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={onToday}
          title="Aujourd'hui"
        >
          Aujourd'hui
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={onNext}
          title="Mois suivant"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
