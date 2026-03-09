import DailyMenuManager from "./DailyMenuManager";

export default function DailyMenuAdminPage() {
  return (
    <>
      <div className="row">
        <div className="col-sm-12">
          <div className="page-title-box d-md-flex justify-content-md-between align-items-center">
            <h4 className="page-title">Menu du Jour</h4>
            <div>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/admin">Admin</a></li>
                <li className="breadcrumb-item active">Menu du Jour</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <DailyMenuManager />
    </>
  );
}
