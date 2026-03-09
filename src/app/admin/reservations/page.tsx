import { Suspense } from "react";
import ReservationsManager from "./ReservationsManager";

export default function ReservationsAdminPage() {
  return (
    <>
      <div className="row">
        <div className="col-sm-12">
          <div className="page-title-box d-md-flex justify-content-md-between align-items-center">
            <h4 className="page-title">Réservations</h4>
            <div>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/admin">Admin</a></li>
                <li className="breadcrumb-item active">Réservations</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        </div>
      }>
        <ReservationsManager />
      </Suspense>
    </>
  );
}
